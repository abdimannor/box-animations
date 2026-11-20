// Draggable cubic-bezier editor. Writes the easing into the playground state.
import { state, render, replay } from "./playground.js";

const svg = document.querySelector("#bz");
const h = [document.querySelector("#bz-h1"), document.querySelector("#bz-h2")];
const arms = [document.querySelector("#bz-arm1"), document.querySelector("#bz-arm2")];
const curve = document.querySelector("#bz-curve");
const out = document.querySelector("#bz-value");
const presets = document.querySelector("#bz-presets");

const pts = [[0.65, 0], [0.35, 1]];
const clampX = (v) => Math.min(1, Math.max(0, v));
const clampY = (v) => Math.min(1.8, Math.max(-0.8, v));
const round = (v) => Math.round(v * 100) / 100;
const toSvg = ([x, y]) => [x * 200, 200 - y * 200];

export const easingString = () => `cubic-bezier(${pts.flat().map(round).join(", ")})`;

const draw = () => {
  const [a, b] = pts.map(toSvg);
  curve.setAttribute("d", `M0 200 C${a[0]} ${a[1]} ${b[0]} ${b[1]} 200 0`);
  [[0, 200, a], [200, 0, b]].forEach(([x, y, p], i) => {
    arms[i].setAttribute("x1", x); arms[i].setAttribute("y1", y);
    arms[i].setAttribute("x2", p[0]); arms[i].setAttribute("y2", p[1]);
    h[i].setAttribute("cx", p[0]); h[i].setAttribute("cy", p[1]);
    h[i].setAttribute("aria-valuenow", round(pts[i][0]));
    h[i].setAttribute("aria-valuetext", `x ${round(pts[i][0])}, y ${round(pts[i][1])}`);
  });
  state.easing = easingString();
  out.value = state.easing;
  for (const btn of presets.querySelectorAll("button")) {
    btn.setAttribute("aria-pressed", String(`cubic-bezier(${btn.dataset.ease})` === state.easing));
  }
  render();
  document.dispatchEvent(new CustomEvent("easingchange", { detail: state.easing }));
};

const fromEvent = (event) => {
  const m = svg.getScreenCTM().inverse();
  const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(m);
  return [clampX(p.x / 200), clampY((200 - p.y) / 200)];
};

h.forEach((handle, i) => {
  handle.addEventListener("pointerdown", (event) => {
    handle.setPointerCapture(event.pointerId);
    handle.classList.add("is-dragging");
  });
  handle.addEventListener("pointermove", (event) => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    pts[i] = fromEvent(event);
    draw();
  });
  handle.addEventListener("pointerup", () => { handle.classList.remove("is-dragging"); replay(); });
  handle.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 0.1 : 0.01;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    pts[i] = [clampX(pts[i][0] + move[0]), clampY(pts[i][1] + move[1])];
    draw();
    replay();
  });
});

presets.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-ease]");
  if (!btn) return;
  const v = btn.dataset.ease.split(",").map(Number);
  pts[0] = [v[0], v[1]];
  pts[1] = [v[2], v[3]];
  draw();
  replay();
});

draw();
