const body = document.body;
const root = document.documentElement;
const motionButton = document.querySelector("#toggle-motion");
const speedControl = document.querySelector("#speed-control");
const speedOutput = document.querySelector("#speed-output");
const themeControl = document.querySelector("#theme-control");
const copyButtons = document.querySelectorAll("[data-copy-target]");

const baseDurations = {
  slide: 2.2,
  pulse: 1.7,
  orbit: 4,
};

function setSpeed(value) {
  const speed = Number(value);
  root.style.setProperty("--slide-duration", `${baseDurations.slide / speed}s`);
  root.style.setProperty("--pulse-duration", `${baseDurations.pulse / speed}s`);
  root.style.setProperty("--orbit-duration", `${baseDurations.orbit / speed}s`);
  speedOutput.textContent = `${Number.isInteger(speed) ? speed : speed.toFixed(2).replace(/0$/, "")}x`;
}

function setTheme(theme) {
  body.classList.remove("theme-paper", "theme-night", "theme-signal");
  body.classList.add(`theme-${theme}`);
  localStorage.setItem("boxAnimationsTheme", theme);
}

function setPaused(paused) {
  body.classList.toggle("is-paused", paused);
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.textContent = paused ? "Play" : "Pause";
}

async function copySnippet(button) {
  const target = document.getElementById(button.dataset.copyTarget);
  if (!target) return;

  const originalLabel = button.textContent;

  try {
    await navigator.clipboard.writeText(target.textContent);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Select";
    target.closest("pre")?.focus();
  }

  window.setTimeout(() => {
    button.textContent = originalLabel;
  }, 1300);
}

motionButton.addEventListener("click", () => {
  setPaused(!body.classList.contains("is-paused"));
});

speedControl.addEventListener("input", (event) => {
  setSpeed(event.target.value);
});

themeControl.addEventListener("change", (event) => {
  setTheme(event.target.value);
});

copyButtons.forEach((button) => {
  button.addEventListener("click", () => copySnippet(button));
});

const savedTheme = localStorage.getItem("boxAnimationsTheme");
if (savedTheme && ["paper", "night", "signal"].includes(savedTheme)) {
  themeControl.value = savedTheme;
  setTheme(savedTheme);
}

setSpeed(speedControl.value);
