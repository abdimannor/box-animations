// Race lane: the same distance and duration, five timing functions side by side.
import { state } from "./playground.js";

const lanes = document.querySelector("#race-lanes");
const go = document.querySelector("#race-go");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");

const sync = () => {
  for (const lane of lanes.children) {
    const ease = lane.dataset.ease === "custom" ? state.easing : lane.dataset.ease;
    lane.style.setProperty("--race-ease", ease);
    lane.title = ease;
  }
};

const run = () => {
  sync();
  if (reduce.matches) {
    lanes.classList.add("is-finished");
    return;
  }
  lanes.classList.remove("is-racing", "is-finished");
  void lanes.offsetWidth;
  lanes.classList.add("is-racing");
};

go.addEventListener("click", run);
document.addEventListener("easingchange", sync);
sync();
