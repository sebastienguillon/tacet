// Where Tacet runs: the mode (every site, chosen sites, off), the choice for each
// site, and the popup that sets them. The content script runs with a stand-in for
// the extension storage and messaging, in Chromium and Firefox, on a fixture
// served at https://news.example/ so the site has a host name.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium, firefox } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "../src");
const js = await readFile(join(SRC, "content/tacet.js"), "utf8");
const css = await readFile(join(SRC, "content/tacet.css"), "utf8");
const page = await readFile(join(here, "fixtures/cases.html"), "utf8");
const popupUrl = pathToFileURL(join(SRC, "popup/popup.html")).href;
const HOST = "news.example";

// The stand-in extension API, then the shipped CSS and script. __settings does
// what the popup does: change settings, or send a message to the page.
const harness = (stored) => `(() => {
  const store = ${JSON.stringify(stored)};
  const changed = [];
  const handlers = [];
  globalThis.browser = {
    storage: {
      local: { get: async () => structuredClone(store) },
      onChanged: { addListener: (fn) => changed.push(fn) },
    },
    runtime: { onMessage: { addListener: (fn) => handlers.push(fn) } },
  };
  globalThis.__settings = {
    set(values) {
      const changes = {};
      for (const [k, v] of Object.entries(values)) {
        store[k] = v;
        changes[k] = { newValue: v };
      }
      for (const fn of changed) fn(changes, "local");
    },
    send: (type) => new Promise((done) => { for (const fn of handlers) fn({ type }, {}, done); }),
  };
  const add = () => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(css)}; document.documentElement.appendChild(s); };
  if (document.documentElement) add();
  else new MutationObserver((_, o) => { if (document.documentElement) { o.disconnect(); add(); } }).observe(document, { childList: true });
})();
${js}`;

// What Tacet did to cases.html: its wall at load, its vendor container, its
// scroll lock on <html>, and any attribute Tacet sets (but data-tacet-debug, the
// status the debug setting mirrors into the page).
const state = (p) =>
  p.evaluate(() => ({
    wall: getComputedStyle(document.getElementById("wall")).display === "none",
    signature: getComputedStyle(document.getElementById("didomi-host")).display === "none",
    locked: getComputedStyle(document.documentElement).overflowY === "hidden",
    marks: [...document.querySelectorAll("*")].flatMap((el) =>
      el.getAttributeNames().filter((n) => n.startsWith("data-tacet") && n !== "data-tacet-debug"),
    ),
  }));
const ACTIVE = { wall: true, signature: true, locked: false };
const UNTOUCHED = { wall: false, signature: false, locked: true, marks: [] };
const pick = ({ wall, signature, locked }) => ({ wall, signature, locked });

for (const [engine, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  describe(engine, () => {
    let browser;
    let ctx;

    before(async () => {
      browser = await type.launch();
      ctx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
      await ctx.route(/^https:\/\/(www\.)?news\.example\//, (route) =>
        route.fulfill({ contentType: "text/html", body: page }),
      );
    });
    after(() => browser?.close());

    async function open(stored, url = `https://${HOST}/`) {
      const p = await ctx.newPage();
      await p.addInitScript({ content: harness(stored) });
      await p.goto(url);
      await p.waitForTimeout(1500);
      return p;
    }

    for (const [label, stored, expected, url] of [
      ["no settings: runs, as before modes", {}, ACTIVE],
      ["all sites: runs", { mode: "on" }, ACTIVE],
      [
        "all sites, this site switched off: leaves the page alone",
        { mode: "on", sites: { [HOST]: false } },
        UNTOUCHED,
      ],
      ["chosen sites, nothing chosen: leaves the page alone", { mode: "sites" }, UNTOUCHED],
      [
        "chosen sites, a site on another host chosen: leaves the page alone",
        { mode: "sites", sites: { "other.example": true } },
        UNTOUCHED,
      ],
      [
        "chosen sites, this site chosen: runs, on www. too",
        { mode: "sites", sites: { [HOST]: true } },
        ACTIVE,
        `https://www.${HOST}/`,
      ],
      [
        "off: leaves the page alone, whatever the site's choice",
        { mode: "off", sites: { [HOST]: true } },
        UNTOUCHED,
      ],
      [
        "site switched off before modes existed: leaves the page alone",
        { disabledHosts: { [HOST]: true } },
        UNTOUCHED,
      ],
    ]) {
      test(label, async () => {
        const p = await open(stored, url);
        const st = await state(p);
        await p.close();
        if (expected === UNTOUCHED) assert.deepEqual(st, UNTOUCHED);
        else assert.deepEqual(pick(st), expected);
      });
    }

    test("switching the site on and the mode off applies to the open page", async (t) => {
      const p = await open({ mode: "sites" });
      await t.test("chosen sites, nothing chosen: untouched", async () =>
        assert.deepEqual(await state(p), UNTOUCHED),
      );
      await p.evaluate((host) => globalThis.__settings.set({ sites: { [host]: true } }), HOST);
      await p.waitForTimeout(800);
      await t.test("site switched on: runs", async () =>
        assert.deepEqual(pick(await state(p)), ACTIVE),
      );
      await p.evaluate(() => globalThis.__settings.set({ mode: "off" }));
      await p.waitForTimeout(300);
      await t.test("mode off: every change is undone", async () =>
        assert.deepEqual(await state(p), UNTOUCHED),
      );
      await p.close();
    });

    test("Zap now and Undo on a site Tacet is off for", async (t) => {
      const p = await open({ mode: "sites" });
      const zapped = await p.evaluate(() => globalThis.__settings.send("tacet:zap"));
      await t.test("Zap now hides the wall on this page", async () => {
        assert.equal(zapped.active, true);
        assert.deepEqual(pick(await state(p)), ACTIVE);
      });
      await p.evaluate(() => globalThis.__settings.set({ debug: true }));
      await p.waitForTimeout(300);
      await t.test("another setting changing does not undo the Zap", async () =>
        assert.deepEqual(pick(await state(p)), ACTIVE),
      );
      const undone = await p.evaluate(() => globalThis.__settings.send("tacet:undo"));
      await p.evaluate(() => globalThis.__settings.set({ banners: false }));
      await p.waitForTimeout(300);
      await t.test("Undo restores the page, and another setting does not redo it", async () => {
        assert.equal(undone.active, false);
        assert.deepEqual(await state(p), UNTOUCHED);
      });
      await p.close();
    });

    // The popup, with a stand-in for the extension API: the active tab answers
    // with `status`, or has no content script when it is null.
    describe("popup", () => {
      const STATUS = { host: HOST, active: true, paused: false, locked: [], actions: [] };

      async function popup(stored, status = STATUS) {
        const p = await ctx.newPage({ viewport: { width: 340, height: 400 } });
        await p.addInitScript(
          ({ stored, status }) => {
            const store = stored;
            globalThis.__store = store;
            globalThis.browser = {
              tabs: {
                query: async () => [{ id: 1 }],
                sendMessage: async () => {
                  if (!status) throw new Error("no content script");
                  return status;
                },
              },
              storage: {
                local: {
                  get: async (keys) =>
                    Object.fromEntries(
                      [keys]
                        .flat()
                        .filter((k) => k in store)
                        .map((k) => [k, structuredClone(store[k])]),
                    ),
                  set: async (values) => Object.assign(store, structuredClone(values)),
                  remove: async (keys) => [keys].flat().forEach((k) => delete store[k]),
                },
              },
            };
          },
          { stored, status },
        );
        await p.goto(popupUrl);
        await p.waitForTimeout(100);
        return p;
      }
      const stored = (p) => p.evaluate(() => structuredClone(globalThis.__store));
      const view = (p) =>
        p.evaluate(() => ({
          mode: document.querySelector('input[name="mode"]:checked')?.value,
          site: document.getElementById("site").checked,
          siteEnabled: !document.getElementById("site").disabled,
        }));
      const choose = async (p, mode) => {
        await p.check(`input[name="mode"][value="${mode}"]`);
        await p.waitForTimeout(50);
      };

      test("modes and the site switch", async (t) => {
        const p = await popup({});
        await t.test("a fresh install runs on all sites, this one included", async () =>
          assert.deepEqual(await view(p), { mode: "on", site: true, siteEnabled: true }),
        );

        await choose(p, "sites");
        await t.test("chosen sites: this site is off until switched on", async () => {
          assert.equal((await stored(p)).mode, "sites");
          assert.deepEqual(await view(p), { mode: "sites", site: false, siteEnabled: true });
        });

        await p.check("#site");
        await p.waitForTimeout(50);
        await t.test("switching the site on records the choice", async () =>
          assert.deepEqual((await stored(p)).sites, { [HOST]: true }),
        );

        await choose(p, "off");
        await t.test("off: the site switch is off and disabled", async () =>
          assert.deepEqual(await view(p), { mode: "off", site: false, siteEnabled: false }),
        );

        await choose(p, "on");
        await p.uncheck("#site");
        await p.waitForTimeout(50);
        await t.test("all sites: switching the site off records the choice", async () =>
          assert.deepEqual(await stored(p), { mode: "on", sites: { [HOST]: false } }),
        );
        await p.close();
      });

      test("sites switched off before modes become choices", async () => {
        const p = await popup({
          disabledHosts: { [HOST]: true, "other.example": true },
          sites: { "other.example": true },
        });
        assert.deepEqual(await stored(p), {
          sites: { "other.example": true, [HOST]: false },
        });
        assert.deepEqual(await view(p), { mode: "on", site: false, siteEnabled: true });
        await p.close();
      });

      test("a page without the content script: the mode can still change", async () => {
        const p = await popup({}, null);
        assert.deepEqual(await view(p), { mode: "on", site: false, siteEnabled: false });
        await choose(p, "sites");
        assert.equal((await stored(p)).mode, "sites");
        await p.close();
      });
    });
  });
}
