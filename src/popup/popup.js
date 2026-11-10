const api = globalThis.browser ?? globalThis.chrome;
const $ = (id) => document.getElementById(id);

// The settings are described in src/content/tacet.js, next to its runsOn().
const HINTS = {
  on: "Runs on every site, except those you switch off below.",
  sites: "Runs only on the sites you switch on below.",
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

// The sites switched off before modes existed become choices in `sites`.
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

function render(st) {
  const list = $("list");
  list.textContent = "";
  if (!st) {
    $("host").textContent = "";
    $("state").textContent = "Tacet does not run on this page.";
    for (const id of ["site", "zap", "undo"]) $(id).disabled = true;
    return;
  }
  $("host").textContent = st.host;
  const bits = [];
  if (!st.active) bits.push("Inactive on this page.");
  if (st.paused) bits.push("Cookie settings opened by you: vendor dialogs are shown.");
  if (st.locked.length) bits.push(`Scroll still locked (${st.locked.join(", ")}).`);
  const hides = st.actions.filter((a) => a.type === "hide").length;
  bits.push(hides ? `${hides} element${hides > 1 ? "s" : ""} hidden.` : "Nothing hidden.");
  $("state").textContent = bits.join(" ");
  for (const a of st.actions) {
    const li = document.createElement("li");
    const kind = document.createElement("span");
    kind.className = "kind";
    kind.textContent = a.kind;
    const what = document.createElement("code");
    what.textContent = a.what;
    const why = document.createElement("small");
    why.textContent = `${a.reason} · ${(a.t / 1000).toFixed(1)}s${a.text ? " · “" + a.text + "”" : ""}`;
    li.append(kind, what, why);
    list.append(li);
  }
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
  const refresh = () => setTimeout(async () => render(await send("tacet:status")), 150);

  for (const r of modes) r.checked = r.value === s.mode;
  $("debug").checked = s.debug;
  $("banners").checked = s.banners;
  render(st);
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
  $("debug").addEventListener("change", () => api.storage.local.set({ debug: $("debug").checked }));
  $("banners").addEventListener("change", () =>
    api.storage.local.set({ banners: $("banners").checked }),
  );
  $("zap").addEventListener("click", async () => render(await send("tacet:zap")));
  $("undo").addEventListener("click", async () => render(await send("tacet:undo")));
}

init();
