// Motion button: motion is on by default; the visitor can turn it off.
// The choice lives in localStorage and on <html data-motion="on|off">, which the CSS reads.
const KEY = "boxAnimationsMotion";
const root = document.documentElement;
const toggle = document.querySelector("#motion-switch");

const readSaved = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export const motionOn = () => root.dataset.motion !== "off";

const apply = () => {
  const on = readSaved() !== "off";
  root.dataset.motion = on ? "on" : "off";
  const label = on ? "Pause motion" : "Play motion";
  toggle.setAttribute("aria-pressed", String(on));
  toggle.setAttribute("aria-label", label);
  toggle.title = label;
  document.dispatchEvent(new CustomEvent("motionchange", { detail: { on } }));
};

const choose = (on) => {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
  apply();
};

toggle.addEventListener("click", () => choose(!motionOn()));
apply();
