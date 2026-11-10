# Tacet

Tacet is a Manifest V3 browser extension for Chrome and Firefox that removes consent walls and other blocking popups, their overlays, and the scroll locks they leave on `<html>`/`<body>`. It is plain JavaScript with no build step: the browsers load `src/` as it is.

It never clicks anything and records no choice: a hidden consent dialog stays unanswered, so consent-gated trackers stay off. Its name is the word a musical score uses to tell an instrument to stay silent.

## Install

Tacet is not published in the stores yet. The sections below load it from this repository as a development build, in Chrome or in Firefox.

Its public website is <https://sebastienguillon.github.io/tacet/>, in English and French (see [Public website](#public-website)).

## Requirements

- Google Chrome, or Firefox 140 or later
- A local copy of this repository
- Node.js 24 or later and pnpm 12 or later, for the tests and tools only

## Install locally in Chrome

1. Open Chrome and enter `chrome://extensions` in the address bar.
2. Enable **Developer mode** using the switch in the upper-right corner.
3. Click **Load unpacked**.
4. Select this repository's `src/` directory, the directory containing `manifest.json`.
5. Optionally open Chrome's Extensions menu and pin **Tacet** to the toolbar.

After changing the source, click the **Reload** button on the Tacet card in `chrome://extensions` and reload the open tabs. Chrome lists a warning about the `browser_specific_settings` key, which only Firefox reads; it is harmless.

## Install locally in Firefox

1. Open Firefox and enter `about:debugging` in the address bar.
2. Select **This Firefox**.
3. Click **Load Temporary Add-on…**.
4. Select `src/manifest.json` in this repository.

Firefox removes temporarily loaded extensions when the browser restarts. `pnpm start:firefox` starts a separate Firefox profile with Tacet loaded and reloads it when the source changes; `pnpm start:chrome` does the same in Chromium.

## Using it

Tacet works on its own as pages load. The toolbar popup can:

- choose where Tacet runs: **All sites** (the default), **Chosen sites** (only the sites you switch on), or **Off**;
- switch Tacet on or off for the current site (**Active on this site**). In **All sites** this makes an exception, in **Chosen sites** it adds the site; the choice is kept when you change modes, and **Off** overrides it. A site is its host name without `www.`, so `www.example.com` and `example.com` are one site and `news.example.com` is another;
- hide cookie banners that do not block the page, or leave them (on by default);
- hide whatever is left on the page (**Zap now**) and restore the page (**Undo on this page**);
- list what was hidden or repaired on the page and why;
- turn on debug logging (`[Tacet]` lines in the page console).

On a site where Tacet is off, the content script reads its settings and nothing else: it does not observe or change the page. **Zap now** still works there, on the current page only; **Undo on this page** stops it again.

The settings are in `browser.storage.local`: `mode` (`"on"`, `"sites"` or `"off"`), `sites` (`{ host: true | false }`), `banners` and `debug`. `src/content/tacet.js` documents them next to `runsOn()`, which `src/popup/popup.js` repeats. Sites switched off before modes existed, in `disabledHosts`, are still honoured and move into `sites` the first time the popup opens.

## How detection works

`src/content/tacet.js` runs at `document_start` in the top frame of every page.

1. **Signatures.** Containers of known consent and popup vendors (Didomi, Sourcepoint, OneTrust, AppConsent, Quantcast, Cookiebot, Usercentrics, Piano…) are hidden from a `MutationObserver` callback, before the browser paints them.
2. **Geometry.** On DOM changes, and on a timer during the first 15 s, the script hit-tests 9 viewport points with `elementFromPoint`, takes the outermost `position: fixed` layer at each point, and also lists fixed elements near the top of the tree, modal `<dialog>`s and open popovers. Each candidate is scored on:
   - coverage (at least 75 % of the viewport is an overlay; otherwise a popup, banner or corner box);
   - look: translucent backdrop or `backdrop-filter`, `z-index`, `role="dialog"`;
   - vocabulary in French, English, German, Spanish and Italian: cookies, partenaires, s'abonner, €/mois, adblock, a newsletter with an email field…;
   - container names and iframe `src` (`sp_message`, `consent`, `paywall`…);
   - whether the page is scroll-locked, and whether the layer stays for 2.5 s.

   Banners and corner boxes are hidden only when they are clearly about cookies.

3. **Scroll locks.** Once a wall is hidden, or a lock persists with content below the fold, `overflow: hidden|clip`, `position: fixed` on `<body>` (restoring the reading position), `pointer-events: none` and `touch-action: none` are overridden through attributes and high-specificity rules in `src/content/tacet.css`.
4. **Content repair.** Content the wall blurred, disabled or made `inert` is restored: right after a wall is hidden, and later only while a vendor class such as Didomi's `didomi-popup-open` stays on `<html>`/`<body>`. Only large, on-screen, in-flow wrappers are touched.

Tacet leaves alone:

- layers that appear right after a related click (login, menu, lightbox, "Je m'abonne");
- closed menus (`aria-hidden`, behind the page, link lists) and app shells (containing `main`, `article` or `nav`);
- anti-bot challenges (DataDome, Turnstile, reCAPTCHA…);
- scroll locks, blur and disabled content that follow the user's own clicks or key presses, and anything behind a menu or dialog that is open;
- closed drawers, off-screen slides, click-through decorations and blurred backgrounds.

Clicking a "cookie settings" control, such as "Modifier mes choix cookies", releases the vendor dialogs for the rest of the page.

## Development

### Project layout

| Path                      | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `src/`                    | The extension, loaded as is: manifest, content script and styles, popup, icons     |
| `tests/`                  | Behaviour tests in Chromium and Firefox, and manifest checks                       |
| `tests/fixtures/`         | Local pages reproducing walls, locks and the patterns that must be left alone      |
| `scripts/probe.mjs`       | Loads real sites with and without Tacet and reports the difference                 |
| `scripts/sites/`          | The URL lists the probe runs on                                                    |
| `scripts/icons.mjs`       | Exports `assets/icon.svg` to the PNG sizes in `src/icons/` and `docs/icon.png`     |
| `scripts/site.mjs`        | Copies the content script into `docs/demo/` for the website's demo                 |
| `scripts/screenshots.mjs` | Takes the store screenshots from the website's demo page                           |
| `store/`                  | The store listing's text and release notes, one file per language, and screenshots |
| `assets/`                 | The icon's SVG source                                                              |
| `docs/`                   | The public website, published by GitHub Pages; French pages in `docs/fr/`          |
| `.github/`                | The CI workflow, which runs `pnpm check`                                           |
| `out/`                    | Generated, ignored probe screenshots and reports                                   |
| `web-ext-artifacts/`      | Generated, ignored packages from `pnpm package`                                    |

### Install dependencies

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox
```

The second command downloads the browsers Playwright drives for the tests and the probe.

### Tests

```sh
pnpm test
```

`tests/extension.test.mjs` injects the content script into each page of `tests/fixtures/`, in Chromium and in Firefox, and checks what it hides, unlocks and repairs, and what it must leave alone: walls at load and after a delay, user-opened lightboxes and login forms, cookie-settings links, app shells, `position: fixed` locks, content blurred by a CMP class, menus that blur the page on purpose, inert drawers and slides, loading states and dropdowns that disable `<body>`. Each page is a test and each check a subtest. The website's two demo pages (`docs/demo/`) run the same way, so the homepage never shows a wall Tacet cannot remove. Node runs them with its built-in test runner. `tests/settings.test.mjs` runs the content script with a stand-in for the extension storage, on a fixture served at a real host name, and checks where it runs in each mode, that it leaves a site it is off for untouched, and that the popup records the mode and the site's choice. `tests/manifest.test.mjs` checks the manifest's version and file references, and `tests/site.test.mjs` that the website runs the shipped content script.

When a real site misbehaves, reproduce the pattern in a fixture before changing the detection, and make sure the new check fails without the change.

### Checking real sites

```sh
pnpm probe articles                  # the URL list in scripts/sites/articles.txt
pnpm probe controls homepages        # several lists
pnpm probe https://example.com/page  # any URL
```

The probe loads each page twice in Chromium, without and with the real unpacked extension, and prints what covers the centre of the page, the scroll-lock state, whether wheel scrolling works, the length of the main text, and every action Tacet took. Screenshots and a JSON report go to `out/`.

| List                          | Contents                                                       |
| ----------------------------- | -------------------------------------------------------------- |
| `scripts/sites/articles.txt`  | Article pages with consent walls, checked by hand in a browser |
| `scripts/sites/homepages.txt` | News and media home pages with consent walls                   |
| `scripts/sites/controls.txt`  | Sites without walls, where nothing may break                   |

Options: `--engine=firefox` (the script is injected, as Playwright cannot load Firefox add-ons), `--mode=inject`, `--no-sig` (inject mode only: vendor signatures off, to test the generic detection alone), `--wait=8000` (ms after `DOMContentLoaded`), `--concurrency=4`, `--headed`.

The probe sends a regular Chrome user agent because some consent tools skip headless browsers. Sites behind bot protection (Akamai, DataDome) refuse it and must be checked by hand, with the popup's list and debug logging.

### Configure VS Code or Cursor

Open the repository root and install the recommended **Oxc** extension (`oxc.oxc-vscode`). The committed `.vscode/settings.json` makes it the formatter for JavaScript, JSON, CSS, HTML and Markdown, with `.oxfmtrc.json`, and formats on save. Run **Developer: Reload Window** after installing dependencies so the editor finds the project's `oxlint` and `oxfmt`.

### Development commands

Run commands from the repository root:

| Command              | Purpose                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `pnpm test`          | Run the tests in `tests/` with Node's built-in test runner        |
| `pnpm lint`          | Check the source, tests and tools with Oxlint                     |
| `pnpm lint:fix`      | Apply Oxlint's safe automatic fixes                               |
| `pnpm lint:ext`      | Validate `src/` with Mozilla's add-on linter, every warning fatal |
| `pnpm format`        | Format supported project files with Oxfmt                         |
| `pnpm format:check`  | Verify formatting without changing files                          |
| `pnpm check`         | Lint, verify formatting, test, and validate the extension         |
| `pnpm start:chrome`  | Run Chromium with Tacet loaded, reloading it on source changes    |
| `pnpm start:firefox` | Run Firefox with Tacet loaded, reloading it on source changes     |
| `pnpm probe`         | Compare real sites with and without Tacet                         |
| `pnpm icons`         | Export `assets/icon.svg` to `src/icons/` and `docs/icon.png`      |
| `pnpm site`          | Copy the content script into the website's demo                   |
| `pnpm screenshots`   | Recreate the store screenshots (`pnpm screenshots fr` for French) |
| `pnpm site:serve`    | Serve `docs/` at <http://127.0.0.1:8766/> to preview the website  |
| `pnpm package`       | Run `pnpm check`, then zip `src/` into `web-ext-artifacts/`       |

Before committing changes, run:

```sh
pnpm check
```

### Continuous integration

`.github/workflows/ci.yml` runs `pnpm check` on every push to `master` and on every pull request, on Node.js 24, after installing Chromium and Firefox for Playwright. It installs with the lockfile frozen, uses the exact pnpm version that `pnpm-lock.yaml` pins, and only has read access to the repository. The actions are pinned to a commit rather than a tag, with the version in a trailing comment.

### Versions

Versions are dates, in the [Calendar Versioning](https://calver.org/) form `YYYY.M.D`, with a fourth number for a second release on the same day, such as `2026.10.20.1`. Set `version` in both `src/manifest.json` and `package.json`; `pnpm test` fails if they differ. `pnpm package` writes `web-ext-artifacts/tacet-<version>.zip` from `src/`. The code is not bundled or minified, so Mozilla does not need a separate source archive.

### Release to the stores

The store listing is not part of the extension: its text, the Chrome Web Store's privacy practices fields and the release notes are kept in [`store/listing.en.md`](store/listing.en.md) and [`store/listing.fr.md`](store/listing.fr.md), and pasted into each store's dashboard. The stores read the name and the summary from `src/manifest.json`; `pnpm test` checks that the summary matches the English listing and fits the Chrome Web Store's 132 characters.

1. Set the release's date as `version` in `src/manifest.json` and `package.json`, and add its notes to both listing files.
2. Run `pnpm package`, which checks everything and writes `web-ext-artifacts/tacet-<version>.zip`. The same ZIP goes to both stores.
3. Chrome Web Store: in the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/), upload the ZIP, paste the description, upload the screenshots from `store/screenshots/` (`pnpm screenshots` recreates them), and fill in **Privacy practices** from the listing. Save the draft, then submit for review.
4. addons.mozilla.org: upload the same ZIP at the [Developer Hub](https://addons.mozilla.org/developers/) and paste the description and the release notes. No source archive is needed, as the code is not bundled or minified.
5. Once a store publishes Tacet, point the website's install buttons at it (see [Public website](#public-website)).

## Public website

The homepage, privacy policy and support page are static files in `docs/`, with their French versions in `docs/fr/`, published at <https://sebastienguillon.github.io/tacet/>. GitHub Pages serves the `master` branch's `/docs` folder; `docs/.nojekyll` makes it publish the files as they are. There is no build step; preview with `pnpm site:serve` (the demo needs a server, not `file://`).

- The homepage demo runs the extension's own content script on a made-up newspaper (`docs/demo/en.html`, `docs/demo/fr.html`). After changing `src/content/`, run `pnpm site`; `pnpm test` fails until the copies match.
- The tested-pages table on the homepage holds the results of the 20 October 2026 probe run on `scripts/sites/articles.txt` and `homepages.txt`. Update both languages together when re-running it.
- The install buttons explain how to load Tacet from source until the stores approve it. When a store listing goes live, point its button at the listing and change its status line, in `docs/index.html` and `docs/fr/index.html`.
- Update `docs/privacy.html` and `docs/fr/confidentialite.html` whenever what the extension reads, keeps or sends changes.

## Limits

- Content that a wall script removes or truncates is not restored; only overlays, popups, locks and blurred or disabled content are handled.
- Scroll locks done with `wheel`/`touchmove` listeners calling `preventDefault()` are not undone.
- Only the top frame is processed.
- Tacet targets consent walls and nag popups; it does not try to get around subscription paywalls.

## License

Tacet is released under the [MIT License](LICENSE).
