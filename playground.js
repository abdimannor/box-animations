// Keyframe playground: live controls write CSS custom properties and a code panel.
import { motionOn } from "./motion.js";
import { NAME as CUSTOM, customCss, kfParam, loadKf } from "./builder.js";
const form = document.querySelector("#pg-form");
const track = document.querySelector(".pg-track");
const box = document.querySelector(".pg-box");
const code = document.querySelector("#pg-css");
const status = document.querySelector("#pg-status");

const keyframes = {
  slide: "@keyframes slideBox {\n  to { translate: calc(100cqi - var(--box)); }\n}",
  pulse: "@keyframes pulseBox {\n  0%, 100% { opacity: 0.5; scale: 0.78; }\n  50% { opacity: 1; scale: 1.18; rotate: 8deg; }\n}",
  orbit: "@keyframes orbitPath {\n  to { rotate: 360deg; }\n}",
  get custom() { return customCss(); },
};
const names = { slide: "slideBox", pulse: "pulseBox", orbit: "orbitPath", custom: CUSTOM };

export const state = { easing: "cubic-bezier(0.65, 0, 0.35, 1)", touched: false };

const field = (name) => form.querySelector(`[name="${name}"]:is(:checked, select, [type="range"])`).value;
const show = (name, value) => { form.querySelector(`[data-out="${name}"]`).textContent = value; };

const read = () => {
  const iterations = Number(field("iterations"));
  return {
    anim: field("anim"),
    duration: `${Number(field("duration"))}s`,
    delay: `${Number(field("delay"))}s`,
    iterations: iterations > 10 ? "infinite" : String(iterations),
    direction: field("direction"),
    fill: field("fill"),
  };
};

export const render = () => {
  const v = read();
  show("duration", v.duration);
  show("delay", v.delay);
  show("iterations", v.iterations);
  track.dataset.anim = v.anim;
  const props = {
    "--pg-name": names[v.anim],
    "--pg-duration": v.duration,
    "--pg-delay": v.delay,
    "--pg-iterations": v.iterations,
    "--pg-direction": v.direction,
    "--pg-fill": v.fill,
    "--pg-easing": state.easing,
  };
  for (const [k, val] of Object.entries(props)) box.style.setProperty(k, val);
  code.textContent = `.box {\n  animation-name: ${names[v.anim]};\n  animation-duration: ${v.duration};\n  animation-timing-function: ${state.easing};\n  animation-delay: ${v.delay};\n  animation-iteration-count: ${v.iterations};\n  animation-direction: ${v.direction};\n  animation-fill-mode: ${v.fill};\n}\n\n${keyframes[v.anim]}`;
  if (state.touched) history.replaceState(null, "", `#${shareParams(v)}`);
  status.textContent = motionOn() ? "" : "Animations are off: the preview stays still, the CSS still updates.";
};

// Shareable state: the URL hash carries every playground setting, e.g.
// #anim=pulse&duration=1.5&delay=0&iterations=11&direction=alternate&fill=both&ease=0.34,1.56,0.64,1
// A custom animation adds kf=at:x:y:rotate:scale:opacity;... (validated by builder.js).
const shareParams = (v) => {
  const ease = state.easing.match(/-?[\d.]+/g) ?? [];
  return new URLSearchParams({
    anim: v.anim,
    duration: parseFloat(v.duration),
    delay: parseFloat(v.delay),
    iterations: field("iterations"),
    direction: v.direction,
    fill: v.fill,
    ease: ease.join(","),
    ...(v.anim === "custom" ? { kf: kfParam() } : {}),
  }).toString().replaceAll("%2C", ",").replaceAll("%3A", ":").replaceAll("%3B", ";");
};

const setField = (name, value) => {
  if (value == null) return;
  if (name === "anim") {
    const radio = form.querySelector(`[name="anim"][value="${CSS.escape(value)}"]`);
    if (radio) radio.checked = true;
    return;
  }
  const input = form.querySelector(`[name="${name}"]`);
  if (input.tagName === "SELECT") {
    if ([...input.options].some((o) => o.value === value)) input.value = value;
  } else if (Number.isFinite(Number(value)) && value !== "") {
    input.value = value; // the browser clamps range inputs to min/max/step
  }
};

// Returns the four bezier numbers from the hash, or null when absent or malformed.
export const loadFromHash = () => {
  const params = new URLSearchParams(location.hash.slice(1));
  if (![...params.keys()].length) return null;
  for (const name of ["anim", "duration", "delay", "iterations", "direction", "fill"]) setField(name, params.get(name));
  // A custom animation needs valid stops; a missing or malformed kf falls back to slide.
  if (params.has("kf") && !loadKf(params.get("kf")) || params.get("anim") === "custom" && !params.has("kf")) {
    form.querySelector('[name="anim"][value="slide"]').checked = true;
  }
  const ease = (params.get("ease") ?? "").split(",").map(Number);
  return ease.length === 4 && ease.every(Number.isFinite) ? ease : null;
};

export const initialEase = loadFromHash();

export const replay = () => {
  box.classList.remove("is-running");
  void box.offsetWidth;
  box.classList.add("is-running");
};

form.addEventListener("input", () => { state.touched = true; render(); replay(); });

const copyLink = document.querySelector("#pg-link");
copyLink.addEventListener("click", async () => {
  state.touched = true;
  render();
  try {
    await navigator.clipboard.writeText(location.href);
    status.textContent = "Link copied: it opens the playground with these settings.";
  } catch {
    status.textContent = `Share this link: ${location.href}`;
  }
});

addEventListener("hashchange", () => {
  const ease = loadFromHash();
  document.dispatchEvent(new CustomEvent("pgload", { detail: ease }));
  render();
  replay();
});
document.querySelector("#pg-replay").addEventListener("click", replay);
document.addEventListener("motionchange", () => { render(); replay(); });
render();
replay();
