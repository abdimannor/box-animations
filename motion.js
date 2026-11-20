// Motion switch: the OS reduced-motion setting is the default, the visitor can override it.
// The choice lives in localStorage and on <html data-motion="on|off">, which the CSS reads.
const KEY = "boxAnimationsMotion";
const root = document.documentElement;
const system = matchMedia("(prefers-reduced-motion: reduce)");
const toggle = document.querySelector("#motion-switch");
const notices = document.querySelectorAll("#motion-notice, [data-motion-notice]");

const readSaved = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export const motionOn = () => root.dataset.motion === "on";

const apply = () => {
  const saved = readSaved();
  const on = saved === "on" || saved === "off" ? saved === "on" : !system.matches;
  root.dataset.motion = on ? "on" : "off";
  root.dataset.motionSource = saved ? "visitor" : "system";
  toggle.setAttribute("aria-checked", String(on));
  toggle.querySelector(".motion-state").textContent = on ? "on" : "off";
  const pausedBySystem = !saved && system.matches;
  for (const notice of notices) notice.hidden = !pausedBySystem;
  document.dispatchEvent(new CustomEvent("motionchange", { detail: { on } }));
};

const choose = (on) => {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
  apply();
};

toggle.addEventListener("click", () => choose(!motionOn()));
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-motion-play]")) choose(true);
});
system.addEventListener("change", apply);
apply();
