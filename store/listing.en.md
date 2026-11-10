# Store listing, English

The text pasted into the stores' dashboards. The name and the summary are the `name` and `description` in `src/manifest.json`, which both stores read from the package; `pnpm test` keeps the summary within the Chrome Web Store's 132 characters. The description and the release notes are plain text, as the Chrome Web Store shows no markup. They name no sites or brands: the Chrome Web Store treats lists of them as keyword spam.

## Name

Tacet

## Summary

Hides consent walls, cookie popups and the scroll locks they leave, without clicking Accept or Refuse.

## Description

Tacet hides consent walls, cookie popups and the scroll locks they leave on the page, so you can read. It never clicks Accept or Refuse: the site's consent tool stays unanswered, and the trackers that wait for your consent never get it. Its name is the word a musical score uses to tell an instrument to stay silent.

What it removes. The popup asking you to accept, wherever it sits on the page. The dark or blurred backdrop stretched over the page. The scroll lock that stops the page from moving: Tacet lifts it and brings you back to where you were reading. The blur or disabled state some sites put on the article until you answer. Tacet also hides newsletter, notification and ad-blocker popups that appear without you asking.

How it finds them. Tacet recognises the most common consent tools and hides their windows as they are added to the page, usually before they appear on screen. It finds other walls by their shape, their place on the page and their wording, in English, French, German, Spanish and Italian. It needs no filter lists.

What it leaves alone. What you open yourself: a login form, a menu, a photo viewer. When you click a site's cookie settings link, its own dialog comes back for you to answer as you choose. Anti-bot checks such as CAPTCHAs are left in place.

You stay in control. Tacet's menu lists what it hid on the page and why. From there you can hide what is left with Zap now, restore the page with Undo on this page, switch Tacet off for a site, or leave in place the cookie banners that do not block the page. You also choose where it runs: on all sites, only on the sites you switch on, or on none.

Tacet clears consent walls; it does not get around paywalls, so articles reserved for subscribers stay reserved.

Privacy. Tacet has no server, no analytics and no account, and sends nothing anywhere. It needs access to the sites you visit to find walls on them, and storage to keep your settings on your device. Privacy policy: https://sebastienguillon.github.io/tacet/privacy.html

Tacet is open source under the MIT License: https://github.com/sebastienguillon/tacet. Its menu is in English; its website is in English and French: https://sebastienguillon.github.io/tacet/

Tacet is an independent project, not affiliated with the websites or the consent tools it handles.

## Screenshots

Upload, in this order, the 1280x800 images in `store/screenshots/` (`pnpm screenshots` recreates them from the website's demo page, a made-up newspaper with a made-up consent wall):

1. `en-1-wall-1280x800.jpg`: the page as a browser without Tacet shows it.
2. `en-2-tacet-1280x800.jpg`: the same page with Tacet, and its menu listing what it did.

## Chrome Web Store: Privacy practices

These fields are entered separately in the Chrome Developer Dashboard, under Privacy practices. They are not supplied by the extension ZIP or the public description. Paste each paragraph into its matching field, then click Save Draft before submitting for review. See [Chrome's privacy fields guide](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

### Single purpose

Tacet has one purpose: removing the consent walls and other blocking popups that cover web pages, together with their overlays and the scroll locks they leave, so the page can be read, without answering the consent dialog.

### storage justification

Tacet uses storage to remember, on the user's device, where it runs (all sites, chosen sites or none), the sites the user switched it on or off for, whether it hides cookie banners that do not block the page, and whether its debug log is on. Nothing stored is sent anywhere; Tacet makes no network requests.

### Host permission justification

Tacet's content script runs on every http and https page because consent walls and blocking popups can appear on any site, as soon as the page starts loading. It reads the page's layout, its visible text and the names of its elements only to recognise a wall, then hides the wall and lifts the scroll lock it left, inside the page. It does not read form input, cookies or browsing history, and sends no page data anywhere.

### Remote code

Select “No, I am not using remote code.” All of Tacet's code is in the extension package: one content script, one stylesheet and the popup. It loads nothing from the network and runs no code from the pages it visits.

### Data usage

Leave every type of user data unchecked: Tacet collects none. Tick the three certifications: no data is sold or transferred to third parties, no data is used or transferred for purposes unrelated to the extension's single purpose, and no data is used or transferred to determine creditworthiness or for lending.

### Privacy policy URL

https://sebastienguillon.github.io/tacet/privacy.html

## addons.mozilla.org

- Summary and description: as above.
- Homepage: https://sebastienguillon.github.io/tacet/
- Support site: https://sebastienguillon.github.io/tacet/support.html
- License: MIT License.
- Privacy policy: not required, as Tacet declares in its manifest that it collects no data.
- The code is not bundled or minified, so no source archive is needed.

## Release notes

### 2026.11.10

Choose where Tacet runs, from the top of its menu: on all sites, as before; only on the sites you switch on, so it leaves every other site untouched; or on none. Zap now still works on the current page in every mode. On a site where Tacet is off, it no longer changes anything while the page loads.

### 2026.10.20

First release. Tacet hides consent walls, cookie popups, and the newsletter, notification and ad-blocker popups that appear on their own, with the backdrops behind them and the scroll locks they leave, without clicking Accept or Refuse. It restores content a wall blurred or disabled, leaves alone what you open yourself, and steps aside when you open a site's cookie settings. Its menu lists what it hid and why, and can hide what is left, undo its changes on a page, or switch it off for a site.
