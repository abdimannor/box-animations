// Custom @keyframes builder: stops on a 0-100% track (add, remove, drag, arrow keys),
// each with translate, rotate, scale and opacity. The playground reads customCss() for the
// live CSS panel and the preview, and kfParam()/loadKf() for the shareable URL hash.
const form = document.querySelector("#pg-form");
const rail = document.querySelector("#kf-rail");
const editor = document.querySelector("#kf-editor");
const addButton = document.querySelector("#kf-add");
const removeButton = document.querySelector("#kf-remove");
const style = document.querySelector("#kf-style");

export const NAME = "customBox";
// Field order in the hash: at:x:y:rotate:scale:opacity
const FIELDS = [
  ["at", 0, 100], ["x", -400, 400], ["y", -200, 200], ["r", -720, 720], ["s", 0, 4], ["o", 0, 1],
];
const MAX_STOPS = 12;
const DEFAULT = [
  { at: 0, x: 0, y: 0, r: 0, s: 1, o: 1 },
  { at: 50, x: 120, y: -40, r: 45, s: 1.3, o: 0.6 },
  { at: 100, x: 0, y: 0, r: 0, s: 1, o: 1 },
];
let stops = DEFAULT.map((s) => ({ ...s }));
let selected = 1;

const round = (n) => Math.round(n * 100) / 100;
const sorted = () => [...stops].sort((a, b) => a.at - b.at);

export const customCss = () => `@keyframes ${NAME} {\n${sorted().map((s) =>
  `  ${round(s.at)}% { transform: translate(${round(s.x)}px, ${round(s.y)}px) rotate(${round(s.r)}deg) scale(${round(s.s)}); opacity: ${round(s.o)}; }`).join("\n")}\n}`;

export const kfParam = () => sorted().map((s) => FIELDS.map(([k]) => round(s[k])).join(":")).join(";");

// Validates a hash value: 2-12 stops, six finite numbers each, every value in range,
// no two stops at the same offset. Anything else keeps the current stops.
export const parseKf = (text) => {
  if (typeof text !== "string" || !text) return null;
  const parts = text.split(";");
  if (parts.length < 2 || parts.length > MAX_STOPS) return null;
  const out = [];
  for (const part of parts) {
    const nums = part.split(":").map((n) => (n.trim() === "" ? NaN : Number(n)));
    if (nums.length !== FIELDS.length || !nums.every(Number.isFinite)) return null;
    if (FIELDS.some(([, min, max], i) => nums[i] < min || nums[i] > max)) return null;
    out.push(Object.fromEntries(FIELDS.map(([k], i) => [k, nums[i]])));
  }
  if (new Set(out.map((s) => s.at)).size !== out.length) return null;
  return out;
};

export const loadKf = (text) => {
  const parsed = parseKf(text);
  if (!parsed) return false;
  stops = parsed;
  selected = 0;
  draw();
  return true;
};

const commit = () => {
  const custom = form.querySelector('[name="anim"][value="custom"]');
  if (custom) custom.checked = true;
  draw();
  form.dispatchEvent(new Event("input", { bubbles: true }));
};

const draw = () => {
  style.textContent = customCss();
  rail.replaceChildren(...stops.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "kf-stop";
    b.style.setProperty("--at", `${s.at}%`);
    b.dataset.index = i;
    b.setAttribute("aria-label", `Stop at ${round(s.at)}%`);
    b.setAttribute("aria-pressed", String(i === selected));
    b.tabIndex = i === selected ? 0 : -1;
    return b;
  }));
  const s = stops[selected];
  for (const [k] of FIELDS) {
    const input = editor.querySelector(`[name="kf-${k}"]`);
    if (input && document.activeElement !== input) input.value = round(s[k]);
  }
  editor.querySelector("[data-kf-title]").textContent = `Stop at ${round(s.at)}%`;
  removeButton.disabled = stops.length <= 2;
  addButton.disabled = stops.length >= MAX_STOPS;
};

const clampAt = (at, i) => {
  let v = Math.round(Math.min(100, Math.max(0, at)));
  // Never land on another stop's offset.
  while (stops.some((s, j) => j !== i && s.at === v)) v += v < 100 ? 1 : -1;
  return v;
};

const select = (i, focus) => {
  selected = i;
  draw();
  if (focus) rail.querySelector(`[data-index="${i}"]`)?.focus();
};

const addAt = (at) => {
  if (stops.length >= MAX_STOPS) return;
  const list = sorted();
  const after = list.findLast((s) => s.at <= at) ?? list[0];
  stops.push({ ...after, at: clampAt(at, -1) });
  selected = stops.length - 1;
  commit();
  rail.querySelector(`[data-index="${selected}"]`)?.focus();
};

addButton.addEventListener("click", () => {
  // Middle of the widest gap between neighbouring stops.
  const list = sorted();
  let best = [0, 0];
  for (let i = 1; i < list.length; i++) if (list[i].at - list[i - 1].at > best[1] - best[0]) best = [list[i - 1].at, list[i].at];
  if (best[1] - best[0] < 2) return;
  addAt((best[0] + best[1]) / 2);
});
removeButton.addEventListener("click", () => {
  if (stops.length <= 2) return;
  stops.splice(selected, 1);
  selected = Math.min(selected, stops.length - 1);
  commit();
});

editor.addEventListener("input", (event) => {
  const k = event.target.name?.replace(/^kf-/, "");
  const field = FIELDS.find(([key]) => key === k);
  if (!field) return;
  const n = Number(event.target.value);
  if (event.target.value === "" || !Number.isFinite(n)) return;
  stops[selected][k] = k === "at" ? clampAt(n, selected) : Math.min(field[2], Math.max(field[1], n));
  commit();
});
editor.addEventListener("change", () => draw());

// Pointer: press a stop to select and drag it; press the empty rail to add a stop there.
const percent = (event) => {
  const r = rail.getBoundingClientRect();
  return ((event.clientX - r.left) / r.width) * 100;
};
let dragging = -1;
rail.addEventListener("pointerdown", (event) => {
  const stop = event.target.closest(".kf-stop");
  if (!stop) return addAt(percent(event));
  event.preventDefault();
  dragging = Number(stop.dataset.index);
  rail.setPointerCapture(event.pointerId);
  select(dragging, true);
});
rail.addEventListener("pointermove", (event) => {
  if (dragging < 0) return;
  stops[dragging].at = clampAt(percent(event), dragging);
  commit();
  rail.querySelector(`[data-index="${dragging}"]`)?.focus();
});
const drop = () => { dragging = -1; };
rail.addEventListener("pointerup", drop);
rail.addEventListener("pointercancel", drop);

// Keyboard: Left/Right move the stop (Shift for 10%), Home/End jump between stops,
// Delete removes it.
rail.addEventListener("keydown", (event) => {
  const stop = event.target.closest(".kf-stop");
  if (!stop) return;
  const i = Number(stop.dataset.index);
  const step = event.shiftKey ? 10 : 1;
  const order = sorted();
  const pos = order.indexOf(stops[i]);
  const moves = {
    ArrowLeft: () => { stops[i].at = clampAt(stops[i].at - step, i); commit(); },
    ArrowRight: () => { stops[i].at = clampAt(stops[i].at + step, i); commit(); },
    Home: () => select(stops.indexOf(order[Math.max(0, pos - 1)])),
    End: () => select(stops.indexOf(order[Math.min(order.length - 1, pos + 1)])),
    Delete: () => removeButton.click(),
    Backspace: () => removeButton.click(),
  };
  if (!moves[event.key]) return;
  event.preventDefault();
  moves[event.key]();
  rail.querySelector(`[data-index="${selected}"]`)?.focus();
});
rail.addEventListener("click", (event) => {
  const stop = event.target.closest(".kf-stop");
  if (stop && event.detail === 0) select(Number(stop.dataset.index), true);
});

draw();
