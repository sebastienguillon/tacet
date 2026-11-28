---
name: Tacet
description: Paper, ink and one highlighter. The sg-x family world, extended with keys nobody presses and an ink voice that reports what it did.
colors:
  green: "#526600"
  lime: "#d5ed75"
  unpressed: "#868b73"
  unpressed-line: "#b9bdaa"
  paper: "#f6f5ef"
  ink: "#20231d"
  muted: "#5c6353"
  line: "#d5d8ca"
  tint: "#e8eddb"
  ink-line: "#3a3e35"
  ink-muted: "#b4b9a6"
  selection: "rgb(168 199 11 / 30%)"
  popup-folder: "#141513"
  popup-raised: "#1d1e1b"
  popup-selected: "#33352f"
  popup-engraving: "#ecebe5"
  popup-grey: "#8f9288"
  popup-mark: "#7d8076"
  popup-rule: "#262824"
  popup-edge: "#3d3f39"
typography:
  display:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "min(116px, 8vw)"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "-0.045em"
  headline:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(36px, 4.3vw, 54px)"
    fontWeight: 700
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  title:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(28px, 3vw, 36px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  statement:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(21px, 2vw, 26px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  subtitle:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  lead:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 650
  nav:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 600
  meta:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: '"tnum"'
  popup-host:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  popup-state:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.35
  popup-body:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.35
  popup-brand:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.01em"
  popup-button:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
  popup-small:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.35
  popup-kind:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "10.5px"
    fontWeight: 600
    letterSpacing: "0.07em"
  popup-time:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
    fontSize: "11.5px"
    fontWeight: 400
    fontFeature: '"tnum"'
  popup-selector:
    fontFamily: 'ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.35
  popup-count:
    fontFamily: '"Tacet Figures"'
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 0
rounded:
  code: "3px"
  control: "8px"
  panel: "12px"
  pill: "17px"
  key: "0.17em"
  popup-bar: "1px"
  popup-icon: "5px"
  popup-segment: "6px"
  popup-segments: "9px"
  popup-switch: "13px"
spacing:
  content-width: "1120px"
  reading-width: "720px"
  section: "clamp(40px, 5vw, 64px)"
  gutter: "64px"
  page-margin: "32px"
  page-margin-mobile: "20px"
  block: "32px"
  stack: "24px"
  tight: "12px"
  popup-width: "340px"
  popup-max-height: "600px"
  popup-inset: "14px 16px 12px"
  popup-width-touch: "480px"
  popup-inset-touch: "20px"
  popup-row: "44px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.green}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.tint}"
  text-button:
    textColor: "{colors.green}"
    typography: "{typography.label}"
    height: "44px"
  nav-link:
    textColor: "{colors.muted}"
    typography: "{typography.nav}"
    height: "44px"
  nav-link-current:
    textColor: "{colors.ink}"
  unpressed-key:
    textColor: "{colors.unpressed}"
    typography: "{typography.display}"
    rounded: "{rounded.key}"
    padding: "0.05em 0.38em 0.13em"
  switch-track:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    width: "64px"
    height: "34px"
  switch-track-on:
    backgroundColor: "{colors.ink}"
  switch-thumb:
    backgroundColor: "{colors.ink}"
    size: "24px"
  switch-thumb-on:
    backgroundColor: "{colors.lime}"
  readout:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "18px 20px 8px"
    width: "340px"
  readout-verb:
    textColor: "{colors.lime}"
  readout-detail:
    textColor: "{colors.ink-muted}"
  privacy-panel:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "40px"
  contact-card:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "24px 28px"
  register:
    textColor: "{colors.ink}"
    typography: "{typography.data}"
  code-inline:
    backgroundColor: "{colors.tint}"
    rounded: "{rounded.code}"
    padding: "2px 5px"
  demo-frame:
    rounded: "{rounded.panel}"
    height: "560px"
  popup-rest-acted:
    textColor: "{colors.lime}"
    width: "64px"
    height: "48px"
  popup-rest-watching:
    textColor: "{colors.lime}"
  popup-rest-off:
    textColor: "{colors.popup-mark}"
  popup-count:
    textColor: "{colors.popup-engraving}"
    typography: "{typography.popup-count}"
  popup-segments:
    backgroundColor: "{colors.popup-raised}"
    rounded: "{rounded.popup-segments}"
    padding: "3px"
    height: "34px"
  popup-segment:
    textColor: "{colors.popup-grey}"
    typography: "{typography.popup-body}"
    rounded: "{rounded.popup-segment}"
  popup-segment-selected:
    backgroundColor: "{colors.popup-selected}"
    textColor: "{colors.popup-engraving}"
  popup-switch-row:
    textColor: "{colors.popup-engraving}"
    typography: "{typography.popup-body}"
    padding: "9px 0"
    height: "{spacing.popup-row}"
  popup-switch-track:
    backgroundColor: "{colors.popup-edge}"
    rounded: "{rounded.popup-switch}"
    width: "44px"
    height: "26px"
  popup-switch-track-on:
    backgroundColor: "{colors.lime}"
  popup-switch-thumb:
    backgroundColor: "{colors.popup-grey}"
    size: "20px"
  popup-switch-thumb-on:
    backgroundColor: "{colors.popup-folder}"
  popup-button:
    backgroundColor: "transparent"
    textColor: "{colors.popup-engraving}"
    typography: "{typography.popup-button}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "34px"
  popup-button-hover:
    backgroundColor: "{colors.popup-raised}"
  popup-button-active:
    backgroundColor: "{colors.popup-selected}"
  popup-button-primary:
    backgroundColor: "{colors.popup-engraving}"
    textColor: "{colors.popup-folder}"
    typography: "{typography.popup-button}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "34px"
  popup-button-primary-hover:
    backgroundColor: "#ffffff"
  popup-button-primary-active:
    backgroundColor: "#d9d8d1"
  popup-button-disabled:
    backgroundColor: "transparent"
    textColor: "{colors.popup-mark}"
  popup-change-row:
    textColor: "{colors.popup-engraving}"
    typography: "{typography.popup-selector}"
    padding: "9px 0 8px"
  popup-debug-row:
    textColor: "{colors.popup-grey}"
    typography: "{typography.popup-small}"
    padding: "6px 0 0"
---

# Design System: Tacet

## Overview

**Creative North Star: "The Unpressed Page"**

A reader's page in paper and ink. Whatever a site demands of the reader shows up as a key nobody presses: a pale, dashed outline at display size, drawn but inert. Tacet's own voice speaks only from ink panels with lime type, and one lime highlighter marks the answer. Everything else is quiet: warm off-white paper, olive-black ink, hairline rules, generous 17px/1.7 reading text, no shadows, no imagery beyond the mark.

The world is inherited, not invented. It belongs to the sg-x family (the user's sibling extension, `../sg-x/docs/styles.css`, outside this repository), chosen explicitly as "same family as sg-x". The shared family layer is identical value for value: paper, ink, muted, line, green, lime, tint, the selection colour, the system UI stack, the 1120px content and 720px reading widths, the section rhythm, header, footer, links, buttons, Read-page layouts and disclosures. Tacet adds four tokens and the devices built on them: the unpressed key colours (text and dashed line), the ink-panel rule and muted tokens, the switch, the readout, the ruled register, the lime highlighter under the answer, and the wash motion. Tacet extends the family without retuning any of its values.

Two things sit in the repository but outside this world. The made-up newspaper inside the homepage demo (`docs/demo/demo.css`, `en.html`, `fr.html`) imitates a generic news site on purpose, with a white ground, Georgia serif, a drop-shadowed consent box and uppercase tracked datelines. It is a contained exception that lives only inside the demo frame. The extension's toolbar popup (`src/popup/`) has its own dark world, documented in its own section, The Toolbar Popup, at the end of this file.

**Key Characteristics:**

- Paper ground (#f6f5ef) everywhere; depth comes from tone (tint card, ink panel), never from shadow.
- One type family at weights 400 to 750; display character comes from weight 750 and tracking down to -0.045em.
- Hairline-ruled structure: sections, lists, the register and disclosures are separated by 1px rules, not boxes.
- Unpressed keys: the site's demands rendered as dashed, inert outlines at display size.
- Ink panels with lime type are where Tacet itself speaks.
- One motion grammar: a status changes in place under a brief lime wash.
- Every string exists in English and French; layouts are sized for the longer French.

## Colors

A warm, low-chroma olive family on unbleached paper, with one saturated lime used sparingly.

### Primary

- **Olive Mark** (#526600): the family's working accent on paper. Body links (1px underline at 4px offset, 2px on hover), list markers, the current-page underline in the nav, the focus ring, the primary button's hover fill, the "Show all pages" text button, the live change count beside the switch, and disclosure summaries on hover. Holds 5.9:1 on paper and 5.4:1 on tint.

### Secondary

- **Highlighter Lime** (#d5ed75): Tacet's own voice. On ink it is type and marks: the privacy panel's heading and link, the readout's verbs ("Hidden", "Unlocked", "Repaired") and change count, the switch thumb when on, the focus ring inside ink panels (12.3:1 on ink). On paper it appears only as the highlighter underline beneath the answer, and transiently as the 22% wash of the motion grammar.

### Tertiary

- **Faded Key Olive** (#868b73, Tacet addition): the text of unpressed keys. 3.2:1 on paper, so it is legal only at display size, where it always sits.
- **Dashed Key Line** (#b9bdaa, Tacet addition): the 3px dashed outline of unpressed keys (2px under 650px). Pure decoration at 1.8:1; it carries no information.

### Neutral

- **Unbleached Paper** (#f6f5ef): the page ground and the text colour inside ink panels and on the primary button.
- **Olive-Black Ink** (#20231d): all headings and body text (14.6:1 on paper), the primary button, ink panels, the register's header rule, the switch track outline and its "on" fill. Also the browser `theme-color`.
- **Moss Grey** (#5c6353): secondary text, including leads, feature and list descriptions, captions, the store status, metadata, footer, inactive nav links and disclosure answers (5.7:1 on paper).
- **Pencil Hairline** (#d5d8ca): every 1px rule. Header and footer edges, section tops, register rows, list separators, disclosure edges, the demo frame's border, the nav's language divider.
- **Pale Sage Tint** (#e8eddb): the quiet card (support's "Report a problem"), inline code, and the secondary button's hover fill.
- **Ink Panel Rule** (#3a3e35, Tacet addition): hairlines between readout entries on ink.
- **Ink Panel Grey** (#b4b9a6, Tacet addition): secondary text on ink, including the readout's status sentence and per-entry details (7.9:1 on ink).
- **Lime Selection** (rgb(168 199 11 / 30%)): text selection on paper, inherited from the family.

### Named Rules

**The Family Rule.** The family tokens are sg-x's, value for value. Tacet adds tokens next to them and never retunes one.

**The Lime Has Two Places Rule.** Lime is type and marks on ink, where Tacet speaks, and a highlighter underline on paper, once per page. It is never text on paper and never the fill of a button or card. Its only other appearance is the transient wash.

**The Unpressed Rule.** The two unpressed colours belong only to keys nobody presses. Faded Key Olive holds 3.2:1, so it never appears below display size.

## Typography

**Display Font:** system-ui (with -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
**Body Font:** the same stack
**Label/Mono Font:** none distinct; inline code uses the browser's monospace at 0.85em on tint

**Character:** One family, inherited from sg-x by the user's choice of that family. Hierarchy is built from weight (400 body, 600 to 650 UI, 700 headings, 750 display and brand) and from tracking that tightens as size grows, from -0.02em at 21px to -0.045em at 116px. Headings use `text-wrap: balance`; the display headline uses `pretty`.

### Hierarchy

- **Display** (750, min(116px, 8vw), line-height 1, -0.045em): the homepage headline only. The first line is the unpressed keys and the second line is the answer, both at the same size; the answer, "Tacet presses neither.", stays on one line at 1440. French uses min(100px, 6.9vw), its answer on two lines. Under 650px both languages use min(15vw, 64px) at -0.04em.
- **Headline** (700, clamp(36px, 4.3vw, 54px), 1.14, -0.035em): the h1 of Read pages (privacy, support).
- **Title** (700, clamp(28px, 3vw, 36px), 1.2, -0.03em): section h2s on the homepage. Inside Read-page articles h2 steps down to 26px (24px on mobile).
- **Statement** (700, clamp(21px, 2vw, 26px), 1.2, -0.03em): the short declarative lines of the "never" list, each followed by a muted paragraph.
- **Subtitle** (700, 21px, 1.35, -0.02em): h3s (the names in the "what Tacet clears away" list); the contact card's h2 is set to the same 21px.
- **Lead** (400, 20px, 1.65, Moss Grey): the paragraph under a headline or section title, max 65ch; 18px under 650px.
- **Body** (400, 17px, 1.7): all reading text. Descriptive paragraphs cap at 62ch and Read pages at the 720px measure.
- **Label** (650, 15px): buttons, the switch label and state, the text button, the live count. Disclosure summaries use 650 at body size.
- **Nav** (600, 14px): header links.
- **Meta** (400, 14px, 1.5): captions, the store status, the update date, the policy index. Footer runs at 13px/1.65; readout details at 12.5px.
- **Data** (400, 15px, 1.45, tabular numerals): the register. Column heads are 700 at 13px, sentence case.
- **Brand** (750, 23px, -0.03em; 21px on mobile): the "Tacet" wordmark beside the 36px icon.

### Named Rules

**The Folded Question Rule.** No eyebrow, kicker or small label above a heading. When a section has a question to ask, the question goes into the heading itself, as the homepage folds "Accept all / Refuse" into its h1.

**The Ledger Figures Rule.** Every figure that changes or is compared uses tabular numerals. This covers register times, change counts and readout timings.

**The French Runs Longer Rule.** Sizes are set so the French fits rather than trimmed to the English. The French headline is smaller (min(100px, 6.9vw)), and below 480px French keys shrink to min(1em, 10.5vw) so "Tout accepter" stays one key while the answer keeps its size.

## Layout

A single centred column of content at 1120px (`min(1120px, 100% − 64px)`, so 32px page margins; 20px under 650px), set on paper with no background bands. Sections are separated by a 1px hairline at the top and clamp(40px, 5vw, 64px) of padding. Density is generous. Reading pages sit at a 720px measure, and running text never exceeds about 65ch.

Where two columns meet, the gap is 64px. The homepage offer pairs a 600px lead with the install actions. The "clears away" list sets a 260px name column against its description. The close pairs two equal columns, with text above, then links and install. The privacy page puts a sticky 260px section index (top 32px) beside the 720px article. The demo is the exception, with a fluid frame and a 340px sticky readout 28px apart. The support page is a single 720px column.

Responsive behaviour:

- **900px:** every two-column layout becomes one column. The readout and the policy index stop being sticky, and the index becomes a two-column grid between two hairlines.
- **650px:** mobile. Margins drop to 20px, the headline drops to min(15vw, 64px) and key dashes thin to 2px. Install buttons stack, the demo frame drops to 520px and the footer stacks. Each register row becomes a three-line block: site and time, then page · consent tool, then what Tacet did. ARIA roles keep it a table.
- **480px:** French keys shrink (see Typography).
- **380px:** the nav spreads across the full width; the policy index becomes one column.

Touch targets are 44px minimum for links in the nav, footer, close links and policy index (on mobile), and 48px for buttons and the switch.

## Elevation & Depth

The system is flat and casts no shadows. Depth is tonal and comes in three steps. Paper is the ground. Pale Sage Tint marks a quiet aside. An ink panel marks Tacet speaking. Structure comes from hairlines rather than raised surfaces. The one `box-shadow` in the system is an inset 1.5px ink line that draws an outline, used on the secondary button and the switch track. It is a border drawn without layout cost, not elevation.

### Named Rules

**The No-Shadow Rule.** Nothing on the site floats. If something needs more weight, it moves from paper to tint, or from tint to an ink panel.

## Shapes

Soft, small corners on a ruled page. Controls use 8px corners, and panels (the ink privacy panel, the readout, the tint card, the demo frame) use 12px. Inline code uses 3px. The switch track is a full pill (17px on a 34px track) with a circular 24px thumb. An unpressed key's corner scales with its type (0.17em), so it reads as the same key at every size.

Lines come in three kinds. Pencil Hairline at 1px divides everything. A heavier 1.5px ink line marks headers and outlines: the register's column heads, the secondary button, the switch track. The 3px dashed line (2px on mobile) belongs only to unpressed keys, so a dashed edge always means "not pressed". The disclosure chevron is drawn from two 1.5px borders rotated 45°, not a glyph.

The mark (`assets/icon.svg`) is an ink rounded square (28 on a 128 grid) carrying a lime multi-measure rest: a thick bar (72 by 28) between two end strokes (8 by 52), all with 3px corners, on one muted staff line (#5c6353, 4px). It is the sign an orchestral part prints for a passage marked tacet, so the name and the mark explain each other. One shape, so it holds at 16px.

## Components

### Buttons

Plain and solid, with no gradients, icons or uppercase.

- **Shape:** gently rounded (8px), 48px minimum height, 12px 22px padding, 650 weight at 15px.
- **Primary:** ink fill, paper text ("Install in Firefox").
- **Hover / Active / Focus:** hover fills with Olive Mark. Active returns to ink. Focus is a 3px olive outline at 4px offset. Colour changes are instant, with no transition.
- **Secondary:** transparent with a 1.5px inset ink outline and ink text ("Install in Chrome"). Hover fills with Pale Sage Tint.
- **Pairing:** primary and secondary always appear together with a Moss Grey status line under them at 14px.

### Links and the text button

- **Links:** Olive Mark with a 1px underline at 4px offset, 2px on hover, wrapping anywhere. Inside ink panels links turn lime, and so does their focus ring.
- **Text button:** a real `<button>` styled as a link (olive, underlined, 650 at 15px, 44px tall). It is used for "Show all 47 pages / Show fewer pages" under the register.

### Navigation

- **Header:** the brand (36px icon plus the 23px 750 wordmark) on the left and the nav on the right, above a hairline, with 18px vertical padding.
- **Links:** 14px 600 Moss Grey, 44px tall, with no underline at rest. Hover and the current page turn ink with a 2px olive underline at 7px offset.
- **Language switch:** "Français" / "English" comes last, set off by a hairline divider and 24px of padding. It carries its own `lang`.
- **Mobile:** the header wraps, the brand shrinks to 32px and 21px, and at 380px the nav spreads across the full width.

### Unpressed keys and the answer (signature)

The site's two consent buttons are set as part of the h1: each label sits in a 3px dashed Dashed Key Line outline with 0.17em corners, Faded Key Olive text, and padding 0.05em 0.38em 0.13em. Keys wrap with a 0.24em gap. They are inert spans inside a heading, not buttons. They have no hover, no cursor and no focus. Visually hidden punctuation (", or", "?") keeps the heading a sentence for screen readers. The answer follows at the same size in ink, with the final words in a `<mark>` drawn as a lime underline 0.3em thick at -0.2em offset with skip-ink off, so it reads as a highlighter stroke behind the letters.

### The Tacet switch (signature)

A real `role="switch"` button, hidden until the script runs: the word "Tacet", a track, then the state ("Off" / "On"; "Désactivé" / "Activé"), 650 at 15px, 48px tall. Off, the track is paper with a 1.5px inset ink outline and an ink thumb. On, the track fills with ink and the lime thumb slides 30px. The thumb moves over 220ms on cubic-bezier(0.16, 1, 0.3, 1), and colours change over 160ms ease-out. These are the only transitions besides the wash, and reduced motion turns both off. While the demo page reloads, the switch is disabled with a progress cursor. An olive live count ("3 changes") sits beside it in tabular numerals.

### The readout (signature)

Tacet's voice in the demo: a 340px ink panel (12px corners, 18px 20px 8px padding), sticky beside the frame on desktop. The top row is "Tacet" in paper at 16px 750 with the lime count at 13px. Under it an Ink Panel Grey status sentence (`role="status"`) explains what is happening and, once done, summarises what Tacet did and how to undo it. Each entry sits above an Ink Panel Rule hairline: a lime verb ("Hidden", "Unlocked", "Repaired"), the thing changed in paper, and a 12.5px Ink Panel Grey detail with the evidence and the time in tabular numerals. New entries arrive under the wash.

### The register (signature)

A ruled table of measured pages that never moves. The column heads are 13px 700 above a 1.5px ink rule. Rows have 11px vertical padding above 1px hairlines, with the site name in 650 and "What Tacet did" in Moss Grey. Times are right-aligned in tabular numerals. Each row starts in a waiting state ("Wall up" and an em dash, in Moss Grey, on top of the real text, which is hidden only visually). As the row scrolls into view, it turns to the real result under the wash, rows entering together staggered 70ms apart. The grid, row heights and order never change. Ten rows show by default and the text button reveals the rest. On mobile each row becomes a three-line block.

### Ink panel (privacy note)

The family's closing statement, used where Tacet states its privacy promise: an ink panel with 12px corners and 40px padding (28px 24px on mobile). A lime h2 sits on the left with a deliberate line break, and paper body text sits on the right in a 1 : 1.4 grid. Its link is lime.

### Cards / Containers

- **Corner Style:** 12px.
- **Background:** Pale Sage Tint for the one quiet card (support's "Report a problem"); ink for Tacet's voice. No other card types exist.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** none; tone does the work.
- **Internal Padding:** 24px 28px (22px on mobile) for the tint card.

### Disclosures

Support's quick checks are `<details>` separated by hairlines above and below. The summary is 650 at body size, padded 20px top and bottom, with a drawn chevron on the right that flips when open, and it turns olive on hover. The answer is in Moss Grey. The first one is open by default.

### Read-page furniture

The privacy page's index is titled "On this page" in 14px 700, with 14px Moss Grey links that turn olive and underlined on hover. Inline code sits on tint with 3px corners. List markers are olive, and the metadata line ("Privacy policy · Updated …") sits under the lead in 14px Moss Grey.

### The demo frame (contained exception)

The made-up page runs in an iframe with a 1px hairline border, 12px corners, a white background and a height of 560px (520px on mobile), with a 14px Moss Grey caption that says it is invented. Everything inside the frame, including the newspaper's serif, its white ground, the shadowed consent box and the uppercase datelines, imitates a generic news site and belongs to no part of this system.

### Motion

**The One Motion Rule.** A status changes in place under a brief lime wash: the background goes from rgb(213 237 117 / 22%) to transparent over 900ms on cubic-bezier(0.16, 1, 0.3, 1). New readout entries and turning register rows use it, and nothing else animates apart from the switch's own knob. Under `prefers-reduced-motion` the wash, the switch transitions and smooth anchor scrolling are all off, and the register shows its final state from the start.

## Do's and Don'ts

### Do:

- **Do** keep paper (#f6f5ef) as the only page ground, and give Tacet's own voice an ink (#20231d) panel with 12px corners and lime type.
- **Do** divide sections with a 1px Pencil Hairline (#d5d8ca) and clamp(40px, 5vw, 64px) of space, not with background bands or boxes.
- **Do** draw any question the site puts to the reader as unpressed keys (3px dashed #b9bdaa, 2px under 650px, text #868b73, 0.17em corners), only at display size.
- **Do** mark at most one answer per page with the lime highlighter: an underline 0.3em thick at -0.2em offset, skip-ink off.
- **Do** set every changing or compared figure in tabular numerals.
- **Do** announce every demo change in the readout (`role="status"`) and keep it reversible by the same switch.
- **Do** change a status in place under the 900ms lime wash, and turn it off under `prefers-reduced-motion`.
- **Do** write every string in English and French, and size headlines and keys for the French.
- **Do** keep touch targets at 44px minimum and buttons and the switch at 48px.
- **Do** focus with a 3px Olive Mark (#526600) outline at 4px offset; inside ink panels, lime.

### Don't:

- **Don't** put an eyebrow, kicker or small label above a heading; fold the question into the heading.
- **Don't** make an unpressed key clickable, hoverable or focusable, and don't style a real control with a dashed outline.
- **Don't** set lime as text on paper, or use it to fill buttons or cards.
- **Don't** add other motion: no fades, slides, scroll reveals, parallax or animated counters.
- **Don't** use drop shadows or gradients for depth; move from paper to tint to ink instead.
- **Don't** retune a family token (paper, ink, muted, line, green, lime, tint); add a named token beside it instead.
- **Don't** show site or consent-tool logos; their names stay plain text.
- **Don't** carry the demo newspaper's styles (Georgia serif, white ground, shadowed box, uppercase tracked datelines) out of the demo frame.

## The Toolbar Popup

The popup (`src/popup/`) is a second world beside the website's, with its own tokens (every `popup-` key in the frontmatter). It shares only three things with the site: the family's Highlighter Lime (#d5ed75), the lime selection colour and the system UI sans. Everything else is its own. The website's rules above govern the website. The rules in this section govern the popup, and neither carries into the other.

### Overview

**Creative North Star: "The Orchestral Part"**

The popup is an instrument's part on a black stand folder. What Tacet silenced on this page is counted the way engraved music counts silence: a multi-measure rest with its figure above it. Engraving white sits on folder black, hairlines run like staff lines, and lime marks only what is live. The page closes on a final double bar, and the debug row sits quietly below it. It is dense and small, a 340px instrument read in two seconds, not a reading page.

The popup is dark only, by the user's choice. It has no light mode and does not follow the system's colour scheme (`color-scheme: dark`, fixed).

**Key Characteristics:**

- Folder black (#141513) ground, engraving white (#ecebe5) text; dark only, never matched to the system.
- Lime only for live state: switches on, the rest when Tacet acted or watches, focus.
- The count is a multi-measure rest with a Tacet Figures numeral above it.
- Hairline rows (#262824) like staff lines; the foot closes on a final double bar.
- One motion: switch thumbs, track colours and the selected segment over 180ms ease-out.

### Colors

A near-neutral black with a faint olive cast, one engraving white, two greys and one live lime.

- **Highlighter Lime** (`{colors.lime}`, shared with the site): live state only. The switch track when on, the rest bar and its strokes when Tacet acted (solid) or watches (a 1.5px outline), and every focus ring. 14.1:1 on folder black.
- **Folder Black** (#141513): the ground of the whole popup, and the thumb and text colour on lime and on the primary button.
- **Raised Folder** (#1d1e1b): the segmented control's well and a button's hover fill.
- **Selected Folder** (#33352f): the sliding selection in the segmented control and a button's pressed fill.
- **Engraving White** (#ecebe5): all primary text, the count figure and the primary button's fill. 15.3:1 on folder black.
- **Folder Grey** (#8f9288): secondary text, including the mode hint, notes, unselected segments, the change list's number, kind, time and reason, disabled switch rows, the debug row and the switch thumb when off. 5.8:1 on folder black, 5.3:1 on Raised Folder.
- **Rest Grey** (#7d8076): marks rather than text, including the rest when Tacet is off, the final double bar, the list's scrollbar and disabled button text. 4.6:1 on folder black but 4.2:1 on Raised Folder, so it is never used for running secondary text.
- **Staff Hairline** (#262824): every 1px rule, under the header, between switch rows and under each change, plus the segmented control's border and a disabled button's border.
- **Folder Edge** (#3d3f39): the switch track when off, a button's 1px border and the rest's staff line.

**The Live Lime Rule.** In the popup, lime means "live now". It appears only on a switch that is on, the rest while Tacet acts or watches, and focus. It is never decoration, never text and never a button fill.

**The Two Greys Rule.** Folder Grey (#8f9288) is for words and Rest Grey (#7d8076) is for marks. Secondary text never drops to Rest Grey.

### Typography

**Labels and text:** system-ui (with -apple-system, "Segoe UI", sans-serif)
**Selectors:** ui-monospace (with "SF Mono", "Cascadia Mono", Consolas, monospace)
**Count:** Tacet Figures, Bravura's ten time-signature digits (SIL OFL 1.1, renamed as the licence requires), bundled as `src/popup/fonts/tacet-figures.woff2` with `font-display: block` and loaded from the package, never the network.

- **Host** (600, 24px, 1.1, -0.015em): the site's hostname, one line, ending in an ellipsis. "Not a web page" drops to 18px in Folder Grey.
- **Count** (Tacet Figures, 56px, line-height 0): the figure above the rest. A zero line-height puts the figure's middle on its line in every engine, because the glyphs are centred on their baseline with symmetric metrics.
- **State** (600, 14px): the sentence that heads the change list ("3 changes on this page").
- **Body** (400, 13px, 1.35): switch-row labels and segment labels (500, or 600 when selected).
- **Brand** (600, 13px, 0.01em): "Tacet" beside the 20px icon.
- **Button** (600, 13px, 1): Zap now and Undo on this page.
- **Small** (400, 12px): the mode hint, notes, each change's reason (clamped to two lines) and the debug row.
- **Kind** (600, 10.5px, 0.07em, uppercase): the change list's kind column (Overlay, Scroll, Content).
- **Time and number** (11.5px and 11px italic, tabular numerals): the change list's time and row number.
- **Selector** (monospace, 12px): the changed element, one line with an ellipsis. Monospace appears nowhere else.

**The Engraved Figure Rule.** Tacet Figures sets the count above the rest and nothing else. Every other figure in the popup is system UI in tabular numerals.

### Layout

One column, 340px wide on desktop (`popup-width`), padded 14px 16px 12px, capped at 600px tall. Past that height the change list gives way and scrolls while everything above and below stays put. Order, top to bottom: the brand row, then the host on the left and the rest on the right (48px tall, bottom-aligned) above a hairline. Under them come the segmented mode control and its hint, the two switch rows, Zap now and Undo side by side (8px apart, equal widths), the state sentence, notes and the change list, then the final double bar and the debug row.

The change list is a four-column grid (14px number, 58px kind, the selector, the time on the right), with the reason under the selector across the last two columns. Columns never change between rows.

On a coarse pointer (Firefox for Android opens the popup as a full page), the body goes fluid up to 480px, centred, padded 20px, with no height cap. The segmented control and buttons grow to 44px. Switch rows are 44px tall everywhere.

### Elevation & Depth

Flat. Depth is three tones of folder: black for the ground, Raised Folder for the control well and hover, Selected Folder for the selection and press. No `box-shadow` casts a shadow. The one use is an inset 1.5px line of currentColor that draws the rest's bar as an outline while Tacet watches or is off.

### Shapes

Small, rounded instrument corners. Buttons use 8px (the site's `control` value), the segmented well 9px, its sliding selection 6px, the brand icon 5px. Switches are full pills (13px on a 26px track) with a round 20px thumb. The rest is engraved square: a 7px bar with two 3px by 15px end strokes, all with 1px corners, on a 1px Folder Edge staff line.

Lines come in two kinds. The 1px Staff Hairline divides rows. The final double bar (1px over 3px, 3px apart, Rest Grey) closes the page.

### Components

#### The rest (signature)

The count of what Tacet silenced, set as a multi-measure rest at the right of the host: a thick bar between two strokes on a staff line, 64px by 48px, its Tacet Figures numeral above. It has three states, all of them colour and fill on the same shape. **Acted**: solid lime bar with the engraving-white count. **Watching** (on, nothing silenced yet): the bar drawn as a lime 1.5px outline, with no figure. **Off**: the outline in Rest Grey, with no figure. When there is no web page the rest is hidden but keeps its space. Switching the site on turns the rest from grey to lime in place. It is `aria-hidden`; the state sentence carries the meaning.

#### The segmented control

Where Tacet runs: three real radio inputs in a fieldset (legend visually hidden), drawn as a 34px well (Raised Folder, 1px Staff Hairline border, 9px corners, 3px padding) with three equal labels: Chosen sites, All sites, Off. A single Selected Folder block (6px corners) sits under the checked label and slides to it. Unselected labels are Folder Grey 500 and turn engraving white on hover. The selected label is engraving white 600. Focus draws a 2px lime outline inset 1px on the label. A 12px Folder Grey hint under it explains the chosen mode.

#### Switch rows

The label on the left and the switch on the right, 44px minimum, 9px vertical padding, with the whole row as the hit target and a Staff Hairline between rows. The switch is a real checkbox with `role="switch"` over a 44px by 26px pill. Off, the track is Folder Edge and the thumb Folder Grey. On, the track is lime and the thumb Folder Black, slid 18px. A disabled switch fades to 35% opacity and its row label turns Folder Grey. Focus draws a 2px lime ring at 2px offset around the track.

#### Buttons

Two equal buttons, 34px tall, 8px corners, 600 at 13px, with no icons and no uppercase.

- **Primary (Zap now):** an engraving-white fill with folder-black text. Hover goes to #ffffff and press to #d9d8d1.
- **Secondary (Undo on this page):** transparent with a 1px Folder Edge border and engraving-white text. Hover takes a Raised Folder fill with a Folder Grey border, and press takes Selected Folder.
- **Disabled:** transparent, Staff Hairline border, Rest Grey text, default cursor.
- **Focus:** a 2px lime outline at 2px offset.

#### The change list

What Tacet did, one change per row on a Staff Hairline, like bars on a staff. Each row has its italic number, uppercase kind, monospace selector and tabular time on one baseline, with the reason in 12px Folder Grey under it (two lines at most). The list scrolls inside the popup's height cap with a thin Rest Grey scrollbar. **More below:** while rows remain under the fold, the last 32px of the list fade to transparent (a mask, not an overlay), and the fade lifts once the list is scrolled to its end. The list region is `aria-live="polite"`.

#### The final double bar and the debug row

The page ends as a part ends: a final double bar (a 1px line, then a 3px line, in Rest Grey) 14px under the list. Under it sits the quiet debug row, a switch row with no minimum height, 6px top padding and 12px Folder Grey text, so it reads as small print after the last bar.

#### Motion

Switch thumbs, switch track colours and the selected segment move over 180ms ease-out. Segment label colour, button fill and border, and the rest bar's colour share the same 180ms. Nothing else animates: no entrances, no counters, no fades beyond the list's static mask. Under `prefers-reduced-motion` every transition is off.

### Do's and Don'ts

#### Do:

- **Do** keep the popup dark only: folder black (#141513) ground, engraving white (#ecebe5) text, `color-scheme: dark`.
- **Do** keep lime (#d5ed75) for live state only: a switch on, the rest while Tacet acts or watches, focus.
- **Do** count what Tacet silenced as the rest with its Tacet Figures numeral, and change its state in place by colour and fill.
- **Do** set secondary text in Folder Grey (#8f9288) and keep Rest Grey (#7d8076) for marks, disabled text and the double bar.
- **Do** put each switch on the right of a 44px row whose whole width toggles it.
- **Do** rule rows with 1px Staff Hairlines (#262824) and close the page on the final double bar.
- **Do** keep monospace for selectors and tabular numerals for times and row numbers.
- **Do** move only switch thumbs, track colours and the selected segment, over 180ms ease-out, and nothing under reduced motion.
- **Do** ship every font inside the package; the popup makes no network requests.

#### Don't:

- **Don't** add a light theme or follow the system's colour scheme.
- **Don't** use lime as text, as a button fill or as decoration.
- **Don't** carry the website's paper, ink, unpressed keys or wash into the popup, or the popup's folder palette onto the site.
- **Don't** set any figure other than the count in Tacet Figures, or any text other than selectors in monospace.
- **Don't** add a power button, a "blocked" badge or icons to buttons.
- **Don't** add shadows for depth; step from folder to Raised Folder to Selected Folder instead.
