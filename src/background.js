// Stores where a new install of Tacet runs, and listens to nothing else: "sites"
// (Chosen sites), so Tacet leaves every site alone until it is switched on
// there. An install from before has no mode stored, which means "on" (All
// sites), the default before: it needs no event, so one the browser does not
// send (Firefox sends none for an update applied while Tacet is disabled) cannot
// switch Tacet off where it ran. A mode already stored is the user's choice and
// stays. src/content/tacet.js describes the settings next to its runsOn().
const api = globalThis.browser ?? globalThis.chrome;

api.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install") return;
  const { mode } = await api.storage.local.get("mode");
  if (mode === undefined) await api.storage.local.set({ mode: "sites" });
});
