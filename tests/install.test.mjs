// What Tacet stores when it is installed or updated (src/background.js). The
// script runs in Node with a stand-in for the extension API; then the unpacked
// extension is installed in Chromium, where a new install leaves the pages alone
// until their site is chosen. Playwright cannot install an extension in Firefox.
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "../src");
const background = await readFile(join(SRC, "background.js"), "utf8");
const page = await readFile(join(here, "fixtures/cases.html"), "utf8");
const HOST = "news.example";

// Runs background.js with `stored` in storage, under `namespace` (Firefox's
// `browser` or Chrome's `chrome`), fires onInstalled for `reason`, and returns
// what storage then holds.
async function installed(reason, stored = {}, namespace = "browser") {
  const store = structuredClone(stored);
  let onInstalled;
  const api = {
    runtime: { onInstalled: { addListener: (fn) => (onInstalled = fn) } },
    storage: {
      local: {
        get: async (keys) =>
          Object.fromEntries(
            [keys]
              .flat()
              .filter((k) => k in store)
              .map((k) => [k, structuredClone(store[k])]),
          ),
        set: async (values) => void Object.assign(store, structuredClone(values)),
      },
    },
  };
  vm.runInNewContext(background, { [namespace]: api });
  await onInstalled({ reason });
  return store;
}

describe("background script", () => {
  test("a new install runs on chosen sites", async () => {
    assert.deepEqual(await installed("install"), { mode: "sites" });
    assert.deepEqual(await installed("install", {}, "chrome"), { mode: "sites" });
  });

  // No mode stored means all sites, the default before: an install from before
  // keeps it without any event.
  test("an update or a browser update stores nothing", async () => {
    assert.deepEqual(await installed("update"), {});
    const before = { disabledHosts: { [HOST]: true }, banners: false };
    assert.deepEqual(await installed("update", before), before);
    assert.deepEqual(await installed("browser_update"), {});
    assert.deepEqual(await installed("chrome_update", {}, "chrome"), {});
  });

  test("a stored mode is the user's choice and stays", async () => {
    for (const mode of ["sites", "on", "off"])
      assert.deepEqual(await installed("install", { mode }), { mode });
  });
});

describe("chromium, the unpacked extension", () => {
  let profile;
  let ctx;
  let worker;

  before(async () => {
    profile = await mkdtemp(join(tmpdir(), "tacet-install-"));
    ctx = await chromium.launchPersistentContext(profile, {
      channel: "chromium",
      headless: true,
      viewport: { width: 1200, height: 800 },
      args: [`--disable-extensions-except=${SRC}`, `--load-extension=${SRC}`],
    });
    await ctx.route(/^https:\/\/news\.example\//, (route) =>
      route.fulfill({ contentType: "text/html", body: page }),
    );
    worker = ctx.serviceWorkers()[0] ?? (await ctx.waitForEvent("serviceworker"));
  });
  after(async () => {
    await ctx?.close();
    if (profile) await rm(profile, { recursive: true, force: true });
  });

  const stored = () => worker.evaluate(() => chrome.storage.local.get());
  // The wall of cases.html, and its scroll lock on <html>.
  const state = (p) =>
    p.evaluate(() => ({
      wall: getComputedStyle(document.getElementById("wall")).display === "none",
      locked: getComputedStyle(document.documentElement).overflowY === "hidden",
    }));

  test("a new install leaves pages alone until their site is chosen", async (t) => {
    // onInstalled may still be storing the mode.
    let s = await stored();
    for (let i = 0; i < 50 && !s.mode; i++) {
      await new Promise((done) => setTimeout(done, 100));
      s = await stored();
    }
    await t.test("chosen sites is stored", () => assert.deepEqual(s, { mode: "sites" }));

    const p = await ctx.newPage();
    await p.goto(`https://${HOST}/`);
    await p.waitForTimeout(1500);
    await t.test("the page is left alone", async () =>
      assert.deepEqual(await state(p), { wall: false, locked: true }),
    );

    await worker.evaluate((host) => chrome.storage.local.set({ sites: { [host]: true } }), HOST);
    await p.waitForTimeout(800);
    await t.test("the site switched on: Tacet runs on the open page", async () =>
      assert.deepEqual(await state(p), { wall: true, locked: false }),
    );
    await p.close();
  });
});
