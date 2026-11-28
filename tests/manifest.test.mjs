import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(join(root, "src/manifest.json"), "utf8"));
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

describe("manifest", () => {
  test("has the same version as package.json", () => {
    assert.equal(manifest.version, pkg.version);
  });

  test("uses a version the stores accept (YYYY.M.D, optional fourth number)", () => {
    assert.match(
      manifest.version,
      /^20\d\d\.(?:[1-9]|1[0-2])\.(?:[1-9]|[12]\d|3[01])(?:\.[1-9]\d*)?$/,
    );
  });

  test("has a summary the stores accept, as written in store/listing.en.md", async () => {
    assert.ok(manifest.description.length <= 132, `${manifest.description.length} characters`);
    const listing = await readFile(join(root, "store/listing.en.md"), "utf8");
    const summary = /## Summary\n\n(.+)\n/.exec(listing)?.[1];
    assert.equal(summary, manifest.description);
  });

  // Chrome reads service_worker and Firefox reads scripts, each ignoring the
  // other; Chrome before 121 refuses a Manifest V3 extension with scripts.
  test("gives Chrome 121+ and Firefox the same background script", () => {
    assert.ok(Number(manifest.minimum_chrome_version) >= 121);
    const { service_worker, scripts, ...rest } = manifest.background;
    assert.equal(typeof service_worker, "string");
    assert.deepEqual(scripts, [service_worker]);
    assert.deepEqual(rest, {});
  });

  test("references only files that exist", async () => {
    const files = [
      ...Object.values(manifest.icons),
      ...Object.values(manifest.action.default_icon),
      manifest.action.default_popup,
      manifest.background.service_worker,
      ...manifest.background.scripts,
      ...manifest.content_scripts.flatMap((c) => [...(c.js ?? []), ...(c.css ?? [])]),
    ];
    for (const file of files) await access(join(root, "src", file));
  });
});
