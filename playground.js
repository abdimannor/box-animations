// Keyframe playground: live controls write CSS custom properties and a code panel.
const form = document.querySelector("#pg-form");
const track = document.querySelector(".pg-track");
const box = document.querySelector(".pg-box");
const code = document.querySelector("#pg-css");
const status = document.querySelector("#pg-status");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");

const keyframes = {
  slide: "@keyframes slideBox {\n  to { translate: calc(100cqi - var(--box)); }\n}",
  pulse: "@keyframes pulseBox {\n  0%, 100% { opacity: 0.5; scale: 0.78; }\n  50% { opacity: 1; scale: 1.18; rotate: 8deg; }\n}",
  orbit: "@keyframes orbitPath {\n  to { rotate: 360deg; }\n}",
};
const names = { slide: "slideBox", pulse: "pulseBox", orbit: "orbitPath" };

export const state = { easing: "cubic-bezier(0.65, 0, 0.35, 1)" };

const read = () => {
  const data = new FormData(form);
  const iterations = Number(data.get("iterations"));
  return {
    anim: data.get("anim"),
    duration: `${Number(data.get("duration"))}s`,
    delay: `${Number(data.get("delay"))}s`,
    iterations: iterations > 10 ? "infinite" : String(iterations),
    direction: data.get("direction"),
    fill: data.get("fill"),
  };
};

export const render = () => {
  const v = read();
  form.elements.durationOut.value = v.duration;
  form.elements.delayOut.value = v.delay;
  form.elements.iterationsOut.value = v.iterations;
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
  status.textContent = reduce.matches ? "Reduced motion is on: the preview stays still, the CSS still updates." : "";
};

export const replay = () => {
  box.classList.remove("is-running");
  void box.offsetWidth;
  box.classList.add("is-running");
};

form.addEventListener("input", () => { render(); replay(); });
document.querySelector("#pg-replay").addEventListener("click", replay);
reduce.addEventListener("change", render);
render();
replay();
