import assert from "node:assert/strict";
import { OneEuro, createGestureEngine } from "./hand-engine.js";

/* Synthetic hand in metres (x right, y down, z toward the camera negative), projected orthographically.
   pose "pinch": thumb tip fixed, index tip `gap` metres away from it. Hand size (0 to 9) is 0.095. */
const K = 1.5;
const U = [0.3, -0.9, 0.3].map((v) => v / Math.hypot(0.3, 0.9, 0.3));
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const lerp = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);

function hand({ cx = 0.5, cy = 0.5, pose = "pinch", gap = 0.07, rotX = 0, world = true } = {}) {
  const p = new Array(21);
  p[0] = [0, 0.05, 0];
  const mcp = [[-0.022, -0.04, 0], [0, -0.045, 0], [0.02, -0.04, 0], [0.038, -0.03, 0]];
  const ext = [[-0.028, -0.115, 0], [0, -0.13, 0], [0.024, -0.115, 0], [0.048, -0.087, 0]];
  mcp.forEach((m, f) => {
    const b = 5 + f * 4;
    p[b] = m;
    if (pose === "fist") { p[b + 1] = add(m, [0, -0.02, -0.03]); p[b + 2] = add(m, [0, 0, -0.04]); p[b + 3] = add(m, [0, 0.02, -0.02]); }
    else { p[b + 1] = lerp(m, ext[f], 0.45); p[b + 2] = lerp(m, ext[f], 0.75); p[b + 3] = ext[f]; }
  });
  let thumbTip = [-0.06, -0.025, 0];
  if (pose === "pinch") {
    thumbTip = [-0.045, -0.06, -0.05];
    p[8] = add(thumbTip, U.map((v) => v * gap));
    p[6] = add(lerp(p[5], p[8], 1 / 3), [0, 0, -0.012]);
    p[7] = add(lerp(p[5], p[8], 2 / 3), [0, 0, -0.012]);
  }
  if (pose === "fist") thumbTip = add(p[8], [0.004, 0.008, -0.012]);   /* thumb resting on the curled index */
  p[1] = [-0.02, 0.035, 0]; p[4] = thumbTip; p[2] = lerp(p[1], p[4], 1 / 3); p[3] = lerp(p[1], p[4], 2 / 3);
  const c = Math.cos(rotX), s = Math.sin(rotX);
  const r = p.map(([x, y, z]) => [x, y * c - z * s, y * s + z * c]);
  return {
    lm: r.map(([x, y, z]) => ({ x: cx + x * K, y: cy + y * K, z: z * K })),
    w: world ? r.map(([x, y, z]) => ({ x, y, z })) : null
  };
}

function rig(opts) {
  const engine = createGestureEngine(opts);
  const events = [];
  for (const type of ["pinchstart", "pinchmove", "pinchend", "twostart", "twomove", "twoend", "lost"])
    engine.on(type, (e) => events.push({ type, ...e, handId: e.hand.id }));
  const r = { engine, events, t: 0, state: null,
    step(hands, n = 1) {
      for (let i = 0; i < n; i++) {
        const hs = typeof hands === "function" ? hands(i) : hands;
        const res = { landmarks: hs.map((h) => h.lm), handedness: hs.map(() => [{ categoryName: "Right" }]) };
        if (hs.every((h) => h.w)) res.worldLandmarks = hs.map((h) => h.w);
        r.state = engine.update(res, r.t);
        r.t += 33;
      }
      return r.state;
    },
    of: (type) => events.filter((e) => e.type === type) };
  return r;
}

const OPEN = 0.07, SHUT = 0.012;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test("One Euro reduces noise variance on a stationary noisy signal", () => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32) - 0.5;
  const f = new OneEuro({ minCutoff: 1.2, beta: 15, dCutoff: 1 });
  const raw = [], out = [];
  for (let i = 0; i < 300; i++) { const v = 0.5 + rnd() * 0.006; raw.push(v); out.push(f.filter(v, i * 33)); }
  const variance = (a) => { const m = a.reduce((s, v) => s + v, 0) / a.length; return a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length; };
  assert.ok(variance(out.slice(30)) < variance(raw.slice(30)) * 0.25, "variance should drop by 4x or more");
  /* and it must not lag a fast move: after a 0.3 jump it is within 0.01 in 5 frames */
  let v; for (let i = 300; i < 305; i++) v = f.filter(0.8, i * 33);
  assert.ok(Math.abs(v - 0.8) < 0.01, "fast step lag " + Math.abs(v - 0.8));
});

test("quick pinch: pinchstart then pinchend with tap true, and the point does not jump on contact", () => {
  const r = rig();
  r.step([hand({ gap: OPEN })], 6);
  const before = { ...r.state.hands[0].pinchPoint }, midBefore = mid(r.state.hands[0]);
  r.step([hand({ gap: SHUT })], 5);
  assert.equal(r.state.hands[0].pinching, true);
  assert.equal(r.state.hands[0].pinchStrength, 1);
  const P = r.state.hands[0].pinchPoint, midNow = mid(r.state.hands[0]);
  const rawJump = Math.hypot(midNow.x - midBefore.x, midNow.y - midBefore.y);
  const jump = Math.hypot(P.x - before.x, P.y - before.y);
  assert.ok(rawJump > 0.03, "test hand should slide the raw midpoint");
  assert.ok(jump < rawJump * 0.25, `pinchPoint jumped ${jump} of raw ${rawJump}`);
  r.step([hand({ gap: OPEN })], 6);
  const types = r.events.map((e) => e.type).filter((t) => t !== "pinchmove");
  assert.deepEqual(types, ["pinchstart", "pinchend"]);
  const end = r.of("pinchend")[0];
  assert.equal(end.tap, true, `duration ${end.duration} travel ${end.travel}`);
  assert.ok(end.duration < 450 && end.travel < 0.04);
  assert.equal(r.state.hands[0].pinching, false);
});

test("pinch plus move: pinchmove deltas sum to the travel, tap false", () => {
  const r = rig();
  r.step([hand({ cx: 0.3, gap: OPEN })], 5);
  r.step([hand({ cx: 0.3, gap: SHUT })], 5);
  r.step((i) => [hand({ cx: 0.3 + 0.3 * (i + 1) / 15, gap: SHUT })], 15);
  r.step([hand({ cx: 0.6, gap: SHUT })], 12);
  r.step([hand({ cx: 0.6, gap: OPEN })], 6);
  const moves = r.of("pinchmove"), end = r.of("pinchend")[0], start = r.of("pinchstart")[0];
  const sx = moves.reduce((s, e) => s + e.dx, 0), sy = moves.reduce((s, e) => s + e.dy, 0);
  const last = moves[moves.length - 1];
  assert.ok(Math.abs(sx - last.totalDx) < 1e-9 && Math.abs(sy - last.totalDy) < 1e-9);
  assert.ok(Math.abs(sx - 0.3) < 0.015, "sum dx " + sx);
  assert.ok(Math.abs(end.travel - 0.3) < 0.015, "travel " + end.travel);
  assert.ok(Math.abs(end.point.x - start.point.x - 0.3) < 0.015);
  assert.equal(end.tap, false);
});

test("release velocity reflects a fling", () => {
  const r = rig();
  r.step([hand({ cx: 0.2, gap: OPEN })], 4);
  r.step([hand({ cx: 0.2, gap: SHUT })], 5);
  let x = 0.2;
  r.step(() => [hand({ cx: (x += 0.03), gap: SHUT })], 8);          /* about 0.9 units/s */
  r.step(() => [hand({ cx: (x += 0.03), gap: OPEN })], 4);
  const end = r.of("pinchend")[0];
  assert.ok(end.vel.x > 0.5 && end.vel.x < 1.3, "vel.x " + end.vel.x);
  assert.ok(Math.abs(end.vel.y) < 0.3, "vel.y " + end.vel.y);
});

test("jitter around the thresholds does not toggle", () => {
  const size = 0.095;
  const r = rig();
  r.step([hand({ gap: OPEN })], 5);
  /* hovering around pinchOff from the open side: never starts */
  r.step((i) => [hand({ gap: size * (i % 2 ? 0.36 : 0.48) })], 30);
  assert.equal(r.of("pinchstart").length, 0);
  r.step([hand({ gap: SHUT })], 5);
  /* hovering around pinchOn while pinched: never ends */
  r.step((i) => [hand({ gap: size * (i % 2 ? 0.22 : 0.36) })], 40);
  assert.equal(r.of("pinchstart").length, 1);
  assert.equal(r.of("pinchend").length, 0);
  /* a single garbage frame in either direction is debounced */
  r.step([hand({ gap: OPEN })], 1); r.step([hand({ gap: SHUT })], 5);
  assert.equal(r.of("pinchend").length, 0);
  r.step([hand({ gap: OPEN })], 8);
  r.step([hand({ gap: SHUT })], 1); r.step([hand({ gap: OPEN })], 5);
  assert.equal(r.of("pinchstart").length, 1);
  assert.equal(r.of("pinchend").length, 1);
});

test("a 2-frame dropout mid-pinch does not end the pinch; a long one does, then lost", () => {
  const r = rig();
  r.step([hand({ gap: OPEN })], 4);
  r.step([hand({ gap: SHUT })], 6);
  const id = r.state.hands[0].id;
  r.step([], 2);
  assert.equal(r.state.hands.length, 1);
  assert.equal(r.state.hands[0].pinching, true);
  assert.equal(r.state.hands[0].tracked, false);
  r.step([hand({ gap: SHUT })], 4);
  assert.equal(r.state.hands[0].id, id);
  assert.equal(r.of("pinchend").length, 0);
  assert.equal(r.of("lost").length, 0);
  r.step([], 6);
  assert.equal(r.state.hands.length, 0);
  const tail = r.events.filter((e) => e.type !== "pinchmove").slice(-2);
  assert.deepEqual(tail.map((e) => e.type), ["pinchend", "lost"]);
  assert.equal(tail[0].tap, false);
});

test("rotated hand (foreshortened in 2D, same 3D pinch distance) still pinches", () => {
  const rot = (70 * Math.PI) / 180, gap = 0.02;
  const h = hand({ gap, rotX: rot });
  const d2 = (a, b) => Math.hypot(h.lm[a].x - h.lm[b].x, h.lm[a].y - h.lm[b].y);
  assert.ok(d2(4, 8) / d2(0, 9) > 0.35, "the naive 2D ratio must fail here, or the test proves nothing");
  const r = rig();
  r.step([hand({ gap: OPEN, rotX: rot })], 5);
  assert.equal(r.state.hands[0].pinching, false);
  r.step([h], 5);
  assert.equal(r.state.hands[0].pinching, true);
  r.step([hand({ gap: OPEN, rotX: rot })], 6);
  assert.equal(r.of("pinchend").length, 1);
});

test("without worldLandmarks the 2D ratio is used", () => {
  const r = rig();
  r.step([hand({ gap: OPEN, world: false })], 5);
  assert.equal(r.state.hands[0].pinching, false);
  r.step([hand({ gap: SHUT, world: false })], 5);
  assert.equal(r.state.hands[0].pinching, true);
});

test("a fist does not pinch; open palm is reported", () => {
  const r = rig();
  r.step([hand({ pose: "open" })], 5);
  assert.equal(r.state.hands[0].openPalm, true);
  r.step([hand({ pose: "fist" })], 20);
  assert.equal(r.state.hands[0].openPalm, false);
  assert.equal(r.of("pinchstart").length, 0);
  /* the guard is what stops it: with the guard off the same fist reads as a pinch */
  const r2 = rig({ fistCurl: 0 });
  r2.step([hand({ pose: "fist" })], 10);
  assert.equal(r2.of("pinchstart").length, 1);
});

test("two hands pinching and moving apart: scale > 1, twomove, no pinchmove, never a tap", () => {
  const r = rig();
  r.step([hand({ cx: 0.4, gap: OPEN }), hand({ cx: 0.6, gap: OPEN })], 5);
  assert.equal(r.state.hands.length, 2);
  const ids = r.state.hands.map((h) => h.id);
  r.step([hand({ cx: 0.4, gap: SHUT }), hand({ cx: 0.6, gap: SHUT })], 5);
  assert.equal(r.state.two.active, true);
  r.step((i) => { const d = 0.1 + 0.2 * (i + 1) / 12; return [hand({ cx: 0.5 - d, gap: SHUT }), hand({ cx: 0.5 + d, gap: SHUT })]; }, 12);
  r.step([hand({ cx: 0.2, gap: SHUT }), hand({ cx: 0.8, gap: SHUT })], 10);
  assert.deepEqual(r.state.hands.map((h) => h.id), ids, "hand ids stay stable");
  assert.ok(Math.abs(r.state.two.scale - 3) < 0.1, "scale " + r.state.two.scale);
  const [A, B] = r.state.hands.map((h) => h.pinchPoint);
  assert.ok(Math.abs(r.state.two.center.x - (A.x + B.x) / 2) < 1e-9 && Math.abs(B.x - A.x - 0.6) < 0.01);
  assert.ok(Math.abs(r.state.two.angle) < 0.02);
  assert.ok(r.of("twomove").length > 15);
  const i0 = r.events.findIndex((e) => e.type === "twostart");
  assert.ok(i0 >= 0 && !r.events.slice(i0).some((e) => e.type === "pinchmove"), "pinchmove suppressed");
  r.step([hand({ cx: 0.2, gap: OPEN }), hand({ cx: 0.8, gap: OPEN })], 6);
  assert.equal(r.of("twoend").length, 1);
  assert.equal(r.state.two.active, false);
  assert.deepEqual(r.of("pinchend").map((e) => e.tap), [false, false]);
});

test("two-hand rotation reports the angle", () => {
  const r = rig();
  const at = (a) => [hand({ cx: 0.5 - 0.2 * Math.cos(a), cy: 0.5 - 0.2 * Math.sin(a), gap: SHUT }),
                     hand({ cx: 0.5 + 0.2 * Math.cos(a), cy: 0.5 + 0.2 * Math.sin(a), gap: SHUT })];
  r.step(at(0), 6);
  r.step((i) => at((Math.PI / 2) * (i + 1) / 20), 20);
  r.step(at(Math.PI / 2), 10);
  assert.ok(Math.abs(r.state.two.angle - Math.PI / 2) < 0.05, "angle " + r.state.two.angle);
  assert.ok(Math.abs(r.state.two.scale - 1) < 0.05);
});

test("zero hands, missing fields, reset and off()", () => {
  const r = rig();
  assert.deepEqual(r.engine.update({ landmarks: [] }, 0).hands, []);
  assert.deepEqual(r.engine.update({}, 33).hands, []);
  assert.deepEqual(r.engine.update(null, 66).hands, []);
  let n = 0; const fn = () => n++;
  r.engine.on("pinchstart", fn); r.engine.off("pinchstart", fn);
  r.t = 100;
  r.step([hand({ gap: SHUT })], 5);
  assert.equal(n, 0);
  assert.equal(r.of("pinchstart").length, 1);
  r.engine.reset();
  assert.deepEqual(r.engine.update({ landmarks: [] }, r.t).hands, []);
  /* opts are live */
  r.engine.opts.pinchOn = 0.01; r.engine.opts.pinchOff = 0.02;
  r.t += 33;
  r.step([hand({ gap: SHUT })], 6);
  assert.equal(r.of("pinchstart").length, 1);
});

function mid(h) { return { x: (h.landmarks[4].x + h.landmarks[8].x) / 2, y: (h.landmarks[4].y + h.landmarks[8].y) / 2 }; }

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log("ok   " + name); }
  catch (err) { failed++; console.log("FAIL " + name + "\n     " + String(err.message).split("\n").join("\n     ")); }
}
console.log(`${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
