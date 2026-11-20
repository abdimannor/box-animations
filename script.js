const root = document.documentElement;
const body = document.body;
const motionButton = document.querySelector("#toggle-motion");
const speedControl = document.querySelector("#speed-control");
const speedOutput = document.querySelector("#speed-output");
const themeControl = document.querySelector("#theme-control");
const themes = ["night", "paper", "signal"];
const durations = { slide: 2.2, pulse: 1.7, orbit: 4 };

const setSpeed = (value) => {
  const speed = Number(value);
  for (const [name, base] of Object.entries(durations)) {
    root.style.setProperty(`--${name}-duration`, `${base / speed}s`);
  }
  speedOutput.value = `${speed}x`;
};

const setTheme = (theme) => {
  body.classList.remove(...themes.map((t) => `theme-${t}`));
  body.classList.add(`theme-${theme}`);
  localStorage.setItem("boxAnimationsTheme", theme);
};

motionButton.addEventListener("click", () => {
  const paused = body.classList.toggle("is-paused");
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.textContent = paused ? "Play" : "Pause";
  // A scrubbed demo is driven by the Web Animations API, which overrides
  // animation-play-state, so pause and play through the API as well.
  for (const el of document.querySelectorAll(".stage, .pg-stage")) {
    for (const anim of el.getAnimations({ subtree: true })) paused ? anim.pause() : anim.play();
  }
});

speedControl.addEventListener("input", (event) => setSpeed(event.target.value));
themeControl.addEventListener("change", (event) => setTheme(event.target.value));

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-target]");
  if (!button) return;
  const target = document.getElementById(button.dataset.copyTarget);
  // Remember the original label once; a second click within the reset window
  // would otherwise store "Copied" as the label and never restore it.
  const label = (button.dataset.label ??= button.textContent);
  clearTimeout(Number(button.dataset.resetTimer));
  try {
    await navigator.clipboard.writeText(target.textContent);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Select";
    target.closest("pre").focus();
  }
  button.dataset.resetTimer = String(setTimeout(() => { button.textContent = label; }, 1300));
});

const saved = localStorage.getItem("boxAnimationsTheme");
if (themes.includes(saved)) {
  themeControl.value = saved;
  setTheme(saved);
}
setSpeed(speedControl.value);
