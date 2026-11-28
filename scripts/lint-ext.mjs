// Mozilla's linter on src/, failing on any error or warning but one: the
// manifest gives Chrome background.service_worker next to Firefox's
// background.scripts, and the linter warns that Firefox ignores it.
//   pnpm lint:ext
import webExt from "web-ext";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWED = new Set(["BACKGROUND_SERVICE_WORKER_IGNORED"]);

const result = await webExt.cmd.lint(
  { sourceDir: join(root, "src"), output: "text", boring: false, pretty: false },
  { shouldExitProgram: false },
);
const failures = [...result.errors, ...result.warnings.filter((w) => !ALLOWED.has(w.code))];
const allowed = result.warnings.filter((w) => ALLOWED.has(w.code));
if (allowed.length) console.log(`Allowed: ${allowed.map((w) => w.code).join(", ")}.`);
if (failures.length) {
  console.error(
    `${failures.length} error(s) or warning(s): ${failures.map((f) => f.code).join(", ")}.`,
  );
  process.exitCode = 1;
}
