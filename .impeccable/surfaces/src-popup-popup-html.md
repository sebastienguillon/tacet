---
version: 1
slug: "src-popup-popup-html"
primary_target: "src/popup/popup.html"
related_targets: ["src/popup/popup.css", "src/popup/popup.js"]
---

# Surface brief: the toolbar popup

Scope: the extension's toolbar popup (`src/popup/`), ~340px wide on desktop, full width on Firefox for Android. Mode: Operate.

Audience and job: a reader mid-article checks in two seconds whether Tacet works on this site, switches the site on (new installs run on Chosen sites), sees what Tacet silenced, and zaps or undoes. Constraints: dark only (pinned by the user: no light mode, no system matching); iOS-style switches on the right of each row (pinned); English only for now; labels may change if every doc quoting them changes too; debug sits quiet at the bottom; no network requests, so every font ships in the package.

Memorable moment: the count of what Tacet silenced, set as a multi-measure rest.

## Direction contract

THESIS: The popup is an instrument's part on a black stand folder: what Tacet silenced on this page is counted the way engraved music counts silence, a multi-measure rest with its figure above it. It refuses the category's settings sheet with a power button and a "blocked" badge.

OWN-WORLD: Folder black #141513, engraving white #ecebe5, the icon's lime #d5ed75 only for live state (switches on, the rest bar when Tacet acted, focus), grey #7d8076 for secondary text, hairlines #262824 like staff lines. System UI sans for labels, monospace only for selectors, engraved time-signature figures (Tacet Figures, subset from Bravura) for the count. The foot closes on a final double bar.

STORY: The reader sees the site, whether Tacet acts on it and how much it silenced; one tap switches the site on; Zap now and Undo sit under the switches; the list says what changed and why.

FIRST VIEWPORT: Brand row; the host large on the left and the rest bar with its figure on the right; the segmented mode control and its hint; two switch rows; Zap now (solid engraving white) beside Undo; the count sentence and the changes on hairlines in fixed columns (number, kind, target, time; reason under); the final double bar; the quiet debug row. Signature interaction: switching the site on turns the rest bar from grey to lime in place. Motion grammar: switch thumbs and the selected segment slide over 180ms ease-out; nothing else moves; none under reduced motion.

FORM: The Orchestral Part, position 1 on the ordered list (Impeccable's pick, chosen by the user). seed:df7912b170a31356

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
