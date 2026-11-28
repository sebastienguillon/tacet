// Store screenshots (1280x800 JPEG) of the made-up newspaper on the website's
// demo page, which carries a made-up consent wall: once as a browser without
// Tacet shows it, once with the real unpacked extension and its popup.
//   pnpm screenshots            English page, written to store/screenshots/
//   pnpm screenshots fr         French page
//
// Headless Chromium cannot open an extension's toolbar popup, so the popup is
// src/popup/popup.html rendered with the status the extension returned for the
// page, and placed at the top right, where the browser shows it.
import { chromium } from "playwright";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXT = join(root, "src");
const OUT = join(root, "store/screenshots");
const lang = process.argv[2] === "fr" ? "fr" : "en";
const PAGE = `https://sebastienguillon.github.io/tacet/demo/${lang}.html`;
const HOST = new URL(PAGE).hostname.replace(/^www\./, "");
const VIEWPORT = { width: 1280, height: 800 };
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

await mkdir(OUT, { recursive: true });

// 1. The page as a browser without Tacet shows it.
const plain = await chromium.launch();
const before = await plain.newPage({ viewport: VIEWPORT, userAgent: CHROME_UA });
await before.goto(PAGE, { waitUntil: "load" });
await before.waitForTimeout(800);
await before.screenshot({
  path: join(OUT, `${lang}-1-wall-1280x800.jpg`),
  type: "jpeg",
  quality: 90,
});

// 2. The same page with the extension, and the status it reports.
const profile = await mkdtemp(join(tmpdir(), "tacet-shots-"));
const ctx = await chromium.launchPersistentContext(profile, {
  channel: "chromium",
  headless: true,
  viewport: VIEWPORT,
  userAgent: CHROME_UA,
  args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
});
const ext = await ctx.newPage();
await ext.goto("chrome://extensions");
const id = await ext.evaluate(
  async () => (await chrome.management.getAll()).find((e) => e.name === "Tacet")?.id,
);
if (!id) throw new Error("Tacet extension did not load");
// A new install runs on chosen sites: choose the demo's, as a reader would.
const worker = ctx.serviceWorkers()[0] ?? (await ctx.waitForEvent("serviceworker"));
await worker.evaluate((host) => chrome.storage.local.set({ sites: { [host]: true } }), HOST);
const page = await ctx.newPage();
await page.goto(PAGE, { waitUntil: "load" });
await page.waitForTimeout(2000);
const after = await page.screenshot({ type: "png" });
await ext.goto(`chrome-extension://${id}/popup/popup.html`);
// Without the tabs permission, tabs cannot be queried by URL: ask each one;
// only the demo page has the content script to answer.
const status = await ext.evaluate(async () => {
  for (const tab of await chrome.tabs.query({})) {
    try {
      const st = await chrome.tabs.sendMessage(tab.id, { type: "tacet:status" });
      if (st) return st;
    } catch {
      // no content script in this tab
    }
  }
  return null;
});
await ctx.close();
await rm(profile, { recursive: true, force: true });
if (!status?.actions?.length) throw new Error("Tacet did nothing on the demo page");

// 3. The popup, rendered by its own code with that status and those settings.
const popup = await plain.newPage({ viewport: { width: 340, height: 200 } });
await popup.addInitScript((st) => {
  const settings = { mode: "sites", sites: { [st.host]: true } };
  globalThis.browser = {
    tabs: { query: async () => [{ id: 1 }], sendMessage: async () => st },
    storage: { local: { get: async () => structuredClone(settings), set: async () => {} } },
  };
}, status);
await popup.goto(pathToFileURL(join(EXT, "popup/popup.html")).href);
await popup.waitForTimeout(300);
const panel = await popup.screenshot({ fullPage: true, type: "png" });

// 4. Page and popup together.
const sheet = await plain.newPage({ viewport: VIEWPORT });
const img = (buf) => `data:image/png;base64,${buf.toString("base64")}`;
await sheet.setContent(`<style>
  html, body { margin: 0; width: 1280px; height: 800px; overflow: hidden; }
  .page { display: block; width: 1280px; height: 800px; }
  .popup { position: absolute; top: 8px; right: 16px; width: 340px; border-radius: 8px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 18%), 0 12px 32px rgb(0 0 0 / 22%); }
</style><img class="page" src="${img(after)}"><img class="popup" src="${img(panel)}">`);
await sheet.screenshot({
  path: join(OUT, `${lang}-2-tacet-1280x800.jpg`),
  type: "jpeg",
  quality: 90,
});
await plain.close();

console.log(
  `${lang}: ${status.actions.length} actions`,
  status.actions.map((a) => a.reason),
);
