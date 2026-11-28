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

<!-- impeccable:design-map -->

Name: Tacet
Colors: primary: green #526600; secondary: lime #d5ed75; tertiary: unpressed #868b73; neutral: paper #f6f5ef; tertiary: unpressed-line #b9bdaa; neutral: ink #20231d; neutral: muted #5c6353 (+13 more in the sidecar)
Fonts: system-ui (display, headline, title, statement, subtitle, lead, body, label, nav, meta, data, popup-host, popup-state, popup-body, popup-brand, popup-button, popup-small, popup-kind, popup-time); ui-monospace (popup-selector); Tacet Figures (popup-count)
Spacing: content-width 1120px, reading-width 720px, section clamp(40px, 5vw, 64px), gutter 64px, page-margin 32px, page-margin-mobile 20px, block 32px, stack 24px, tight 12px, popup-width 340px (+5 more in the frontmatter)
Radius: code 3px, control 8px, panel 12px, pill 17px, key 0.17em, popup-bar 1px, popup-icon 5px, popup-segment 6px, popup-segments 9px, popup-switch 13px
North Star: "The Unpressed Page"
North Star: "The Orchestral Part"
Rules:

- The Family Rule. The family tokens are sg-x's, value for value.
- (+10 more)
  Don't:
- Don't put an eyebrow, kicker or small label above a heading; fold the question into the heading.
- Don't make an unpressed key clickable, hoverable or focusable, and don't style a real control with a dashed outline.
- Don't set lime as text on paper, or use it to fill buttons or cards.
- Don't add other motion: no fades, slides, scroll reveals, parallax or animated counters.
- Don't use drop shadows or gradients for depth; move from paper to tint to ink instead.
- Don't retune a family token (paper, ink, muted, line, green, lime, tint); add a named token beside it instead.
- Don't show site or consent-tool logos; their names stay plain text.
- Don't carry the demo newspaper's styles (Georgia serif, white ground, shadowed box, uppercase tracked datelines) out of the demo frame.
- Don't add a light theme or follow the system's colour scheme.
- Don't use lime as text, as a button fill or as decoration.
- Don't carry the website's paper, ink, unpressed keys or wash into the popup, or the popup's folder palette onto the site.
- Don't set any figure other than the count in Tacet Figures, or any text other than selectors in monospace.
- (+2 more)
  Map: docs/demo/demo.css
  Map: src/popup/
  Map: assets/icon.svg
  Map: src/popup/fonts/tacet-figures.woff2
  Full: .impeccable/design-full.md (read a section when you need its detail)
