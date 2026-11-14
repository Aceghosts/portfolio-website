// Holographic hand HUD for the AR page. One 2D canvas, no shadowBlur, no filters,
// no gradients, no per-frame allocations. Glow is faked with a wide low-alpha
// stroke; legibility over bright video comes from a dark under-stroke.
// Visual test: hud-demo.html

const EMBER = "#FF5A1F", AMBER = "#FFB35C", CREAM = "#F4EDE4", DARK = "#0B0908";
const TAU = Math.PI * 2;
const FADE_MS = 150, TRAIL_MS = 240, TRAIL_N = 14, SNAP_MS = 260, PULSE_MS = 420;

// MediaPipe hand connections as polylines, 255 = pen up.
const BONES = new Uint8Array([
  0, 1, 2, 3, 4, 255, 0, 5, 6, 7, 8, 255, 9, 10, 11, 12, 255,
  13, 14, 15, 16, 255, 0, 17, 18, 19, 20, 255, 5, 9, 13, 17,
]);
const TIPS = new Uint8Array([4, 12, 16, 20]); // index tip (8) gets the reticle instead

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (k) => 1 - (1 - k) * (1 - k) * (1 - k);

function newState() {
  return {
    used: false, seen: false, id: null, alpha: 0,
    lm: new Float32Array(42),
    tipX: 0, tipY: 0, ppX: 0, ppY: 0,
    strength: 0, pinching: false, hover: false, grabbing: false,
    hoverK: 0, grabK: 0, snapT: -1e9,
    tx: new Float32Array(TRAIL_N), ty: new Float32Array(TRAIL_N),
    tt: new Float64Array(TRAIL_N), th: 0, tn: 0,
  };
}

export function createHandHUD(canvas) {
  const ctx = canvas.getContext("2d");
  let dpr = 1, cssW = -1, cssH = -1, lastT = 0, now = 0;
  let pctVal = -1, pctStr = "";

  // 2 live hands + 2 fading out
  const states = [newState(), newState(), newState(), newState()];
  const pulses = [];
  for (let i = 0; i < 8; i++) pulses.push({ on: false, x: 0, y: 0, kind: 0, t0: -1 });
  let pulseNext = 0;

  function resize() {
    cssW = canvas.clientWidth; cssH = canvas.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }

  function stateFor(id) {
    let free = null, weakest = null;
    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      if (s.used && s.id === id) return s;
      if (!s.used) free = free || s;
      else if (!s.seen && (!weakest || s.alpha < weakest.alpha)) weakest = s;
    }
    const s = free || weakest;
    if (!s) return null;
    s.used = true; s.id = id; s.alpha = 0; s.tn = 0; s.th = 0;
    s.hoverK = 0; s.grabK = 0; s.snapT = -1e9; s.pinching = false;
    return s;
  }

  // Stroke the current path twice: dark under-stroke, then colour.
  function ink(color, width, a, base) {
    ctx.globalAlpha = base * a * 0.6;
    ctx.strokeStyle = DARK; ctx.lineWidth = width + 2.5; ctx.stroke();
    ctx.globalAlpha = base * a;
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  // Same, plus a wide low-alpha halo standing in for glow.
  function glowInk(color, width, a, base) {
    ctx.globalAlpha = base * a * 0.6;
    ctx.strokeStyle = DARK; ctx.lineWidth = width + 2.5; ctx.stroke();
    ctx.globalAlpha = base * a * 0.22;
    ctx.strokeStyle = color; ctx.lineWidth = width + 5; ctx.stroke();
    ctx.globalAlpha = base * a;
    ctx.lineWidth = width; ctx.stroke();
  }

  function brackets(x, y, h, len) {
    for (let sx = -1; sx <= 1; sx += 2) for (let sy = -1; sy <= 1; sy += 2) {
      const cx = x + sx * h, cy = y + sy * h;
      ctx.moveTo(cx - sx * len, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy - sy * len);
    }
  }

  function drawHand(s) {
    const A = s.alpha, lm = s.lm;
    const pk = s.pinching ? 1 : clamp01(s.strength);

    // fingertip trail
    for (let i = 1; i < s.tn; i++) {
      const a = (s.th - i + TRAIL_N) % TRAIL_N, b = (s.th - i - 1 + TRAIL_N * 2) % TRAIL_N;
      const k = 1 - (now - s.tt[b]) / TRAIL_MS;
      if (k <= 0) break;
      ctx.beginPath(); ctx.moveTo(s.tx[a], s.ty[a]); ctx.lineTo(s.tx[b], s.ty[b]);
      ctx.globalAlpha = A * k * 0.5;
      ctx.strokeStyle = s.pinching ? EMBER : AMBER; ctx.lineWidth = 1 + 3 * k; ctx.stroke();
    }

    // skeleton
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i < BONES.length; i++) {
      const j = BONES[i];
      if (j === 255) { pen = false; continue; }
      if (pen) ctx.lineTo(lm[j * 2], lm[j * 2 + 1]); else ctx.moveTo(lm[j * 2], lm[j * 2 + 1]);
      pen = true;
    }
    glowInk(AMBER, 1.25, 0.8, A);

    // joints
    ctx.beginPath();
    for (let j = 0; j < 21; j++) {
      const x = lm[j * 2], y = lm[j * 2 + 1];
      ctx.moveTo(x + 2, y); ctx.arc(x, y, 2, 0, TAU);
    }
    ctx.globalAlpha = A * 0.6; ctx.fillStyle = DARK; ctx.fill();
    ctx.beginPath();
    for (let j = 0; j < 21; j++) {
      const x = lm[j * 2], y = lm[j * 2 + 1];
      ctx.moveTo(x + 1.2, y); ctx.arc(x, y, 1.2, 0, TAU);
    }
    ctx.globalAlpha = A * 0.9; ctx.fillStyle = AMBER; ctx.fill();

    // fingertips (not index): small bright ring
    ctx.beginPath();
    for (let i = 0; i < TIPS.length; i++) {
      const x = lm[TIPS[i] * 2], y = lm[TIPS[i] * 2 + 1];
      ctx.moveTo(x + 3.5, y); ctx.arc(x, y, 3.5, 0, TAU);
    }
    ink(CREAM, 1.2, 0.95, A);

    // pinch gauge: thumb-index link, closing ring, fill arc
    const px = s.ppX, py = s.ppY;
    if (pk > 0.04 && !s.pinching) {
      ctx.beginPath();
      ctx.moveTo(lm[8], lm[9]); ctx.lineTo(lm[16], lm[17]);
      ink(AMBER, 1, 0.25 + 0.6 * pk, A);
      const r = 22 - 13 * pk;
      ctx.beginPath(); ctx.arc(px, py, r, 0, TAU);
      ink(CREAM, 1, 0.3, A);
      ctx.beginPath(); ctx.arc(px, py, r, -Math.PI / 2, -Math.PI / 2 + TAU * pk);
      glowInk(pk > 0.75 ? EMBER : AMBER, 2.5, 1, A);
    }

    // index reticle: ring, centre dot, four ticks; hover tightens and adds brackets
    const x = s.tipX, y = s.tipY, hk = easeOut(s.hoverK);
    const ra = s.pinching ? 0.35 : 1; // step back once the pinch marker takes over
    const r = 11 - 3.5 * hk;
    const col = hk > 0.5 ? EMBER : CREAM;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.moveTo(x + r + 2.5, y); ctx.lineTo(x + r + 7, y);
    ctx.moveTo(x - r - 2.5, y); ctx.lineTo(x - r - 7, y);
    ctx.moveTo(x, y + r + 2.5); ctx.lineTo(x, y + r + 7);
    ctx.moveTo(x, y - r - 2.5); ctx.lineTo(x, y - r - 7);
    glowInk(col, 1.5, ra, A);
    if (hk > 0.02) {
      ctx.beginPath(); brackets(x, y, 26 - 9 * hk, 6);
      glowInk(EMBER, 2, hk * ra, A);
    }
    ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU);
    ctx.globalAlpha = A * 0.7; ctx.fillStyle = DARK; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU);
    ctx.globalAlpha = A; ctx.fillStyle = hk > 0.5 ? EMBER : CREAM; ctx.fill();

    // pinched: solid ember marker at pinchPoint, plus a one-shot snap ring
    if (s.pinching) {
      const sk = clamp01((now - s.snapT) / SNAP_MS);
      if (sk < 1) {
        const e = easeOut(sk);
        ctx.beginPath(); ctx.arc(px, py, 9 + 24 * e, 0, TAU);
        glowInk(EMBER, 4 - 3 * e, 1 - sk, A);
      }
      ctx.beginPath(); ctx.arc(px, py, 9, 0, TAU);
      ctx.globalAlpha = A * 0.7; ctx.fillStyle = DARK; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU);
      ctx.globalAlpha = A; ctx.fillStyle = sk < 0.35 ? CREAM : EMBER; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, 11, 0, TAU);
      ink(CREAM, 1.5, 1, A);
    }

    // held: three arcs orbiting the marker, brackets clamped around it
    if (s.grabK > 0.02) {
      const gk = easeOut(s.grabK), rot = now * 0.004, gr = 24 - 7 * gk;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a0 = rot + (i * TAU) / 3;
        ctx.moveTo(px + Math.cos(a0) * gr, py + Math.sin(a0) * gr);
        ctx.arc(px, py, gr, a0, a0 + 1.25);
      }
      glowInk(EMBER, 2.5, gk, A);
      ctx.beginPath(); brackets(px, py, 34 - 8 * gk, 7);
      ink(AMBER, 1.5, gk, A);
    }
  }

  function drawLink(a, b, two) {
    const A = Math.min(a.alpha, b.alpha);
    ctx.beginPath(); ctx.moveTo(a.ppX, a.ppY); ctx.lineTo(b.ppX, b.ppY);
    glowInk(AMBER, 1.5, 0.9, A);
    const c = two.center;
    const cx = c ? c.x : (a.ppX + b.ppX) / 2, cy = c ? c.y : (a.ppY + b.ppY) / 2;
    const pct = Math.round((two.scale == null ? 1 : two.scale) * 100);
    if (pct !== pctVal) { pctVal = pct; pctStr = pct + "%"; }
    const hw = 25, hh = 11;
    ctx.beginPath();
    ctx.arc(cx - hw + hh, cy, hh, Math.PI / 2, -Math.PI / 2);
    ctx.arc(cx + hw - hh, cy, hh, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.globalAlpha = A * 0.85; ctx.fillStyle = DARK; ctx.fill();
    ctx.globalAlpha = A; ctx.strokeStyle = AMBER; ctx.lineWidth = 1.25; ctx.stroke();
    ctx.fillStyle = CREAM; ctx.font = "600 12px Montserrat, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(pctStr, cx, cy + 0.5);
  }

  function drawPulse(p) {
    if (p.t0 < 0) p.t0 = now; // starts on the first draw after pulse(), whatever the timebase
    const k = (now - p.t0) / PULSE_MS;
    if (k >= 1) { p.on = false; return; }
    const e = easeOut(k), a = 1 - k;
    ctx.beginPath();
    if (p.kind === 1) { // grab: ring and brackets collapse inward
      ctx.arc(p.x, p.y, 40 - 28 * e, 0, TAU);
      brackets(p.x, p.y, 46 - 22 * e, 8);
      glowInk(EMBER, 2.5, a, 1);
    } else if (p.kind === 2) { // release: ring opens, four ticks fly out
      const r = 12 + 30 * e;
      ctx.arc(p.x, p.y, r, 0, TAU);
      for (let i = 0; i < 4; i++) {
        const c = Math.cos(i * TAU / 4 + 0.785), s = Math.sin(i * TAU / 4 + 0.785);
        ctx.moveTo(p.x + c * (r + 4), p.y + s * (r + 4));
        ctx.lineTo(p.x + c * (r + 12), p.y + s * (r + 12));
      }
      glowInk(AMBER, 1.5, a, 1);
    } else { // tap: expanding ember ring with a thin cream echo
      ctx.arc(p.x, p.y, 8 + 38 * e, 0, TAU);
      glowInk(EMBER, 3.5 - 2.5 * e, a, 1);
      ctx.beginPath(); ctx.arc(p.x, p.y, 4 + 22 * e, 0, TAU);
      ink(CREAM, 1, a * 0.8, 1);
    }
  }

  function draw(hands, tMs, opts) {
    if (canvas.clientWidth !== cssW || canvas.clientHeight !== cssH) resize();
    now = tMs;
    let dt = tMs - lastT; lastT = tMs;
    if (!(dt >= 0)) dt = 0; else if (dt > 100) dt = 100;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.lineCap = "round"; ctx.lineJoin = "round";

    for (let i = 0; i < states.length; i++) states[i].seen = false;
    let s0 = null, s1 = null;
    const n = hands ? hands.length : 0;
    for (let i = 0; i < n; i++) {
      const h = hands[i], s = stateFor(h.id);
      if (!s || !h.landmarks || h.landmarks.length < 21) continue;
      s.seen = true;
      for (let j = 0; j < 21; j++) { s.lm[j * 2] = h.landmarks[j].x; s.lm[j * 2 + 1] = h.landmarks[j].y; }
      const tip = h.tip || h.landmarks[8];
      s.tipX = tip.x; s.tipY = tip.y;
      if (h.pinchPoint) { s.ppX = h.pinchPoint.x; s.ppY = h.pinchPoint.y; }
      else { s.ppX = (s.lm[8] + s.lm[16]) / 2; s.ppY = (s.lm[9] + s.lm[17]) / 2; }
      if (h.pinching && !s.pinching) s.snapT = tMs;
      s.pinching = !!h.pinching; s.strength = h.pinchStrength || 0;
      s.hover = !!h.hover; s.grabbing = !!h.grabbing;
      s.th = (s.th + 1) % TRAIL_N;
      s.tx[s.th] = s.tipX; s.ty[s.th] = s.tipY; s.tt[s.th] = tMs;
      if (s.tn < TRAIL_N) s.tn++;
      if (!s0) s0 = s; else if (!s1) s1 = s;
    }

    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      if (!s.used) continue;
      s.alpha = clamp01(s.alpha + (s.seen ? dt : -dt) / FADE_MS);
      if (!s.seen && s.alpha <= 0) { s.used = false; continue; }
      s.hoverK = clamp01(s.hoverK + (s.hover && s.seen ? dt : -dt) / 120);
      s.grabK = clamp01(s.grabK + (s.grabbing && s.seen ? dt : -dt) / 140);
      if (s.alpha > 0) drawHand(s);
    }

    const two = opts && opts.two;
    if (two && two.active && s0 && s1) drawLink(s0, s1, two);

    for (let i = 0; i < pulses.length; i++) if (pulses[i].on) drawPulse(pulses[i]);
    ctx.globalAlpha = 1;
  }

  function pulse(x, y, kind) {
    const p = pulses[pulseNext];
    pulseNext = (pulseNext + 1) % pulses.length;
    p.on = true; p.x = x; p.y = y; p.t0 = -1;
    p.kind = kind === "grab" ? 1 : kind === "release" ? 2 : 0;
  }

  function clear() {
    for (let i = 0; i < states.length; i++) states[i].used = false;
    for (let i = 0; i < pulses.length; i++) pulses[i].on = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  resize();
  return { resize, draw, pulse, clear };
}
