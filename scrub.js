// Timeline scrubbers: pause a demo and drag through it with the Web Animations API.
import { motionOn } from "./motion.js";

const cycleOf = (anim) => {
  const t = anim.effect.getComputedTiming();
  const turns = String(t.direction).startsWith("alternate") ? 2 : 1;
  return Number(t.duration) * turns;
};

const scrubbers = [...document.querySelectorAll("[data-scrub]")].map((root) => {
  const card = root.closest(".motion-card");
  const stage = card.querySelector(".stage");
  const range = root.querySelector(".scrub-range");
  const button = root.querySelector(".scrub-play");
  const time = root.querySelector(".scrub-time");
  const item = { range, held: false };

  const anims = () => stage.getAnimations({ subtree: true });
  const cycle = () => Math.max(0, ...anims().map(cycleOf)) || 1;
  const label = (ms) => { time.textContent = `${(ms / 1000).toFixed(2)}s`; };
  const setHeld = (held) => {
    item.held = held;
    button.textContent = held ? "Play" : "Pause";
    card.classList.toggle("is-scrubbing", held);
  };

  range.addEventListener("input", () => {
    const at = (Number(range.value) / 1000) * cycle();
    for (const anim of anims()) { anim.pause(); anim.currentTime = at; }
    label(at);
    setHeld(true);
  });
  button.addEventListener("click", () => {
    const hold = !item.held;
    for (const anim of anims()) hold ? anim.pause() : anim.play();
    setHeld(hold);
  });

  item.sync = () => {
    const on = motionOn();
    range.disabled = !on;
    button.disabled = !on;
    if (!on) { setHeld(false); range.value = 0; label(0); return; }
    const first = anims()[0];
    if (!first || item.held || first.playState !== "running") return;
    const c = cycle();
    const at = Number(first.currentTime) % c;
    range.value = String(Math.round((at / c) * 1000));
    label(at);
  };
  item.reset = () => setHeld(false);
  return item;
});

let frame = 0;
const tick = () => {
  for (const s of scrubbers) s.sync();
  frame = motionOn() ? requestAnimationFrame(tick) : 0;
};
const start = () => {
  cancelAnimationFrame(frame);
  for (const s of scrubbers) s.reset();
  tick();
};

document.addEventListener("motionchange", start);
start();
