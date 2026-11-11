/* 9V CLEARANCE – tactical air-law shooter for ME2804 (three.js r128) */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NOLOCK = /[?&]nolock/.test(location.search);
const TOUCH = !NOLOCK && ('ontouchstart' in window) && matchMedia('(pointer:coarse)').matches;

/* ───────── save ───────── */
let save = { name: '', agent: 'torque', diff: 1, sens: 1, best: {}, ride: 0, briefed: {} };
try { Object.assign(save, JSON.parse(localStorage.getItem('9vc_save') || '{}')); } catch (e) {}
const persist = () => { try { localStorage.setItem('9vc_save', JSON.stringify(save)); } catch (e) {} };
const DIFF = [{ n: 'Cadet', acc: 0.6, dmg: 0.6 }, { n: 'Standard', acc: 1, dmg: 1 }, { n: 'Ace', acc: 1.25, dmg: 1.3 }];
const ROUNDS = 6, NEED = 4, RIDE_ROUNDS = 8, RIDE_NEED = 6, ROUND_TIME = 100, ULT_MAX = 6;
const RIDE = { id: 'ride', code: 'FINAL', name: 'Check Ride', short: 'Check Ride', color: '#ffffff', tagline: 'Mixed questions from all four operations. Clear 6 of 8 rounds to earn your clearance.' };
const agent = () => AGENTS.find(a => a.id === save.agent) || AGENTS[0];
const cleared = id => !!(save.best[id] && save.best[id].clear);
const allCleared = () => MISSIONS.every(m => cleared(m.id));

/* ───────── audio (synthesised) ───────── */
let AC = null, noiseBuf = null;
function au() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, d, type = 'square', vol = 0.06, slide = 0, delay = 0) {
  const a = au(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d);
}
function noise(d, vol = 0.14, freq = 1800) {
  const a = au(); if (!a) return;
  if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d); s.connect(f); f.connect(g); g.connect(a.destination); s.start(); s.stop(a.currentTime + d);
}
const sfx = {
  shot: w => { noise(0.12, w.pellets ? 0.22 : 0.15, w.dmg > 60 ? 900 : 2400); tone(w.dmg > 60 ? 140 : 220, 0.08, 'sawtooth', 0.05, -120); },
  eshot: () => noise(0.09, 0.05, 1200), hit: () => tone(1500, 0.04, 'square', 0.04), head: () => { tone(2200, 0.06, 'square', 0.05); tone(3000, 0.05, 'square', 0.03, 0, 0.03); },
  kill: () => { tone(660, 0.08, 'triangle', 0.08); tone(990, 0.14, 'triangle', 0.08, 0, 0.07); }, hurt: () => tone(110, 0.14, 'sawtooth', 0.09, -50),
  click: () => tone(900, 0.03, 'square', 0.03), buy: () => { tone(700, 0.05, 'triangle', 0.06); tone(1050, 0.08, 'triangle', 0.06, 0, 0.05); }, deny: () => tone(160, 0.12, 'square', 0.05),
  reload: () => { tone(400, 0.04, 'square', 0.03); tone(600, 0.04, 'square', 0.03, 0, 0.18); }, tick: p => tone(500 + p * 700, 0.05, 'sine', 0.05),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.08, 0, i * 0.1)), lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'sawtooth', 0.05, 0, i * 0.16)),
  wrong: () => { tone(180, 0.35, 'sawtooth', 0.09, -80); noise(0.3, 0.1, 600); }, abil: () => tone(300, 0.3, 'sine', 0.08, 900), start: () => { tone(440, 0.1, 'square', 0.05); tone(880, 0.25, 'square', 0.05, 0, 0.12); }
};

/* ───────── three setup ───────── */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const scene = new THREE.Scene();
const SKY = 0x162238; scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 50, 190);
const camera = new THREE.PerspectiveCamera(74, 1, 0.05, 420); camera.rotation.order = 'YXZ'; scene.add(camera);
scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x39425a, 1.0));
const sun = new THREE.DirectionalLight(0xffe2b8, 0.75); sun.position.set(-60, 90, 40); scene.add(sun);
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.userData = { c, x }; return t; }
const box = (w, h, d, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); (parent || scene).add(m); return m; };
const lam = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o));

/* ───────── map ───────── */
const MAP = [
  '#########################',
  '#.......#.......#.......#',
  '#.e.1...#..e2.e.#...3.e.#',
  '#.......#.......#.......#',
  '#...c...#.c...c.#...c...#',
  '##.###.###..#..###.###.##',
  '#.......................#',
  '#..c..#....T.T....#..c..#',
  '#.....#...........#.....#',
  '#.##..####.###.####..##.#',
  '#.....#.....c.....#.....#',
  '#..T........e.........T.#',
  '#.....#.....T.....#.....#',
  '####.######...######.####',
  '#...........P...........#',
  '#########################'
];
const GW = MAP[0].length, GH = MAP.length, CS = 4;
const cx = c => (c - GW / 2 + 0.5) * CS, cz = r => (r - GH / 2 + 0.5) * CS;
const col = x => Math.floor(x / CS + GW / 2), row = z => Math.floor(z / CS + GH / 2);
const cell = (c, r) => (r < 0 || r >= GH || c < 0 || c >= GW) ? '#' : MAP[r][c];
const solid = (c, r) => { const k = cell(c, r); return k === '#' || k === 'c' || k === 'T'; };
const tall = (c, r) => { const k = cell(c, r); return k === '#' || k === 'T'; };
const SITE_COL = ['#35d0c8', '#ffb020', '#ff6bd6'];
const SITES = [], GUARDS = [], FREE = [], wallMeshes = [];
let spawn = { x: 0, z: 0 };
{
  const wallTex = ctex(128, 192, (x, w, h) => {
    x.fillStyle = '#c9d2e0'; x.fillRect(0, 0, w, h); x.fillStyle = '#b4bfd0'; x.fillRect(0, 0, w, 6); x.fillRect(0, 92, w, 4);
    x.strokeStyle = '#9aa7bb'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2); x.fillStyle = '#8894a8'; for (let i = 0; i < 4; i++) { x.fillRect(10 + i * 34, 12, 4, 4); x.fillRect(10 + i * 34, 80, 4, 4); }
    for (let i = -2; i < 8; i++) { x.fillStyle = i % 2 ? '#2a2f3a' : '#f2b632'; x.beginPath(); x.moveTo(i * 24, h); x.lineTo(i * 24 + 24, h); x.lineTo(i * 24 + 44, h - 20); x.lineTo(i * 24 + 20, h - 20); x.fill(); }
  });
  const crateTex = ctex(128, 128, (x, w, h) => { x.fillStyle = '#d8dde6'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7d8798'; x.lineWidth = 6; x.strokeRect(6, 6, w - 12, h - 12); x.beginPath(); x.moveTo(6, 6); x.lineTo(w - 6, h - 6); x.moveTo(w - 6, 6); x.lineTo(6, h - 6); x.stroke(); });
  const zoneCol = (c, r) => r <= 5 ? [0x4f7f86, 0x8a744c, 0x805a7c][c < 8 ? 0 : c <= 16 ? (c === 8 || c === 16 ? 1 : 1) : 2] : 0x5d6b84;
  const wm = {}, wallMat = c => wm[c] || (wm[c] = lam(c, { map: wallTex }));
  const crateMat = lam(0x3d7dd8, { map: crateTex }), tallMat = lam(0xc9792b, { map: crateTex });
  const floorTex = ctex(256, 256, (x, w, h) => { x.fillStyle = '#4a5468'; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? 0 : 255},${Math.random() < 0.5 ? 0 : 255},255,0.035)`; x.fillRect(Math.random() * w, Math.random() * h, 3, 3); } x.strokeStyle = '#3c4557'; x.lineWidth = 3; x.strokeRect(0, 0, w, h); });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(GW, GH);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(GW * CS, GH * CS), lam(0xffffff, { map: floorTex })); floor.rotation.x = -Math.PI / 2; scene.add(floor); wallMeshes.push(floor);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), lam(0x2a3344)); apron.rotation.x = -Math.PI / 2; apron.position.y = -0.05; scene.add(apron);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf2b632 });
  for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) {
    const k = MAP[r][c], x = cx(c), z = cz(r);
    if (k === '#') wallMeshes.push(box(CS, 6, CS, wallMat(zoneCol(c, r)), x, 3, z));
    else if (k === 'T') wallMeshes.push(box(CS * 0.96, 3.4, CS * 0.96, tallMat, x, 1.7, z));
    else if (k === 'c') wallMeshes.push(box(CS * 0.9, 1.25, CS * 0.9, crateMat, x, 0.625, z));
    else { FREE.push({ c, r, x, z }); if (k === 'P') spawn = { x, z }; if (k === 'e') GUARDS.push({ x, z, c, r }); if ('123'.includes(k)) SITES.push({ i: +k - 1, letter: 'ABC'[+k - 1], x, z, color: SITE_COL[+k - 1] }); }
  }
  SITES.sort((a, b) => a.i - b.i);
  // taxi lines along the main lanes
  [[6, 1, 23], [14, 1, 23]].forEach(([r, c0, c1]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry((c1 - c0 + 1) * CS, 0.22), lineMat); m.rotation.x = -Math.PI / 2; m.position.set((cx(c0) + cx(c1)) / 2, 0.02, cz(r)); scene.add(m); });
  // sites: ring, beam, floating answer board
  SITES.forEach(s => {
    const c = new THREE.Color(s.color);
    const ring = new THREE.Mesh(new THREE.RingGeometry(4.6, 5.2, 48), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(s.x, 0.04, s.z); scene.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(4.6, 48), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.13 })); disc.rotation.x = -Math.PI / 2; disc.position.set(s.x, 0.03, s.z); scene.add(disc);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 60, 12, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, fog: false })); beam.position.set(s.x, 30, s.z); scene.add(beam);
    s.tex = ctex(768, 288, () => {}); s.board = new THREE.Sprite(new THREE.SpriteMaterial({ map: s.tex, fog: false, depthWrite: false })); s.board.scale.set(17, 6.4, 1); s.board.position.set(s.x, 11, s.z); scene.add(s.board);
    s.ring = ring; s.disc = disc; s.beam = beam;
  });
  // scenery beyond the walls: control tower, hangars, parked airliners
  const dk = lam(0x232d42), glass = new THREE.MeshBasicMaterial({ color: 0x7fe8ff }), wht = lam(0xdfe7f2), acc = lam(0xffb020);
  box(7, 46, 7, dk, 0, 23, -78); box(13, 6, 13, glass, 0, 48, -78); box(15, 1.5, 15, dk, 0, 52, -78); box(0.5, 9, 0.5, dk, 0, 57, -78);
  [[-88, -30, 44, 22, 60], [92, 20, 44, 20, 70], [-30, 74, 70, 18, 30]].forEach(([x, z, w, h, d]) => { box(w, h, d, dk, x, h / 2, z); box(w * 0.7, 0.8, d * 0.2 + 1, acc, x, h * 0.72, z + (z > 60 ? -d / 2 : 0) + (x < -60 ? 0 : 0)); });
  const liner = (x, z, ry) => { const g = new THREE.Group(); const f = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 34, 14), wht); f.rotation.z = Math.PI / 2; f.position.y = 5; g.add(f);
    const n = new THREE.Mesh(new THREE.SphereGeometry(2.4, 14, 10), wht); n.position.set(17, 5, 0); n.scale.x = 1.6; g.add(n); box(7, 0.6, 38, wht, 0, 4.2, 0, g); box(5, 9, 0.6, acc, -15, 10, 0, g); box(4, 0.4, 13, wht, -15, 6, 0, g);
    [-9, 9].forEach(zz => { const e = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 5, 12), dk); e.rotation.z = Math.PI / 2; e.position.set(2, 2.8, zz); g.add(e); }); [[10, 0], [-3, 3], [-3, -3]].forEach(([a, b]) => box(0.5, 2.6, 0.5, dk, a, 1.3, b, g));
    g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); };
  liner(-82, 34, 0.5); liner(84, -34, 2.4); liner(38, 68, 3.3);
  const starG = new THREE.BufferGeometry(), sp = []; for (let i = 0; i < 500; i++) { const a = Math.random() * 6.283, e = rnd(0.12, 1.4), R = 380; sp.push(Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R); }
  starG.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); scene.add(new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, fog: false, sizeAttenuation: false })));
}
function drawBoard(s) {
  const x = s.tex.userData.x, w = 768, h = 288; x.clearRect(0, 0, w, h);
  x.fillStyle = 'rgba(9,14,26,0.86)'; x.fillRect(0, 0, w, h); x.fillStyle = s.struck ? '#6b7385' : s.color; x.fillRect(0, 0, w, 10); x.fillRect(0, 0, 190, h);
  x.fillStyle = '#0b1220'; x.font = '900 220px Arial Black, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s.letter, 95, h / 2 + 14);
  x.fillStyle = s.struck ? '#7c869a' : '#ffffff'; x.textAlign = 'left'; let size = 50, lines;
  for (; size >= 30; size -= 4) { x.font = `700 ${size}px Arial, sans-serif`; lines = []; let cur = ''; (s.text || '').split(' ').forEach(wd => { const t = cur ? cur + ' ' + wd : wd; if (x.measureText(t).width > 540 && cur) { lines.push(cur); cur = wd; } else cur = t; }); if (cur) lines.push(cur); if (lines.length * size * 1.15 <= 250) break; }
  const lh = size * 1.15, y0 = h / 2 + 5 - (lines.length - 1) * lh / 2; lines.forEach((l, i) => x.fillText(l, 212, y0 + i * lh));
  if (s.struck) { x.strokeStyle = '#ff5d73'; x.lineWidth = 16; x.beginPath(); x.moveTo(20, 20); x.lineTo(w - 20, h - 20); x.moveTo(w - 20, 20); x.lineTo(20, h - 20); x.stroke(); }
  s.tex.needsUpdate = true; const o = s.struck ? 0.25 : 1; s.ring.material.opacity = 0.9 * o; s.beam.material.opacity = 0.22 * o; s.disc.material.opacity = 0.13 * o;
}
function blocked(x, z, r) {
  const c0 = col(x - r), c1 = col(x + r), r0 = row(z - r), r1 = row(z + r);
  for (let rr = r0; rr <= r1; rr++) for (let cc = c0; cc <= c1; cc++) if (solid(cc, rr)) {
    const bx = cx(cc), bz = cz(rr), dx = Math.abs(x - bx) - CS / 2, dz = Math.abs(z - bz) - CS / 2;
    if (dx < r && dz < r && (dx <= 0 || dz <= 0 || dx * dx + dz * dz < r * r)) return true;
  }
  return false;
}
function moveBody(o, dx, dz, r) { if (!blocked(o.x + dx, o.z, r)) o.x += dx; if (!blocked(o.x, o.z + dz, r)) o.z += dz; }
function los(x0, z0, x1, z1) { const d = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(d / 1.0); for (let i = 1; i < n; i++) { const t = i / n; if (tall(col(x0 + (x1 - x0) * t), row(z0 + (z1 - z0) * t))) return false; } return true; }
// flow field toward the player (BFS over walkable cells)
const flow = new Int16Array(GW * GH); let flowCell = -1;
function updateFlow() {
  const pc = col(P.x), pr = row(P.z), id = pr * GW + pc; if (id === flowCell) return; flowCell = id; flow.fill(-1);
  const q = [id]; flow[id] = 0;
  for (let h = 0; h < q.length; h++) { const k = q[h], c = k % GW, r = (k / GW) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const nc = c + a, nr = r + b, nk = nr * GW + nc; if (!solid(nc, nr) && flow[nk] < 0) { flow[nk] = flow[k] + 1; q.push(nk); } }); }
}

/* ───────── player & input ───────── */
const P = { x: 0, z: 0, yaw: 0, pitch: 0, hp: 100, armor: 0, alive: true, moving: false, bob: 0, resistT: 0, boostT: 0 };
const keys = {}, joy = { x: 0, y: 0 };
let state = 'lobby', paused = false, now = 0;
const locked = () => NOLOCK || TOUCH || document.pointerLockElement === canvas;
const playing = () => state === 'play' && !paused;
function lock() { if (NOLOCK || TOUCH) return; try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
function unlock() { if (document.pointerLockElement) document.exitPointerLock(); }
document.addEventListener('pointerlockchange', () => { if (state === 'play') { paused = !locked(); $('pause').classList.toggle('hidden', !paused); if (paused) { W.trigger = false; for (const k in keys) keys[k] = false; } } });
$('pause').addEventListener('click', e => { if (e.target.id === 'quitBtn') { paused = false; $('pause').classList.add('hidden'); state = 'lobby'; lobby(); return; } au(); lock(); });
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return; keys[e.code] = true; if (!playing()) return;
  if (['Space', 'Tab', 'KeyF', 'KeyE', 'KeyR', 'KeyX'].includes(e.code)) e.preventDefault(); if (e.repeat) return;
  if (e.code === 'KeyR') reload(); else if (e.code === 'Digit1') switchTo(M.primary || 'pitot'); else if (e.code === 'Digit2') switchTo('pitot'); else if (e.code === 'KeyQ') swap();
  else if (e.code === 'KeyE') useE(); else if (e.code === 'KeyX') useX();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; W.trigger = false; });
document.addEventListener('mousemove', e => { if (!playing() || !locked() || TOUCH) return; look(e.movementX || 0, e.movementY || 0, 0.0022); });
function look(dx, dy, k) { P.yaw -= dx * k * save.sens; P.pitch = clamp(P.pitch - dy * k * save.sens, -1.45, 1.45); }
canvas.addEventListener('mousedown', e => { if (TOUCH) return; if (state === 'play' && !locked()) { lock(); return; } if (playing() && e.button === 0) { W.trigger = true; W.fired = false; } });
addEventListener('mouseup', e => { if (e.button === 0) W.trigger = false; });
canvas.addEventListener('wheel', e => { if (playing()) swap(); }, { passive: true });
canvas.addEventListener('contextmenu', e => e.preventDefault());
if (TOUCH) {
  $('touch').classList.remove('hidden');
  const stick = $('stick'), knob = $('knob'); let sid = null;
  const sm = t => { const r = stick.getBoundingClientRect(); let dx = t.clientX - r.left - 60, dy = t.clientY - r.top - 60; const m = Math.hypot(dx, dy); if (m > 45) { dx *= 45 / m; dy *= 45 / m; } joy.x = dx / 45; joy.y = dy / 45; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  stick.addEventListener('touchstart', e => { e.preventDefault(); sid = e.changedTouches[0].identifier; sm(e.changedTouches[0]); }, { passive: false });
  stick.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === sid) sm(t); }, { passive: false });
  const se = e => { for (const t of e.changedTouches) if (t.identifier === sid) { sid = null; joy.x = joy.y = 0; knob.style.transform = ''; } };
  stick.addEventListener('touchend', se); stick.addEventListener('touchcancel', se);
  const lookT = {}; // drag anywhere on the canvas (or on the fire button) to aim
  const ls = e => { e.preventDefault(); for (const t of e.changedTouches) lookT[t.identifier] = { x: t.clientX, y: t.clientY }; };
  const lm = e => { e.preventDefault(); for (const t of e.changedTouches) { const p = lookT[t.identifier]; if (p) { if (playing()) look(t.clientX - p.x, t.clientY - p.y, 0.006); p.x = t.clientX; p.y = t.clientY; } } };
  const le = e => { for (const t of e.changedTouches) delete lookT[t.identifier]; };
  [canvas, $('tFire')].forEach(el => { el.addEventListener('touchstart', ls, { passive: false }); el.addEventListener('touchmove', lm, { passive: false }); el.addEventListener('touchend', le); el.addEventListener('touchcancel', le); });
  const hold = (id, dn, up) => { const el = $(id); el.addEventListener('touchstart', e => { e.preventDefault(); au(); dn(); }, { passive: false }); const u = () => up && up(); el.addEventListener('touchend', u); el.addEventListener('touchcancel', u); };
  hold('tFire', () => { W.trigger = true; W.fired = false; }, () => { W.trigger = false; });
  hold('tUse', () => { keys.KeyF = true; }, () => { keys.KeyF = false; });
  hold('tE', () => playing() && useE()); hold('tX', () => playing() && useX()); hold('tR', () => playing() && reload()); hold('tS', () => playing() && swap());
}

/* ───────── weapons ───────── */
const W = { cur: 'pitot', ammo: {}, reloadT: 0, cd: 0, heat: 0, trigger: false, fired: false, kick: 0, flash: 0 };
const wpn = () => WEAPONS[W.cur];
const vm = new THREE.Group(); camera.add(vm);
const vmMat = lam(0x232b3a), vmAcc = lam(0xffb020);
const muzzle = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ color: 0xffd58a, transparent: true, opacity: 0, depthTest: false, fog: false }));
function buildVM() {
  while (vm.children.length) vm.remove(vm.children[0]);
  const L = { pitot: 0.34, rotor: 0.5, mach: 0.72, boom: 0.66, glide: 0.9 }[W.cur], g = new THREE.Group();
  box(0.085, 0.11, L, vmMat, 0, 0, -L / 2, g); box(0.05, 0.05, L * 0.55, vmAcc, 0, 0.02, -L - L * 0.2, g); box(0.07, 0.2, 0.09, vmMat, 0, -0.14, -0.06, g);
  if (W.cur !== 'pitot') { box(0.06, 0.18, 0.08, vmMat, 0, -0.13, -L * 0.55, g); box(0.075, 0.09, 0.26, vmMat, 0, -0.02, 0.14, g); }
  if (W.cur === 'glide') box(0.06, 0.07, 0.24, vmAcc, 0, 0.1, -L * 0.4, g);
  if (W.cur === 'boom') box(0.1, 0.07, 0.3, vmAcc, 0, -0.06, -L * 0.8, g);
  box(0.02, 0.014, L * 0.7, vmAcc, 0, 0.062, -L * 0.45, g);
  muzzle.position.set(0, 0.02, -L * 1.5 - 0.05); g.add(muzzle); g.scale.setScalar(0.62); g.position.set(0.2, -0.2, -0.42); vm.add(g); vm.userData.g = g; vm.userData.L = L;
}
function fillAmmo() { for (const k in WEAPONS) W.ammo[k] = WEAPONS[k].mag; W.reloadT = 0; W.cd = 0; W.heat = 0; }
function switchTo(id) { if (id === W.cur || (id !== 'pitot' && id !== M.primary)) return; W.cur = id; W.reloadT = 0; W.cd = 0.35; W.kick = 0.5; buildVM(); sfx.click(); hudGun(); }
function swap() { if (!M.primary) return; switchTo(W.cur === 'pitot' ? M.primary : 'pitot'); }
function reload() { if (W.reloadT > 0 || W.ammo[W.cur] >= wpn().mag) return; W.reloadT = wpn().reload; sfx.reload(); }
const ray = new THREE.Raycaster(); ray.far = 260;
let hitTargets = [];
const tracers = [];
function tracer(a, b, color) {
  let t = tracers.find(t => t.life <= 0);
  if (!t) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)); t = { line: new THREE.Line(g, new THREE.LineBasicMaterial({ transparent: true, fog: false })), life: 0 }; t.line.frustumCulled = false; scene.add(t.line); tracers.push(t); }
  const p = t.line.geometry.attributes.position; p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true; t.line.material.color.set(color); t.line.material.opacity = 0.9; t.line.visible = true; t.life = 0.07;
}
const sparks = [];
function spark(p, color) {
  let s = sparks.find(s => s.life <= 0);
  if (!s) { s = { m: new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), new THREE.MeshBasicMaterial({ transparent: true, fog: false })), life: 0 }; scene.add(s.m); sparks.push(s); }
  s.m.position.copy(p); s.m.material.color.set(color); s.m.material.opacity = 1; s.m.visible = true; s.m.scale.setScalar(1); s.life = 0.14;
}
const _f = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3(), _d = new THREE.Vector3(), _o = new THREE.Vector3();
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
function fire() {
  const w = wpn();
  if (W.reloadT > 0 || W.cd > 0) return; if (W.ammo[W.cur] <= 0) { reload(); return; } if (!w.auto && W.fired) return;
  W.fired = true; W.ammo[W.cur]--; W.cd = 60 / w.rpm; W.kick = 1; W.flash = 0.05; sfx.shot(w); M.shots++;
  camera.getWorldDirection(_f); _r.crossVectors(_f, camera.up).normalize(); _u.crossVectors(_r, _f);
  const spread = w.spread * (1 + W.heat * 2.4) * (P.moving ? 1.9 : 1);
  _o.copy(camera.position).addScaledVector(_r, 0.2).addScaledVector(_u, -0.16).addScaledVector(_f, 0.9);
  let any = false, headed = false, killed = false;
  for (let i = 0; i < (w.pellets || 1); i++) {
    _d.copy(_f).addScaledVector(_r, gauss() * spread).addScaledVector(_u, gauss() * spread).normalize();
    if (TOUCH) aimAssist(_d);
    ray.set(camera.position, _d); const h = ray.intersectObjects(hitTargets, false)[0];
    const end = h ? h.point : _d.clone().multiplyScalar(200).add(camera.position); tracer(_o, end, 0xffe2a0);
    if (h && h.object.userData.e) { const e = h.object.userData.e, hd = h.object.userData.head; any = true; headed = headed || hd; spark(h.point, 0xff5d73); if (hurtEnemy(e, w.dmg * (hd ? w.head : 1))) killed = true; }
    else if (h) spark(h.point, 0xffe2a0);
  }
  if (any) { M.hits++; hitmark(killed); headed ? sfx.head() : sfx.hit(); }
  P.pitch = clamp(P.pitch + w.kick * (0.55 + W.heat * 0.6), -1.45, 1.45); P.yaw += gauss() * w.kick * 0.35 * W.heat; W.heat = Math.min(1, W.heat + (w.auto ? 0.16 : 0.3));
  alertEnemies(46); hudGun();
}
function aimAssist(d) { let best = null, bd = 0.07; enemies.forEach(e => { if (e.dead) return; _u.set(e.x - camera.position.x, 1.5 - camera.position.y, e.z - camera.position.z).normalize(); const a = Math.acos(clamp(_u.dot(d), -1, 1)); if (a < bd && los(P.x, P.z, e.x, e.z)) { bd = a; best = _u.clone(); } }); if (best) d.lerp(best, 0.85).normalize(); _u.crossVectors(_r, _f); }

/* ───────── enemies ───────── */
const enemies = [];
const eMat = { body: lam(0x2b3242), dark: lam(0x171c27), heavy: lam(0x5a3a2a) };
const CALLSIGNS = ['NO-AOC', 'EXPIRED C of A', 'UNREGISTERED', 'NOISY-9', 'ROGUE OPS', 'NO-PERMIT', 'BAD LOGBOOK', 'OVERDUE CHECK', 'FAKE CRS', 'UNWEIGHED', 'DODGY DEALER', 'LAPSED C of F'];
function makeEnemy(x, z, heavy, hunt) {
  const g = new THREE.Group(), s = heavy ? 1.18 : 1, glow = new THREE.MeshBasicMaterial({ color: heavy ? 0xff9a2e : 0xff3b55 });
  const parts = [];
  const torso = box(1.0, 1.05, 0.6, heavy ? eMat.heavy : eMat.body, 0, 1.45, 0, g), head = box(0.5, 0.5, 0.5, eMat.dark, 0, 2.3, 0, g);
  const legL = box(0.36, 0.95, 0.4, eMat.dark, -0.27, 0.475, 0, g), legR = box(0.36, 0.95, 0.4, eMat.dark, 0.27, 0.475, 0, g);
  box(0.42, 0.12, 0.06, glow, 0, 2.33, 0.26, g); box(0.3, 0.3, 0.06, glow, 0, 1.6, 0.31, g);
  box(0.24, 0.8, 0.3, eMat.dark, -0.64, 1.5, 0.1, g); const gun = box(0.2, 0.24, 1.0, eMat.dark, 0.62, 1.5, 0.45, g); box(0.24, 0.8, 0.3, eMat.dark, 0.64, 1.5, 0, g);
  const bar = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff3b55, depthTest: false, fog: false })); bar.scale.set(1.3, 0.1, 1); bar.position.y = 2.95; bar.visible = false; g.add(bar);
  const mark = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff3b55, depthTest: false, fog: false, transparent: true, opacity: 0.9, rotation: Math.PI / 4 })); mark.scale.set(0.6, 0.6, 1); mark.position.y = 1.5; mark.visible = false; mark.renderOrder = 9; g.add(mark);
  g.scale.setScalar(s); g.position.set(x, 0, z); scene.add(g);
  const e = { g, x, z, hp: heavy ? 170 : 100, max: heavy ? 170 : 100, heavy, state: hunt ? 'hunt' : 'guard', home: { x, z }, tgt: null, wait: rnd(0, 2), seeT: 0, react: rnd(0.45, 0.8), burst: 0, fireCd: rnd(0.3, 1), strafe: Math.random() < 0.5 ? 1 : -1, strafeT: 0, stunT: 0, dead: false, deadT: 0, bar, mark, legL, legR, gun, walk: rnd(0, 6), name: CALLSIGNS[Math.random() * CALLSIGNS.length | 0], flashT: 0, torso };
  [torso, legL, legR].forEach(m => { m.userData = { e, head: false }; parts.push(m); }); head.userData = { e, head: true }; parts.push(head);
  e.parts = parts; enemies.push(e); return e;
}
function clearEnemies() { enemies.forEach(e => scene.remove(e.g)); enemies.length = 0; }
function rebuildTargets() { hitTargets = wallMeshes.slice(); enemies.forEach(e => { if (!e.dead) hitTargets.push(...e.parts); }); }
function alertEnemies(radius) { enemies.forEach(e => { if (!e.dead && e.state === 'guard' && Math.hypot(e.x - P.x, e.z - P.z) < radius) e.state = 'hunt'; }); }
function hurtEnemy(e, dmg) {
  if (e.dead) return false; e.hp -= dmg; e.state = 'hunt'; e.flashT = 0.08; e.bar.visible = true; e.bar.scale.x = 1.3 * Math.max(0, e.hp / e.max);
  if (e.hp > 0) return false;
  e.dead = true; e.deadT = 0.6; e.bar.visible = false; e.mark.visible = false; rebuildTargets();
  M.kills++; RD.kills++; addCredits(150); M.ult = Math.min(ULT_MAX, M.ult + 1); feed(`<b>${esc(save.name || 'You')}</b> grounded <b style="color:#ff5d73">${e.name}</b> +150`); sfx.kill(); hudAbil();
  const left = enemies.filter(x => !x.dead).length; $('sE').textContent = left; if (left === 0 && !RD.over) banner('AREA SECURE', 'Now certify the correct site');
  return true;
}
function spawnFar(n, heavy) {
  const c = shuffle(FREE.filter(f => Math.hypot(f.x - P.x, f.z - P.z) > 30 && !los(P.x, P.z, f.x, f.z) && !SITES.some(s => Math.hypot(f.x - s.x, f.z - s.z) < 6)));
  for (let i = 0; i < n && i < c.length; i++) makeEnemy(c[i].x, c[i].z, heavy && i === 0, true);
  rebuildTargets(); $('sE').textContent = enemies.filter(x => !x.dead).length;
}
function damagePlayer(d, lethal = true) {
  if (!P.alive || RD.over) return; d *= (now < P.resistT ? 0.5 : 1);
  if (P.armor > 0) { const a = Math.min(P.armor, d * 0.6); P.armor -= a; d -= a; }
  P.hp -= d; if (!lethal) P.hp = Math.max(1, P.hp); $('dmg').style.transition = 'none'; $('dmg').style.opacity = 0.65; requestAnimationFrame(() => { $('dmg').style.transition = 'opacity .6s'; $('dmg').style.opacity = 0; }); sfx.hurt(); hudVit();
  if (P.hp <= 0) { P.hp = 0; P.alive = false; hudVit(); endRound(false, 'You were taken out'); }
}
function updateEnemies(dt) {
  const D = DIFF[save.diff], frozen = now < FX.freezeT, reveal = now < FX.revealT;
  enemies.forEach(e => {
    if (e.dead) { if (e.deadT > 0) { e.deadT -= dt; e.g.rotation.x = -(1 - e.deadT / 0.6) * 1.5; e.g.position.y = -(1 - e.deadT / 0.6) * 0.5; if (e.deadT <= 0) e.g.visible = false; } return; }
    if (e.flashT > 0) { e.flashT -= dt; e.g.scale.setScalar((e.heavy ? 1.18 : 1) * (e.flashT > 0 ? 1.06 : 1)); }
    const dx = P.x - e.x, dz = P.z - e.z, dist = Math.hypot(dx, dz), see = dist < 70 && los(e.x, e.z, P.x, P.z);
    e.mark.visible = reveal && !see;
    if (frozen || now < e.stunT) { e.seeT = 0; return; }
    if (see) { e.seeT += dt; if (e.state === 'guard' && e.seeT > 0.25) e.state = 'hunt'; } else e.seeT = Math.max(0, e.seeT - dt * 2);
    let mx = 0, mz = 0, sp = 0;
    if (e.state === 'guard') {
      e.wait -= dt; if (!e.tgt && e.wait <= 0) { const a = rnd(0, 6.283), d = rnd(1.5, 5); e.tgt = { x: e.home.x + Math.cos(a) * d, z: e.home.z + Math.sin(a) * d }; }
      if (e.tgt) { const tx = e.tgt.x - e.x, tz = e.tgt.z - e.z, td = Math.hypot(tx, tz); if (td < 0.4) { e.tgt = null; e.wait = rnd(1, 3.5); } else { mx = tx / td; mz = tz / td; sp = 2.2; } }
      if (sp) e.g.rotation.y = Math.atan2(mx, mz);
    } else {
      if (see && dist < 30) { e.strafeT -= dt; if (e.strafeT <= 0) { e.strafeT = rnd(0.7, 1.8); e.strafe = -e.strafe; } const adv = dist > 14 ? 0.55 : dist < 7 ? -0.5 : 0; mx = (-dz / dist) * e.strafe + (dx / dist) * adv; mz = (dx / dist) * e.strafe + (dz / dist) * adv; sp = 3.2; }
      else {
        const c = col(e.x), r = row(e.z); let best = flow[r * GW + c], bx = 0, bz = 0; if (best < 0) best = 9999;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const v = flow[(r + b) * GW + c + a]; if (v >= 0 && v < best) { best = v; bx = cx(c + a); bz = cz(r + b); } });
        if (best < 9999 && (bx || bz || best === 0)) { const tx = (best === 0 && !bx ? P.x : bx) - e.x, tz = (best === 0 && !bz ? P.z : bz) - e.z, td = Math.hypot(tx, tz) || 1;
          // steer through the middle of the current cell first so corners are not clipped
          const ox = cx(c) - e.x, oz = cz(r) - e.z; mx = tx / td + (Math.abs(tx) < Math.abs(tz) ? ox * 0.6 : 0); mz = tz / td + (Math.abs(tz) < Math.abs(tx) ? oz * 0.6 : 0); sp = e.heavy ? 4.2 : 5.2; }
      }
      e.g.rotation.y = see ? Math.atan2(dx, dz) : (sp ? Math.atan2(mx, mz) : e.g.rotation.y);
      // shooting
      e.fireCd -= dt;
      if (see && e.seeT > e.react && e.fireCd <= 0) {
        if (e.burst <= 0) e.burst = e.heavy ? 5 : 3 + (Math.random() * 2 | 0);
        e.burst--; e.fireCd = e.burst > 0 ? 0.13 : rnd(0.7, 1.4);
        const p = clamp(0.52 - dist * 0.008, 0.12, 0.5) * (P.moving ? 0.72 : 1) * D.acc, hit = Math.random() < p;
        const from = new THREE.Vector3(e.x + Math.sin(e.g.rotation.y) * 0.9, 1.5, e.z + Math.cos(e.g.rotation.y) * 0.9);
        const to = new THREE.Vector3(P.x + (hit ? 0 : rnd(-1.4, 1.4)), 1.35 + (hit ? 0 : rnd(-0.3, 0.9)), P.z + (hit ? 0 : rnd(-1.4, 1.4)));
        if (!hit) to.sub(from).multiplyScalar(1.6).add(from); tracer(from, to, 0xff5d73); sfx.eshot(); if (hit) damagePlayer(rnd(7, 10) * D.dmg * (e.heavy ? 1.25 : 1));
      }
    }
    if (sp) {
      const m = Math.hypot(mx, mz) || 1; moveBody(e, mx / m * sp * dt, mz / m * sp * dt, 0.62); e.walk += dt * sp * 2.2;
      e.legL.rotation.x = Math.sin(e.walk) * 0.6; e.legR.rotation.x = -Math.sin(e.walk) * 0.6;
    }
    enemies.forEach(o => { if (o !== e && !o.dead) { const ax = e.x - o.x, az = e.z - o.z, d = Math.hypot(ax, az); if (d < 1.5 && d > 0.001) moveBody(e, ax / d * dt * 2.5, az / d * dt * 2.5, 0.62); } });
    e.g.position.set(e.x, 0, e.z);
  });
}

/* ───────── abilities ───────── */
const FX = { freezeT: 0, revealT: 0 };
function useE() {
  if (RD.over || M.eLeft <= 0) { sfx.deny(); return; } const a = agent();
  if (a.id === 'torque') { if (P.hp >= 100) { sfx.deny(); return; } P.hp = Math.min(100, P.hp + 50); hudVit(); }
  else if (a.id === 'squawk') FX.revealT = now + 7;
  else if (a.id === 'mach') P.boostT = now + 3.5;
  else if (a.id === 'audit') { const w = SITES.filter(s => !s.correct && !s.struck); if (w.length < 2) { sfx.deny(); banner('NOTHING TO STRIKE', 'Only one wrong site remains'); return; } const s = w[Math.random() * w.length | 0]; s.struck = true; drawBoard(s); hudQ(); }
  M.eLeft--; sfx.abil(); banner(a.e.name.toUpperCase(), a.name); hudAbil();
}
function useX() {
  if (RD.over || M.ult < ULT_MAX) { sfx.deny(); return; } const a = agent();
  if (a.id === 'torque') { P.hp = 100; P.armor = Math.max(P.armor, 50); P.resistT = now + 8; hudVit(); }
  else if (a.id === 'squawk') FX.freezeT = now + 5;
  else if (a.id === 'mach') enemies.slice().forEach(e => { if (!e.dead && Math.hypot(e.x - P.x, e.z - P.z) < 16) { e.stunT = now + 2.5; hurtEnemy(e, 70); } });
  else if (a.id === 'audit') { FX.revealT = now + 8; enemies.slice().forEach(e => hurtEnemy(e, 45)); }
  M.ult = 0; sfx.abil(); noise(0.5, 0.2, 500); banner(a.x.name.toUpperCase(), 'ULTIMATE'); hudAbil();
}

/* ───────── HUD ───────── */
function banner(big, small, ms = 1800) { const b = $('banner'); b.firstElementChild.textContent = big; b.lastElementChild.textContent = small || ''; b.style.opacity = 1; clearTimeout(banner.t); banner.t = setTimeout(() => { b.style.opacity = 0; }, ms); }
function feed(html) { const f = $('feed'), d = document.createElement('div'); d.innerHTML = html; f.prepend(d); setTimeout(() => d.remove(), 4500); }
function hitmark(k) { const h = $('hitm'); h.classList.toggle('k', !!k); h.style.transition = 'none'; h.style.opacity = 1; requestAnimationFrame(() => { h.style.transition = 'opacity .25s'; h.style.opacity = 0; }); }
function hudVit() { $('hp').textContent = Math.ceil(P.hp); $('hp').classList.toggle('low', P.hp <= 30); $('arm').textContent = Math.ceil(P.armor); $('cred').textContent = M.credits; }
function hudGun() { const w = wpn(); $('wname').textContent = `${w.name} · ${w.type.toUpperCase()}`; $('ammo').innerHTML = (W.reloadT > 0 ? '··' : W.ammo[W.cur]) + `<small>/${w.mag}</small>`; }
function hudAbil() { const a = agent(), pips = '◆'.repeat(M.ult) + '◇'.repeat(ULT_MAX - M.ult);
  $('abil').innerHTML = `<div class="ab ${M.eLeft > 0 ? 'rdy' : ''}"><b>${TOUCH ? '' : '[E] '}${a.e.name}</b>${M.eLeft > 0 ? '×' + M.eLeft + ' ready' : 'used'}</div><div class="ab ${M.ult >= ULT_MAX ? 'rdy' : ''}"><b>${TOUCH ? '' : '[X] '}${a.x.name}</b><span class="pips">${pips}</span></div>`; }
function hudQ() { $('qtext').textContent = RD.q.q; $('qopts').innerHTML = SITES.map(s => `<div class="qo ${s.struck ? 'x' : ''}" style="--sc:${s.color}"><i>${s.letter}</i>${esc(s.text)}</div>`).join(''); }
function hudTop() { $('sW').textContent = M.won; $('sL').textContent = M.lost; $('rlab').textContent = `ROUND ${M.i + 1}/${M.n}`; }
function addCredits(n) { M.credits += n; $('cred').textContent = M.credits; }
const mini = $('mini'), mx = mini.getContext('2d');
function drawMini() {
  const w = mini.width, h = mini.height, s = Math.min(w / GW, h / GH), ox = (w - GW * s) / 2, oy = (h - GH * s) / 2; mx.clearRect(0, 0, w, h);
  for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) { const k = MAP[r][c]; if (k === '#' || k === 'T' || k === 'c') { mx.fillStyle = k === '#' ? '#5d6b84' : '#3d4a63'; mx.fillRect(ox + c * s, oy + r * s, s + 0.5, s + 0.5); } }
  const X = x => ox + (x / CS + GW / 2) * s, Z = z => oy + (z / CS + GH / 2) * s;
  mx.font = `900 ${s * 1.7}px Arial`; mx.textAlign = 'center'; mx.textBaseline = 'middle';
  SITES.forEach(t => { mx.globalAlpha = t.struck ? 0.3 : 1; mx.fillStyle = t.color; mx.fillText(t.letter, X(t.x), Z(t.z)); }); mx.globalAlpha = 1;
  const rev = now < FX.revealT; mx.fillStyle = '#ff3b55';
  enemies.forEach(e => { if (!e.dead && (rev || (Math.hypot(e.x - P.x, e.z - P.z) < 70 && los(e.x, e.z, P.x, P.z)))) { mx.beginPath(); mx.arc(X(e.x), Z(e.z), s * 0.42, 0, 6.283); mx.fill(); } });
  mx.save(); mx.translate(X(P.x), Z(P.z)); mx.rotate(-P.yaw); mx.fillStyle = '#fff'; mx.beginPath(); mx.moveTo(0, -s * 0.9); mx.lineTo(s * 0.55, s * 0.6); mx.lineTo(-s * 0.55, s * 0.6); mx.fill(); mx.restore();
}

/* ───────── match / rounds ───────── */
let M = { credits: 0, ult: 0, eLeft: 0, primary: null, kills: 0, shots: 0, hits: 0, won: 0, lost: 0, i: 0, n: ROUNDS };
let RD = { over: true, kills: 0, q: { q: '' } };
function pickRounds(m) {
  if (m.id !== 'ride') return { qs: shuffle(m.rounds).slice(0, ROUNDS), recon: shuffle(m.recon).slice(0, ROUNDS) };
  const qs = [], rc = []; MISSIONS.forEach(x => { shuffle(x.rounds).slice(0, 2).forEach(q => qs.push(Object.assign({ from: x.short }, q))); shuffle(x.recon).slice(0, 2).forEach(q => rc.push(q)); });
  return { qs: shuffle(qs), recon: shuffle(rc) };
}
function startMatch(m) {
  const p = pickRounds(m);
  M = { m, qs: p.qs, recon: p.recon, n: p.qs.length, need: m.id === 'ride' ? RIDE_NEED : NEED, i: 0, won: 0, lost: 0, kills: 0, shots: 0, hits: 0, first: 0, reconOk: 0, missed: [], credits: 800, primary: null, armorBuy: 0, ult: 0, eLeft: 1, eExtra: 0 };
  P.armor = 0; W.cur = 'pitot'; buildVM(); document.documentElement.style.setProperty('--mc', m.color); buyPhase();
}
function setupRound() {
  const q = M.qs[M.i], opts = shuffle([{ t: q.a, ok: true }, ...q.wrong.map(t => ({ t, ok: false }))]);
  SITES.forEach((s, i) => { s.text = opts[i].t; s.correct = opts[i].ok; s.struck = false; drawBoard(s); });
  RD = { q, time: ROUND_TIME, strikes: 0, plant: 0, over: false, kills: 0, site: null, beep: 0 };
  P.x = spawn.x; P.z = spawn.z; P.yaw = 0; P.pitch = 0; P.hp = 100; P.alive = true; P.resistT = 0; P.boostT = 0; FX.freezeT = 0; FX.revealT = 0; flowCell = -1;
  M.eLeft = 1 + M.eExtra; M.eExtra = 0; fillAmmo(); W.cur = M.primary || 'pitot'; buildVM();
  clearEnemies();
  const g = shuffle(GUARDS), n = Math.min(GUARDS.length + 3, 4 + Math.floor(M.i / 2) + (M.m.id === 'ride' ? 1 : 0) + (save.diff === 2 ? 1 : 0));
  // one guard near every site first, then fill the remaining guard posts, then roamers
  const posts = []; SITES.forEach(s => { const k = g.findIndex(p => Math.hypot(p.x - s.x, p.z - s.z) < 14 && !posts.includes(p)); if (k >= 0) posts.push(g[k]); }); g.forEach(p => { if (!posts.includes(p)) posts.push(p); });
  for (let i = 0; i < n; i++) { if (i < posts.length) makeEnemy(posts[i].x, posts[i].z, M.i >= 3 && i === 0, false); else { const f = shuffle(FREE.filter(f => f.r >= 6 && f.r <= 8 && Math.abs(f.x - P.x) > 8))[0]; makeEnemy(f.x, f.z, false, false); } }
  rebuildTargets();
  $('sE').textContent = enemies.length; $('feed').innerHTML = ''; hudTop(); hudQ(); hudVit(); hudGun(); hudAbil(); $('prompt').classList.add('hidden');
}
function beginRound() {
  setupRound(); state = 'play'; paused = false; hideUI(); $('hud').classList.remove('hidden'); lock(); au(); sfx.start();
  banner(`ROUND ${M.i + 1}`, 'Find the correct site · hold ' + (TOUCH ? 'CERT' : 'F') + ' to certify', 2600);
}
function updateCertify(dt) {
  const s = SITES.find(s => !s.struck && Math.hypot(P.x - s.x, P.z - s.z) < 5.2), pr = $('prompt');
  if (!s) { RD.plant = 0; pr.classList.add('hidden'); return; }
  pr.classList.remove('hidden');
  if (keys.KeyF) {
    if (RD.plant === 0) alertEnemies(999);
    RD.plant += dt / 2.4; RD.beep -= dt; if (RD.beep <= 0) { RD.beep = 0.22; sfx.tick(RD.plant); }
    $('ptext').innerHTML = `Certifying <b style="color:${s.color}">SITE ${s.letter}</b>…`;
    if (RD.plant >= 1) { RD.plant = 0; certify(s); }
  } else { RD.plant = Math.max(0, RD.plant - dt * 2); $('ptext').innerHTML = `Hold <b style="color:var(--amber)">${TOUCH ? 'CERT' : '[F]'}</b> to certify <b style="color:${s.color}">SITE ${s.letter}</b>`; }
  $('pfill').style.width = (RD.plant * 100) + '%';
}
function certify(s) {
  if (s.correct) { endRound(true, RD.strikes ? 'Certified – after one wrong site' : 'Certified on the first attempt'); return; }
  s.struck = true; drawBoard(s); hudQ(); RD.strikes++; sfx.wrong();
  if (RD.strikes >= 2) { endRound(false, 'Two wrong certifications'); return; }
  banner('WRONG SITE', 'Reinforcements inbound · one more mistake fails the round', 2600); damagePlayer(25, false); spawnFar(2, M.i >= 2);
}
function endRound(win, reason) {
  if (RD.over) return; RD.over = true; W.trigger = false; keys.KeyF = false; const first = win && RD.strikes === 0;
  let gain = win ? 1000 + (first ? 500 : 0) : 600; M.credits += gain;
  if (win) { M.won++; if (first) M.first++; M.ult = Math.min(ULT_MAX, M.ult + 2); sfx.win(); } else { M.lost++; M.missed.push(RD.q); sfx.lose(); }
  if (!win || RD.strikes) { if (!M.missed.includes(RD.q)) M.missed.push(RD.q); }
  hudTop(); banner(win ? 'CERTIFIED' : 'ROUND FAILED', reason, 1500);
  setTimeout(() => {
    if (state !== 'play') return; state = 'roundend'; unlock(); $('pause').classList.add('hidden'); paused = false; $('prompt').classList.add('hidden');
    const last = M.i + 1 >= M.n, q = RD.q, ok = SITES.find(s => s.correct);
    showUI(`<div class="box cut" style="max-width:760px;margin:auto">
      <div class="eyebrow">${esc(M.m.name)} · Round ${M.i + 1} of ${M.n}</div>
      <div class="res ${win ? 'win' : 'lose'}">${win ? 'Certified' : 'Round failed'}</div>
      <div class="muted">${esc(reason)} · +${gain} credits${RD.kills ? ` · ${RD.kills} hostile${RD.kills > 1 ? 's' : ''} grounded` : ''}</div>
      <div style="margin-top:16px;font-size:17px;font-weight:700">${esc(q.q)}</div>
      <div class="ans">✔ ${esc(q.a)} <span class="muted" style="font-weight:400;font-size:13px">– Site ${ok.letter}</span></div>
      <div class="why">${esc(q.why)} <span class="muted">(${esc(q.s)})</span></div>
      <div class="row sp" style="margin-top:20px"><div class="muted">Cleared <b>${M.won}</b> · Failed <b>${M.lost}</b> · need ${M.need} to pass</div>
      <button class="btn big" id="nx">${last ? 'Debrief' : 'Next round'} ▸</button></div></div>`, true);
    $('nx').onclick = () => { sfx.click(); M.i++; last ? matchEnd() : buyPhase(); };
  }, 1300);
}

/* ───────── UI screens ───────── */
const ui = $('ui'), panel = $('panel');
function showUI(html, overGame) { panel.innerHTML = html; ui.classList.remove('hidden'); ui.classList.toggle('play', !!overGame); ui.scrollTop = 0; }
function hideUI() { ui.classList.add('hidden'); }
const stars = b => b ? '★'.repeat(b.stars) + '☆'.repeat(3 - b.stars) : '☆☆☆';
function lobby() {
  state = 'lobby'; unlock(); $('hud').classList.add('hidden'); document.documentElement.style.setProperty('--mc', '#ffb020');
  const a = agent(), rideOpen = allCleared();
  showUI(`<div class="row sp" style="align-items:flex-end"><div><div class="eyebrow">ME2804 Air Legislation · Tactical air-law shooter</div><div class="logo">9V <span>CLEARANCE</span></div></div>
    <a class="btn ghost" href="../index.html" style="text-decoration:none">◂ All games</a></div>
  <div class="muted" style="margin-top:8px;font-size:15.5px;max-width:760px">Rogue operators have taken over the apron. Each round asks one air-law question – the three answers are projected on sites <b style="color:${SITE_COL[0]}">A</b>, <b style="color:${SITE_COL[1]}">B</b> and <b style="color:${SITE_COL[2]}">C</b>. Fight your way to the <b>correct</b> site and certify it.</div>
  <div class="lobby">
    <div class="grid">
      <div class="eyebrow">Select operation</div>
      ${MISSIONS.map(m => { const b = save.best[m.id]; return `<button class="mcard" data-m="${m.id}" style="--mc:${m.color}"><div class="code">${m.code}</div><div><div class="nm">${esc(m.name)}</div><div class="tg">${esc(m.tagline)}</div></div><div class="st">${stars(b)}<small>${b ? `best ${b.won}/${b.n}${b.clear ? ' · cleared' : ''}` : 'not played'}</small></div></button>`; }).join('')}
      <button class="mcard" data-m="ride" style="--mc:#fff" ${rideOpen ? '' : 'disabled'}><div class="code">FINAL</div><div><div class="nm">Check Ride</div><div class="tg">${rideOpen ? esc(RIDE.tagline) : '🔒 Clear all four operations to unlock the mixed final.'}</div></div><div class="st">${save.ride ? '🎖' : ''}<small>${save.ride ? `best ${save.ride}/${RIDE_ROUNDS}` : ''}</small></div></button>
    </div>
    <div class="grid" style="align-content:start">
      <div class="box cut">
        <div class="eyebrow">Callsign</div>
        <input type="text" id="nm" maxlength="16" placeholder="Enter your name" value="${esc(save.name)}" autocomplete="off" style="margin:6px 0 14px">
        <div class="eyebrow">Specialist</div>
        <div class="agents" style="margin-top:6px">${AGENTS.map(x => `<button class="agent ${x.id === a.id ? 'on' : ''}" data-a="${x.id}" style="--ac:${x.color}"><div class="ic">${x.icon}</div><div class="n">${x.name}</div></button>`).join('')}</div>
        <div class="adesc"><b style="color:${a.color}">${a.name}</b> · ${a.role}<br><kbd>E</kbd> <b>${a.e.name}</b> – ${a.e.desc} <span class="muted">(once per round)</span><br><kbd>X</kbd> <b>${a.x.name}</b> – ${a.x.desc} <span class="muted">(charge with takedowns &amp; correct sites)</span></div>
        <div class="row sp" style="margin-top:10px"><div><div class="eyebrow" style="margin-bottom:4px">Difficulty</div><div class="seg">${DIFF.map((d, i) => `<button data-d="${i}" class="${i === save.diff ? 'on' : ''}">${d.n}</button>`).join('')}</div></div>
        <div><div class="eyebrow" style="margin-bottom:4px">Mouse sensitivity</div><input type="range" id="sens" min="0.3" max="2.5" step="0.1" value="${save.sens}"></div></div>
      </div>
      <div class="box cut keys">${TOUCH ? 'Left stick: move · drag the screen: aim · FIRE · hold CERT on a site to certify' : '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Shift</kbd> walk (steadier aim) · <kbd>Mouse</kbd> aim / fire<br><kbd>R</kbd> reload · <kbd>Q</kbd> / <kbd>1</kbd> <kbd>2</kbd> swap weapon · hold <kbd>F</kbd> on a site to certify<br><kbd>E</kbd> ability · <kbd>X</kbd> ultimate · <kbd>Esc</kbd> pause'}<br><span style="color:var(--ink)">Each operation: ${ROUNDS} rounds · clear ${NEED} to pass · two wrong certifications fail a round.</span></div>
    </div>
  </div>`);
  $('nm').oninput = e => { save.name = e.target.value.trim(); persist(); };
  $('sens').oninput = e => { save.sens = +e.target.value; persist(); };
  panel.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { save.agent = b.dataset.a; persist(); au(); sfx.click(); lobby(); });
  panel.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { save.diff = +b.dataset.d; persist(); au(); sfx.click(); lobby(); });
  panel.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { au(); sfx.click(); const m = b.dataset.m === 'ride' ? RIDE : MISSIONS.find(m => m.id === b.dataset.m); m.id === 'ride' ? startMatch(m) : intel(m, 0, () => startMatch(m), 'Deploy'); });
}
function intel(m, i, done, doneLabel) {
  state = state === 'buy' ? 'buy' : 'intel'; document.documentElement.style.setProperty('--mc', m.color);
  const c = m.intel[i], last = i === m.intel.length - 1, seen = save.briefed[m.id];
  showUI(`<div style="max-width:820px;margin:auto"><div class="row sp"><div><div class="eyebrow">${m.code} · Intel briefing ${i + 1}/${m.intel.length}</div><h1 style="font-size:34px">${esc(m.name)}</h1></div>
    ${seen || doneLabel !== 'Deploy' ? `<button class="btn ghost" id="skip">${doneLabel === 'Deploy' ? 'Skip briefing ▸▸' : 'Close'}</button>` : ''}</div>
    <div class="box cut intel" style="margin-top:14px"><span class="src">${esc(c.s)}</span><h2>${c.h}</h2>${c.b}</div>
    <div class="row sp" style="margin-top:14px"><button class="btn ghost" id="pv" ${i ? '' : 'disabled'}>◂ Back</button><div class="dots">${m.intel.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
    <button class="btn" id="nx">${last ? doneLabel + ' ▸' : 'Next ▸'}</button></div>
    <div class="muted" style="margin-top:12px;font-size:13px">Everything you will be asked in this operation is in this briefing. You can reopen it during any buy phase.</div></div>`, state === 'buy');
  const fin = () => { save.briefed[m.id] = 1; persist(); done(); };
  $('pv').onclick = () => { sfx.click(); intel(m, i - 1, done, doneLabel); }; $('nx').onclick = () => { sfx.click(); last ? fin() : intel(m, i + 1, done, doneLabel); };
  if ($('skip')) $('skip').onclick = () => { sfx.click(); fin(); };
}
function buyPhase() {
  state = 'buy'; unlock(); $('hud').classList.add('hidden'); const rc = M.recon[M.i % M.recon.length]; M.rcDone = M.rcDone === M.i ? M.i : -1;
  const render = fb => {
    const own = id => M.primary === id, it = (id, n, d, cost, dis, owned) => `<button class="item ${owned ? 'own' : ''}" data-buy="${id}" ${dis || owned ? 'disabled' : ''}><span class="n">${n}</span><span class="c">${owned ? 'OWNED' : cost}</span><span class="d">${d}</span></button>`;
    const a = agent(), answered = M.rcDone === M.i;
    showUI(`<div class="row sp"><div><div class="eyebrow">${M.m.code} · ${esc(M.m.name)}</div><h1 style="font-size:34px">Round ${M.i + 1}/${M.n} · Buy phase</h1></div>
      <div style="text-align:right"><div class="eyebrow">Credits</div><div class="cred">${M.credits}</div></div></div>
    <div class="buy" style="margin-top:14px">
      <div class="grid" style="align-content:start">
        <div class="box cut recon"><div class="eyebrow">Recon check · +400 credits if correct</div>
          <div class="stmt">“${esc(rc.t)}”</div>
          ${answered ? `<div class="fb ${fb.ok ? 'ok' : 'bad'}"><b>${fb.ok ? '✔ Correct +400' : '✘ Not quite'}</b> – this statement is <b>${rc.ok ? 'TRUE' : 'FALSE'}</b>. ${esc(rc.why)}</div>` : `<div class="row"><button class="btn t" id="rT">True</button><button class="btn f" id="rF">False</button></div>`}
        </div>
        <div class="box cut"><div class="eyebrow">Score</div><div style="font-size:17px;margin-top:4px">Cleared <b>${M.won}</b> · Failed <b>${M.lost}</b> <span class="muted">· need ${M.need} of ${M.n}</span></div>
          <div class="muted" style="font-size:13.5px;margin-top:6px">${a.icon} ${a.name} · HP resets each round · armour ${Math.ceil(P.armor)} · ultimate ${M.ult}/${ULT_MAX}</div>
          ${M.m.intel ? '<button class="btn ghost" id="rev" style="margin-top:12px">📖 Review intel</button>' : ''}</div>
      </div>
      <div class="box cut"><div class="eyebrow">Armoury</div>
        <div class="shop" style="margin-top:8px">
          ${['rotor', 'boom', 'mach', 'glide'].map(id => { const w = WEAPONS[id]; return it(id, w.name, `${w.type} · ${w.pellets ? w.pellets + '×' : ''}${w.dmg} dmg · ${w.mag} rds${w.auto ? ' · auto' : ''}`, w.cost, M.credits < w.cost, own(id)); }).join('')}
          ${it('arm1', 'LIGHT ARMOUR', 'Set armour to 25', 400, M.credits < 400 || P.armor >= 25, false)}
          ${it('arm2', 'HEAVY ARMOUR', 'Set armour to 50', 1000, M.credits < 1000 || P.armor >= 50, false)}
          ${it('abil', a.e.name.toUpperCase(), 'One extra ability charge this round', 300, M.credits < 300 || M.eExtra >= 1, M.eExtra >= 1)}
        </div>
        <div class="muted" style="font-size:13px;margin-top:10px">Sidearm <b>PITOT</b> is free. A new primary replaces your current one.${M.primary ? ` Equipped: <b>${WEAPONS[M.primary].name}</b>.` : ''}</div>
        <div class="row sp" style="margin-top:16px"><div class="muted" style="font-size:13px">${answered ? '' : 'Answer the recon check to deploy.'}</div><button class="btn big" id="go" ${answered ? '' : 'disabled'}>Ready ▸</button></div>
      </div>
    </div>`);
    if (!answered) { const ans = v => { au(); const ok = v === rc.ok; M.rcDone = M.i; if (ok) { M.credits += 400; M.reconOk++; sfx.buy(); } else sfx.deny(); M.fb = { ok }; render(M.fb); }; $('rT').onclick = () => ans(true); $('rF').onclick = () => ans(false); }
    if ($('rev')) $('rev').onclick = () => { sfx.click(); intel(M.m, 0, () => { state = 'buy'; render(M.fb); }, 'Back to armoury'); };
    panel.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
      const id = b.dataset.buy;
      if (WEAPONS[id]) { M.credits -= WEAPONS[id].cost; M.primary = id; } else if (id === 'arm1') { M.credits -= 400; P.armor = 25; } else if (id === 'arm2') { M.credits -= 1000; P.armor = 50; } else if (id === 'abil') { M.credits -= 300; M.eExtra = 1; }
      sfx.buy(); render(M.fb);
    });
    $('go').onclick = () => { au(); beginRound(); };
  };
  render(M.fb);
}
function matchEnd() {
  state = 'matchend'; unlock(); $('hud').classList.add('hidden');
  const pass = M.won >= M.need, acc = M.shots ? Math.round(M.hits / M.shots * 100) : 0, st = !pass ? 0 : M.first >= M.n ? 3 : M.first >= M.n - 1 ? 2 : 1, ride = M.m.id === 'ride';
  if (ride) { if (M.won > save.ride) save.ride = M.won; }
  else { const b = save.best[M.m.id] || { won: 0, n: M.n, stars: 0, clear: false }; save.best[M.m.id] = { won: Math.max(b.won, M.won), n: M.n, stars: Math.max(b.stars, st), clear: b.clear || pass }; }
  persist(); pass ? sfx.win() : sfx.lose();
  const cert = ride && pass ? `<div class="cert cut" style="margin-top:14px"><div class="eyebrow">Certificate of clearance</div><div style="margin-top:6px">This certifies that</div><div class="nm">${esc(save.name || 'Operator')}</div><div>has passed the <b>9V CLEARANCE Check Ride</b> with <b>${M.won}/${M.n}</b> rounds certified<br><span class="muted">AOC · C of A &amp; Export C of A · Noise Certificate · Permit to Fly</span></div></div>` : '';
  showUI(`<div class="box cut" style="max-width:820px;margin:auto"><div class="eyebrow">${M.m.code} · ${esc(M.m.name)} · Debrief</div>
    <div class="res ${pass ? 'win' : 'lose'}">${pass ? (ride ? 'Clearance granted' : 'Operation cleared') : 'Operation failed'}</div>
    <div class="muted">${pass ? (ride ? '' : `<span style="color:var(--amber);font-size:22px;letter-spacing:3px">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span> · `) + 'Well flown.' : `You need ${M.need} of ${M.n} rounds. Review the intel and redeploy.`}</div>
    ${cert}
    <div class="stats"><div class="stat"><b>${M.won}/${M.n}</b><span>Rounds certified</span></div><div class="stat"><b>${M.first}</b><span>First-try sites</span></div><div class="stat"><b>${M.reconOk}/${M.n}</b><span>Recon checks</span></div><div class="stat"><b>${M.kills}</b><span>Grounded · ${acc}% acc</span></div></div>
    ${M.missed.length ? `<div class="eyebrow" style="margin-top:6px">Review these</div>${M.missed.map(q => `<div class="miss"><b>${esc(q.q)}</b><br>✔ ${esc(q.a)} <span class="muted">– ${esc(q.why)} (${esc(q.s)})</span></div>`).join('')}` : '<div class="fb ok">Flawless – every site certified on the first attempt.</div>'}
    <div class="row sp" style="margin-top:20px"><button class="btn ghost" id="lb">◂ Lobby</button><button class="btn big" id="rt">${pass ? 'Play again' : 'Redeploy'} ▸</button></div></div>`);
  $('lb').onclick = () => { sfx.click(); lobby(); }; $('rt').onclick = () => { sfx.click(); startMatch(M.m); };
}

/* ───────── main loop ───────── */
function update(dt) {
  now += dt; RD.time -= dt;
  const t = Math.max(0, Math.ceil(RD.time)); $('tclock').textContent = `${(t / 60) | 0}:${String(t % 60).padStart(2, '0')}`; $('timer').classList.toggle('low', t <= 20);
  if (RD.time <= 0 && !RD.over) { endRound(false, 'Out of time'); }
  // movement
  let fx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x, fz = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - joy.y;
  const m = Math.hypot(fx, fz); P.moving = m > 0.15 && !(keys.ShiftLeft || keys.ShiftRight);
  if (m > 0.05 && !RD.over) {
    if (m > 1) { fx /= m; fz /= m; }
    const sp = (keys.ShiftLeft || keys.ShiftRight ? 3.6 : 7.4) * (now < P.boostT ? 2 : 1) * (keys.KeyF && RD.plant > 0 ? 0.3 : 1), s = Math.sin(P.yaw), c = Math.cos(P.yaw);
    moveBody(P, (fx * c - fz * s) * sp * dt, (-fx * s - fz * c) * sp * dt, 0.55); P.bob += dt * sp * 1.5;
  }
  updateFlow();
  if (!RD.over) { if (W.trigger) fire(); updateCertify(dt); updateEnemies(dt); }
  W.cd = Math.max(0, W.cd - dt); W.heat = Math.max(0, W.heat - dt * (W.trigger ? 0.25 : 1.6));
  if (W.reloadT > 0) { W.reloadT -= dt; if (W.reloadT <= 0) { W.ammo[W.cur] = wpn().mag; hudGun(); } else if (!update.rl) hudGun(); update.rl = true; } else update.rl = false;
  $('cross').style.setProperty('--g', (4 + (wpn().spread * 260) * (1 + W.heat * 2.4) * (P.moving ? 1.9 : 1)).toFixed(1) + 'px');
}
function render(dt) {
  const menu = state === 'lobby' || state === 'intel' || state === 'matchend'; vm.visible = !menu;
  camera.position.set(P.x, menu ? 17 : 1.7 + (state === 'play' ? Math.sin(P.bob) * 0.035 : 0) - (P.alive ? 0 : 0.9), P.z); camera.rotation.set(menu ? -0.42 : P.pitch, P.yaw, P.alive ? 0 : 0.5);
  const g = vm.userData.g; if (g) { W.kick = Math.max(0, W.kick - dt * 9); g.position.z = -0.42 + W.kick * 0.07; g.rotation.x = W.kick * 0.09 - (W.reloadT > 0 ? 0.7 : 0); g.position.y = -0.2 + Math.sin(P.bob) * 0.008 - (W.reloadT > 0 ? 0.1 : 0); }
  W.flash = Math.max(0, W.flash - dt); muzzle.material.opacity = W.flash > 0 ? 0.95 : 0; muzzle.rotation.z += 1.3;
  tracers.forEach(t => { if (t.life > 0) { t.life -= dt; t.line.material.opacity = Math.max(0, t.life / 0.07); if (t.life <= 0) t.line.visible = false; } });
  sparks.forEach(s => { if (s.life > 0) { s.life -= dt; s.m.material.opacity = Math.max(0, s.life / 0.14); s.m.scale.setScalar(1 + (0.14 - s.life) * 9); if (s.life <= 0) s.m.visible = false; } });
  SITES.forEach(s => { s.ring.rotation.z += dt * 0.5; });
  renderer.render(scene, camera);
}
let last = performance.now(), menuT = 0;
function tick(t) {
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  if (state === 'play' && !paused) { update(dt); drawMini(); }
  else if (state === 'lobby' || state === 'intel' || state === 'matchend') { menuT += dt * 0.07; P.alive = true; P.x = Math.sin(menuT) * 30; P.z = 8 + Math.cos(menuT * 0.8) * 4; P.yaw = menuT * 1.4; P.pitch = 0.1; }   // slow fly-through behind the menus
  render(dt); requestAnimationFrame(tick);
}
SITES.forEach((s, i) => { s.text = ['Air Operator Certificate', 'Certificate of Airworthiness', 'Permit to Fly'][i]; drawBoard(s); });
buildVM(); fillAmmo(); lobby(); requestAnimationFrame(tick);
window.__ops = { P, M: () => M, RD: () => RD, SITES, enemies, keys, W, state: () => state, save, fire, certify, hurtEnemy, MAP, FREE, los };
})();
