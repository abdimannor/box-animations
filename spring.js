// Spring easing: mass, stiffness and damping sliders sample the damped spring solution
// into a CSS linear() easing. "Use spring" sends it to the playground (preview, live CSS
// and share link as spring=m,k,c). Browsers without linear() get a note and keep the bezier.
import { state, render, replay, initialSpring } from "./playground.js";

const box = document.querySelector("#spring");
const fields = ["mass", "stiffness", "damping"].map((n) => box.querySelector(`[name="spring-${n}"]`));
const outs = box.querySelectorAll("output[data-for]");
const line = box.querySelector("#spring-curve");
const value = box.querySelector("#spring-value");
const use = box.querySelector("#spring-use");
const note = box.querySelector("#spring-note");
export const supported = CSS.supports("animation-timing-function", "linear(0, 1)");

// Under-, critically or over-damped spring released from 0 towards 1 with no initial speed.
export const springAt = (m, k, c, t) => {
  const w0 = Math.sqrt(k / m);
  const z = c / (2 * Math.sqrt(k * m));
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  if (z === 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const r1 = -w0 * (z - Math.sqrt(z * z - 1));
  const r2 = -w0 * (z + Math.sqrt(z * z - 1));
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
};

// Settle time: the last moment the spring is more than 0.1% away from rest (max 10 s).
export const settleTime = (m, k, c) => {
  let last = 0;
  for (let t = 0; t <= 10; t += 0.005) if (Math.abs(1 - springAt(m, k, c, t)) > 0.001) last = t;
  return Math.max(0.05, last);
};

export const springEasing = (m, k, c, samples = 40) => {
  const T = settleTime(m, k, c);
  const pts = [];
  for (let i = 0; i <= samples; i++) pts.push(i === samples ? 1 : Math.round(springAt(m, k, c, (T * i) / samples) * 1000) / 1000);
  return `linear(${pts.join(", ")})`;
};

const read = () => fields.map((f) => Number(f.value));
const draw = () => {
  const [m, k, c] = read();
  outs.forEach((o, i) => { o.value = fields[i].value; });
  const T = settleTime(m, k, c);
  const pts = [];
  for (let i = 0; i <= 80; i++) pts.push(`${(i / 80) * 200},${130 - springAt(m, k, c, (T * i) / 80) * 100}`);
  line.setAttribute("points", pts.join(" "));
  const pts41 = springEasing(m, k, c).slice(7, -1).split(", ");
  value.value = `linear(${pts41.slice(0, 4).join(", ")}, ...) · ${pts41.length} stops · settles in ${T.toFixed(2)} s`;
  use.setAttribute("aria-pressed", String(state.spring?.join() === read().join()));
};

const apply = () => {
  if (!supported) return;
  state.spring = read();
  state.easing = springEasing(...state.spring);
  state.touched = true;
  render();
  draw();
  document.dispatchEvent(new CustomEvent("easingchange", { detail: state.easing }));
};

fields.forEach((f) => f.addEventListener("input", () => { draw(); if (state.spring) { apply(); replay(); } }));
use.addEventListener("click", () => { apply(); replay(); });
if (!supported) {
  use.disabled = true;
  note.hidden = false;
}
const load = (spring) => {
  if (!spring) return;
  spring.forEach((v, i) => { fields[i].value = v; });
  apply();
};
document.addEventListener("pgload", (e) => load(e.detail?.spring ?? null));
draw();
load(initialSpring);
