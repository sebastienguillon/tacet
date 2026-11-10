# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who read news, media and everyday websites in Chrome or Firefox (desktop, and Firefox for Android) and keep hitting consent walls, cookie popups, newsletter or ad-blocker popups, and pages that refuse to scroll. Their job is to read the page they opened without being made to accept tracking or hunt for a "refuse" button. They install Tacet from the Chrome Web Store or addons.mozilla.org. No other audience is confirmed.

## Product Purpose

Tacet removes consent walls and other blocking popups, the overlays behind them, and the scroll locks they leave on `<html>`/`<body>`, as early as possible while the page loads, so the content underneath can be read and scrolled.

Success means:

- the page is readable and scrolls, with no wall in front of it;
- nothing the user opened themselves (a login form, a menu, a lightbox, cookie settings they asked for) is hidden;
- ordinary sites keep working exactly as without the extension.

## Positioning

Tacet never answers consent. It hides the wall without clicking Accept or Refuse, so the site's consent tool stays unanswered and trackers that wait for consent never get it. Tools that answer the dialog on the user's behalf cannot say this.

## Operating Context

- A content script runs at `document_start` in the top frame of every http/https page. On a site where Tacet is off, it reads its settings and leaves the page untouched. There is no background script, the only permission is `storage`, and the extension makes no network requests.
- The toolbar popup is the only interface. It chooses where Tacet runs (**All sites**, the default; **Chosen sites**, only the sites switched on; **Off**), switches Tacet on or off for the current site, toggles the hiding of non-blocking cookie banners (on by default), turns on a debug log in the page console, hides whatever is left (**Zap now**), restores the page (**Undo on this page**), and lists every element hidden or repaired, with the reason.
- Settings live in the browser's extension storage: the mode, the choice for each site, the banner toggle, debug.
- Distribution: the Chrome Web Store and addons.mozilla.org, with a public GitHub Pages site (homepage, privacy policy, support) at https://sebastienguillon.github.io/tacet/, as for the sibling extension `sg-x`. The store listing text is in `store/`.
- Development: `pnpm check` (lint, format, behaviour tests in Chromium and Firefox, Mozilla's linter) and `pnpm probe` on real sites; see README.md.

## Capabilities and Constraints

Capabilities:

- hides the containers of known consent and popup vendors (Didomi, Sourcepoint, OneTrust, AppConsent, Quantcast, Cookiebot, Usercentrics, Piano…) before they paint;
- finds other walls by layout, wording (French, English, German, Spanish, Italian) and timing, without per-site filter lists;
- lifts scroll locks and restores the reading position, and repairs content a wall blurred, disabled or made inert;
- leaves alone layers the user opened, closed menus, app shells, and anti-bot challenges;
- releases the vendor dialogs for the rest of the page when the user clicks a "cookie settings" control.

Constraints:

- Manifest V3, one manifest for Chrome and for Firefox 140+ (Firefox for Android 142+); plain JavaScript loaded from `src/` with no build step.
- Collects no data (`data_collection_permissions: none`), never clicks, never records a consent choice.
- Does not try to get around subscription paywalls.
- Does not restore content a wall script removed or truncated; processes the top frame only; does not undo locks made with `wheel`/`touchmove` listeners.

Terminology: wall, overlay, popup, banner, corner box, scroll lock, signature (a known vendor's container), CMP (consent management platform), Zap now, Undo, the modes All sites, Chosen sites and Off.

Open decisions:

- The popup is English only; the French interface is decided but not built. Until it is, the stores show the English summary in every language.
- Tacet is not yet submitted to the Chrome Web Store or addons.mozilla.org; the listing text is in `store/`.

## Brand Commitments

- Name: **Tacet**, the word a musical score uses to tell an instrument to stay silent: the extension stays silent on the consent question. Chosen on 21 October 2026 over "Unwall", a name another wall-removing project already uses (github.com/kelesmert/unwall). The repository is `sebastienguillon/tacet` (renamed from `sg-unwall` the same day) and the website https://sebastienguillon.github.io/tacet/; the Firefox add-on ID is `tacet@sebastienguillon`.
- Languages: the interface and the store listings are in English and French.
- Author: Sébastien Guillon. License: MIT.

## Evidence on Hand

- Behaviour tests: 67 checks in Chromium and Firefox over the pages in `tests/fixtures/`.
- Real-site lists in `scripts/sites/`: 23 article pages the user checked by hand in a browser with and without Tacet (`articles.txt`), 26 news home pages (`homepages.txt`), 16 sites without walls (`controls.txt`). Probe screenshots and reports in `out/` are local test artifacts of third-party sites, not publishable material.
- Existing assets: the icon source `assets/icon.svg` and its PNG exports in `src/icons/`.
- No users, reviews, ratings, install counts, testimonials or press exist yet; none may be invented.

## Product Principles

1. **Never answer for the user.** No clicks, no recorded consent, no choice made on their behalf.
2. **Everything visible and reversible.** Each hide or repair is listed with its reason and can be undone, per page or per site.
3. **Nothing leaves the browser.** No data collection, no network requests, settings stored locally.
4. **Consent walls and nag popups, not paywalls.** Paid-content restrictions are out of scope.
5. **English and French from the start.** Every user-facing text, in the extension, the stores and the site, exists in both.
