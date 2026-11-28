// Loads pages with and without Tacet and reports what was hidden and whether
// the page is usable (nothing covering the centre, wheel scrolling works).
//
//   pnpm probe [options] url|list...
//     a list is the name of a file in scripts/sites/, e.g. `pnpm probe articles controls`
//     --engine=chromium|firefox   default chromium
//     --mode=ext|inject           ext loads the real unpacked extension (chromium only);
//                                 inject adds the content script to the page (default for firefox)
//     --no-sig                    inject mode only: disable vendor signatures to test the heuristics
//     --wait=8000                 ms to wait after DOMContentLoaded
//     --concurrency=4
//     --headed
import { chromium, firefox } from "playwright";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const EXT = resolve(here, "../src");
const OUT = resolve(here, "../out");
const SITES = join(here, "sites");

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const a = args.find((x) => x === `--${name}` || x.startsWith(`--${name}=`));
  if (!a) return dflt;
  return a.includes("=") ? a.split("=")[1] : true;
};
const urls = [];
for (const a of args.filter((x) => !x.startsWith("--"))) {
  if (/^https?:\/\//.test(a)) urls.push(a);
  else
    urls.push(
      ...(await readFile(join(SITES, `${a}.txt`), "utf8"))
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#")),
    );
}
const headed = !!flag("headed", false);
const wait = Number(flag("wait", 8000));
const engine = flag("engine", "chromium");
const mode = flag("mode", engine === "firefox" ? "inject" : "ext");
const noSig = !!flag("no-sig", false);
const concurrency = Number(flag("concurrency", 4));
const VIEWPORT = { width: 1280, height: 860 };

if (!urls.length) {
  console.error(
    "usage: pnpm probe [--engine=chromium|firefox] [--mode=ext|inject] [--no-sig] [--wait=ms] url|list...",
  );
  process.exit(1);
}
if (engine === "firefox" && mode === "ext") {
  console.error(
    "Playwright cannot load Firefox add-ons: use --mode=inject, or `pnpm start:firefox` for manual tests.",
  );
  process.exit(1);
}

const slug = (u) => {
  const { hostname, pathname } = new URL(u);
  const tail = pathname
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(-24);
  return hostname.replace(/^www\./, "") + (tail ? "-" + tail : "");
};

// Runs in the page: what covers the centre, is the page locked, can it scroll.
async function measure(page) {
  const info = await page.evaluate(() => {
    const vw = innerWidth,
      vh = innerHeight;
    const name = (n) =>
      `${n.tagName.toLowerCase()}${n.id ? "#" + n.id : ""}${typeof n.className === "string" && n.className.trim() ? "." + n.className.trim().split(/\s+/).slice(0, 2).join(".") : ""}`;
    const cover = () => {
      const el = document.elementFromPoint(vw / 2, vh / 2);
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        if (getComputedStyle(n).position === "fixed") {
          const r = n.getBoundingClientRect();
          if (r.width * r.height > vw * vh * 0.3) return name(n);
        }
      }
      return null;
    };
    const blocks = [...document.querySelectorAll('article, main, [role="main"]')];
    const hs = getComputedStyle(document.documentElement),
      bs = getComputedStyle(document.body);
    return {
      cover: cover(),
      htmlOverflow: hs.overflowY,
      bodyOverflow: bs.overflowY,
      bodyPosition: bs.position,
      debug: document.documentElement.getAttribute("data-tacet-debug"),
      hidden: [...document.querySelectorAll("[data-tacet-hidden]")].map(
        (e) => `${e.getAttribute("data-tacet-hidden")}:${name(e)}`,
      ),
      unlock: document.documentElement.getAttribute("data-tacet-unlock"),
      mainText: Math.max(0, ...blocks.map((b) => b.innerText.length)),
    };
  });
  const y = () => page.evaluate(() => scrollY + document.body.scrollTop);
  const y0 = await y();
  await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(400);
  const y1 = await y();
  await page.evaluate(() => {
    scrollTo(0, 0);
    document.body.scrollTop = 0;
  });
  await page.waitForTimeout(200);
  return { ...info, scrolled: Math.round(y1 - y0) };
}

async function injectScript() {
  const js = await readFile(join(EXT, "content/tacet.js"), "utf8");
  const css = await readFile(join(EXT, "content/tacet.css"), "utf8");
  return `globalThis.__tacetTest = true; globalThis.__tacetNoSig = ${noSig};
(() => { const css = ${JSON.stringify(css)};
  const add = () => { const s = document.createElement('style'); s.textContent = css; document.documentElement.appendChild(s); };
  if (document.documentElement) add();
  else new MutationObserver((_, o) => { if (document.documentElement) { o.disconnect(); add(); } }).observe(document, { childList: true });
})();
${js}`;
}

async function extensionId(ctx) {
  const p = await ctx.newPage();
  await p.goto("chrome://extensions");
  const id = await p.evaluate(
    async () => (await chrome.management.getAll()).find((e) => e.name === "Tacet")?.id,
  );
  await p.close();
  if (!id) throw new Error("Tacet extension did not load");
  return id;
}

// Some CMPs skip bots, and headless Chromium says "HeadlessChrome" in its user agent.
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

async function openContext(withExt) {
  const opts = {
    viewport: VIEWPORT,
    locale: "fr-FR",
    ...(engine === "chromium" ? { userAgent: CHROME_UA } : {}),
  };
  if (engine === "firefox" || mode === "inject") {
    const browser = await (engine === "firefox" ? firefox : chromium).launch({ headless: !headed });
    const ctx = await browser.newContext(opts);
    if (withExt) await ctx.addInitScript({ content: await injectScript() });
    return { ctx, close: () => browser.close() };
  }
  const dir = await mkdtemp(join(tmpdir(), "tacet-"));
  const ctx = await chromium.launchPersistentContext(dir, {
    ...opts,
    channel: "chromium",
    headless: !headed,
    args: withExt ? [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`] : [],
  });
  if (withExt) {
    // Debug mode makes the content script mirror its status into the DOM. A new
    // install runs on chosen sites: once it has stored that, run on all sites.
    const id = await extensionId(ctx);
    const p = await ctx.newPage();
    await p.goto(`chrome-extension://${id}/popup/popup.html`);
    await p.evaluate(async () => {
      for (let i = 0; i < 50 && (await chrome.storage.local.get("mode")).mode === undefined; i++)
        await new Promise((done) => setTimeout(done, 100));
      await chrome.storage.local.set({ debug: true, mode: "on" });
    });
    await p.close();
  }
  return {
    ctx,
    close: async () => {
      await ctx.close();
      await rm(dir, { recursive: true, force: true });
    },
  };
}

async function visit(url, withExt) {
  const { ctx, close } = await openContext(withExt);
  try {
    const page = await ctx.newPage();
    let error = null;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    } catch (e) {
      error = e.message.split("\n")[0];
    }
    await page.waitForTimeout(wait);
    const m = await measure(page);
    const tag = withExt ? (mode === "inject" ? (noSig ? "nosig" : "inject") : "ext") : "baseline";
    const shot = join(OUT, `${slug(url)}-${engine}-${tag}.png`);
    await page.screenshot({ path: shot });
    return { ...m, shot, error };
  } finally {
    await close();
  }
}

function format(url, base, un) {
  const lines = [`\n=== ${url}`];
  const row = (label, m) =>
    lines.push(
      `  ${label.padEnd(9)} cover=${m.cover ?? "-"}  overflow=${m.htmlOverflow}/${m.bodyOverflow}${m.bodyPosition === "fixed" ? " body-fixed" : ""}  scrolled=${m.scrolled}px  main=${m.mainText}${m.error ? `  ERROR ${m.error}` : ""}`,
    );
  row("baseline", base);
  row("tacet", un);
  if (un.debug) {
    for (const a of JSON.parse(un.debug).actions) {
      lines.push(
        `    ${a.type}/${a.kind} ${a.what} @${a.t}ms: ${a.reason}${a.text ? ` | ${a.text.slice(0, 90)}` : ""}`,
      );
    }
  } else if (un.hidden.length) {
    lines.push(`    hidden: ${un.hidden.join(", ")}  unlock: ${un.unlock ?? "-"}`);
  }
  lines.push(`  shots: ${base.shot}`, `         ${un.shot}`);
  return lines.join("\n");
}

await mkdir(OUT, { recursive: true });
const report = [];
const queue = [...urls];
await Promise.all(
  Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        const [base, un] = await Promise.all([visit(url, false), visit(url, true)]);
        console.log(format(url, base, un));
        report.push({ url, engine, mode, noSig, baseline: base, tacet: un });
      } catch (e) {
        console.log(`\n=== ${url}\n  FAILED ${e.message.split("\n")[0]}`);
      }
    }
  }),
);
await writeFile(
  join(OUT, `report-${engine}-${mode}${noSig ? "-nosig" : ""}.json`),
  JSON.stringify(report, null, 2),
);
