/*
 * Tacet content script.
 *
 * Hides consent walls and other blocking popups, their overlays, and the
 * scroll locks they leave on <html>/<body>. Detection has three layers:
 *
 *   1. Signatures: containers of known consent/paywall vendors, hidden
 *      synchronously from a MutationObserver so they are never painted.
 *   2. Geometry: hit-test a grid of viewport points, take the outermost
 *      fixed-position layer on top of each point, and score it on size,
 *      look (backdrop, z-index), text (cookies, s'abonner, adblock...),
 *      and persistence.
 *   3. Scroll locks: once a wall is hidden (or a lock persists with content
 *      below the fold), override overflow/position locks on <html>/<body>.
 *
 * Layers that appear within GESTURE_GRACE ms of a user click are treated as
 * user-opened (menus, lightboxes, login forms) and left alone.
 *
 * Nothing is clicked and no consent is recorded: hidden CMPs stay unanswered.
 */
(() => {
  "use strict";
  if (globalThis.__tacetLoaded) return;
  globalThis.__tacetLoaded = true;

  const ext = globalThis.browser?.storage
    ? globalThis.browser
    : globalThis.chrome?.storage
      ? globalThis.chrome
      : null;
  // Test harness mode: injected into the page world without extension APIs.
  const TEST = !ext && globalThis.__tacetTest === true;

  const GESTURE_GRACE = 1500; // ms after a click during which new layers count as user-opened
  const OPENER_GRACE = 3000; // same, for controls that announce they open something (login, menu...)
  const PERSIST = 2500; // ms a weak candidate or a bare scroll lock must last before we act
  const EAGER = 15000; // ms after start during which scans run more often
  const SAMPLE = [
    [0.5, 0.5],
    [0.3, 0.3],
    [0.7, 0.3],
    [0.3, 0.7],
    [0.7, 0.7],
    [0.5, 0.2],
    [0.5, 0.8],
    [0.15, 0.5],
    [0.85, 0.5],
  ];

  // [vendor, selector of the outermost container]. Only distinctive ids/classes.
  const SIGNATURES = [
    ["Didomi", "#didomi-host"],
    ["Sourcepoint", 'div[id^="sp_message_container_"]'],
    ["OneTrust", "#onetrust-consent-sdk"],
    ["Quantcast/InMobi Choice", "#qc-cmp2-container, .qc-cmp2-container"],
    ["Cookiebot", "#CybotCookiebotDialog, #CybotCookiebotDialogBodyUnderlay"],
    ["Usercentrics", "#usercentrics-root, #usercentrics-cmp-ui"],
    ["TrustArc", "#truste-consent-track, .truste_overlay, .truste_box_overlay, #consent_blackbar"],
    ["Axeptio", "#axeptio_overlay"],
    ["tarteaucitron", "#tarteaucitronRoot"],
    ["iubenda", "#iubenda-cs-banner"],
    ["Complianz", "#cmplz-cookiebanner-container"],
    ["CookieYes", ".cky-consent-container, .cky-overlay"],
    ["Osano", ".osano-cm-window"],
    ["Borlabs", "#BorlabsCookieBox"],
    ["consentmanager", "#cmpbox, #cmpbox2, .cmpboxBG"],
    ["Google Funding Choices", ".fc-consent-root, .fc-ab-root"],
    ["Sirdata", "#sd-cmp"],
    ["Ketch", "#lanyard_root"],
    ["AppConsent (SFBX)", "#appconsent"],
    ["Piano", ".tp-modal, .tp-backdrop"],
    ["OneSignal", "#onesignal-slidedown-container, #onesignal-popover-container"],
  ];
  // The harness can switch signatures off to test the generic detection alone.
  const SIG_ALL =
    TEST && globalThis.__tacetNoSig ? ":not(*)" : SIGNATURES.map((s) => s[1]).join(",");

  // [category, label, pattern] matched against lower-cased rendered text.
  const KEYWORDS = [
    ["consent", "cookie", /\bcookies?\b/],
    ["consent", "consent", /consent|einwilligung|toestemming|consenso/],
    ["consent", "gdpr", /\b(?:rgpd|gdpr|dsgvo|tcf)\b/],
    [
      "consent",
      "privacy",
      /vie privée|confidentialité|privacy|datenschutz|privacidad|riservatezza/,
    ],
    ["consent", "partners", /\bpartenaires\b|\bpartners?\b/],
    ["consent", "trackers", /traceurs|trackers|\btracking\b/],
    [
      "consent",
      "accept-all",
      /tout accepter|accept all|alle akzeptieren|accetta tutt|aceptar tod|alles accepteren/,
    ],
    ["consent", "no-accept", /continuer sans accepter|continue without accepting|weiter ohne/],
    [
      "consent",
      "legit-interest",
      /intérêt légitime|legitimate interest|berechtigte[sn]? interesse/,
    ],
    [
      "wall",
      "subscribe",
      /s['’]abonner|abonnez-vous|\babonnement|subscribe|subscription|abonnieren|\babo\b|suscr[ií]b|abbonati/,
    ],
    [
      "wall",
      "subscribers",
      /réservée? aux abonnés|subscribers only|for subscribers|für abonnenten/,
    ],
    ["wall", "ad-free", /sans publicité|sans pub\b|ad-free|werbefrei|ohne werbung|without ads/],
    [
      "wall",
      "account",
      /créer un compte|créez (?:un|votre) compte|create (?:an|a free|your) account|sign up|inscrivez-vous|registrieren|regístrate/,
    ],
    [
      "wall",
      "continue-reading",
      /continuer (?:à|a) lire|poursuivre (?:la|votre) lecture|continue reading|weiterlesen/,
    ],
    [
      "wall",
      "price",
      /(?:€|eur|euros?)\s*(?:\/|par)\s*mois|\bper month\b|pro monat|\/\s*mois\b|\/\s*month\b/,
    ],
    ["news", "newsletter", /newsletter|lettre d['’]information|infolettre/],
    [
      "news",
      "push",
      /(?:activer|autoriser|recevoir|enable|allow|turn on|aktivieren)\b[^.]{0,30}\bnotifications?|notifications? push/,
    ],
    [
      "adblock",
      "adblock",
      /ad ?-?block|bloqueurs? de pub|bloqueurs? de publicités?|werbeblocker|liste blanche|whitelist/,
    ],
  ];
  const WEAK =
    /\b(?:accepter|j['’]accepte|accept|agree|refuser|reject|decline|continuer|continue|fermer|close|plus tard|later|non merci|no thanks|se connecter|connexion|log ?in|sign in|anmelden|offre|offer|gratuit|free)\b/g;
  const ATTR_STRONG =
    /didomi|onetrust|cookiebot|cybot|usercentrics|sp_message|qc-cmp|truste|axeptio|tarteaucitron|cookie|consent|gdpr|rgpd|(?:^|[-_\s])cmp(?:[-_\s]|$)|paywall|cookiewall|regwall|adblock|newsletter|subscri|abonn|tp-modal|poool/i;
  const ATTR_WEAK =
    /modal|popup|pop-up|overlay|backdrop|lightbox|dialog|interstitial|veil|blocker|(?:^|[-_\s])wall(?:[-_\s]|$)/i;
  // Anti-bot challenges block on purpose and hiding them only strands the user.
  const NEVER =
    /captcha|ddchallenge|cf-chl|challenge-(?:platform|form|container|running)|turnstile|hcaptcha|recaptcha|arkoselabs|funcaptcha/i;
  // Clicks on these close things, so they cannot have opened what appears next.
  const CLOSER =
    /^\s*(?:[×✕✖x]|fermer|close|non merci|no thanks|plus tard|later|annuler|cancel|ok|j'ai compris|got it)\s*$/i;
  // Labels of controls that open a dialog, possibly after a network round trip.
  const OPENER =
    /connexion|se connecter|connectez|log ?in|sign ?in|s['’]inscrire|inscription|register|menu|rechercher|search|partager|share/i;
  // Controls the user clicks to open cookie settings on purpose.
  const CMP_OPENER =
    /cookie|consent|privacy|vie privée|confidentialit|rgpd|gdpr|traceurs|datenschutz|privacidad|didomi|onetrust|cookiebot|usercentrics|sourcepoint|axeptio|tarteaucitron|\bcmp\b/i;

  const settings = { debug: TEST, banners: true };
  const host = location.hostname.replace(/^www\./, "");
  const T0 = performance.now();
  const now = () => performance.now() - T0;

  // Off until the settings say Tacet runs on this host, so a site it is off for is
  // never touched. Also off after Undo on this page; on after Zap now.
  let active = TEST;
  let siteOn = null; // what the settings say for this host; null until they are read
  let sigOn = true; // false once the user opens cookie settings on purpose
  let done = new WeakSet();
  const userOwned = new WeakSet();
  const firstSeen = new WeakMap();
  const actions = []; // {type, el, kind, reason, what, text, t, undone, undo}
  let lastGesture = -1e9;
  let gestureGrace = GESTURE_GRACE;
  let gestureOpener = false; // the control announced it opens something
  let gestureKw = keywords(""); // keyword categories in the clicked control's label
  let lastGestureCmp = false;
  let lockSince = 0;
  let lockByUser = false;
  let lastHide = -1e9;
  let contentDirty = false; // page content may have been blurred/disabled since the last repair
  let flagSeen = false; // a vendor class was on <html>/<body> at the last class change
  let freed = new WeakMap(); // element -> reasons already recorded by freeContent()

  const log = (...args) => settings.debug && console.debug("[Tacet]", ...args);

  // ---------------------------------------------------------------- helpers

  function describe(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    const cls =
      typeof el.className === "string"
        ? el.className.trim().split(/\s+/).slice(0, 3).join(".")
        : "";
    if (cls) s += "." + cls;
    return s.slice(0, 120);
  }

  function parentOf(n) {
    if (n.parentElement) return n.parentElement;
    const root = n.parentNode;
    return root && root.host ? root.host : null;
  }

  function matches(el, sel) {
    try {
      return el.matches(sel);
    } catch {
      return false;
    }
  }

  function insideHidden(el) {
    for (let n = el; n; n = parentOf(n)) if (done.has(n)) return true;
    return false;
  }

  function visibleRect(r) {
    const vw = innerWidth,
      vh = innerHeight;
    const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    return { w, h, cov: (w * h) / (vw * vh) };
  }

  function zIndexOf(el, cs) {
    let z = parseInt(cs.zIndex, 10) || 0;
    let i = 0;
    for (const c of el.children) {
      if (i++ > 10) break;
      z = Math.max(z, parseInt(getComputedStyle(c).zIndex, 10) || 0);
    }
    return z;
  }

  function translucent(el, cs) {
    const looks = (s) => {
      const m = s.backgroundColor.match(/rgba?\(([^)]+)\)/);
      const a = m ? parseFloat(m[1].split(/[\s,/]+/).filter(Boolean)[3] ?? "1") : 1;
      const backdrop =
        (s.backdropFilter && s.backdropFilter !== "none") ||
        (s.webkitBackdropFilter && s.webkitBackdropFilter !== "none");
      return (a > 0 && a < 1) || backdrop;
    };
    if (looks(cs)) return true;
    const first = el.firstElementChild;
    return !!first && looks(getComputedStyle(first));
  }

  const textCache = new WeakMap();
  function cachedText(el) {
    const c = textCache.get(el);
    if (c && now() - c.t < 2000) return c.text;
    const text = deepText(el);
    textCache.set(el, { t: now(), text });
    return text;
  }

  // Rendered text of el, including open shadow roots and same-origin iframes.
  function deepText(el, max = 6000) {
    let out = el.innerText || el.textContent || "";
    if (el.tagName === "IFRAME") {
      try {
        out += " " + (el.contentDocument?.body?.innerText || "");
      } catch {
        /* cross-origin */
      }
    }
    const extra = (root) => {
      if (out.length >= max) return;
      if (root.shadowRoot) out += " " + root.shadowRoot.textContent;
    };
    extra(el);
    let i = 0;
    for (const d of el.querySelectorAll("*")) {
      if (i++ > 400 || out.length >= max) break;
      extra(d);
      if (d.tagName === "IFRAME") {
        try {
          out += " " + (d.contentDocument?.body?.innerText || "");
        } catch {
          /* cross-origin */
        }
      }
    }
    return out.slice(0, max).toLowerCase();
  }

  // ids, classes and labels of el, a few ancestors (bare iframes sit in a named
  // container) and up to `limit` descendants.
  function attrText(el, limit) {
    const bits = [];
    const add = (n) => {
      bits.push(
        n.id,
        typeof n.className === "string" ? n.className : "",
        n.getAttribute("aria-label"),
        n.getAttribute("title"),
        n.getAttribute("name"),
        n.tagName === "IFRAME" ? n.getAttribute("src") : "",
      );
    };
    add(el);
    for (let n = parentOf(el), up = 0; n && up < 2 && n !== document.body; n = parentOf(n), up++)
      add(n);
    let i = 0;
    for (const d of el.querySelectorAll("*")) {
      if (i++ >= limit) break;
      add(d);
    }
    return bits.filter(Boolean).join(" ");
  }

  function keywords(text) {
    const hits = [];
    const cat = { consent: 0, wall: 0, news: 0, adblock: 0 };
    for (const [c, label, re] of KEYWORDS) {
      if (re.test(text)) {
        hits.push(label);
        cat[c]++;
      }
    }
    const weak = new Set(text.match(WEAK) || []).size;
    return { hits, ...cat, strong: hits.length, weak: Math.min(weak, 3) };
  }

  function isDialogish(el) {
    return (
      matches(el, '[role="dialog"], [role="alertdialog"], [aria-modal="true"], dialog') ||
      !!el.querySelector('[role="dialog"], [role="alertdialog"], [aria-modal="true"], dialog')
    );
  }

  let bodyTextLen = -1; // cached per scan
  function isAppShell(el, text) {
    if (el.querySelector('main, article, [role="main"], nav')) return true;
    if (text.length < 2000) return false;
    if (bodyTextLen < 0) bodyTextLen = (document.body.innerText || "").length;
    return text.length > 0.6 * bodyTextLen;
  }

  // Outermost fixed (or large high-z absolute) ancestor of a hit-tested element.
  function findLayer(el, x, y) {
    let layer = null;
    for (let n = el; n && n !== document.body && n !== document.documentElement; n = parentOf(n)) {
      const cs = getComputedStyle(n);
      if (cs.position === "fixed") layer = n;
      else if (
        cs.position === "absolute" &&
        (parseInt(cs.zIndex, 10) || 0) >= 10 &&
        visibleRect(n.getBoundingClientRect()).cov >= 0.75
      )
        layer = n;
    }
    if (!layer) {
      // Hosts of closed shadow roots report a rect that does not contain the hit.
      const r = el.getBoundingClientRect();
      if (
        el !== document.body &&
        el !== document.documentElement &&
        !(x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)
      )
        layer = el;
    }
    return layer;
  }

  function hitAt(x, y) {
    let el = document.elementFromPoint(x, y);
    while (el && el.shadowRoot) {
      const inner = el.shadowRoot.elementFromPoint(x, y);
      if (!inner || inner === el) break;
      el = inner;
    }
    return el;
  }

  // Rendered, visible and at least partly on screen (closed drawers often stay
  // rendered with visibility: hidden, opacity: 0 or an off-screen transform).
  function showing(el) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility !== "visible") return false;
    if (parseFloat(cs.opacity) === 0 && cs.pointerEvents === "none") return false;
    return visibleRect(el.getBoundingClientRect()).cov > 0;
  }

  const SKIP_TAGS = new Set([
    "SCRIPT",
    "STYLE",
    "LINK",
    "META",
    "NOSCRIPT",
    "TEMPLATE",
    "HEAD",
    "BR",
    "svg",
  ]);

  // Fixed-position elements near the top of the tree (portals usually live there).
  function fixedNearTop(maxDepth = 3, budget = 600) {
    const out = [];
    const queue = [[document.body, 0]];
    for (const c of document.documentElement.children) {
      if (c !== document.body && c.tagName !== "HEAD") queue.push([c, 1]);
    }
    for (let qi = 0; qi < queue.length && budget > 0; qi++) {
      const [node, depth] = queue[qi];
      for (const c of node.children) {
        if (budget-- <= 0) break;
        if (SKIP_TAGS.has(c.tagName) || done.has(c)) continue;
        const cs = getComputedStyle(c);
        if (cs.display === "none") continue;
        if (cs.position === "fixed") {
          out.push(c);
          continue;
        }
        if (depth < maxDepth) {
          queue.push([c, depth + 1]);
          if (c.shadowRoot) queue.push([c.shadowRoot, depth + 1]);
        }
      }
    }
    return out;
  }

  // ---------------------------------------------------------------- actions

  function record(type, el, extra, undo) {
    const a = { type, el, what: describe(el), t: Math.round(now()), undone: false, undo, ...extra };
    actions.push(a);
    publish();
    return a;
  }

  function hide(el, kind, reason, text = "") {
    if (done.has(el)) return;
    done.add(el);
    lastHide = now();
    contentDirty = true;
    // A lock that started just before this wall showed up is the wall's, not the user's.
    if (lockSince && lastHide - lockSince < GESTURE_GRACE) lockByUser = false;
    if (el.tagName === "DIALOG" && el.open) {
      try {
        el.close();
      } catch {
        /* ignore */
      }
    }
    if (matches(el, ":popover-open")) {
      try {
        el.hidePopover();
      } catch {
        /* ignore */
      }
    }
    const prev = el.style.getPropertyValue("display");
    const prio = el.style.getPropertyPriority("display");
    el.setAttribute("data-tacet-hidden", kind);
    // Inline as well: document CSS does not reach into shadow roots.
    el.style.setProperty("display", "none", "important");
    if (document.activeElement && el.contains(document.activeElement))
      document.activeElement.blur?.();
    record(
      "hide",
      el,
      { kind, reason, text: text.replace(/\s+/g, " ").trim().slice(0, 140) },
      () => {
        el.removeAttribute("data-tacet-hidden");
        el.style.removeProperty("display");
        if (prev) el.style.setProperty("display", prev, prio);
      },
    );
    log("hid", kind, reason, el);
  }

  function hideSignature(el) {
    if (done.has(el) || !sigOn) return;
    const sig = SIGNATURES.find(([, sel]) => matches(el, sel));
    hide(el, "signature", sig ? sig[0] : "signature");
  }

  function matchSignatures(node) {
    if (matches(node, SIG_ALL)) hideSignature(node);
    else if (node.firstElementChild)
      for (const m of node.querySelectorAll(SIG_ALL)) hideSignature(m);
  }

  function releaseSignatures() {
    if (!sigOn) return;
    sigOn = false;
    for (const a of actions) {
      if (a.type === "hide" && a.kind === "signature" && !a.undone) {
        a.undo();
        a.undone = true;
        done.delete(a.el);
      }
    }
    log("user opened cookie settings: vendor dialogs released for this page");
    publish();
  }

  const wallActive = () => actions.some((a) => a.type === "hide" && !a.undone && a.el.isConnected);

  // ------------------------------------------------------------ scroll lock

  function lockInfo() {
    const html = document.documentElement,
      body = document.body;
    if (!body) return null;
    const hs = getComputedStyle(html),
      bs = getComputedStyle(body);
    const clip = (v) => v === "hidden" || v === "clip";
    const tokens = new Set();
    // <body> overflow propagates to the viewport when <html> overflow is visible.
    const viewport = hs.overflowY !== "visible" ? hs.overflowY : bs.overflowY;
    if (clip(viewport)) tokens.add("overflow");
    else if (clip(bs.overflowY) && body.scrollHeight > body.clientHeight + 20)
      tokens.add("overflow");
    if (hs.position === "fixed") tokens.add("html-fixed");
    if (bs.position === "fixed") tokens.add("body-fixed");
    if (hs.pointerEvents === "none" || bs.pointerEvents === "none") tokens.add("pointer");
    if (tokens.size && (hs.touchAction === "none" || bs.touchAction === "none"))
      tokens.add("touch");
    if (!tokens.size) return null;
    const taller = Math.max(html.scrollHeight, body.scrollHeight) > innerHeight + 40;
    return { tokens, taller };
  }

  function unlock(info, reason) {
    const html = document.documentElement,
      body = document.body;
    // Inline !important locks beat any stylesheet, so strip those first.
    for (const el of [html, body]) {
      for (const p of ["overflow", "overflow-y", "position", "touch-action", "pointer-events"]) {
        if (el.style.getPropertyPriority(p) !== "important") continue;
        const v = el.style.getPropertyValue(p);
        if (/hidden|clip|fixed|none/.test(v)) el.style.removeProperty(p);
      }
    }
    let restoreY = null;
    if (info.tokens.has("body-fixed")) {
      const top = parseFloat(body.style.top || getComputedStyle(body).top);
      if (top < 0) restoreY = -top;
    }
    const prev = html.getAttribute("data-tacet-unlock");
    const merged = new Set([...(prev ? prev.split(" ") : []), ...info.tokens]);
    if (prev !== null && merged.size === prev.split(" ").length) return; // already overridden
    html.setAttribute("data-tacet-unlock", [...merged].join(" "));
    if (restoreY !== null) requestAnimationFrame(() => scrollTo(0, restoreY));
    record(
      "unlock",
      html,
      { kind: "scroll", reason: `${reason}: ${[...info.tokens].join(", ")}` },
      () => {
        if (prev === null) html.removeAttribute("data-tacet-unlock");
        else html.setAttribute("data-tacet-unlock", prev);
      },
    );
    log("unlocked", reason, [...info.tokens]);
  }

  function handleLock(zap) {
    const info = lockInfo();
    if (!info) {
      lockSince = 0;
      lockByUser = false;
      return;
    }
    if (!info.taller && !zap) return;
    const t = now();
    if (!lockSince) {
      lockSince = t;
      // Menus and dialogs lock the page right after a press (some open on pointerdown
      // and set pointer-events: none on <body>), unless a wall was hidden just now.
      lockByUser = t - lastGesture < gestureGrace && t - lastHide > GESTURE_GRACE;
    }
    let reason = null;
    if (zap) reason = "manual";
    else if (lockByUser) reason = null;
    else if (wallActive()) reason = "wall hidden";
    else if (t - lockSince >= PERSIST && !userModalOpen()) reason = "persistent lock";
    if (reason) unlock(info, reason);
  }

  function userModalOpen() {
    // Checked lazily; fixed elements the user opened are in userOwned.
    for (const el of fixedNearTop(3, 300)) if (userOwned.has(el) && showing(el)) return true;
    return false;
  }

  // Records a content repair once per element and reason, however often the page undoes it.
  function freedOnce(el, reason, undo) {
    const seen = freed.get(el) || new Set();
    if (seen.has(reason)) return;
    seen.add(reason);
    freed.set(el, seen);
    record("free", el, { kind: "content", reason }, undo);
  }

  // A click-through layer stacked over other content (hit-testing reaches what is
  // under it) is a decoration; a disabled page wrapper only lets hits fall to <body>.
  function overOtherContent(c, r) {
    const x0 = Math.max(r.left, 0),
      x1 = Math.min(r.right, innerWidth);
    const y0 = Math.max(r.top, 0),
      y1 = Math.min(r.bottom, innerHeight);
    if (x1 - x0 < 1 || y1 - y0 < 1) return true; // off screen: cannot tell, leave it
    for (const [fx, fy] of SAMPLE) {
      const x = x0 + fx * (x1 - x0),
        y = y0 + fy * (y1 - y0);
      const h = document.elementFromPoint(x, y);
      if (h && !c.contains(h) && !h.contains(c) && !findLayer(h, x, y)) return true;
    }
    return false;
  }

  // Content behind a wall is sometimes blurred, inert or click-disabled, often
  // through a class the vendor puts on <body> (e.g. Didomi's "didomi-popup-open").
  // Only large in-flow wrappers on screen are touched: closed drawers, off-screen
  // slides, decorations and blurred backgrounds keep their state.
  function freeContent() {
    const vw = innerWidth,
      vh = innerHeight;
    for (const el of document.querySelectorAll("[inert]")) {
      if (insideHidden(el) || done.has(el)) continue;
      if (visibleRect(el.getBoundingClientRect()).cov < 0.5) continue;
      if (getComputedStyle(el).position === "fixed") continue;
      el.removeAttribute("inert");
      freedOnce(el, "inert removed", () => el.setAttribute("inert", ""));
    }
    const queue = [[document.body, 0]];
    for (let qi = 0, budget = 300; qi < queue.length && budget > 0; qi++) {
      const [node, depth] = queue[qi];
      for (const c of node.children) {
        if (budget-- <= 0) break;
        if (SKIP_TAGS.has(c.tagName) || done.has(c)) continue;
        const r = c.getBoundingClientRect();
        if (r.width < vw * 0.5) continue;
        const cs = getComputedStyle(c);
        if (cs.position === "fixed") continue;
        if (r.height < vh * 0.5) {
          if (depth < 2) queue.push([c, depth + 1]);
          continue;
        } // headers, ad slots
        // Walls blur text; blurred backgrounds and gradient blobs have none.
        if (
          /blur\(/.test(cs.filter) &&
          !c.hasAttribute("data-tacet-unblur") &&
          c.textContent.trim().length > 100
        ) {
          c.setAttribute("data-tacet-unblur", "");
          freedOnce(c, "blur removed", () => c.removeAttribute("data-tacet-unblur"));
        }
        if (
          cs.pointerEvents === "none" &&
          cs.position !== "absolute" &&
          !c.hasAttribute("data-tacet-unpe") &&
          !overOtherContent(c, r)
        ) {
          c.setAttribute("data-tacet-unpe", "");
          freedOnce(c, "clicks re-enabled", () => c.removeAttribute("data-tacet-unpe"));
        }
        if (c.getAttribute("aria-hidden") === "true") {
          c.removeAttribute("aria-hidden");
          freedOnce(c, "aria-hidden removed", () => c.setAttribute("aria-hidden", "true"));
        }
        if (depth < 2) queue.push([c, depth + 1]);
      }
    }
  }

  // A layer the user opened, or a modal the page shows and Tacet left alone:
  // the page blurs or disables its content for those on purpose.
  function layerOpen(cands) {
    for (const el of cands.keys()) {
      if (!el.isConnected || done.has(el) || insideHidden(el) || !showing(el)) continue;
      if (userOwned.has(el)) return true;
      const m =
        matches(el, '[aria-modal="true"]') || matches(el, ":modal")
          ? el
          : el.querySelector('[aria-modal="true"]');
      if (m && m.getClientRects().length) return true;
    }
    return false;
  }

  // Vendors flag <html>/<body> while their dialog is up (didomi-popup-open,
  // sp-message-open, popin-gdpr-no-scroll...). Sites hang blur rules on those classes.
  const WALL_FLAG =
    /didomi|onetrust|optanon|cookiebot|cybot|usercentrics|sp[-_]message|qc-cmp|truste|axeptio|tarteaucitron|iubenda|cmplz|osano|borlabs|cookie|consent|gdpr|rgpd|(?:^|[-_\s])cmp(?:[-_\s]|$)|tp-modal|paywall|regwall|cookiewall|adblock/i;
  function wallFlagged() {
    const cls = (n) => (n && typeof n.className === "string" ? n.className : "");
    return WALL_FLAG.test(cls(document.documentElement) + " " + cls(document.body));
  }

  // --------------------------------------------------------------- scoring

  function inspect(el, h, zap, locked) {
    if (done.has(el) || !el.isConnected || insideHidden(el)) return null;
    if (userOwned.has(el) && !zap) return null;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.visibility === "collapse")
      return null;
    if (parseFloat(cs.opacity) === 0 && cs.pointerEvents === "none") return null;
    const fs = document.fullscreenElement;
    if (fs && (el === fs || el.contains(fs))) return null;
    // Closed menus and drawers: declared hidden, or parked behind the page.
    if (el.getAttribute("aria-hidden") === "true" && (!h.hits || cs.pointerEvents === "none"))
      return null;
    if ((parseInt(cs.zIndex, 10) || 0) < 0) return null;

    const vw = innerWidth,
      vh = innerHeight;
    const r = el.getBoundingClientRect();
    const g = visibleRect(r);
    const isModal = matches(el, ":modal");
    const cov = Math.max(g.cov, h.hits >= 7 ? h.hits / SAMPLE.length : 0);
    if (cov < 0.005 && !h.hits && !isModal) return null;
    const z = zIndexOf(el, cs);
    if (z < 0 && !h.hits) return null;

    const fresh = !firstSeen.has(el);
    if (fresh) firstSeen.set(el, now());
    const age = now() - firstSeen.get(el);
    const text = cachedText(el);
    const k = keywords(text);
    // "Newsletters" is a common menu entry; only a sign-up form makes it a popup.
    if (
      k.hits.includes("newsletter") &&
      !el.querySelector('input[type="email"], input[name*="mail" i], input[placeholder*="mail" i]')
    ) {
      k.hits.splice(k.hits.indexOf("newsletter"), 1);
      k.news--;
      k.strong--;
    }

    // A layer that shows up right after a related click was opened by the user.
    // "Related": the control announced a dialog (login, menu...), or the layer has
    // no popup vocabulary, or it shares it with the control ("Je m'abonne" -> offer).
    // A full consent dialog only counts after a click on a cookie-settings control.
    if (!zap && fresh && now() - lastGesture < gestureGrace) {
      const related =
        lastGestureCmp ||
        gestureOpener ||
        k.strong === 0 ||
        (k.wall && gestureKw.wall) ||
        (k.news && gestureKw.news) ||
        (k.adblock && gestureKw.adblock);
      if (related && (lastGestureCmp || k.consent < 3)) {
        userOwned.add(el);
        log("opened by the user, left alone:", describe(el));
        return null;
      }
    }

    const center =
      h.center || (r.left <= vw / 2 && r.right >= vw / 2 && r.top <= vh / 2 && r.bottom >= vh / 2);
    const banner = g.w >= vw * 0.6 && g.h <= vh * 0.5 && (r.top <= 8 || r.bottom >= vh - 8);
    const kind =
      isModal || cov >= 0.75 ? "overlay" : banner ? "banner" : center ? "popup" : "corner";
    if (kind === "overlay" && !isModal && isAppShell(el, text)) return null;
    // A full-screen layer that is neither on top anywhere nor a tinted veil covers nothing.
    if (kind === "overlay" && !h.hits && !isModal && !translucent(el, cs)) return null;
    // Menus are link lists; consent walls with long vendor lists still say "cookies"/"partners".
    const menuLike =
      matches(el, 'nav, [role="navigation"], [role="menu"]') ||
      !!el.querySelector('nav, [role="navigation"]') ||
      el.querySelectorAll("a[href]").length >= 15;
    if (menuLike && k.consent < 2) return null;

    const selfAttrs = attrText(el, 12);
    const deepAttrs = attrText(el, 60);
    if (NEVER.test(deepAttrs)) return null;
    const attrStrong = ATTR_STRONG.test(deepAttrs);
    const attrWeak = ATTR_WEAK.test(deepAttrs);
    const look = isModal || translucent(el, cs);
    const dialog = isDialogish(el);
    // A bare backdrop left behind by a wall we just hid.
    const companion = wallActive() && text.trim().length < 60 && (look || h.hits > 0);
    const persisted = age >= PERSIST;
    const why = [];
    let hideIt = false;

    if (kind === "overlay") {
      let s = 0;
      if (k.strong) {
        s += Math.min(k.strong, 3) * 2;
        why.push("text:" + k.hits.join(","));
      }
      s += Math.min(k.weak, 2);
      if (attrStrong) {
        s += 2;
        why.push("attr");
      } else if (attrWeak) {
        s += 1;
        why.push("attr~");
      }
      if (look) {
        s += 1;
        why.push("backdrop");
      }
      if (dialog) {
        s += 1;
        why.push("dialog");
      }
      if (z >= 1000 || isModal) {
        s += 1;
        why.push("z");
      }
      if (locked) {
        s += 1;
        why.push("lock");
      }
      if (companion) {
        s += 3;
        why.push("companion");
      }
      if (persisted) {
        s += 2;
        why.push("persist");
      }
      // Cross-origin consent iframes have no readable text; their container names give them away.
      if (
        attrStrong &&
        text.trim().length < 20 &&
        (el.tagName === "IFRAME" || el.querySelector("iframe"))
      ) {
        s += 2;
        why.push("iframe");
      }
      why.unshift("score " + s);
      hideIt = zap || s >= 5 || (k.strong >= 1 && s >= 4);
    } else if (kind === "popup") {
      const s = k.strong * 2 + k.weak + (attrStrong ? 2 : 0) + (dialog ? 1 : 0) + (look ? 1 : 0);
      why.push("score " + s, "text:" + k.hits.join(","));
      hideIt = (k.strong >= 1 && s >= 4) || (zap && (z > 0 || dialog || k.strong > 0));
    } else if (settings.banners || zap) {
      // Banners and corner boxes do not block, so require consent-specific text.
      // Headers routinely say "S'abonner", so wall words alone never count here.
      const selfHint = ATTR_STRONG.test(selfAttrs);
      const isChrome =
        matches(el, 'header, nav, [role="banner"], [role="navigation"]') ||
        !!el.querySelector("nav");
      why.push("text:" + k.hits.join(","));
      hideIt =
        (k.consent >= 2 && !isChrome) ||
        (k.consent >= 1 && selfHint && !isChrome) ||
        ((k.news >= 1 || k.adblock >= 1) && selfHint && !isChrome);
    }

    if (!hideIt && fresh) setTimeout(schedule, PERSIST + 50); // re-check once it has persisted
    return { kind, hideIt, why: why.join(" "), text };
  }

  // ------------------------------------------------------------------ scan

  function scan(zap = false) {
    if (!active || !document.body) return;
    bodyTextLen = -1;
    const vw = innerWidth,
      vh = innerHeight;
    if (vw < 50 || vh < 50) return;

    // Re-apply hides the page undid.
    for (const a of actions) {
      if (
        a.type === "hide" &&
        !a.undone &&
        a.el.isConnected &&
        !a.el.hasAttribute("data-tacet-hidden")
      ) {
        a.el.setAttribute("data-tacet-hidden", a.kind);
        a.el.style.setProperty("display", "none", "important");
      }
    }
    if (sigOn) for (const el of document.querySelectorAll(SIG_ALL)) hideSignature(el);

    const cands = new Map();
    for (const [fx, fy] of SAMPLE) {
      const x = fx * vw,
        y = fy * vh;
      const el = hitAt(x, y);
      if (!el || el === document.body || el === document.documentElement) continue;
      const layer = findLayer(el, x, y);
      if (!layer) continue;
      const c = cands.get(layer) || { hits: 0, center: false };
      c.hits++;
      if (fx === 0.5 && fy === 0.5) c.center = true;
      cands.set(layer, c);
    }
    for (const el of fixedNearTop()) if (!cands.has(el)) cands.set(el, { hits: 0, center: false });
    for (const el of document.querySelectorAll("dialog[open], [popover]")) {
      if (!cands.has(el) && (matches(el, ":modal") || matches(el, ":popover-open")))
        cands.set(el, { hits: 0, center: true });
    }

    let changed = false;
    let blocking = false;
    const locked = !!lockInfo();
    for (const [el, h] of cands) {
      const res = inspect(el, h, zap, locked);
      if (!res?.hideIt) continue;
      hide(el, res.kind, res.why, res.text);
      changed = true;
      if (res.kind === "overlay" || res.kind === "popup") blocking = true;
    }
    handleLock(zap);
    // Repair content right after hiding a blocking layer. Otherwise (vendor dialogs
    // hidden before they paint, blur added later) only while a vendor class on
    // <html>/<body> says the wall is still up, not right after a press (menus blur
    // the page on purpose), and never while a layer the user opened or a modal the
    // page shows is open. contentDirty stays set until the repair can run.
    if (zap || blocking || (contentDirty && wallActive() && wallFlagged())) {
      const wait = gestureGrace - (now() - lastGesture);
      if (zap || blocking || (wait <= 0 && !layerOpen(cands))) {
        contentDirty = false;
        freeContent();
      } else if (!repairTimer) {
        log("content repair deferred", wait > 0 ? "after a press" : "a layer is open");
        repairTimer = setTimeout(
          () => {
            repairTimer = 0;
            schedule();
          },
          wait > 0 ? wait + 50 : 1000,
        );
      }
    }
    if (changed) schedule(); // catch companion backdrops on the next frame
  }

  let pending = false;
  let lastRun = -1e9;
  let repairTimer = 0;
  function schedule() {
    if (pending || !active) return;
    pending = true;
    const gap = (now() < EAGER ? 100 : 700) - (now() - lastRun);
    const go = () =>
      requestAnimationFrame(() => {
        pending = false;
        lastRun = now();
        try {
          scan(false);
        } catch (e) {
          log("scan failed", e);
        }
      });
    if (gap > 0) setTimeout(go, gap);
    else go();
  }

  // ------------------------------------------------------------- lifecycle

  function onGesture(e) {
    if (!active || !e.isTrusted) return;
    // Presses (pointerdown, Enter, Space) only time the gesture: some menus open on
    // them. Cookie settings are released on the click itself.
    const isPress = e.type === "pointerdown" || e.type === "keydown";
    if (!isPress) lastGestureCmp = false;
    const t = e.target instanceof Element ? e.target : null;
    const ctl = t?.closest('a, button, [role="button"], [onclick], summary, label, input');
    const text = (ctl?.textContent || "").trim();
    const aria = ctl?.getAttribute("aria-label") || "";
    if (CLOSER.test(text) || CLOSER.test(aria) || /close|fermer/i.test(aria)) return;
    lastGesture = now();
    // Look again while what the press opened fades or slides in, so it is
    // inspected while still fresh and counted as user-opened.
    setTimeout(schedule, 250);
    setTimeout(schedule, 700);
    gestureGrace = GESTURE_GRACE;
    gestureOpener = false;
    gestureKw = keywords((text + " " + aria).toLowerCase().slice(0, 300));
    if (!ctl || insideHidden(ctl)) return;
    const href = (ctl.getAttribute("href") || "").trim();
    const navigates = ctl.tagName === "A" && href && !/^(#|javascript:)/i.test(href);
    if (
      ctl.matches(
        "[aria-haspopup], [aria-controls], [aria-expanded], [data-toggle], [data-bs-toggle], [data-target]",
      ) ||
      OPENER.test(text + " " + aria)
    ) {
      gestureGrace = OPENER_GRACE;
      gestureOpener = true;
    }
    const label = [
      text,
      aria,
      ctl.getAttribute("title"),
      ctl.id,
      ctl.getAttribute("class"),
      ctl.getAttribute("onclick"),
      href,
    ]
      .join(" ")
      .slice(0, 400);
    if (!isPress && !navigates && CMP_OPENER.test(label)) {
      lastGestureCmp = true;
      releaseSignatures();
    }
  }

  function undoAll() {
    for (let i = actions.length - 1; i >= 0; i--) {
      const a = actions[i];
      if (!a.undone) {
        a.undo();
        a.undone = true;
      }
    }
    done = new WeakSet();
    freed = new WeakMap();
    contentDirty = false;
    publish();
  }

  function status() {
    const lock = lockInfo();
    return {
      host,
      active,
      paused: !sigOn,
      locked: lock ? [...lock.tokens] : [],
      actions: actions
        .filter((a) => !a.undone)
        .map(({ type, kind, reason, what, text, t }) => ({ type, kind, reason, what, text, t })),
    };
  }

  // Debug mode mirrors the status into the DOM so test harnesses can read it.
  function publish() {
    if (!settings.debug) return;
    try {
      document.documentElement.setAttribute("data-tacet-debug", JSON.stringify(status()));
    } catch {
      /* ignore */
    }
  }

  function setActive(on) {
    if (on === active) return;
    active = on;
    if (on) {
      watch();
      // Vendor containers parsed while the settings were read: hide them now, not
      // on the next frame.
      if (sigOn) for (const el of document.querySelectorAll(SIG_ALL)) hideSignature(el);
      schedule();
    } else {
      observer.disconnect();
      undoAll();
    }
  }

  // Settings in extension storage (src/popup/popup.js writes them):
  //   mode: "on" (default) runs on every site, "sites" only on the sites switched
  //         on, "off" on none;
  //   sites: { host: true | false }, the user's choice for each site, which wins
  //         over the mode's default in "on" and "sites";
  //   disabledHosts: { host: true }, the sites switched off before modes existed.
  // popup.js has the same rule in runsOn().
  const SETTINGS = ["mode", "sites", "disabledHosts", "debug", "banners"];
  function runsOn(s) {
    if (s.mode === "off") return false;
    const choice = s.sites?.[host];
    if (typeof choice === "boolean") return choice;
    if (s.disabledHosts?.[host] === true) return false;
    return s.mode !== "sites";
  }

  function applySettings(s) {
    settings.debug = TEST || !!s.debug;
    settings.banners = s.banners !== false;
    // Only a change in what the settings say for this host switches Tacet on or
    // off, so changing another setting does not undo a Zap or redo an Undo.
    const on = runsOn(s);
    if (on !== siteOn) {
      siteOn = on;
      setActive(on);
    }
    publish();
  }

  // A mutation that can blur or disable the page: a new stylesheet, or attribute
  // changes and added elements on <html>, <body> or the wrappers just below
  // (content rendered after the repair falls under the same blur rule).
  function nearTop(r) {
    if (r.type === "childList") {
      let el = false;
      for (const n of r.addedNodes) {
        if (n.nodeName === "STYLE" || n.nodeName === "LINK") return true;
        if (n.nodeType === 1) el = true;
      }
      if (!el) return false;
    }
    let d = 0;
    for (let n = r.target; n && d <= 3; n = n.parentNode, d++) {
      if (n === document.body || n === document.documentElement) return true;
    }
    return false;
  }

  // Watches the page only while Tacet is active on it.
  const observer = new MutationObserver((records) => {
    if (!active) return;
    let urgent = false;
    for (const r of records) {
      if (lastHide >= 0) {
        // The vendor flagging <html>/<body> (again) means its dialog is up: repair.
        if (
          r.attributeName === "class" &&
          (r.target === document.body || r.target === document.documentElement)
        ) {
          const f = wallFlagged();
          if (f && !flagSeen) contentDirty = true;
          flagSeen = f;
        }
        // Class and style changes right after a press are the page reacting to the
        // user (menus, filters, loading states), not the wall. New content still
        // counts; the repair itself waits for the press grace and open layers.
        if (!contentDirty && (r.type === "childList" || now() - lastGesture >= gestureGrace))
          contentDirty = nearTop(r);
      }
      for (const n of r.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (sigOn) matchSignatures(n);
        // Portals appended to <body>/<html>: check now so they never paint.
        const p = n.parentNode;
        if (!urgent && (p === document.body || p === document.documentElement)) {
          try {
            urgent = getComputedStyle(n).position === "fixed";
          } catch {
            /* ignore */
          }
        }
      }
    }
    if (urgent && !pending) {
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        lastRun = now();
        try {
          scan(false);
        } catch (e) {
          log(e);
        }
      });
    } else schedule();
  });
  function watch() {
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "open", "hidden", "inert", "aria-hidden", "aria-modal"],
    });
  }

  function start() {
    if (active) watch(); // test mode; otherwise once the settings are read
    // Every listener and timer below does nothing while Tacet is off.
    addEventListener("click", onGesture, { capture: true, passive: true });
    // Some menus open on pointerdown or from the keyboard, before any click.
    addEventListener("pointerdown", onGesture, { capture: true, passive: true });
    addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter" || e.key === " ") onGesture(e);
      },
      { capture: true, passive: true },
    );
    addEventListener("submit", onGesture, { capture: true, passive: true });
    document.addEventListener("DOMContentLoaded", schedule);
    addEventListener("load", schedule);
    addEventListener("resize", schedule, { passive: true });
    addEventListener("scroll", schedule, { passive: true });
    for (const ms of [300, 1000, 2000, 3000, 4500, 6500, 9000, 12000, 16000])
      setTimeout(schedule, ms);
  }

  // ------------------------------------------------------------ wiring

  if (ext) {
    // Unreadable settings mean the defaults: on, as before there were settings.
    const read = () => ext.storage.local.get(SETTINGS).then(applySettings, () => applySettings({}));
    read();
    ext.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && SETTINGS.some((k) => k in changes)) read();
    });
    ext.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (!msg || typeof msg.type !== "string" || !msg.type.startsWith("tacet:")) return;
      // Both act on this page only, whatever the settings say for the site.
      if (msg.type === "tacet:zap") {
        setActive(true);
        scan(true);
      }
      if (msg.type === "tacet:undo") setActive(false);
      sendResponse(status());
    });
  }
  if (TEST) {
    globalThis.__tacet = { status, scan: () => scan(false), zap: () => scan(true), undo: undoAll };
  }

  start();
})();
