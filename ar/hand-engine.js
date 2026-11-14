/* Hand tracking + gesture engine for the AR page.
   createGestureEngine is pure (no DOM, no MediaPipe, no clock) so it runs in node: `node ar/hand-engine.test.mjs`. */

const alpha = (cutoff, dt) => { const r = 2 * Math.PI * cutoff * dt; return r / (r + 1); };
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export class OneEuro {
  constructor({ minCutoff = 1, beta = 0, dCutoff = 1 } = {}) {
    this.minCutoff = minCutoff; this.beta = beta; this.dCutoff = dCutoff;
    this.reset();
  }
  reset() { this.x = null; this.dx = 0; this.t = null; }
  filter(value, tMs) {
    if (this.x === null) { this.x = value; this.t = tMs; return value; }
    const dt = (tMs - this.t) / 1000;
    if (!(dt > 0)) return this.x;
    this.t = tMs;
    this.dx += alpha(this.dCutoff, dt) * ((value - this.x) / dt - this.dx);
    this.x += alpha(this.minCutoff + this.beta * Math.abs(this.dx), dt) * (value - this.x);
    return this.x;
  }
}

export async function createHandTracker({ modelPath = "hand_landmarker.task", numHands = 2 } = {}) {
  const base = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
  const { FilesetResolver, HandLandmarker } = await import(base + "/+esm");
  const vision = await FilesetResolver.forVisionTasks(base + "/wasm");
  /* confidences stay at library defaults: raising them made the tracker miss hands (LEARNINGS.md section 5) */
  const make = (delegate) => HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: modelPath, delegate }, runningMode: "VIDEO", numHands
  });
  let landmarker, delegate = "GPU";
  try { landmarker = await make("GPU"); }
  catch (gpuErr) { delegate = "CPU"; landmarker = await make("CPU"); }
  let lastT = -1;
  return {
    delegate,
    detect(source, tMs) {
      /* MediaPipe throws on a timestamp that does not increase */
      if (!(tMs > lastT)) tMs = lastT + 1;
      lastT = tMs;
      return landmarker.detectForVideo(source, tMs);
    },
    close() { landmarker.close(); }
  };
}

export const DEFAULTS = {
  /* One Euro on every landmark coordinate (normalized image units, tuned for ~30 fps) */
  minCutoff: 1.2,      /* Hz at rest: lower = steadier but laggier */
  beta: 15,            /* Hz added per unit/s of speed: higher = less lag in fast motion */
  dCutoff: 1,
  ratioCutoff: 6,      /* Hz, light smoothing of the pinch ratio itself */
  /* pinch ratio = thumb tip to index tip distance / hand size (wrist to middle knuckle) */
  pinchOn: 0.32,
  pinchOff: 0.5,
  pinchOpen: 0.9,      /* ratio at which pinchStrength reads 0 */
  pinchOnMs: 30,       /* the ratio must stay past the threshold this long (always at least 2 frames) */
  pinchOffMs: 50,
  fistCurl: 0.35,      /* fingertip to its own knuckle, in hand sizes, below which a finger counts as tucked */
  zWeight: 0.5,        /* weight of depth in the 3D tip distance; world z is the noisiest axis on real phones */
  blend2d: 0.6,        /* the 2D image ratio may pull the 3D ratio down to this fraction of itself, no further (0 = 2D only, 1 = 3D only) */
  aspect: 1,           /* video width / height, only used for 2D distances (set it from the video element) */
  graceMs: 120,
  tapMaxMs: 450,
  tapMaxTravel: 0.04,
  velTauMs: 80,
  offsetTauMs: 150,    /* how fast the contact offset on pinchPoint relaxes once the fingers open */
  matchMaxDist: 0.35,  /* max palm movement between frames for a detection to continue a tracked hand */
  maxHands: 2
};

const PALM = [0, 5, 9, 13, 17];
const FINGERS = [[5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];

function centroid(pts, out) {
  let x = 0, y = 0;
  for (const i of PALM) { x += pts[i].x; y += pts[i].y; }
  out.x = x / PALM.length; out.y = y / PALM.length;
  return out;
}

/* Raw per-frame hand measurements. With world landmarks everything is metric 3D, so it does not change
   with hand rotation or distance from the camera. Without them, the same ratios in 2D. */
function measure(lm, w, o) {
  let d, size, tips;
  const d2 = (a, b) => Math.hypot((lm[a].x - lm[b].x) * o.aspect, lm[a].y - lm[b].y);
  const ratio2 = d2(4, 8) / (Math.max(d2(0, 9), 1.4 * d2(5, 17)) || 1e-6);
  if (w) {
    d = (a, b) => Math.hypot(w[a].x - w[b].x, w[a].y - w[b].y, w[a].z - w[b].z);
    size = d(0, 9);
    tips = Math.hypot(w[4].x - w[8].x, w[4].y - w[8].y, (w[4].z - w[8].z) * o.zWeight);
  } else {
    d = d2;
    /* palm width covers the case where the wrist-to-knuckle axis is foreshortened (1.4 = typical length / width) */
    size = Math.max(d(0, 9), 1.4 * d(5, 17));
    tips = d(4, 8);
  }
  size = size || 1e-6;
  let straight = 1;
  for (const [a, b, c, e] of FINGERS) straight = Math.min(straight, d(a, e) / (d(a, b) + d(b, c) + d(c, e) || 1e-6));
  /* On real phones the 3D tips rarely read as touching (world depth is noisy), so a real pinch can sit at 0.3 to 0.4
     in 3D while the image clearly shows contact. The 2D ratio may therefore pull the 3D one down, but only to
     blend2d of it: fingers that merely line up along the camera axis (small in 2D, far apart in 3D) still do not pinch. */
  const ratio3 = tips / size;
  return {
    ratio: w ? Math.min(ratio3, Math.max(ratio2, o.blend2d * ratio3)) : ratio3,
    ratio3, ratio2,
    /* Fist rejection: in a fist the thumb often rests on the index tip, so the tip ratio alone reads as a pinch.
       "Middle finger up" was tried before and rejected real pinches made with relaxed, half-curled fingers.
       What separates the two is the index itself: pinching, its tip is about 0.7 hand sizes from its own knuckle;
       in a fist it is tucked to about 0.3. Requiring index AND middle tucked keeps one noisy finger from vetoing. */
    fist: d(8, 5) / size < o.fistCurl && d(12, 9) / size < o.fistCurl,
    straight
  };
}

export function createGestureEngine(userOpts = {}) {
  const opts = { ...DEFAULTS, ...userOpts };
  const listeners = new Map();
  let tracks = [], nextId = 1, two = null;
  const twoState = { active: false, scale: 1, center: { x: 0, y: 0 }, angle: 0 };

  const emit = (type, payload) => { const set = listeners.get(type); if (set) for (const fn of [...set]) fn(payload); };
  const filt = (f, v, t, minCutoff, beta) => {
    f.minCutoff = minCutoff; f.beta = beta; f.dCutoff = opts.dCutoff;   /* opts are live-tunable */
    return f.filter(v, t);
  };

  function newTrack(t) {
    const landmarks = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
    return {
      hand: { id: nextId++, label: "", landmarks, tip: landmarks[8], pinchPoint: { x: 0, y: 0 }, pinching: false,
              pinchStrength: 0, vel: { x: 0, y: 0 }, openPalm: false, tracked: true },
      fx: landmarks.map(() => new OneEuro()), fy: landmarks.map(() => new OneEuro()), fr: new OneEuro(),
      c: { x: 0, y: 0 },            /* raw palm centre, for matching detections to tracks */
      seen: t, lastT: null, candT: null, pinch: null, started: false, updated: false,
      off: { x: 0, y: 0 }, mid: { x: 0, y: 0 }, palm: { x: 0, y: 0 }
    };
  }

  function endPinch(tr, t, lost) {
    const p = tr.pinch, h = tr.hand;
    const duration = t - p.t0;
    h.pinching = false; tr.pinch = null; tr.candT = null;
    emit("pinchend", { hand: h, t, point: { ...h.pinchPoint }, vel: { ...h.vel }, duration, travel: p.travel,
      tap: !lost && !p.two && duration <= opts.tapMaxMs && p.travel <= opts.tapMaxTravel });
  }

  function drop(tr, t) {
    if (tr.pinch) endPinch(tr, t, true);
    tracks = tracks.filter((x) => x !== tr);
    emit("lost", { hand: tr.hand, t });
  }

  function updateTrack(tr, det, t) {
    const h = tr.hand, L = h.landmarks, lm = det.lm, o = opts;
    for (let i = 0; i < 21; i++) {
      L[i].x = filt(tr.fx[i], lm[i].x, t, o.minCutoff, o.beta);
      L[i].y = filt(tr.fy[i], lm[i].y, t, o.minCutoff, o.beta);
    }
    const m = measure(lm, det.w, o);
    const ratio = filt(tr.fr, m.ratio, t, o.ratioCutoff, 0);
    h.ratio = ratio; h.ratio3 = m.ratio3; h.ratio2 = m.ratio2; h.fist = m.fist;
    const strength = clamp01((o.pinchOpen - ratio) / (o.pinchOpen - o.pinchOn));

    /* pinchPoint = thumb/index midpoint + offset. The midpoint slides as the fingers close or open, which would
       drag the target on every click. So the part of the midpoint's motion that is NOT whole-hand motion
       (midpoint relative to the palm) is absorbed into the offset in proportion to g: g rises to 1 as the fingers
       near contact, is 0 while firmly pinched (the point follows the hand exactly), and rises again through the
       release band. Whole-hand translation always passes through untouched. */
    const mx = (L[4].x + L[8].x) / 2, my = (L[4].y + L[8].y) / 2;
    const prevPalmX = tr.palm.x, prevPalmY = tr.palm.y;
    centroid(L, tr.palm);
    const first = tr.lastT === null, dt = first ? 0 : (t - tr.lastT) / 1000;
    const P = h.pinchPoint, px = P.x, py = P.y;
    if (dt > 0) {
      /* the raw ratio sees the closing one frame before the filtered one, which is the frame that moves most */
      const near = clamp01((o.pinchOpen - Math.min(ratio, m.ratio)) / (o.pinchOpen - o.pinchOn));
      const g = h.pinching ? clamp01((ratio - o.pinchOn) / (o.pinchOff - o.pinchOn)) : clamp01((near - 0.4) / 0.6);
      tr.off.x -= g * ((mx - tr.mid.x) - (tr.palm.x - prevPalmX));
      tr.off.y -= g * ((my - tr.mid.y) - (tr.palm.y - prevPalmY));
      if (!h.pinching) {
        const k = Math.exp(-(1 - g) * dt * 1000 / o.offsetTauMs);
        tr.off.x *= k; tr.off.y *= k;
      }
    }
    tr.mid.x = mx; tr.mid.y = my;
    P.x = mx + tr.off.x; P.y = my + tr.off.y;
    if (dt > 0) {
      const a = 1 - Math.exp(-dt * 1000 / o.velTauMs);
      h.vel.x += a * ((P.x - px) / dt - h.vel.x);
      h.vel.y += a * ((P.y - py) / dt - h.vel.y);
    }
    if (first || dt > 0) tr.lastT = t;

    /* hysteresis (separate on/off thresholds) plus a time debounce on both edges */
    tr.started = false;
    const want = h.pinching ? ratio > o.pinchOff : ratio < o.pinchOn && !m.fist;
    if (!want) tr.candT = null;
    else {
      if (tr.candT === null) tr.candT = t;
      if (t - tr.candT >= (h.pinching ? o.pinchOffMs : o.pinchOnMs)) {
        tr.candT = null;
        if (h.pinching) endPinch(tr, t, false);
        else {
          h.pinching = true; tr.started = true;
          tr.pinch = { t0: t, start: { x: P.x, y: P.y }, last: { x: P.x, y: P.y }, travel: 0, two: false };
          emit("pinchstart", { hand: h, t, point: { x: P.x, y: P.y } });
        }
      }
    }
    if (tr.pinch) tr.pinch.travel = Math.max(tr.pinch.travel, Math.hypot(P.x - tr.pinch.start.x, P.y - tr.pinch.start.y));

    h.pinchStrength = h.pinching ? 1 : strength;
    h.openPalm = !h.pinching && m.straight > (h.openPalm ? 0.78 : 0.88);
    h.label = det.label || h.label;
    h.tracked = true;
    tr.c.x = det.c.x; tr.c.y = det.c.y;
    tr.seen = t; tr.updated = true;
  }

  function update(result, tMs) {
    const t = tMs, o = opts;
    const lms = (result && result.landmarks) || [];
    const dets = [];
    for (let i = 0; i < lms.length; i++) {
      const lm = lms[i];
      if (!lm || lm.length < 21) continue;
      const w = result.worldLandmarks && result.worldLandmarks[i];
      const hd = result.handedness && result.handedness[i] && result.handedness[i][0];
      const c = centroid(lm, { x: 0, y: 0 });
      /* MediaPipe sometimes reports the same hand twice */
      const size = Math.hypot(lm[0].x - lm[9].x, lm[0].y - lm[9].y);
      if (dets.some((d) => Math.hypot(d.c.x - c.x, d.c.y - c.y) < size * 0.5)) continue;
      dets.push({ lm, w: w && w.length >= 21 ? w : null, label: hd ? hd.categoryName : "", c });
    }

    /* identity by proximity, nearest pairs first; the handedness label flickers too much to key on */
    for (const tr of tracks) tr.updated = false;
    const pairs = [];
    for (const tr of tracks) for (const d of dets) {
      const dist = Math.hypot(tr.c.x - d.c.x, tr.c.y - d.c.y);
      if (dist <= o.matchMaxDist) pairs.push({ tr, d, dist });
    }
    pairs.sort((a, b) => a.dist - b.dist);
    const used = new Set();
    for (const { tr, d } of pairs) {
      if (tr.updated || used.has(d)) continue;
      used.add(d); updateTrack(tr, d, t);
    }
    for (const d of dets) {
      if (used.has(d)) continue;
      if (tracks.length >= o.maxHands) {
        const stale = tracks.filter((tr) => !tr.updated).sort((a, b) => a.seen - b.seen)[0];
        if (!stale) continue;
        drop(stale, t);
      }
      const tr = newTrack(t);
      tracks.push(tr); updateTrack(tr, d, t);
    }
    for (const tr of [...tracks]) {
      if (tr.updated) continue;
      if (t - tr.seen > o.graceMs) drop(tr, t);
      else tr.hand.tracked = false;   /* brief dropout: hold everything, including a pinch */
    }

    /* two-hand gesture */
    const geom = () => {
      const A = two.a.hand.pinchPoint, B = two.b.hand.pinchPoint;
      const vx = (B.x - A.x) * o.aspect, vy = B.y - A.y;
      return { d: Math.hypot(vx, vy) || 1e-6, ang: Math.atan2(vy, vx), cx: (A.x + B.x) / 2, cy: (A.y + B.y) / 2 };
    };
    const twoPayload = () => ({ hand: two.a.hand, hands: [two.a.hand, two.b.hand], t, scale: twoState.scale,
      center: { ...twoState.center }, angle: twoState.angle });
    if (two && !(two.a.pinch && two.b.pinch)) {
      emit("twoend", twoPayload());
      two = null;
      twoState.active = false; twoState.scale = 1; twoState.angle = 0;
    }
    if (two) {
      const g = geom();
      let da = g.ang - two.prevAng;
      da -= 2 * Math.PI * Math.round(da / (2 * Math.PI));
      two.prevAng = g.ang;
      twoState.scale = g.d / two.d0; twoState.angle += da;
      twoState.center.x = g.cx; twoState.center.y = g.cy;
      emit("twomove", twoPayload());
    } else {
      const pin = tracks.filter((tr) => tr.pinch);
      if (pin.length >= 2) {
        two = { a: pin[0], b: pin[1] };
        const g = geom();
        two.d0 = g.d; two.prevAng = g.ang;
        pin[0].pinch.two = pin[1].pinch.two = true;   /* a pinch that took part in a two-hand gesture is never a tap */
        twoState.active = true; twoState.scale = 1; twoState.angle = 0;
        twoState.center.x = g.cx; twoState.center.y = g.cy;
        emit("twostart", twoPayload());
      }
    }

    for (const tr of tracks) {
      const p = tr.pinch;
      if (!p || !tr.updated || tr.started) continue;
      const P = tr.hand.pinchPoint, dx = P.x - p.last.x, dy = P.y - p.last.y;
      p.last.x = P.x; p.last.y = P.y;
      if (!two) emit("pinchmove", { hand: tr.hand, t, point: { x: P.x, y: P.y }, dx, dy,
        totalDx: P.x - p.start.x, totalDy: P.y - p.start.y });
    }

    return { hands: tracks.map((tr) => tr.hand), two: { ...twoState, center: { ...twoState.center } } };
  }

  return {
    opts,
    update,
    on(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    off(type, fn) { const set = listeners.get(type); if (set) set.delete(fn); },
    reset() { tracks = []; two = null; twoState.active = false; twoState.scale = 1; twoState.angle = 0; }
  };
}
