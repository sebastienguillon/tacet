const api = globalThis.browser ?? globalThis.chrome;
const $ = (id) => document.getElementById(id);

// The settings are described in src/content/tacet.js, next to its runsOn().
const HINTS = {
  sites: "Runs only on the sites you switch on.",
  on: "Runs on every site, except those you switch off.",
  off: "Off everywhere. Zap now still works on this page.",
};

function runsOn(mode, sites, host) {
  if (mode === "off") return false;
  if (typeof sites[host] === "boolean") return sites[host];
  return mode !== "sites";
}

async function activeTab() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function send(type) {
  const tab = await activeTab();
  if (!tab) return null;
  try {
    return await api.tabs.sendMessage(tab.id, { type });
  } catch {
    return null; // no content script on this page (browser pages, store, PDF...)
  }
}

// The sites switched off before modes existed become choices in `sites`. No
// mode stored means All sites, as for the installs from before; a new install
// stores Chosen sites (src/background.js).
async function readSettings() {
  const s = await api.storage.local.get(["mode", "sites", "disabledHosts", "debug", "banners"]);
  const sites = s.sites ?? {};
  if (s.disabledHosts) {
    for (const [host, off] of Object.entries(s.disabledHosts))
      if (off === true && !Object.hasOwn(sites, host)) sites[host] = false;
    await api.storage.local.set({ sites });
    await api.storage.local.remove("disabledHosts");
  }
  return {
    mode: HINTS[s.mode] ? s.mode : "on",
    sites,
    debug: s.debug ?? false,
    banners: s.banners ?? true,
  };
}

// What Tacet did on the page, counted on the rest: lime with its figure when it
// acted, an outline while it watches, grey when it is off here.
function render(st, s) {
  const list = $("list");
  list.textContent = "";
  $("notes").textContent = "";
  if (!st) {
    $("host").textContent = "Not a web page";
    $("host").className = "none";
    $("rest").dataset.state = "none";
    $("figure").textContent = "";
    $("state").textContent = "Tacet does not run on this page.";
    $("notes").textContent =
      "It runs only on web pages: not on browser pages, extension stores or files on your computer.";
    for (const id of ["site", "zap", "undo"]) $(id).disabled = true;
    return;
  }
  $("host").textContent = st.host;
  $("host").className = "";
  $("host").title = st.host;
  const n = st.actions.length;
  $("rest").dataset.state = !st.active ? "off" : n ? "acted" : "watching";
  $("figure").textContent = st.active && n ? String(n) : "";
  const notes = [];
  if (!st.active) {
    $("state").textContent = "Not active on this page.";
    if (s.mode !== "off")
      notes.push(
        runsOn(s.mode, s.sites, st.host)
          ? "Undone here. Reload the page, or press Zap now, to run again."
          : "Switch on Active on this site, or press Zap now for this page only.",
      );
  } else {
    $("state").textContent = n
      ? `${n} change${n > 1 ? "s" : ""} on this page`
      : "Nothing to silence on this page yet.";
  }
  if (st.paused) notes.push("You opened this site’s cookie settings, so its dialogs are shown.");
  if (st.locked.length) notes.push(`Scroll still locked (${st.locked.join(", ")}).`);
  $("notes").textContent = notes.join(" ");
  st.actions.forEach((a, i) => {
    const li = document.createElement("li");
    const no = document.createElement("span");
    no.className = "no";
    no.textContent = String(i + 1);
    const kind = document.createElement("span");
    kind.className = "kind";
    kind.textContent = a.kind;
    const what = document.createElement("code");
    what.textContent = a.what;
    what.title = a.what;
    const time = document.createElement("span");
    time.className = "time";
    time.textContent = `${(a.t / 1000).toFixed(1)}s`;
    const why = document.createElement("span");
    why.className = "why";
    why.textContent = a.text ? `${a.reason} · “${a.text}”` : a.reason;
    li.append(no, kind, what, time, why);
    list.append(li);
  });
  more();
}

// Marks a list that scrolls and is not at its end, for the fade on its last row.
function more() {
  const list = $("list");
  list.toggleAttribute("data-more", list.scrollTop + list.clientHeight < list.scrollHeight - 1);
}

async function init() {
  const st = await send("tacet:status");
  const s = await readSettings();
  const modes = document.querySelectorAll('input[name="mode"]');

  // The mode and this site's switch, as the settings stand.
  const showSite = () => {
    $("hint").textContent = HINTS[s.mode];
    $("site").checked = !!st && runsOn(s.mode, s.sites, st.host);
    $("site").disabled = !st || s.mode === "off";
  };
  // The content script follows storage changes; show the page once it has.
  const refresh = () => setTimeout(async () => render(await send("tacet:status"), s), 150);

  for (const r of modes) r.checked = r.value === s.mode;
  $("debug").checked = s.debug;
  $("banners").checked = s.banners;
  render(st, s);
  showSite();

  for (const r of modes)
    r.addEventListener("change", async () => {
      s.mode = r.value;
      showSite();
      await api.storage.local.set({ mode: s.mode });
      if (st) refresh();
    });
  $("site").addEventListener("change", async () => {
    const { sites = {} } = await api.storage.local.get("sites");
    sites[st.host] = $("site").checked;
    s.sites = sites;
    await api.storage.local.set({ sites });
    refresh();
  });
  $("list").addEventListener("scroll", more, { passive: true });
  $("debug").addEventListener("change", () => api.storage.local.set({ debug: $("debug").checked }));
  $("banners").addEventListener("change", () =>
    api.storage.local.set({ banners: $("banners").checked }),
  );
  $("zap").addEventListener("click", async () => render(await send("tacet:zap"), s));
  $("undo").addEventListener("click", async () => render(await send("tacet:undo"), s));
}

init();
