/* PENCIL WHIP – open-world aircraft maintenance caper (three.js r128) */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const TOUCH = ('ontouchstart' in window) && matchMedia('(pointer:coarse)').matches;

/* ───────── save ───────── */
const SKEY = 'pw_save';
let save = { name: '', done: {}, cash: 0, facts: {}, pages: {}, exam: 0, intro: false, cam: 0, mute: false, radio: 1, stats: { busted: 0, jacked: 0, peds: 0, wrong: 0, right: 0 } };
try { const s = JSON.parse(localStorage.getItem(SKEY) || '{}'); Object.assign(save, s); save.stats = Object.assign({ busted: 0, jacked: 0, peds: 0, wrong: 0, right: 0 }, s.stats || {}); } catch (e) {}
const persist = () => { try { localStorage.setItem(SKEY, JSON.stringify(save)); } catch (e) {} };
const mainDone = () => MISSIONS.filter(m => !m.final && !m.island).filter(m => save.done[m.id]).length;
const cayDone = () => MISSIONS.filter(m => m.island).every(m => save.done[m.id]);
const RANKS = [[0, 'Apprentice'], [2, 'Mechanic'], [4, 'B1 Engineer'], [6, 'Certifying Staff'], [8, 'Chief Engineer']];
const rank = () => save.exam >= 8 ? 'Licence Board Approved' : RANKS.filter(r => mainDone() >= r[0]).pop()[1];

/* ───────── audio ───────── */
let AC = null, master = null, noiseBuf = null;
function au() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = save.mute ? 0 : 1; master.connect(AC.destination); } catch (e) { return null; } }
  if (AC.state === 'suspended') AC.resume(); return AC;
}
function tone(f, d, type = 'square', vol = 0.05, slide = 0, delay = 0) {
  const a = au(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.02);
}
function noise(d, vol = 0.12, freq = 1200) {
  const a = au(); if (!a) return;
  if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate * 0.6, a.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d); s.connect(f); f.connect(g); g.connect(master); s.start(); s.stop(a.currentTime + d);
}
const sfx = {
  crash: v => noise(0.25, Math.min(0.25, 0.04 + v * 0.012), 700), horn: () => { tone(392, 0.32, 'square', 0.05); tone(494, 0.32, 'square', 0.04); },
  pass: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.28, 'triangle', 0.07, 0, i * 0.11)),
  fail: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.32, 'sawtooth', 0.05, 0, i * 0.15)),
  bust: () => { [880, 660, 880, 660].forEach((f, i) => tone(f, 0.2, 'square', 0.05, 0, i * 0.2)); }, pick: () => { tone(880, 0.08, 'triangle', 0.07); tone(1320, 0.14, 'triangle', 0.06, 0, 0.07); },
  bad: () => tone(170, 0.35, 'sawtooth', 0.07, -60), click: () => tone(900, 0.03, 'square', 0.03), star: () => { tone(600, 0.12, 'square', 0.05); tone(450, 0.2, 'square', 0.05, 0, 0.12); },
  ok: () => { tone(660, 0.1, 'triangle', 0.06); tone(990, 0.16, 'triangle', 0.06, 0, 0.08); }, page: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.2, 'sine', 0.06, 0, i * 0.08)),
  door: () => noise(0.08, 0.08, 2500), hit: () => { noise(0.2, 0.2, 500); tone(120, 0.2, 'sawtooth', 0.06, -50); }
};
let eng = null, sir = null;
function loops() {
  const a = au(); if (!a || eng) return;
  const mk = (type, f) => { const o = a.createOscillator(), fl = a.createBiquadFilter(), g = a.createGain(); o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 900; g.gain.value = 0; o.connect(fl); fl.connect(g); g.connect(master); o.start(); return { o, g, fl }; };
  eng = mk('sawtooth', 60); sir = mk('square', 700); sir.fl.frequency.value = 2500;
}
// radio: chiptune (Ramp FM) and fact readout (Tower Talk)
const STATIONS = ['RADIO OFF', 'RAMP FM 98.6', 'TOWER TALK'];
let radioNext = 0, radioStep = 0, talkT = 6;
const BASS = [45, 45, 52, 45, 48, 48, 55, 48, 43, 43, 50, 43, 47, 47, 52, 50], ARP = [0, 4, 7, 12, 7, 4, 0, 7];
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
function radioTick() {
  if (!AC || mode !== 'play' || !P.veh || save.radio !== 1) { radioNext = 0; return; }
  if (!radioNext || radioNext < AC.currentTime) radioNext = AC.currentTime + 0.05;
  while (radioNext < AC.currentTime + 0.25) {
    const s = radioStep % 16, b = BASS[(radioStep >> 1) % 16], t = radioNext - AC.currentTime;
    if (s % 2 === 0) tone(mtof(b), 0.2, 'triangle', 0.035, 0, t);
    tone(mtof(b + 24 + ARP[radioStep % 8]), 0.09, 'square', 0.012, 0, t);
    if (s % 4 === 2) noise(0.03, 0.03, 6000);
    radioStep++; radioNext += 0.13;
  }
}
setInterval(radioTick, 60);

/* ───────── three setup ───────── */
const canvas = $('c');
if (!save.gfx) save.gfx = TOUCH ? 'low' : 'high';
const HQ = () => save.gfx !== 'low';
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, HQ() ? 1.75 : 1));
renderer.shadowMap.enabled = HQ(); renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.classList.toggle('hq', HQ());
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbcdcf6, 170, 560);
const camera = new THREE.PerspectiveCamera(62, 1, 0.3, 2200);
const hemi = new THREE.HemisphereLight(0xffffff, 0x5d6b52, 0.72); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d6, 0.85); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
{ const c = sun.shadow.camera; c.left = -120; c.right = 120; c.top = 120; c.bottom = -120; c.near = 20; c.far = 520; sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.35; }
scene.add(sun); scene.add(sun.target);
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const mats = {}; const M = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
// sky dome with sun disc, glow and stars
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunC: { value: new THREE.Color() }, sunD: { value: new THREE.Vector3(0, 1, 0) }, stars: { value: 0 } };
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 sunC; uniform vec3 sunD; uniform float stars; varying vec3 vD;
    float hs(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
    void main(){ float y = vD.y; vec3 c = y > 0.0 ? mix(hor, top, pow(y, 0.5)) : hor * 0.9;
      float s = max(dot(vD, normalize(sunD)), 0.0); c += sunC * (pow(s, 900.0) * 3.0 + pow(s, 12.0) * 0.45 + pow(s, 3.0) * 0.12);
      if (stars > 0.0 && y > 0.0) { float r = hs(floor(vD * 420.0)); c += vec3(step(0.9975, r) * stars * smoothstep(0.0, 0.3, y)); }
      gl_FragColor = vec4(c, 1.0); }` }));
skyDome.renderOrder = -10; scene.add(skyDome);
// environment map for glossy car paint, glass and water
const ENV = (() => {
  const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene(), g = new THREE.SphereGeometry(10, 32, 16), pos = g.attributes.position, cols = [];
  const top = new THREE.Color(0x3d86d8), hz = new THREE.Color(0xf4f2ea), gnd = new THREE.Color(0x4a4d52), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 10; if (y > 0) c.copy(hz).lerp(top, Math.pow(y, 0.6)); else c.copy(hz).lerp(gnd, Math.min(1, -y * 5)); cols.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); es.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const sb = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); sb.position.set(-5, 6, 4); es.add(sb);
  const t = pm.fromScene(es, 0.03).texture; pm.dispose(); return t;
})();
const paintMats = {}, glowMats = [];
const paint = (c, metal = 0.45, rough = 0.3) => paintMats[c + ':' + metal] || (paintMats[c + ':' + metal] = new THREE.MeshStandardMaterial({ color: c, metalness: metal, roughness: rough, envMap: ENV }));
const glassMat = new THREE.MeshStandardMaterial({ color: 0x101820, metalness: 0.85, roughness: 0.06, envMap: ENV });
function radialTex(inner, outer) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, inner); g.addColorStop(1, outer); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); }
const glowTex = radialTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), blobTex = radialTex('rgba(0,0,0,0.55)', 'rgba(0,0,0,0)');
const poolMat = new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
const beamMat = new THREE.MeshBasicMaterial({ map: glowTex, color: 0xfff0c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0x77705f });
function flat(w, d, mat, x, y, z, parent) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.userData.flat = true; (parent || scene).add(m); return m; }
function shadowify(o) { o.traverse(m => { if (m.isMesh && !m.userData.flat && !(m.material && m.material.transparent)) { m.castShadow = true; m.receiveShadow = true; } }); return o; }
// time of day: [hour, sky top, sky horizon, fog, sun colour, sun intensity, hemi sky, hemi ground, hemi intensity, night glow]
let tod = typeof save.tod === 'number' ? save.tod : 17.4;
const TOD = [
  [0, 0x0b1434, 0x1d2b4e, 0x1b2846, 0x8fa6d8, 0.22, 0x51659f, 0x1c2232, 0.42, 1],
  [5, 0x14204a, 0x3c3e68, 0x383c62, 0x9aa8d8, 0.22, 0x5a6aa0, 0x222a3a, 0.44, 1],
  [6.5, 0x3a6db0, 0xf6a96a, 0xd6a486, 0xffb070, 0.6, 0xb8c8e8, 0x5a5048, 0.62, 0.35],
  [8.5, 0x2f7fd6, 0xc4e2ff, 0xbcdcf6, 0xfff2dc, 0.9, 0xffffff, 0x5d6b52, 0.7, 0],
  [16, 0x2f7fd6, 0xc4e2ff, 0xbcdcf6, 0xfff2dc, 0.9, 0xffffff, 0x5d6b52, 0.7, 0],
  [18, 0x3768b8, 0xffb47c, 0xf0bc94, 0xffa45a, 0.85, 0xffdcc0, 0x5d5048, 0.66, 0.1],
  [19.3, 0x2a3c80, 0xff7854, 0xb4627a, 0xff6a3a, 0.45, 0xa094c4, 0x40384a, 0.52, 0.7],
  [20.6, 0x111d47, 0x3a3a70, 0x2f3662, 0x8fa6d8, 0.24, 0x5a6aa0, 0x222a3a, 0.45, 1],
  [24, 0x0b1434, 0x1d2b4e, 0x1b2846, 0x8fa6d8, 0.22, 0x51659f, 0x1c2232, 0.42, 1]];
let glow = 0; const _ca = new THREE.Color(), _cb = new THREE.Color(), _sd = new THREE.Vector3();
const lc = (i, a, b, t) => _ca.setHex(TOD[a][i]).lerp(_cb.setHex(TOD[b][i]), t);
function applyTOD(fx, fz) {
  let a = 0; while (a < TOD.length - 2 && tod >= TOD[a + 1][0]) a++; const b = a + 1, t = clamp((tod - TOD[a][0]) / (TOD[b][0] - TOD[a][0]), 0, 1), n = (i) => TOD[a][i] + (TOD[b][i] - TOD[a][i]) * t;
  skyU.top.value.copy(lc(1, a, b, t)); skyU.hor.value.copy(lc(2, a, b, t)); scene.fog.color.copy(lc(3, a, b, t)); sun.color.copy(lc(4, a, b, t)); sun.intensity = n(5);
  hemi.color.copy(lc(6, a, b, t)); hemi.groundColor.copy(lc(7, a, b, t)); hemi.intensity = n(8); glow = n(9);
  const ang = (tod - 6) / 12 * Math.PI; _sd.set(Math.cos(ang) * 0.8, Math.sin(ang), 0.42).normalize(); skyU.sunD.value.copy(_sd);
  skyU.sunC.value.copy(sun.color).multiplyScalar(_sd.y > -0.05 ? 1 : 0.15); skyU.stars.value = Math.max(0, glow - 0.5) * 2;
  const ld = _sd.y > 0.12 ? _sd.clone() : new THREE.Vector3(-0.35, 0.85, 0.4).normalize(); if (ld.y < 0.25) { ld.y = 0.25; ld.normalize(); }
  const sx = Math.round(fx / 4) * 4, sz = Math.round(fz / 4) * 4; sun.target.position.set(sx, 0, sz); sun.position.set(sx + ld.x * 260, ld.y * 260, sz + ld.z * 260);
  scene.fog.near = 170 - glow * 50; scene.fog.far = 560 - glow * 140;
  glowMats.forEach(m => { m.emissiveIntensity = glow * 0.95; });
  lampHeadMat.color.setHex(0x77705f).lerp(_cb.setHex(0xfff0c0), glow); poolMat.opacity = glow * 0.55; beamMat.opacity = glow * 0.42;
  for (const k in paintMats) paintMats[k].envMapIntensity = 1 - glow * 0.75; glassMat.envMapIntensity = 1 - glow * 0.7;
}
const clockStr = () => { const h = Math.floor(tod), m = Math.floor((tod - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); };
function box(w, h, d, mat, x, y, z, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof mat === 'number' ? M(mat) : mat); m.position.set(x, y, z); (parent || scene).add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, parent, seg = 12) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof mat === 'number' ? M(mat) : mat); m.position.set(x, y, z); (parent || scene).add(m); return m; }
function plane(w, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), typeof mat === 'number' ? M(mat) : mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.userData.flat = true; m.receiveShadow = true; scene.add(m); return m; }
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return new THREE.CanvasTexture(c); }
function textSprite(text, o = {}) {
  const lines = String(text).split('\n'), fs = o.size || 46, pad = 18, c = document.createElement('canvas'), x = c.getContext('2d');
  x.font = `800 ${fs}px Segoe UI, Arial, sans-serif`; const w = Math.min(1024, Math.ceil(Math.max(...lines.map(l => x.measureText(l).width)) + pad * 2)), h = Math.ceil(lines.length * fs * 1.2 + pad * 2);
  c.width = w; c.height = h; x.font = `800 ${fs}px Segoe UI, Arial, sans-serif`;
  if (o.bg !== null) { x.fillStyle = o.bg || 'rgba(8,12,22,0.86)'; x.fillRect(0, 0, w, h); if (o.edge) { x.fillStyle = o.edge; x.fillRect(0, 0, w, 8); } }
  x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach((l, i) => { x.lineWidth = 8; x.strokeStyle = '#000'; if (o.bg === null) x.strokeText(l, w / 2, pad + fs * 0.6 + i * fs * 1.2); x.fillStyle = i === 0 ? (o.fg || '#fff') : (o.fg2 || o.fg || '#fff'); x.fillText(l, w / 2, pad + fs * 0.6 + i * fs * 1.2); });
  const t = new THREE.CanvasTexture(c), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: o.depth !== false, fog: false, transparent: true }));
  const sc = o.scale || 0.05; s.scale.set(w * sc, h * sc, 1); return s;
}

/* ───────── grid / graph ───────── */
const XL = [-200, -120, -40, 40, 120, 200], ZL = [-200, -160, -80, 0, 80, 160], NX = 6, NZ = 6, RH = 7;
const nid = (i, j) => i * NZ + j, npos = id => ({ x: XL[(id / NZ) | 0], z: ZL[id % NZ] });
function NB(id) { const i = (id / NZ) | 0, j = id % NZ, r = []; if (i > 0) r.push(nid(i - 1, j)); if (i < NX - 1) r.push(nid(i + 1, j)); if (j > 0) r.push(nid(i, j - 1)); if (j < NZ - 1) r.push(nid(i, j + 1)); return r; }
function nearestNode(x, z, ok) { let b = -1, bd = 1e9; for (let id = 0; id < NX * NZ; id++) { if (ok && !ok(id)) continue; const p = npos(id), d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; b = id; } } return b; }
function bfs(a, b) { if (a === b) return [a]; const prev = new Int16Array(NX * NZ).fill(-1), q = [a]; prev[a] = a; for (let h = 0; h < q.length; h++) { const k = q[h]; for (const n of NB(k)) if (prev[n] < 0) { prev[n] = k; if (n === b) { const p = [b]; let c = b; while (c !== a) { c = prev[c]; p.push(c); } return p.reverse(); } q.push(n); } } return [a]; }
const LOC = {
  hangar: [-160, -89], standA: [-80, -89], standB: [0, -89], standC: [80, -89], ga: [160, -89],
  workshop: [-160, -9], ops: [-80, -9], crew: [0, -9], quality: [66, -9], records: [98, -9], archive: [160, -9],
  training: [-160, 9], caas: [80, 9], pW: [-160, 89], pM: [0, 89], pE: [160, 89],
  cab0: [136, -42], cab1: [152, -42], cab2: [168, -42], cab3: [184, -42], runway: [215, -232], dock: [-225, 196],
  tcc: [575, -12], modh: [700, -12], plant: [545, 12], doa: [630, -12], prod: [630, 12], vault: [700, 12], ftest: [630, -138],
  n1: [545, -120], n2: [630, -120], n3: [715, -120], s1: [545, 120], s2: [630, 120], s3: [715, 120],
  iNW: [500, -120], iNE: [760, -120], iSE: [760, 120], iSW: [500, 120], iW: [500, 0], iE: [760, 0], bE: [468, 0], bW: [250, 0]
};
for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) LOC[`n_${i}_${j}`] = [XL[i], ZL[j]];
const L = k => ({ x: LOC[k][0], z: LOC[k][1] });

/* ───────── colliders ───────── */
const COL = [];
const LAND = [{ x0: -238, x1: 238, z0: -262, z1: 205 }, { x0: -229, x1: -221, z0: 200, z1: 222 }, { x0: 230, x1: 480, z0: -8, z1: 8 }, { x0: 470, x1: 790, z0: -150, z1: 150 }];
const onLand = (x, z) => LAND.some(R => x >= R.x0 && x <= R.x1 && z >= R.z0 && z <= R.z1);
function addCol(cx, cz, w, d, h = 10) { const c = { x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2, h }; COL.push(c); return c; }
function pushOut(x, z, r) {
  let px = 0, pz = 0;
  for (const c of COL) {
    if (c.off) continue;
    if (x + r < c.x0 || x - r > c.x1 || z + r < c.z0 || z - r > c.z1) continue;
    const qx = clamp(x, c.x0, c.x1), qz = clamp(z, c.z0, c.z1), dx = x - qx, dz = z - qz, d2 = dx * dx + dz * dz;
    if (d2 > r * r) continue;
    if (d2 > 1e-8) { const d = Math.sqrt(d2), k = (r - d) / d; px += dx * k; pz += dz * k; x += dx * k; z += dz * k; }
    else { const l = x - c.x0 + r, rr = c.x1 - x + r, t = z - c.z0 + r, b = c.z1 - z + r, m = Math.min(l, rr, t, b);
      if (m === l) { px -= l; x -= l; } else if (m === rr) { px += rr; x += rr; } else if (m === t) { pz -= t; z -= t; } else { pz += b; z += b; } }
  }
  // keep everything on land: Vista Bay, the jetty, the bridge and Design Cay
  let best = null;
  for (const R of LAND) { const cx = clamp(x, R.x0 + r, R.x1 - r), cz = clamp(z, R.z0 + r, R.z1 - r), d = (cx - x) ** 2 + (cz - z) ** 2; if (d < 1e-9) { best = null; break; } if (!best || d < best.d) best = { d, cx, cz }; }
  if (best) { px += best.cx - x; pz += best.cz - z; }
  return [px, pz];
}
function segBlocked(x0, z0, x1, z1, minH = 2.5) {
  const dx = x1 - x0, dz = z1 - z0;
  for (const c of COL) {
    if (c.off || c.h < minH) continue; let t0 = 0, t1 = 1;
    if (Math.abs(dx) < 1e-9) { if (x0 < c.x0 || x0 > c.x1) continue; } else { let a = (c.x0 - x0) / dx, b = (c.x1 - x0) / dx; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) continue; }
    if (Math.abs(dz) < 1e-9) { if (z0 < c.z0 || z0 > c.z1) continue; } else { let a = (c.z0 - z0) / dz, b = (c.z1 - z0) / dz; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) continue; }
    return true;
  }
  return false;
}

/* ───────── world ───────── */
// window textures: 4x2 modules of 3x2 windows; a matching emissive map lights random windows at night
const winTex = {};
function windowTex(col) {
  if (winTex[col]) return winTex[col];
  const c = '#' + col.toString(16).padStart(6, '0'), wins = [];
  const diff = ctex(512, 256, (x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * 0.05})`; x.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
    for (let mx = 0; mx < 4; mx++) for (let my = 0; my < 2; my++) { const ox = mx * 128, oy = my * 128;
      x.fillStyle = 'rgba(0,0,0,0.16)'; x.fillRect(ox, oy + 118, 128, 10); x.fillStyle = 'rgba(255,255,255,0.14)'; x.fillRect(ox, oy + 114, 128, 4);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const X = ox + 9 + i * 40, Y = oy + 12 + j * 52, W2 = 30, H2 = 38;
        x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(X - 2, Y - 2, W2 + 4, H2 + 5);
        const g = x.createLinearGradient(X, Y, X + W2, Y + H2); g.addColorStop(0, '#7fa3c4'); g.addColorStop(0.45, '#33495f'); g.addColorStop(1, '#1b2735'); x.fillStyle = g; x.fillRect(X, Y, W2, H2);
        x.fillStyle = 'rgba(255,255,255,0.22)'; x.fillRect(X, Y, W2, 2); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(X + W2 / 2 - 1, Y, 2, H2); x.fillStyle = 'rgba(255,255,255,0.3)'; x.fillRect(X - 2, Y + H2 + 1, W2 + 4, 2);
        wins.push([X, Y, W2, H2]); } } });
  const em = ctex(512, 256, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); wins.forEach(([X, Y, W2, H2]) => { if (Math.random() < 0.42) { x.fillStyle = ['#ffcf73', '#ffe6aa', '#ffbb55', '#cfe6ff', '#fff4d0'][Math.random() * 5 | 0]; x.fillRect(X, Y, W2, H2); } }); });
  return (winTex[col] = { diff, em });
}
const shopTex = (() => { const d = ctex(256, 64, (x, w, h) => { x.fillStyle = '#20262e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6c8aa6'); g.addColorStop(1, '#25313e'); x.fillStyle = g; x.fillRect(i * 64 + 4, 6, 56, 52); x.fillStyle = '#11151a'; x.fillRect(i * 64 + 30, 6, 3, 52); } x.fillStyle = '#c9ccd1'; x.fillRect(0, 0, w, 5); });
  const e = ctex(256, 64, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { x.fillStyle = ['#ffd38a', '#bfe3ff', '#ffe8b8', '#ffc070'][i]; x.fillRect(i * 64 + 4, 6, 56, 52); } }); return { d, e }; })();
const AWN = [0xd8343a, 0x1f7a5a, 0x2e5fbf, 0xe0a106, 0x8e44ad, 0xe8e8e8];
function bld(cx, cz, w, d, h, col, roof, o = {}) {
  const T = windowTex(col), rx = Math.max(1, Math.round(w / 7)) / 4, ry = Math.max(1, Math.round(h / 6)) / 2, rz = Math.max(1, Math.round(d / 7)) / 4;
  const mk = (r) => { const t = T.diff.clone(), e = T.em.clone(); [t, e].forEach(q => { q.needsUpdate = true; q.wrapS = q.wrapT = THREE.RepeatWrapping; q.repeat.set(r, ry); });
    const m = new THREE.MeshLambertMaterial({ map: t, emissive: 0xffffff, emissiveMap: e, emissiveIntensity: 0 }); glowMats.push(m); return m; };
  const sx = mk(rx), sz = mk(rz), top = M(roof || 0x5a5f68);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [sz, sz, top, top, sx, sx]); m.position.set(cx, h / 2, cz); scene.add(m);
  // parapet and rooftop clutter
  const pc = 0x6d727b; box(w + 0.4, 0.9, 0.4, pc, cx, h + 0.45, cz - d / 2); box(w + 0.4, 0.9, 0.4, pc, cx, h + 0.45, cz + d / 2); box(0.4, 0.9, d, pc, cx - w / 2, h + 0.45, cz); box(0.4, 0.9, d, pc, cx + w / 2, h + 0.45, cz);
  if (w > 12 && d > 12) { box(w * 0.22, 1.6, d * 0.2, 0x8a8f99, cx + w * 0.18, h + 0.8, cz - d * 0.15); box(2.2, 1.2, 2.2, 0xa0a5ad, cx - w * 0.25, h + 0.6, cz + d * 0.2); box(2.2, 1.2, 2.2, 0xa0a5ad, cx - w * 0.25 + 3, h + 0.6, cz + d * 0.2); }
  if (h > 20) { cyl(0.12, 0.12, 8, 0x30343a, cx - w * 0.3, h + 4, cz - d * 0.3); const b = box(0.3, 0.3, 0.3, new THREE.MeshBasicMaterial({ color: 0xff3030 }), cx - w * 0.3, h + 8.1, cz - d * 0.3); b.userData.blink = true; blinkers.push(b); }
  // storefront band with awnings
  if (o.shop) { const sd = shopTex.d.clone(), se = shopTex.e.clone(); [sd, se].forEach(q => { q.needsUpdate = true; q.wrapS = THREE.RepeatWrapping; q.repeat.set(Math.max(1, Math.round(w / 10)), 1); });
    const sm = new THREE.MeshLambertMaterial({ map: sd, emissive: 0xffffff, emissiveMap: se, emissiveIntensity: 0 }); glowMats.push(sm);
    const sb = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 3.4, d + 0.3), [sm, sm, M(0x2a3038), M(0x2a3038), sm, sm]); sb.position.set(cx, 1.7, cz); scene.add(sb);
    const ac = AWN[Math.random() * AWN.length | 0]; [-1, 1].forEach(sg => { const a = box(w * 0.86, 0.22, 1.8, ac, cx, 3.75, cz + sg * (d / 2 + 0.9)); a.rotation.x = sg * 0.18; }); }
  addCol(cx, cz, w, d, h); return m;
}
const blinkers = [];
function billboard(x, y, z, ry, title, sub, c1, c2) {
  const t = ctex(512, 200, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * 0.85, h * 0.5, 30 + i * 22, 0, 6.283); g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,0.08)'; g.stroke(); }
    g.font = '900 78px Impact, Arial Black, sans-serif'; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 8; g.strokeText(title, 26, 100); g.fillText(title, 26, 100);
    g.font = 'italic 700 30px Arial, sans-serif'; g.fillStyle = '#fff6d0'; g.fillText(sub, 30, 160); });
  const grp = new THREE.Group(), fm = new THREE.MeshLambertMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0 }); glowMats.push(fm);
  box(14, 5.6, 0.4, 0x2a2d33, 0, 4.2, 0, grp); const f = new THREE.Mesh(new THREE.PlaneGeometry(13.4, 5.2), fm); f.position.set(0, 4.2, 0.22); grp.add(f); const bk = f.clone(); bk.rotation.y = Math.PI; bk.position.z = -0.22; grp.add(bk);
  [-5, 5].forEach(px => box(0.3, 2, 0.3, 0x2a2d33, px, 1, 0, grp)); grp.position.set(x, y, z); grp.rotation.y = ry; scene.add(grp);
}
function sign(text, x, y, z, col = '#ffc83d', sc = 0.06) { const s = textSprite(text, { bg: 'rgba(10,14,24,0.9)', edge: col, size: 40, scale: sc }); s.position.set(x, y, z); scene.add(s); return s; }
const leafMat = new THREE.MeshLambertMaterial({ color: 0x3c9a46, flatShading: true }), leafMat2 = new THREE.MeshLambertMaterial({ color: 0x2f7d3a, flatShading: true });
function tree(x, z, palm) {
  if (palm) {
    const g = new THREE.Group(); let px = 0, py = 0; const lean = rnd(-0.12, 0.12);
    for (let k = 0; k < 6; k++) { const sgm = cyl(0.32 - k * 0.02, 0.36 - k * 0.02, 1.35, 0x8a6a45, px, py + 0.67, 0, g, 7); sgm.rotation.z = lean; px += Math.sin(-lean) * 1.35; py += 1.3; }
    for (let i = 0; i < 8; i++) { const f = new THREE.Group(); f.position.set(px, py, 0); f.rotation.y = i * 0.785 + rnd(-0.2, 0.2);
      const l1 = box(0.9, 0.08, 2.4, i % 2 ? leafMat : leafMat2, 0, 0.25, 1.2, f); l1.rotation.x = -0.25; const l2 = box(0.7, 0.08, 2.2, i % 2 ? leafMat : leafMat2, 0, -0.35, 3.2, f); l2.rotation.x = 0.45; g.add(f); }
    [[0.3, 0], [-0.2, 0.25], [-0.1, -0.3]].forEach(([a, b]) => { const n = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), M(0x5a3d1e)); n.position.set(px + a, py - 0.3, b); g.add(n); });
    g.position.set(x, 0, z); g.rotation.y = rnd(0, 6.28); scene.add(g);
  } else {
    cyl(0.3, 0.45, 3.4, 0x6b4a2e, x, 1.7, z);
    const s1 = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 0), leafMat2); s1.position.set(x, 4.8, z); scene.add(s1);
    const s2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 0), leafMat); s2.position.set(x + 0.9, 6.0, z - 0.6); scene.add(s2);
  }
  addCol(x, z, 1.2, 1.2, 3);
}
// ground
const seaTex = ctex(128, 128, (x, w, h) => { x.fillStyle = '#1f6fa8'; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`; x.fillRect(Math.random() * w, Math.random() * h, rnd(4, 14), 1.5); } });
seaTex.wrapS = seaTex.wrapT = THREE.RepeatWrapping; seaTex.repeat.set(90, 90);
const seaMat = new THREE.MeshStandardMaterial({ map: seaTex, color: 0xffffff, metalness: 0.35, roughness: 0.18, envMap: ENV });
plane(3200, 3200, seaMat, 0, -0.6, 0);
const noiseTex = (base, n, a, rep, lines) => { const t = ctex(256, 256, (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`; const s = rnd(1, 4); x.fillRect(Math.random() * w, Math.random() * h, s, s); }
  if (lines) { x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 2; for (let k = 0; k <= 4; k++) { x.beginPath(); x.moveTo(k * 64, 0); x.lineTo(k * 64, h); x.stroke(); x.beginPath(); x.moveTo(0, k * 64); x.lineTo(w, k * 64); x.stroke(); } } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return new THREE.MeshLambertMaterial({ map: t }); };
plane(476, 474, noiseTex('#6aaa5a', 4000, 0.12, [60, 60]), 0, 0, -25);
plane(476, 182, noiseTex('#999da4', 3000, 0.08, [30, 12], true), 0, 0.01, -171);
plane(476, 47, noiseTex('#e6d6a2', 4000, 0.1, [50, 5]), 0, 0.012, 188.5);
plane(8, 22, 0x8a6a45, -225, 0.3, 212);
// runway
{ const rt = ctex(64, 256, (x, w, h) => { x.fillStyle = '#3f434a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f4f4f4'; x.fillRect(29, 0, 6, 120); });
  rt.wrapS = rt.wrapT = THREE.RepeatWrapping; rt.repeat.set(1, 16); const r = plane(32, 470, new THREE.MeshLambertMaterial({ map: rt }), 0, 0.02, -232); r.rotation.z = Math.PI / 2;
  for (const e of [-1, 1]) for (let k = 0; k < 8; k++) plane(1.6, 10, 0xf4f4f4, e * 222, 0.03, -232 - 12 + k * 3.4); }
// roads
const roadTex = (airside) => ctex(128, 128, (x, w, h) => { x.fillStyle = airside ? '#8f949b' : '#363a41'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * 0.08})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(36, 0, 12, h); x.fillRect(80, 0, 12, h);
  x.fillStyle = airside ? '#f1c232' : '#e9e9e9'; x.fillRect(61, 0, 6, 64); if (!airside) { x.fillRect(3, 0, 3, h); x.fillRect(122, 0, 3, h); } });
const rTex = [roadTex(false), roadTex(true)];
const zebraMat = (() => { const t = ctex(128, 32, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(240,240,240,0.92)'; for (let i = 0; i < 8; i++) x.fillRect(i * 16 + 3, 0, 9, h); }); return new THREE.MeshLambertMaterial({ map: t, transparent: true }); })();
for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
  const a = npos(nid(i, j));
  const seg = (b, horiz) => { const len = horiz ? b.x - a.x : b.z - a.z, airside = Math.max(a.z, b.z) <= -80; const t = rTex[airside ? 1 : 0].clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, len / 8);
    const m = plane(RH * 2, len - RH * 2, new THREE.MeshLambertMaterial({ map: t }), (a.x + b.x) / 2, 0.04, (a.z + b.z) / 2); if (horiz) m.rotation.z = Math.PI / 2; };
  if (i < NX - 1) seg(npos(nid(i + 1, j)), true); if (j < NZ - 1) seg(npos(nid(i, j + 1)), false);
  plane(RH * 2, RH * 2, a.z <= -80 ? 0x8f949b : 0x363a41, a.x, 0.045, a.z);
  if (a.z >= 0) [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dx, dz]) => { const m = plane(dx ? 3.2 : RH * 2, dx ? RH * 2 : 3.2, zebraMat, a.x + dx * (RH + 1.8), 0.05, a.z + dz * (RH + 1.8)); if (dx) m.rotation.z = Math.PI / 2; void m; });
}
// sidewalk pads for landside blocks
const walkMat = noiseTex('#b9b4aa', 2500, 0.1, [16, 16], true), plazaMat = noiseTex('#a3a7ac', 2500, 0.08, [12, 12], true), lawnMat = noiseTex('#68a85a', 3000, 0.12, [12, 12]);
for (let i = 0; i < NX - 1; i++) for (let j = 2; j < NZ - 1; j++) { const cx = (XL[i] + XL[i + 1]) / 2, cz = (ZL[j] + ZL[j + 1]) / 2; plane(66, 66, walkMat, cx, 0.02, cz); plane(58, 58, j === 2 ? plazaMat : lawnMat, cx, 0.03, cz);
  const cm = M(0xd8d4cc); [[0, -33, 66, 0.35], [0, 33, 66, 0.35], [-33, 0, 0.35, 66], [33, 0, 0.35, 66]].forEach(([ox, oz, w, d]) => { const c = box(w, 0.16, d, cm, cx + ox, 0.08, cz + oz); c.userData.flat = true; c.receiveShadow = true; }); }
// stand markings
[-80, 0, 80, 160].forEach(x => { plane(0.4, 60, 0xf1c232, x, 0.03, -120); });
// aircraft
const aircraft = {}, PLANES = [];
function airliner(x, z, reg, o) {
  const g = new THREE.Group(), Lf = o.len, R = o.r, span = o.span, y0 = R + 1.6, wht = M(0xf2f4f7);
  const fus = cyl(R, R, Lf, wht, 0, y0, 0, g, 16); fus.rotation.x = Math.PI / 2;
  const nose = new THREE.Mesh(new THREE.SphereGeometry(R, 16, 10), wht); nose.scale.z = 1.6; nose.position.set(0, y0, Lf / 2); g.add(nose);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(R, R * 3, 16), wht); tail.rotation.x = -Math.PI / 2; tail.position.set(0, y0 + R * 0.2, -Lf / 2 - R * 1.4); g.add(tail);
  box(R * 2.02, R * 0.35, Lf * 0.92, o.c1, 0, y0 - R * 0.15, 0, g).scale.set(1, 1, 1);
  box(R * 1.6, R * 0.5, R * 0.6, 0x1c2733, 0, y0 + R * 0.45, Lf / 2 + R * 0.6, g);
  box(R * 2.03, R * 0.16, Lf * 0.78, 0x1c2733, 0, y0 + R * 0.38, -Lf * 0.02, g);
  const bcn = box(0.4, 0.25, 0.4, new THREE.MeshBasicMaterial({ color: 0xff2a2a }), 0, y0 + R + 0.15, 0, g); blinkers.push(bcn);
  box(span, 0.5, Lf * 0.16, 0xe6e9ee, 0, y0 - R * 0.3, -Lf * 0.04, g);
  const ex = o.engines === 4 ? [-span * 0.34, -span * 0.18, span * 0.18, span * 0.34] : [-span * 0.24, span * 0.24];
  ex.forEach(e => { const n = cyl(R * 0.55, R * 0.48, R * 2, o.c2, e, y0 - R * 1.05, Lf * 0.04, g); n.rotation.x = Math.PI / 2; });
  box(0.5, R * 2.6, Lf * 0.15, o.c1, 0, y0 + R * 2, -Lf / 2 + Lf * 0.02, g);
  box(span * 0.36, 0.35, Lf * 0.09, 0xe6e9ee, 0, y0 + R * 0.3, -Lf / 2 + Lf * 0.02, g);
  [[0, Lf * 0.36], [-R * 1.2, -Lf * 0.06], [R * 1.2, -Lf * 0.06]].forEach(([a, b]) => cyl(0.35, 0.35, 1.6, 0x222222, a, 0.8, b, g, 8));
  g.position.set(x, 0, z); scene.add(g);
  const lb = textSprite(reg + '\n' + o.type, { size: 44, scale: 0.06, edge: '#ffc83d' }); lb.position.set(x, y0 + R * 4 + 3, z); scene.add(lb);
  const cs = [addCol(x, z, R * 2.1, Lf + R * 2.4, y0 + R), addCol(x, z - Lf * 0.04, span, Lf * 0.2, 4), addCol(x, z - Lf / 2, span * 0.36, Lf * 0.09, 4)]; cs.forEach(c => { c.plane = true; });
  PLANES.push({ reg, type: o.type, g, lb, lbY: y0 + R * 4 + 3, cols: cs, home: { x, z }, len: Lf + R * 2.4, span, wingZ: -Lf * 0.04, fusR: R, spec: o.type === 'A320' ? 'a320' : 'heavy' });
  aircraft[reg] = g; return g;
}
airliner(-80, -126, '9V-VBA', { len: 30, r: 1.9, span: 30, c1: 0x1f5fbf, c2: 0x1f5fbf, type: 'A320' });
airliner(0, -130, '9V-VBC', { len: 40, r: 2.5, span: 42, c1: 0xd8343a, c2: 0x9aa3ad, type: 'B777' });
airliner(80, -128, '9V-VBD', { len: 38, r: 2.3, span: 40, c1: 0x188b5a, c2: 0x9aa3ad, engines: 4, type: 'A340-500' });
{ // GA light aircraft + small hangar
  const g = new THREE.Group(), x = 160, z = -112;
  const f = cyl(0.7, 0.5, 7, 0xffffff, 0, 1.4, 0, g); f.rotation.x = Math.PI / 2; box(11, 0.15, 1.5, 0xffffff, 0, 2.3, 0.8, g); box(0.15, 1.6, 1.2, 0xd8343a, 0, 2.2, -3.2, g);
  box(3.4, 0.12, 0.9, 0xffffff, 0, 1.5, -3.2, g); const p = box(0.1, 1.8, 0.2, 0x222222, 0, 1.4, 3.6, g); p.userData.spin = true; g.userData.prop = p;
  [-1, 1].forEach(s => cyl(0.25, 0.25, 0.5, 0x222222, s * 1, 0.25, 0.6, g, 8)); g.position.set(x, 0, z); scene.add(g); aircraft['9V-VBX'] = g;
  const lb = textSprite('9V-VBX\nLight aircraft', { size: 44, scale: 0.05, edge: '#ffc83d' }); lb.position.set(x, 6, z); scene.add(lb); const cs = [addCol(x, z, 11, 3, 3), addCol(x, z, 1.6, 8, 3)]; cs.forEach(c => { c.plane = true; });
  PLANES.push({ reg: '9V-VBX', type: 'Light aircraft', g, lb, lbY: 6, cols: cs, home: { x, z }, len: 8, span: 11, wingZ: 0.8, fusR: 0.8, spec: 'light' });
  bld(160, -146, 40, 18, 9, 0x8e98a6, 0x6b7380); sign('GA APRON', 160, 12, -136);
}
const padMat = (() => { const t = ctex(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(40,44,52,0.95)'; x.beginPath(); x.arc(128, 128, 124, 0, 6.283); x.fill();
  x.strokeStyle = '#ffd21a'; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 104, 0, 6.283); x.stroke(); x.fillStyle = '#ffffff'; x.font = '900 150px Arial Black, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('H', 128, 136); });
  return new THREE.MeshLambertMaterial({ map: t, transparent: true }); })();
function heli(x, z, reg, col, label) {
  const g = new THREE.Group(), P_ = paint(col), dark = M(0x23262b);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.5, 18, 12), P_); body.scale.set(1.0, 0.92, 1.65); body.position.set(0, 1.95, 0.3); g.add(body);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(1.28, 16, 10, 0, Math.PI * 2, 0, Math.PI / 1.9), glassMat); glass.rotation.x = Math.PI / 2.15; glass.position.set(0, 2.1, 1.45); g.add(glass);
  const boom = cyl(0.26, 0.48, 5.4, P_, 0, 2.25, -3.5, g, 10); boom.rotation.x = Math.PI / 2 - 0.06;
  box(0.16, 1.5, 0.9, P_, 0, 3.0, -6.05, g); box(1.9, 0.1, 0.55, P_, 0, 2.35, -5.4, g); box(1.6, 0.25, 2.6, dark, 0, 1.15, 0.3, g);
  const tr = new THREE.Group(); tr.position.set(0.28, 2.95, -6.15); [0, Math.PI / 2].forEach(a => { const b = box(0.05, 1.7, 0.16, dark, 0, 0, 0, tr); b.rotation.x = a; }); g.add(tr);
  cyl(0.13, 0.13, 0.7, dark, 0, 3.2, 0.3, g, 8);
  const rotor = new THREE.Group(); rotor.position.set(0, 3.55, 0.3); cyl(0.32, 0.32, 0.2, dark, 0, 0, 0, rotor, 10);
  for (let i = 0; i < 3; i++) { const bl = new THREE.Group(); bl.rotation.y = i * Math.PI * 2 / 3; box(0.36, 0.06, 5.3, dark, 0, 0, 2.65, bl); rotor.add(bl); } g.add(rotor);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(5.4, 32), new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); disc.rotation.x = -Math.PI / 2; disc.position.set(0, 3.56, 0.3); g.add(disc);
  [-1, 1].forEach(sx => { const sk = cyl(0.09, 0.09, 4.6, dark, sx * 1.15, 0.12, 0.4, g, 6); sk.rotation.x = Math.PI / 2; [-0.6, 1.4].forEach(zz => { const st = box(0.08, 0.95, 0.08, dark, sx * 1.0, 0.6, zz, g); st.rotation.z = -sx * 0.25; }); });
  const bc = box(0.25, 0.18, 0.25, new THREE.MeshBasicMaterial({ color: 0xff2a2a }), 0, 2.95, -1.2, g); blinkers.push(bc);
  g.position.set(x, 0, z); scene.add(g); flat(15, 15, padMat, x, 0.06, z + 0.3);
  const lb = textSprite(reg + '\n' + label, { size: 44, scale: 0.05, edge: '#ffc83d' }); lb.position.set(x, 7, z); scene.add(lb);
  const cs = [addCol(x, z - 0.35, 3.2, 12, 3.2)]; cs.forEach(c => { c.plane = true; });
  PLANES.push({ reg, type: 'Helicopter', g, lb, lbY: 7, cols: cs, home: { x, z }, len: 11.6, span: 10.8, wingZ: 0.3, fusR: 1.5, spec: 'heli', rotor, tr, disc });
}
heli(184, -100, '9V-HVA', 0xd8343a, 'Helicopter');
{
  heli(-138, 22, '9V-HVB', 0xf2c200, 'Training helicopter');
}
// line maintenance hangar (open front)
{ const cx = -160, cz = -124, w = 54, d = 44, h = 16, c = 0x9aa6b5, wl = M(c);
  box(w, h, 1.5, wl, cx, h / 2, cz - d / 2); addCol(cx, cz - d / 2, w, 1.5, h);
  [-1, 1].forEach(s => { box(1.5, h, d, wl, cx + s * w / 2, h / 2, cz); addCol(cx + s * w / 2, cz, 1.5, d, h); box(7, h, 1.5, wl, cx + s * (w / 2 - 3.5), h / 2, cz + d / 2); addCol(cx + s * (w / 2 - 3.5), cz + d / 2, 7, 1.5, h); });
  box(w + 2, 1.2, d + 2, 0x6b7380, cx, h + 0.6, cz); box(w - 14, 3, 1.5, 0x6b7380, cx, h - 1.5, cz + d / 2);
  sign('LINE MAINTENANCE HANGAR', cx, h + 5, cz + d / 2, '#7dff8a');
  box(3, 2.2, 3, 0x9ba4ad, cx - 12, 1.1, cz - 8); addCol(cx - 12, cz - 8, 3, 3, 2.2); box(3, 2.2, 3, 0x9ba4ad, cx + 14, 1.1, cz - 12); addCol(cx + 14, cz - 12, 3, 3, 2.2);
}
// control tower
cyl(3, 4, 40, 0xdfe3e8, 222, 20, -182); cyl(6, 5, 6, 0x5fb6e8, 222, 43, -182); cyl(6.5, 6.5, 1, 0x50565f, 222, 46.5, -182); addCol(222, -182, 9, 9, 40);
// facilities row
bld(-160, -52, 44, 28, 10, 0xc7b98f); sign('COMPONENT WORKSHOP', -160, 15, -37, '#7dff8a');
bld(-80, -50, 34, 30, 24, 0x7fa6c9); sign('OPS CENTRE', -80, 29, -34, '#4fc3ff');
bld(0, -52, 56, 26, 14, 0x9fd0e8, 0xdfe6ee); sign('CREW CENTRE', 0, 19, -38, '#ff7ad9');
bld(80, -52, 50, 26, 12, 0xe0c27a); sign('QUALITY & RECORDS', 80, 17, -38, '#ffc83d');
bld(160, -66, 34, 12, 8, 0xb59bd1); sign('LOG BOOK ARCHIVE', 160, 13, -58, '#ff7ad9');
['AIRCRAFT', 'ENGINE', 'PROPELLER', 'MODIFICATION'].forEach((n, i) => { const x = 136 + i * 16; box(6, 3.5, 3, [0x4fc3ff, 0xff9b42, 0x7dff8a, 0xff7ad9][i], x, 1.75, -52); addCol(x, -52, 6, 3, 3.5);
  const s = textSprite(n + '\nLOG BOOK', { size: 40, scale: 0.035, edge: '#fff' }); s.position.set(x, 6, -52); scene.add(s); });
// city
bld(-160, 52, 46, 30, 12, 0xd9a08b); sign('TRAINING CENTRE', -160, 17, 36, '#fff');
bld(80, 54, 44, 28, 18, 0xe9edf2, 0x334466); sign('CAAS OFFICE', 80, 23, 39, '#ff5252');
bld(-8, 52, 26, 30, 9, 0xf0c27a, null, { shop: true }); bld(20, 52, 20, 30, 16, 0x8fb3a3, null, { shop: true });
[[-160, 112, 22, 22, 34, 0xcfd6de], [-140, 136, 14, 14, 20, 0xb7c4cf], [-90, 110, 40, 20, 10, 0xe8b0b0], [-62, 138, 16, 16, 26, 0xa5b8d6], [0, 120, 44, 44, 8, 0xd8d0c0],
 [70, 108, 22, 18, 30, 0x95a8bd], [96, 130, 18, 22, 22, 0xc5d1dc], [150, 120, 30, 30, 18, 0xf2e3c6], [182, 100, 12, 12, 14, 0xd6c0e6]].forEach(b => bld(b[0], b[1], b[2], b[3], b[4], b[5], null, { shop: true }));
billboard(-160, 34, 112, 0, 'RIVET COLA', 'Tastes torqued.', '#d8343a', '#7a0f1a');
billboard(70, 30, 108, Math.PI, 'SKYHOOK INSURANCE', 'Covered from wheels-up to chocks-on.', '#1f5fbf', '#0b2550');
billboard(-90, 10, 110, 0, 'RAMP FM 98.6', 'The sound of the apron.', '#ff8c1a', '#8a2e00');
billboard(150, 18, 120, 0, '100LL BURGERS', 'High-octane flavour.', '#27ae60', '#0c4a26');
// street lamps along landside roads
function lamp(x, z, ax, az) { if (z < -82 || Object.values(LOC).some(([lx, lz]) => Math.hypot(lx - x, lz - z) < 6.5) || Math.hypot(x - 64, z - 16) < 5 || Math.hypot(x - 96, z - 16) < 5) return; cyl(0.11, 0.16, 6.6, 0x3a3d42, x, 3.3, z); const arm = box(Math.abs(ax) * 2.6 + 0.12, 0.12, Math.abs(az) * 2.6 + 0.12, 0x3a3d42, x + ax * 1.3, 6.5, z + az * 1.3); arm.castShadow = false;
  box(0.9, 0.22, 0.9, lampHeadMat, x + ax * 2.6, 6.4, z + az * 2.6); flat(11, 11, poolMat, x + ax * 3, 0.07, z + az * 3); addCol(x, z, 0.4, 0.4, 6); }
for (let i = 0; i < NX; i++) for (let j = 2; j < NZ; j++) {
  const a = npos(nid(i, j));
  if (i < NX - 1) { const b = npos(nid(i + 1, j)); for (let t = 16, k = 0; t < b.x - a.x - 12; t += 26, k++) { const sd = k % 2 ? 1 : -1; lamp(a.x + t, a.z + sd * 10.4, 0, -sd); } }
  if (j < NZ - 1) { const b = npos(nid(i, j + 1)); for (let t = 16, k = 0; t < b.z - a.z - 12; t += 26, k++) { const sd = k % 2 ? 1 : -1; lamp(a.x + sd * 10.4, a.z + t, -sd, 0); } }
}
sign('VISTA BAY MALL', 0, 13, 97, '#4fc3ff');
// parks & palms
[[150, 30], [170, 50], [140, 60], [178, 22], [-60, 28], [-100, 28], [-60, 60], [-100, 60]].forEach(([x, z]) => tree(x, z));
plane(20, 14, seaMat, 160, 0.05, 44);
for (let x = -230; x <= 230; x += 26) { if (Math.abs(x + 225) > 10) tree(x + rnd(-4, 4), 176 + rnd(-3, 6), true); }
for (let z = -60; z <= 150; z += 24) { tree(-224 + rnd(-4, 4), z, true); if (Math.abs(z + 10) > 14) tree(224 + rnd(-4, 4), z + 10, true); }

/* ───────── Design Cay: second island (SAR Part 21 – TC, STC, STSO) ───────── */
{
  plane(332, 312, noiseTex('#e6d6a2', 3000, 0.1, [30, 30]), 630, 0.005, 0);
  plane(300, 280, noiseTex('#66a85c', 4000, 0.12, [40, 40]), 630, 0.012, 0);
  // bridge from Vista Bay
  box(244, 0.6, 16, 0x8d9096, 354, -0.28, 0).userData.flat = true;
  [-1, 1].forEach(sg => { box(244, 0.9, 0.35, 0xc9ccd1, 354, 0.45, sg * 7.8); });
  for (let x = 250; x <= 460; x += 30) { box(2.4, 6, 10, 0x7d8188, x, -3.4, 0); }
  const road = (x0, z0, x1, z1) => { const horiz = z0 === z1, len = horiz ? x1 - x0 : z1 - z0, t = rTex[0].clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, len / 8);
    const m = plane(RH * 2, len, new THREE.MeshLambertMaterial({ map: t }), (x0 + x1) / 2, 0.05, (z0 + z1) / 2); if (horiz) m.rotation.z = Math.PI / 2; };
  road(207, 0, 500, 0); road(507, 0, 753, 0); road(507, -120, 753, -120); road(507, 120, 753, 120); road(500, -127, 500, 127); road(760, -127, 760, 127);
  [[500, -120], [760, -120], [500, 120], [760, 120], [500, 0], [760, 0]].forEach(([x, z]) => plane(RH * 2, RH * 2, 0x363a41, x, 0.055, z));
  for (let x = 262; x <= 452; x += 38) [-1, 1].forEach(sg => lamp(x, sg * 8.8, 0, -sg));
  const ds = textSprite('DESIGN CAY ▸\nType Certificate · STC · STSO', { size: 40, scale: 0.06, edge: '#9b8cff' }); ds.position.set(250, 9, 0); scene.add(ds);
  // flight test strip
  { const rt = ctex(64, 256, (x, w, h) => { x.fillStyle = '#3f434a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f4f4f4'; x.fillRect(29, 0, 6, 120); }); rt.wrapS = rt.wrapT = THREE.RepeatWrapping; rt.repeat.set(1, 9);
    const r = plane(18, 250, new THREE.MeshLambertMaterial({ map: rt }), 630, 0.04, -138); r.rotation.z = Math.PI / 2; sign('FLIGHT TEST STRIP', 630, 8, -128, '#ffc83d');
    cyl(0.1, 0.1, 6, 0xdddddd, 770, 3, -140); const sock = cyl(0.5, 0.2, 2.4, 0xff8c1a, 771.2, 5.6, -140); sock.rotation.z = Math.PI / 2; }
  // buildings
  bld(560, -58, 44, 30, 20, 0xb8b2e8, 0x4a4570); sign('TYPE CERTIFICATION CENTRE', 560, 25, -42, '#9b8cff');
  bld(630, -58, 36, 28, 14, 0xd9dde4); sign('DESIGN OFFICE (DOA)', 630, 19, -43, '#9b8cff');
  bld(705, -58, 44, 30, 13, 0xe8b27a, 0x6b5a48); sign('STC MOD HANGAR', 705, 18, -42, '#ff9b42');
  bld(560, 58, 44, 30, 12, 0x9ad9cc, 0x3d5a55); sign('STSO PARTS PLANT', 560, 17, 42, '#3fe0c5'); cyl(1.2, 1.5, 10, 0x8a8f99, 576, 17, 66);
  bld(630, 58, 36, 28, 10, 0xc7c9cf); sign('PRODUCTION PLANT (POA)', 630, 15, 43, '#3fe0c5');
  bld(705, 58, 34, 26, 9, 0x8f9db0, 0x3a4352); sign('TECHNICAL DATA VAULT', 705, 14, 44, '#ffc83d');
  billboard(560, 20, -58, Math.PI, 'DESIGN → PRODUCTION', '→ FLIGHT TEST. In that order.', '#5b4bc4', '#1f1a4d');
  // palms and trees
  for (let x = 480; x <= 780; x += 24) { if (Math.abs(x - 505) > 8 && Math.abs(x - 775) > 8) { tree(x + rnd(-3, 3), 140 + rnd(-2, 3), true); } }
  for (let z = -100; z <= 100; z += 25) { if (Math.abs(z) > 14) { tree(482 + rnd(-2, 2), z, true); tree(778 + rnd(-2, 2), z + 8, true); } }
  [[600, -30], [665, -30], [600, 30], [665, 30], [740, -30], [520, 30]].forEach(([x, z]) => tree(x, z));
}
scene.traverse(o => { if (o.isMesh && !o.userData.flat && o !== skyDome && !(o.material && o.material.transparent) && !(o.material && o.material.isMeshBasicMaterial)) { o.castShadow = true; o.receiveShadow = true; } });

/* ───────── characters ───────── */
function makePerson(o = {}) {
  const g = new THREE.Group(), skin = o.skin || [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524][Math.random() * 4 | 0];
  const limb = (w, h, d, c, x, y) => { const pv = new THREE.Group(); pv.position.set(x, y, 0); box(w, h, d, c, 0, -h / 2, 0, pv); g.add(pv); return pv; };
  const legL = limb(0.28, 0.8, 0.3, o.pants || 0x2c3e50, -0.17, 0.8), legR = limb(0.28, 0.8, 0.3, o.pants || 0x2c3e50, 0.17, 0.8);
  box(0.7, 0.78, 0.4, o.shirt || 0x3498db, 0, 1.2, 0, g);
  const armL = limb(0.2, 0.72, 0.22, o.shirt || 0x3498db, -0.46, 1.56), armR = limb(0.2, 0.72, 0.22, o.shirt || 0x3498db, 0.46, 1.56);
  box(0.42, 0.42, 0.42, skin, 0, 1.82, 0, g); box(0.3, 0.06, 0.02, 0x222222, 0, 1.88, 0.215, g); box(0.16, 0.1, 0.16, skin, 0, 1.6, 0, g);
  if (o.hat) box(0.46, 0.14, 0.5, o.hat, 0, 2.08, 0.02, g); else box(0.44, 0.12, 0.44, [0x2b1d14, 0x111111, 0x6b4a2e, 0xc9a26b][Math.random() * 4 | 0], 0, 2.07, -0.01, g);
  if (o.vest) { box(0.72, 0.5, 0.42, o.vest, 0, 1.3, 0, g); box(0.73, 0.06, 0.43, 0xdddddd, 0, 1.2, 0, g); }
  [legL, legR].forEach(l => box(0.3, 0.14, 0.42, 0x1b1b1b, 0, -0.76, 0.05, l)); [armL, armR].forEach(a => box(0.16, 0.16, 0.16, skin, 0, -0.78, 0, a));
  g.rotation.order = 'YXZ'; g.userData = { legL, legR, armL, armR, ph: Math.random() * 6 }; return shadowify(g);
}
function animPerson(g, dt, sp, run) { const u = g.userData; u.ph += dt * sp * (run ? 1.45 : 2.6); const a = Math.sin(u.ph) * Math.min(run ? 1.15 : 0.8, sp * 0.18);
  u.legL.rotation.x = a; u.legR.rotation.x = -a; u.armL.rotation.x = -a * (run ? 1.2 : 1); u.armR.rotation.x = a * (run ? 1.2 : 1); u.armL.rotation.z = run ? 0.25 : 0; u.armR.rotation.z = run ? -0.25 : 0;
  g.rotation.x += ((run ? 0.2 : 0) - g.rotation.x) * Math.min(1, dt * 8); }

/* ───────── vehicles ───────── */
const VT = {
  van:    { name: 'OPS VAN', len: 5.2, wid: 2.2, h: 2.4, max: 27, acc: 13, turn: 2.1, mass: 1.4, col: 0xffffff },
  sedan:  { name: 'SALOON', len: 4.6, wid: 2.0, h: 1.5, max: 30, acc: 14, turn: 2.3, mass: 1.0 },
  follow: { name: 'FOLLOW-ME CAR', len: 4.4, wid: 2.0, h: 1.6, max: 35, acc: 17, turn: 2.4, mass: 1.0, col: 0xffd21a },
  tug:    { name: 'PUSHBACK TUG', len: 4.8, wid: 2.7, h: 1.5, max: 16, acc: 9, turn: 1.9, mass: 2.4, col: 0xf2c200 },
  truck:  { name: 'FUEL BOWSER', len: 8.0, wid: 2.6, h: 3.0, max: 22, acc: 8, turn: 1.6, mass: 2.6, col: 0xe8e8e8 },
  cart:   { name: 'BAGGAGE TRACTOR', len: 3.2, wid: 1.7, h: 1.6, max: 18, acc: 11, turn: 2.5, mass: 0.9, col: 0x2e86de },
  caas:   { name: 'CAAS INSPECTOR', len: 4.7, wid: 2.05, h: 1.6, max: 33, acc: 17, turn: 2.4, mass: 1.2, col: 0xf4f6fa }
};
const CAR_COLS = [0xd8343a, 0x2e86de, 0x27ae60, 0x34495e, 0xf39c12, 0x8e44ad, 0xecf0f1, 0x16a085, 0x7f8c8d, 0xc0392b];
const vehicles = [];
const tyreGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16); tyreGeo.rotateZ(Math.PI / 2);
const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.34, 10); rimGeo.rotateZ(Math.PI / 2);
const tyreMat = M(0x151515), rimMat = new THREE.MeshStandardMaterial({ color: 0xc8cdd2, metalness: 0.9, roughness: 0.3, envMap: ENV });
const headMat = new THREE.MeshBasicMaterial({ color: 0xfff6d8 }), tailMat = new THREE.MeshBasicMaterial({ color: 0xff1a1a }), amberMat = new THREE.MeshBasicMaterial({ color: 0xffa31a });
function makeVehMesh(type, col) {
  const s = VT[type], g = new THREE.Group(), c = col || s.col || CAR_COLS[Math.random() * CAR_COLS.length | 0], P_ = paint(c), dark = M(0x1e1f22), W = s.wid, Ln = s.len, wheels = [];
  const wheel = (x, z, front) => { const pv = new THREE.Group(); pv.position.set(x, 0.42, z); const t = new THREE.Mesh(tyreGeo, tyreMat); t.add(new THREE.Mesh(rimGeo, rimMat)); pv.add(t); g.add(pv); wheels.push({ pv, t, front }); };
  let wz = Ln * 0.32, lightY = 0.8;
  if (type === 'sedan' || type === 'caas' || type === 'follow') {
    box(W, 0.56, Ln, P_, 0, 0.68, 0, g); box(W * 0.96, 0.12, Ln * 0.3, P_, 0, 1.0, Ln * 0.33, g); box(W * 0.96, 0.1, Ln * 0.2, P_, 0, 0.99, -Ln * 0.38, g);
    box(W * 0.84, 0.5, Ln * 0.46, glassMat, 0, 1.21, -Ln * 0.05, g); box(W * 0.8, 0.07, Ln * 0.36, P_, 0, 1.49, -Ln * 0.07, g);
    box(W * 1.02, 0.24, 0.24, dark, 0, 0.5, Ln / 2, g); box(W * 1.02, 0.24, 0.24, dark, 0, 0.5, -Ln / 2, g); box(W * 1.02, 0.14, Ln * 0.56, dark, 0, 0.44, 0, g);
    box(W * 0.5, 0.14, 0.04, dark, 0, 0.74, Ln / 2 + 0.01, g); box(0.5, 0.14, 0.03, M(0xf0f0f0), 0, 0.62, -Ln / 2 - 0.13, g);
    [-1, 1].forEach(sx => box(0.12, 0.12, 0.22, P_, sx * (W / 2 + 0.06), 1.06, Ln * 0.14, g));
    if (type === 'caas') { box(W * 1.01, 0.16, Ln * 0.9, M(0x1a3fa8), 0, 0.76, 0, g); box(1.3, 0.12, 0.4, dark, 0, 1.58, -0.2, g);
      const r = box(0.55, 0.22, 0.38, new THREE.MeshBasicMaterial({ color: 0xff2020 }), -0.33, 1.72, -0.2, g), b = box(0.55, 0.22, 0.38, new THREE.MeshBasicMaterial({ color: 0x2050ff }), 0.33, 1.72, -0.2, g); g.userData.bar = [r, b]; }
    if (type === 'follow') { const ct = ctex(64, 16, (x, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? '#111' : '#fff'; x.fillRect(i * 8, j * 8, 8, 8); } }); box(W * 0.9, 0.5, 0.12, new THREE.MeshLambertMaterial({ map: ct }), 0, 1.8, -0.3, g); box(W * 1.01, 0.18, Ln * 0.92, new THREE.MeshLambertMaterial({ map: ct }), 0, 0.78, 0, g); }
  } else if (type === 'van') {
    box(W, 1.85, Ln * 0.84, P_, 0, 1.38, -Ln * 0.08, g); box(W, 1.1, Ln * 0.18, P_, 0, 0.98, Ln * 0.41, g); box(W * 0.92, 0.7, 0.5, glassMat, 0, 1.85, Ln * 0.33, g);
    box(W * 1.01, 0.5, Ln * 0.22, glassMat, 0, 1.88, Ln * 0.18, g); box(W + 0.02, 0.3, Ln * 0.8, M(0xff8c1a), 0, 1.15, -Ln * 0.08, g); box(W * 1.02, 0.24, 0.22, dark, 0, 0.5, Ln / 2, g); box(W * 1.02, 0.24, 0.22, dark, 0, 0.5, -Ln / 2, g);
    const bc = box(0.3, 0.2, 0.3, amberMat, 0, 2.4, -Ln * 0.1, g); blinkers.push(bc);
  } else if (type === 'tug') { box(W, 0.8, Ln, P_, 0, 0.74, 0, g); box(W * 0.55, 0.85, 1.3, glassMat, 0, 1.56, -Ln * 0.28, g); box(W * 0.6, 0.08, 1.4, P_, 0, 2.02, -Ln * 0.28, g); box(W * 0.8, 0.3, 0.5, dark, 0, 0.55, Ln / 2, g);
    for (let i = 0; i < 6; i++) box(W / 6, 0.2, 0.06, i % 2 ? dark : M(0xf2c200), -W / 2 + W / 12 + i * W / 6, 0.85, Ln / 2 + 0.01, g); const bc = box(0.3, 0.2, 0.3, amberMat, 0, 2.15, -Ln * 0.28, g); blinkers.push(bc); }
  else if (type === 'truck') { box(W, 2.0, 2.2, paint(0xd8343a), 0, 1.5, Ln / 2 - 1.1, g); box(W * 0.9, 0.7, 0.1, glassMat, 0, 2.0, Ln / 2 + 0.01, g); box(W * 1.01, 0.5, 1.2, glassMat, 0, 2.0, Ln / 2 - 0.9, g);
    const t = cyl(1.15, 1.15, Ln - 2.8, paint(0xd9dde2, 0.8, 0.25), 0, 1.85, -1.3, g, 18); t.rotation.x = Math.PI / 2; box(W, 0.4, Ln, dark, 0, 0.62, 0, g); wz = Ln * 0.36; lightY = 0.9; }
  else if (type === 'cart') { box(W, 0.8, Ln, P_, 0, 0.75, 0, g); box(W * 0.8, 0.1, 1.4, dark, 0, 2.2, -0.3, g); [-1, 1].forEach(sx => box(0.08, 1.1, 0.08, dark, sx * W * 0.38, 1.65, 0.3, g)); wz = Ln * 0.3; }
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => wheel(sx * (W / 2 - 0.05), sz * wz, sz > 0));
  [-1, 1].forEach(sx => { box(0.4, 0.18, 0.06, headMat, sx * W * 0.32, lightY, Ln / 2 + 0.03, g); box(0.42, 0.18, 0.06, tailMat, sx * W * 0.32, lightY, -Ln / 2 - 0.03, g); });
  flat(W + 1.2, Ln + 1.4, blobMat, 0, 0.035, 0, g); flat(4.5, 9, beamMat, 0, 0.06, Ln / 2 + 5, g);
  g.userData.wheels = wheels; return shadowify(g);
}
function spawnVeh(type, x, z, h, driver, col) {
  const s = VT[type], v = { type, s, g: makeVehMesh(type, col), x, z, h, vx: 0, vz: 0, driver: driver || null, in: { thr: 0, steer: 0, hb: driver ? 0 : 1 }, steer: 0, r: s.wid / 2 * 1.02, off: Math.max(0, s.len / 2 - s.wid / 2), ai: { stuck: 0, rev: 0 }, crash: 0, hitCd: 0 };
  if (driver === 'npc' || driver === 'cop') { v.dg = makePerson({ shirt: driver === 'cop' ? 0x1a237e : undefined }); v.dg.scale.setScalar(0.85); v.dg.position.set(0, 0.55, 0.1); v.g.add(v.dg); }
  scene.add(v.g); vehicles.push(v); return v;
}
function removeVeh(v) { scene.remove(v.g); const i = vehicles.indexOf(v); if (i >= 0) vehicles.splice(i, 1); }
const fwdSpd = v => v.vx * Math.sin(v.h) + v.vz * Math.cos(v.h);
const spd = v => Math.hypot(v.vx, v.vz);
function stepVeh(v, dt) {
  const s = v.s, fx = Math.sin(v.h), fz = Math.cos(v.h), rx = -fz, rz = fx;
  let vf = v.vx * fx + v.vz * fz, vl = v.vx * rx + v.vz * rz;
  const { thr, steer, hb } = v.in, stun = v.ai.stun > 0 ? 0.35 : 1;
  if (thr > 0) { if (vf < -0.5) vf += 30 * dt; else if (vf < s.max * stun) vf += s.acc * thr * dt * (1 - 0.55 * vf / s.max); }
  else if (thr < 0) { if (vf > 0.5) vf -= 30 * dt * -thr; else if (vf > -s.max * 0.35) vf -= s.acc * 0.6 * -thr * dt; }
  else vf -= Math.sign(vf) * Math.min(Math.abs(vf), (1.6 + Math.abs(vf) * 0.12) * dt);
  if (hb) vf -= Math.sign(vf) * Math.min(Math.abs(vf), 9 * dt);
  v.steer += (steer - v.steer) * Math.min(1, dt * 8);
  v.h -= v.steer * s.turn * clamp(vf / 7, -1, 1) * (1 - 0.3 * Math.min(1, Math.abs(vf) / s.max)) * (hb ? 1.45 : 1) * dt;
  vl *= Math.exp(-(hb ? 1.6 : 9) * dt);
  const nfx = Math.sin(v.h), nfz = Math.cos(v.h); v.vx = nfx * vf - nfz * vl; v.vz = nfz * vf + nfx * vl;
  v.x += v.vx * dt; v.z += v.vz * dt;
  for (const o of [v.off, -v.off]) {
    const cx = v.x + Math.sin(v.h) * o, cz = v.z + Math.cos(v.h) * o, [px, pz] = pushOut(cx, cz, v.r);
    if (px || pz) { v.x += px; v.z += pz; const d = Math.hypot(px, pz), nx = px / d, nz = pz / d, vn = v.vx * nx + v.vz * nz; if (vn < 0) { v.vx -= 1.35 * vn * nx; v.vz -= 1.35 * vn * nz; v.crash = Math.max(v.crash, -vn); } }
  }
  if (v.ai.stun > 0) v.ai.stun -= dt; if (v.hitCd > 0) v.hitCd -= dt;
  v.g.position.set(v.x, 0, v.z); v.g.rotation.y = v.h; v.g.rotation.z = clamp(-v.steer * Math.abs(vf) * 0.004, -0.05, 0.05);
  v.slip = Math.abs(v.vx * -nfz + v.vz * nfx); v.vf = vf;
  const wl = v.g.userData.wheels; if (wl) for (const w of wl) { w.t.rotation.x += vf * dt / 0.42; if (w.front) w.pv.rotation.y = -v.steer * 0.45; }
}
function vehPairs() {
  for (let i = 0; i < vehicles.length; i++) for (let j = i + 1; j < vehicles.length; j++) {
    const a = vehicles[i], b = vehicles[j], R = (a.s.len + b.s.len) / 2 + 1;
    if (Math.abs(a.x - b.x) > R || Math.abs(a.z - b.z) > R) continue;
    for (const oa of [a.off, -a.off]) for (const ob of [b.off, -b.off]) {
      const ax = a.x + Math.sin(a.h) * oa, az = a.z + Math.cos(a.h) * oa, bx = b.x + Math.sin(b.h) * ob, bz = b.z + Math.cos(b.h) * ob;
      let dx = ax - bx, dz = az - bz, d = Math.hypot(dx, dz); const rr = a.r + b.r; if (d >= rr) continue; if (d < 1e-4) { dx = 1; dz = 0; d = 1; }
      const nx = dx / d, nz = dz / d, ov = rr - d, ma = a.s.mass, mb = b.s.mass, ia = 1 / ma, ib = 1 / mb;
      a.x += nx * ov * ia / (ia + ib); a.z += nz * ov * ia / (ia + ib); b.x -= nx * ov * ib / (ia + ib); b.z -= nz * ov * ib / (ia + ib);
      const vr = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
      if (vr < 0) { const jm = -(1.25) * vr / (ia + ib); a.vx += jm * ia * nx; a.vz += jm * ia * nz; b.vx -= jm * ib * nx; b.vz -= jm * ib * nz; onVehHit(a, b, -vr); }
    }
  }
}
const smokeTex = radialTex('rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'), smoke = [];
for (let i = 0; i < 80; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xdcdcdc, transparent: true, opacity: 0, depthWrite: false })); sp.visible = false; scene.add(sp); smoke.push({ sp, life: 0, max: 1, vx: 0, vy: 0, vz: 0, s0: 1 }); }
let smokeI = 0;
function puff(x, y, z, size = 1, col = 0xdcdcdc, life = 1.2, vy = 0.8) { const p = smoke[smokeI++ % smoke.length]; p.sp.position.set(x, y, z); p.sp.material.color.setHex(col); p.life = p.max = life; p.s0 = size; p.vx = rnd(-0.6, 0.6); p.vz = rnd(-0.6, 0.6); p.vy = vy; p.sp.visible = true; }
const skidGeo = new THREE.PlaneGeometry(0.3, 1); skidGeo.rotateX(-Math.PI / 2);
const skidMat = new THREE.MeshBasicMaterial({ color: 0x0c0c0c, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
const skids = []; for (let i = 0; i < 400; i++) { const m = new THREE.Mesh(skidGeo, skidMat); m.visible = false; m.position.y = 0.06; scene.add(m); skids.push(m); } let skidI = 0;
function vehFX(v, dt) {
  const s = spd(v); const sk = s > 5 && (v.slip > 3.2 || (v.in.hb && s > 7) || (v.in.thr < 0 && v.vf > 10));
  if (!sk) { v.lastSkid = null; return; }
  const fx = Math.sin(v.h), fz = Math.cos(v.h), rx = -fz, rz = fx, pts = [-1, 1].map(sx => [v.x + rx * sx * (v.s.wid / 2 - 0.1) - fx * v.s.len * 0.32, v.z + rz * sx * (v.s.wid / 2 - 0.1) - fz * v.s.len * 0.32]);
  if (v.lastSkid) pts.forEach((p, i) => { const q = v.lastSkid[i], dx = p[0] - q[0], dz = p[1] - q[1], d = Math.hypot(dx, dz); if (d < 0.05 || d > 4) return; const m = skids[skidI++ % skids.length]; m.visible = true; m.position.set((p[0] + q[0]) / 2, 0.06, (p[1] + q[1]) / 2); m.rotation.y = Math.atan2(dx, dz); m.scale.z = d; });
  v.lastSkid = pts; if (Math.random() < dt * 22) { const p = pts[Math.random() * 2 | 0]; puff(p[0], 0.4, p[1], 1.2, 0xe2e2e2, 1.3, 0.6); }
}
function updateFX(dt) {
  for (const p of smoke) { if (p.life <= 0) continue; p.life -= dt; const k = 1 - p.life / p.max; p.sp.position.x += p.vx * dt; p.sp.position.y += p.vy * dt; p.sp.position.z += p.vz * dt; p.sp.scale.setScalar(p.s0 * (1 + k * 3.5)); p.sp.material.opacity = 0.45 * (1 - k); if (p.life <= 0) p.sp.visible = false; }
  const bl = (now * 1.6 | 0) % 2 === 0; blinkers.forEach(b => { b.visible = bl; });
  seaTex.offset.x = (seaTex.offset.x + dt * 0.004) % 1; seaTex.offset.y = (seaTex.offset.y + dt * 0.002) % 1;
}
function onVehHit(a, b, s) {
  if (s > 4 && (a === P.veh || b === P.veh)) sfx.crash(s);
  if (s > 7) for (let i = 0; i < 4; i++) puff((a.x + b.x) / 2, 0.8, (a.z + b.z) / 2, 1.4, 0xb9a98e, 1, 1.2);
  for (const [me, other] of [[a, b], [b, a]]) {
    if (me !== P.veh) continue;
    if (other.driver === 'target' && s > 4 && other.hitCd <= 0) { other.hitCd = 0.7; other.ai.stun = 0.9; chaseHit(); }
    if (other.driver === 'cop' && s > 6 && spd(me) > spd(other) + 3 && heatCd <= 0) { heatCd = 3; addHeat(1, 'Ramming a CAAS vehicle'); }
    if (other.driver === 'npc' && s > 3 && Math.random() < 0.5) setTimeout(() => sfx.horn(), 300);
  }
}
function driveTo(v, tx, tz, target, dt) {
  const dx = tx - v.x, dz = tz - v.z, diff = wrap(Math.atan2(dx, dz) - v.h), sp = fwdSpd(v), ai = v.ai;
  if (ai.rev > 0) { ai.rev -= dt; v.in.thr = -1; v.in.steer = diff > 0 ? 1 : -1; v.in.hb = 0; return; }
  v.in.steer = clamp(-diff * 2.4, -1, 1); if (Math.abs(diff) > 0.9) target = Math.min(target, 9);
  v.in.thr = target <= 0.1 ? (sp > 0.5 ? -1 : 0) : sp < target - 1 ? 1 : sp > target + 2 ? -0.6 : 0.15; v.in.hb = 0;
  if (v.in.thr > 0 && Math.abs(sp) < 1.2) { ai.stuck += dt; if (ai.stuck > 1.3) { ai.rev = 1.1; ai.stuck = 0; } } else ai.stuck = Math.max(0, ai.stuck - dt);
}

/* ───────── traffic ───────── */
const cityNode = id => id % NZ >= 2, airNode = id => id % NZ <= 2;
function laneTarget(a, b) { const pa = npos(a), pb = npos(b), dx = pb.x - pa.x, dz = pb.z - pa.z, d = Math.hypot(dx, dz) || 1; return { x: pb.x + (dz / d) * 3.5, z: pb.z - (dx / d) * 3.5 }; }
function spawnTraffic(farOnly, air) {
  const ok = air ? airNode : cityNode, ids = shuffle([...Array(NX * NZ).keys()].filter(ok));
  for (const a of ids) {
    const nb = NB(a).filter(ok); if (!nb.length) continue; const b = nb[Math.random() * nb.length | 0], pa = npos(a), pb = npos(b), t = rnd(0.3, 0.7);
    const dx = pb.x - pa.x, dz = pb.z - pa.z, d = Math.hypot(dx, dz), x = pa.x + dx * t + (dz / d) * 3.5, z = pa.z + dz * t - (dx / d) * 3.5;
    if (farOnly && Math.hypot(x - P.x, z - P.z) < 110) continue;
    if (vehicles.some(v => Math.hypot(v.x - x, v.z - z) < 12)) continue;
    const v = spawnVeh(air ? (Math.random() < 0.5 ? 'cart' : 'tug') : (Math.random() < 0.12 ? 'van' : 'sedan'), x, z, Math.atan2(dx, dz), 'npc');
    v.ai.role = 'traffic'; v.ai.air = air; v.ai.prev = a; v.ai.next = b; v.ai.tgt = laneTarget(a, b); return v;
  }
}
function updateTraffic(v, dt) {
  const ai = v.ai, ok = ai.air ? airNode : cityNode;
  if (Math.hypot(ai.tgt.x - v.x, ai.tgt.z - v.z) < 5) { const nb = NB(ai.next).filter(n => ok(n) && n !== ai.prev); const n = nb.length ? nb[Math.random() * nb.length | 0] : ai.prev; ai.prev = ai.next; ai.next = n; ai.tgt = laneTarget(ai.prev, n); }
  const fx = Math.sin(v.h), fz = Math.cos(v.h); let block = false;
  const chk = (x, z) => { const dx = x - v.x, dz = z - v.z, al = dx * fx + dz * fz, lat = -dx * fz + dz * fx; if (al > 0 && al < v.s.len / 2 + 7 && Math.abs(lat) < 2.6) block = true; };
  for (const o of vehicles) if (o !== v) chk(o.x, o.z); for (const p of peds) if (p.state !== 'down') chk(p.x, p.z); if (!P.veh && !P.plane && !P.para) chk(P.x, P.z);
  if (block) { ai.blockT = (ai.blockT || 0) + dt; if (ai.blockT > 3 && Math.random() < dt) sfx.horn(); } else ai.blockT = 0;
  driveTo(v, ai.tgt.x, ai.tgt.z, block ? 0 : (ai.air ? 8 : 12), dt);
  if (block && ai.blockT > 6) { ai.rev = 0.8; ai.blockT = 0; }
}

/* ───────── pedestrians ───────── */
const peds = [];
function spawnPed(bx, bz) {
  const g = makePerson({ shirt: CAR_COLS[Math.random() * CAR_COLS.length | 0], pants: [0x2c3e50, 0x34495e, 0x7f6a55, 0x1b1b1b][Math.random() * 4 | 0] });
  const p = { g, bx, bz, t: rnd(0, 252), dir: Math.random() < 0.5 ? 1 : -1, sp: rnd(1.1, 1.8), ox: 0, oz: 0, ovx: 0, ovz: 0, state: 'walk', timer: 0, hitCd: 0, x: 0, z: 0, h: 0 };
  scene.add(g); peds.push(p); return p;
}
function pathPos(p) { const s = 31.5, side = 63, t = ((p.t % 252) + 252) % 252, k = Math.floor(t / side), u = t - k * side;
  return k === 0 ? [p.bx - s + u, p.bz - s] : k === 1 ? [p.bx + s, p.bz - s + u] : k === 2 ? [p.bx + s - u, p.bz + s] : [p.bx - s, p.bz + s - u]; }
function updatePeds(dt) {
  for (let i = peds.length - 1; i >= 0; i--) {
    const p = peds[i]; p.hitCd = Math.max(0, p.hitCd - dt);
    if (p.runner) { p.timer -= dt; p.x += Math.sin(p.h) * 5 * dt; p.z += Math.cos(p.h) * 5 * dt; const [px, pz] = pushOut(p.x, p.z, 0.4); p.x += px; p.z += pz; animPerson(p.g, dt, 5); p.g.position.set(p.x, 0, p.z); p.g.rotation.y = p.h; if (p.timer <= 0) { scene.remove(p.g); peds.splice(i, 1); } continue; }
    if (p.state === 'down') { p.timer -= dt; p.ox += p.ovx * dt; p.oz += p.ovz * dt; p.ovx *= Math.exp(-4 * dt); p.ovz *= Math.exp(-4 * dt); p.g.rotation.x = -Math.PI / 2 * Math.min(1, (4 - p.timer) * 4); p.g.position.y = 0.2; if (p.timer <= 0) { p.state = 'walk'; p.g.rotation.x = 0; p.g.position.y = 0; } }
    else {
      let moving = p.sp;
      if (p.state === 'stand') { p.timer -= dt; moving = 0; if (p.timer <= 0) p.state = 'walk'; } else { p.t += p.dir * p.sp * dt; if (Math.random() < dt * 0.04) { p.state = 'stand'; p.timer = rnd(1, 4); } }
      // flee fast vehicles
      for (const v of vehicles) { if (!v.driver || spd(v) < 8) continue; const dx = p.x - v.x, dz = p.z - v.z, d = Math.hypot(dx, dz); if (d < 9 && (dx * v.vx + dz * v.vz) > 0) { const s = (dx * v.vz - dz * v.vx) > 0 ? 1 : -1; p.ovx += -v.vz / spd(v) * s * 14 * dt; p.ovz += v.vx / spd(v) * s * 14 * dt; moving = 4; } }
      p.ox += p.ovx * dt; p.oz += p.ovz * dt; p.ovx *= Math.exp(-3 * dt); p.ovz *= Math.exp(-3 * dt);
      const om = Math.hypot(p.ox, p.oz); if (om > 4.5) { p.ox *= 4.5 / om; p.oz *= 4.5 / om; } if (Math.hypot(p.ovx, p.ovz) < 0.3) { p.ox *= Math.exp(-0.8 * dt); p.oz *= Math.exp(-0.8 * dt); }
      animPerson(p.g, dt, moving);
    }
    const [x, z] = pathPos(p), nx = x + p.ox, nz = z + p.oz; if (p.state !== 'down') { const dx = nx - p.x, dz = nz - p.z; if (dx * dx + dz * dz > 1e-4) p.h = Math.atan2(dx, dz); }
    p.x = nx; p.z = nz; p.g.position.x = p.x; p.g.position.z = p.z; p.g.rotation.y = p.h;
    // vehicle impacts
    if (p.state === 'down') continue;
    for (const v of vehicles) {
      const s = spd(v); for (const o of [v.off, -v.off, 0]) { const cx = v.x + Math.sin(v.h) * o, cz = v.z + Math.cos(v.h) * o, dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
        if (d < v.r + 0.4) { if (s > 4) { p.state = 'down'; p.timer = 4; p.ovx = v.vx * 0.6 + dx / d * 3; p.ovz = v.vz * 0.6 + dz / d * 3; if (v === P.veh && p.hitCd <= 0) { p.hitCd = 5; save.stats.peds++; sfx.hit(); addHeat(1, 'Pedestrian struck – reckless driving'); } }
          else { p.ox += dx / d * (v.r + 0.4 - d); p.oz += dz / d * (v.r + 0.4 - d); } break; } }
      if (p.state === 'down') break;
    }
  }
}
function runner(x, z, from) { const g = makePerson({}); scene.add(g); peds.push({ g, x, z, h: Math.atan2(x - from.x, z - from.z), runner: true, timer: 7, state: 'walk', hitCd: 0, ox: 0, oz: 0 }); }

/* ───────── player ───────── */
const P = { x: 0, z: 0, h: 0, veh: null, st: 100, winded: false, run: false, g: makePerson({ shirt: 0xff8c1a, vest: 0xd4ff3a, hat: 0xffffff, skin: 0xe0ac69, pants: 0x1f2a3a }) };
scene.add(P.g);
const pSpeed = () => P.plane ? P.plane.s : P.para ? 99 : P.veh ? spd(P.veh) : P.footSp || 0;
let mode = 'title';
const keys = {}, joy = { x: 0, y: 0 };
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return; keys[e.code] = true;
  if (mode === 'cut' && subAdvance && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); subAdvance(); return; }
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  if (mode === 'menu' && ['Escape', 'KeyP', 'KeyM', 'KeyN'].includes(e.code)) { closeMenu(); return; }
  if (mode !== 'play') return;
  if (e.code === 'KeyF') enterExit(); else if (e.code === 'KeyH') { if (P.veh) sfx.horn(); }
  else if (e.code === 'KeyC') { save.cam = (save.cam + 1) % 3; persist(); toast(['Camera: chase', 'Camera: far', 'Camera: classic top-down'][save.cam]); }
  else if (e.code === 'KeyR' && P.veh) { save.radio = (save.radio + 1) % 3; persist(); showVehName(); if (save.radio !== 2 && window.speechSynthesis) speechSynthesis.cancel(); }
  else if (e.code === 'Escape' || e.code === 'KeyP' || e.code === 'Tab') openMenu('missions'); else if (e.code === 'KeyM') openMenu('map'); else if (e.code === 'KeyN') openMenu('notebook');
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
canvas.addEventListener('wheel', e => { camZoom = clamp(camZoom + Math.sign(e.deltaY) * 0.12, 0.6, 1.8); }, { passive: true });
addEventListener('click', e => { if (mode === 'cut' && subAdvance && !e.target.closest('#ui,#subnav')) subAdvance(); });
if (TOUCH) {
  document.body.classList.add('touch'); $('touch').classList.remove('hidden');
  const stick = $('stick'), knob = $('knob'); let sid = null;
  const sm = t => { const r = stick.getBoundingClientRect(); let dx = t.clientX - r.left - 65, dy = t.clientY - r.top - 65; const m = Math.hypot(dx, dy); if (m > 48) { dx *= 48 / m; dy *= 48 / m; } joy.x = dx / 48; joy.y = dy / 48; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  stick.addEventListener('touchstart', e => { e.preventDefault(); au(); sid = e.changedTouches[0].identifier; sm(e.changedTouches[0]); }, { passive: false });
  stick.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === sid) sm(t); }, { passive: false });
  const se = e => { for (const t of e.changedTouches) if (t.identifier === sid) { sid = null; joy.x = joy.y = 0; knob.style.transform = ''; } };
  stick.addEventListener('touchend', se); stick.addEventListener('touchcancel', se);
  const hold = (id, dn, up) => { const el = $(id); el.addEventListener('touchstart', e => { e.preventDefault(); au(); dn(); }, { passive: false }); el.addEventListener('touchend', () => up && up()); el.addEventListener('touchcancel', () => up && up()); };
  hold('tR', () => { touchRun = true; }, () => { touchRun = false; });
  hold('tUp', () => { keys.ArrowUp = true; }, () => { keys.ArrowUp = false; }); hold('tDn', () => { keys.ArrowDown = true; }, () => { keys.ArrowDown = false; });
  hold('tF', () => mode === 'play' && enterExit()); hold('tB', () => { keys.Space = true; }, () => { keys.Space = false; }); hold('tH', () => P.veh && sfx.horn());
  hold('tM', () => mode === 'play' && openMenu('missions')); hold('tC', () => { save.cam = (save.cam + 1) % 3; persist(); });
}
function nearVeh() { let b = null, bd = 1e9; for (const v of vehicles) { const d = Math.hypot(v.x - P.x, v.z - P.z) - v.s.len / 2; if (d < 2.6 && d < bd) { bd = d; b = v; } } return b; }
function enterExit() {
  if (P.para) { if (!P.para.open) openChute(false); return; }
  if (P.plane) { planeExit(); return; }
  if (P.veh) {
    const v = P.veh; if (spd(v) > 6) { toast('Slow down to get out.'); return; }
    const fx = Math.sin(v.h), fz = Math.cos(v.h);
    for (const side of [1, -1]) { const x = v.x + fz * side * (v.s.wid / 2 + 1), z = v.z - fx * side * (v.s.wid / 2 + 1), [px, pz] = pushOut(x, z, 0.45); if (Math.abs(px) + Math.abs(pz) < 0.5 || side === -1) { P.x = x + px; P.z = z + pz; break; } }
    P.h = v.h; v.driver = null; v.in = { thr: 0, steer: 0, hb: 1 }; P.veh = null; P.g.visible = true; sfx.door(); $('speed').classList.add('hidden'); if (window.speechSynthesis) speechSynthesis.cancel(); return;
  }
  const v = nearVeh(), np = nearPlane();
  if (np && (!v || np.d < Math.hypot(v.x - P.x, v.z - P.z) - v.s.len / 2)) { boardPlane(np.p); return; }
  if (!v) return;
  if (v.driver === 'target') { toast("That's the getaway vehicle – <b>ram it</b> from another vehicle!"); return; }
  if (v.driver === 'npc' || v.driver === 'cop') {
    runner(v.x + Math.cos(v.h) * 2, v.z - Math.sin(v.h) * 2, P); if (v.dg) { v.g.remove(v.dg); v.dg = null; }
    save.stats.jacked++; addHeat(v.driver === 'cop' || v.type === 'caas' ? 2 : 1, v.driver === 'cop' ? 'Taking a CAAS vehicle!' : 'Unauthorised vehicle use');
    if (v.driver === 'cop') { const i = cops.indexOf(v); if (i >= 0) cops.splice(i, 1); }
  } else if (v.type === 'caas') addHeat(2, 'Taking a CAAS vehicle!');
  v.driver = 'player'; v.ai = { stuck: 0, rev: 0 }; v.in.hb = 0; P.veh = v; P.g.visible = false; sfx.door(); loops(); showVehName(); $('speed').classList.remove('hidden');
  if (!save.tipDrive) { save.tipDrive = 1; persist(); help(TOUCH ? 'Stick: steer & throttle · BRAKE: handbrake · ENTER/EXIT to get out.' : '<kbd>W</kbd> accelerate · <kbd>S</kbd> brake/reverse · <kbd>A</kbd><kbd>D</kbd> steer · <kbd>Space</kbd> handbrake · <kbd>H</kbd> horn · <kbd>R</kbd> radio · <kbd>C</kbd> camera', 7000); }
}
let touchRun = false;
function hudStam() { const el = $('stam'), show = !P.veh && (P.run || P.st < 99.5); el.classList.toggle('hidden', !show); if (show) { $('stamF').style.width = P.st + '%'; el.classList.toggle('winded', P.winded); } }
function showVehName() { if (!P.veh) return; $('vehN').textContent = P.veh.s.name; $('vehR').textContent = STATIONS[save.radio]; $('veh').style.opacity = 1; clearTimeout(showVehName.t); showVehName.t = setTimeout(() => { $('veh').style.opacity = 0; }, 3000); talkT = 2; }
function updatePlayer(dt) {
  if (P.plane) { flyPlayer(dt); return; }
  if (P.para) { updatePara(dt); return; }
  const up = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - joy.y, rt = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
  if (P.veh) { const v = P.veh; v.in.thr = clamp(up, -1, 1); v.in.steer = clamp(rt, -1, 1); v.in.hb = keys.Space ? 1 : 0; P.x = v.x; P.z = v.z; P.h = v.h; $('prompt').classList.add('hidden'); $('stam').classList.add('hidden'); return; }
  const fwd = clamp(up, -1, 1), wantRun = (keys.ShiftLeft || keys.ShiftRight || touchRun || Math.hypot(joy.x, joy.y) > 0.96) && fwd > 0.3;
  P.run = false;
  if (wantRun && !P.winded && P.st > 0) { P.run = true; P.st = Math.max(0, P.st - 17 * dt); if (P.st <= 0) { P.winded = true; toast('Out of breath – catch it for a moment.'); } }
  else { P.st = Math.min(100, P.st + (fwd > 0.3 ? 12 : 22) * dt); if (P.winded && P.st > 35) P.winded = false; }
  if (!wantRun && fwd > 0.3 && !save.tipRun && now > 4) { save.tipRun = 1; persist(); help(TOUCH ? 'Push the stick all the way, or hold <b>RUN</b>, to sprint.' : 'Hold <kbd>Shift</kbd> to <b>run</b>. Watch your stamina bar.', 6000); }
  P.h -= clamp(rt, -1, 1) * (P.run ? 2.5 : 3.2) * dt; const sp = fwd > 0 ? fwd * (P.run ? 10.5 : 5.2) : fwd * 3.2; P.footSp = Math.abs(sp);
  P.x += Math.sin(P.h) * sp * dt; P.z += Math.cos(P.h) * sp * dt;
  for (const v of vehicles) for (const o of [v.off, -v.off]) { const cx = v.x + Math.sin(v.h) * o, cz = v.z + Math.cos(v.h) * o, dx = P.x - cx, dz = P.z - cz, d = Math.hypot(dx, dz), r = v.r + 0.45; if (d < r && d > 1e-4) { P.x += dx / d * (r - d); P.z += dz / d * (r - d); } }
  const [px, pz] = pushOut(P.x, P.z, 0.45); P.x += px; P.z += pz;
  P.g.position.set(P.x, 0, P.z); P.g.rotation.y = P.h; animPerson(P.g, dt, Math.abs(sp), P.run); hudStam();
  if (P.run && Math.random() < dt * 6) puff(P.x, 0.2, P.z, 0.5, 0xc8bca4, 0.6, 0.3);
  const nv = nearVeh(), np = nearPlane(), pr = $('prompt');
  if (np && mode === 'play' && (!nv || np.d < Math.hypot(nv.x - P.x, nv.z - P.z) - nv.s.len / 2)) { pr.classList.remove('hidden'); pr.innerHTML = `${TOUCH ? 'Tap <b>ENTER</b>' : 'Press <span class="k">F</span>'} to fly <b>${np.p.reg}</b> (${np.p.type})${np.p.T.heat ? ' <span style="color:#ff4b4b">(★★ heat)</span>' : ''}`; }
  else if (nv && mode === 'play') { pr.classList.remove('hidden'); pr.innerHTML = `${TOUCH ? 'Tap <b>ENTER</b>' : 'Press <span class="k">F</span>'} to ${nv.driver === 'npc' || nv.driver === 'cop' ? 'take' : 'enter'} the <b>${nv.s.name}</b>${nv.driver === 'npc' ? ' <span style="color:#ff4b4b">(★ heat)</span>' : nv.type === 'caas' ? ' <span style="color:#ff4b4b">(★★ heat)</span>' : ''}`; }
  else pr.classList.add('hidden');
}

/* ───────── aircraft: flying & parachute ───────── */
const PT = {
  light: { name: 'LIGHT AIRCRAFT', stall: 17, max: 55, acc: 9, pitch: 1.0, roll: 2.2, turn: 1.0, heat: 0 },
  a320:  { name: 'AIRBUS A320', stall: 34, max: 95, acc: 7.5, pitch: 0.62, roll: 1.4, turn: 0.75, heat: 2 },
  heavy: { name: 'WIDEBODY JET', stall: 38, max: 100, acc: 6.5, pitch: 0.52, roll: 1.1, turn: 0.65, heat: 2 },
  heli:  { name: 'HELICOPTER', heli: true, stall: 0, max: 34, heat: 0 }
};
PLANES.forEach(pl => { Object.assign(pl, { x: pl.home.x, z: pl.home.z, y: 0, h: 0, p: 0, r: 0, s: 0, thr: 0, vy: 0, vx: 0, vz: 0, rpm: 0, landed: true, state: 'parked', T: PT[pl.spec], t: 0 }); pl.g.rotation.order = 'YXZ'; });
function placePlane(pl) { pl.g.position.set(pl.x, pl.y, pl.z); pl.g.rotation.set(-pl.p, pl.h, pl.r); pl.lb.position.set(pl.x, pl.y + pl.lbY, pl.z); pl.lb.visible = pl.state === 'parked'; }
function resetPlane(pl) { Object.assign(pl, { x: pl.home.x, z: pl.home.z, y: 0, h: 0, p: 0, r: 0, s: 0, thr: 0, vy: 0, vx: 0, vz: 0, rpm: 0, landed: true, state: 'parked', t: 0 }); pl.g.visible = true; pl.cols.forEach(c => { c.off = false; }); placePlane(pl); }
function nearPlane() {
  let b = null;
  for (const pl of PLANES) {
    if (pl.y > 0.5 || pl.state === 'wreck' || pl.state === 'bail' || pl.state === 'player') continue;
    const fx = Math.sin(pl.h), fz = Math.cos(pl.h), dx = P.x - pl.x, dz = P.z - pl.z, al = clamp(dx * fx + dz * fz, -pl.len / 2, pl.len / 2), d = Math.hypot(P.x - (pl.x + fx * al), P.z - (pl.z + fz * al)) - pl.fusR;
    if (d < 3 && (!b || d < b.d)) b = { p: pl, d };
  }
  return b;
}
function boardPlane(pl) {
  if (MS) { toast('Aircraft are grounded while you are on a job – finish the mission first.'); return; }
  P.plane = pl; pl.state = 'player'; pl.cols.forEach(c => { c.off = true; }); P.g.visible = false; loops(); sfx.door(); placePlane(pl);
  $('speed').classList.remove('hidden'); $('vehN').textContent = `${pl.T.name} · ${pl.reg}`; $('vehR').textContent = ''; $('veh').style.opacity = 1; clearTimeout(showVehName.t); showVehName.t = setTimeout(() => { $('veh').style.opacity = 0; }, 3000);
  if (pl.T.heat) addHeat(pl.T.heat, 'Moving an airliner with no CRS and no crew – CAAS is coming!');
  else toast('Pre-flight check: tech log reviewed, CRS signed, C of A valid – <b>cleared to fly</b>.', 5000);
  if (pl.T.heli) { help(TOUCH ? 'Stick: fly forward / back and turn · <b>▲ UP</b> / <b>▼ DOWN</b>: climb and descend · <b>ENTER/EXIT</b> in the air: parachute'
    : '<kbd>↑</kbd> / <kbd>Space</kbd> climb · <kbd>↓</kbd> / <kbd>Shift</kbd> descend · <kbd>W</kbd>/<kbd>S</kbd> forward / back · <kbd>A</kbd><kbd>D</kbd> turn · <kbd>←</kbd><kbd>→</kbd> strafe · <kbd>F</kbd> in the air: parachute. Wait for the rotor to spin up.', 11000); return; }
  help(TOUCH ? 'Stick up/down: climb / dive · stick left/right: bank · throttle is automatic – hold <b>BRAKE</b> to slow · <b>ENTER/EXIT</b> in the air: parachute'
    : '<kbd>W</kbd>/<kbd>S</kbd> throttle · <kbd>↑</kbd> climb · <kbd>↓</kbd> dive · <kbd>A</kbd><kbd>D</kbd> bank / steer · <kbd>Space</kbd> wheel brakes · <kbd>F</kbd> in the air: bail out with a parachute', 10000);
}
function flyPlayer(dt) {
  const pl = P.plane;
  if (pl.T.heli) {
    heliStep(pl, dt, { fwd: clamp((keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) - joy.y, -1, 1), turn: clamp((keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + joy.x, -1, 1),
      strafe: (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0), lift: (keys.ArrowUp || keys.Space ? 1 : 0) - (keys.ArrowDown || keys.ShiftLeft || keys.ShiftRight ? 1 : 0) });
    if (P.plane) { P.x = pl.x; P.z = pl.z; P.h = pl.h; }
    $('prompt').classList.add('hidden'); $('stam').classList.add('hidden'); return;
  }
  let thrD = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
  const pitch = clamp((keys.ArrowUp || keys.KeyI ? 1 : 0) - (keys.ArrowDown || keys.KeyK ? 1 : 0) - joy.y, -1, 1), roll = clamp((keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x, -1, 1);
  if (TOUCH) thrD = keys.Space ? -1 : 1;
  flyStep(pl, dt, { thrD, pitch, roll, brake: !!keys.Space });
  if (P.plane) { P.x = pl.x; P.z = pl.z; P.h = pl.h; }
  $('prompt').classList.add('hidden'); $('stam').classList.add('hidden');
}
function flyStep(pl, dt, c) {
  const T = pl.T, gnd = pl.y <= 0.01, px = pl.x, pz = pl.z;
  pl.thr = clamp(pl.thr + c.thrD * dt * 0.7, 0, 1);
  let acc = pl.thr * T.acc - T.acc * (pl.s / T.max) ** 2;
  if (gnd) acc -= pl.s > 0.1 ? (c.brake ? 12 : 0.6) : 0; else acc -= Math.sin(pl.p) * 6;
  pl.s = Math.max(0, pl.s + acc * dt);
  const lift = pl.s >= T.stall;
  if (gnd) {
    pl.r += -pl.r * Math.min(1, dt * 4);
    if (lift && c.pitch > 0) pl.p = Math.min(0.3, pl.p + c.pitch * T.pitch * 0.7 * dt); else pl.p = Math.max(0, pl.p - dt * 0.6);
    pl.h -= c.roll * 0.8 * clamp(pl.s / 6, 0.2, 1) * (pl.s > T.stall * 0.6 ? 0.35 : 1) * dt;
  } else {
    pl.p = clamp(pl.p + c.pitch * T.pitch * dt * 0.9 - (lift ? 0 : dt * 0.7), -0.75, 0.6);
    pl.r += (c.roll * 0.95 - pl.r) * Math.min(1, dt * T.roll);
    pl.h -= Math.sin(pl.r) * T.turn * (1.2 - Math.min(0.6, pl.s / 200)) * dt;
  }
  const vh = pl.s * Math.cos(pl.p); let vy = pl.s * Math.sin(pl.p); if (!gnd && !lift) vy -= 9 * (1 - pl.s / T.stall) + 2;
  if (gnd && vy < 0) vy = 0;
  pl.x += Math.sin(pl.h) * vh * dt; pl.z += Math.cos(pl.h) * vh * dt; pl.y = Math.min(450, pl.y + vy * dt); pl.vy = vy;
  if (pl.y >= 450) pl.p = Math.min(pl.p, 0);
  const sea = !onLand(pl.x, pl.z);
  if (pl.y <= 0) {
    if (!gnd && (vy < -8 || Math.abs(pl.r) > 0.5 || pl.p < -0.35 || sea)) { crashPlane(pl, sea); return; }
    if (!gnd && pl === P.plane) { toast('<b style="color:#5fe36a">Touchdown.</b>'); sfx.ok(); }
    pl.y = 0; if (sea) { pl.x = px; pl.z = pz; pl.s = 0; }
  }
  // stay within Vista Bay airspace
  const far = Math.hypot(pl.x - 280, pl.z + 30);
  if (far > 900 && !gnd) { const want = Math.atan2(280 - pl.x, -(pl.z + 30)); pl.h += wrap(want - pl.h) * Math.min(1, dt * 0.8); if (pl === P.plane && !pl.warn) { pl.warn = 1; toast('Leaving Vista Bay airspace – turning back.'); } } else pl.warn = 0;
  // obstacles: nose, tail and wingtips
  const ch = Math.cos(pl.h), sh = Math.sin(pl.h);
  for (const [lx, lz] of [[0, pl.len / 2], [0, -pl.len / 2], [pl.span / 2, pl.wingZ], [-pl.span / 2, pl.wingZ]]) {
    const wx = pl.x + lx * ch + lz * sh, wz = pl.z - lx * sh + lz * ch;
    for (const k of COL) {
      if (k.off || pl.cols.includes(k) || pl.y > k.h || wx < k.x0 || wx > k.x1 || wz < k.z0 || wz > k.z1) continue;
      if (pl.s > 14 || pl.y > 2) { crashPlane(pl, false); return; }
      pl.x = px; pl.z = pz; pl.s = 0; break;
    }
  }
  placePlane(pl);
}
const flashS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffa040, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); flashS.visible = false; scene.add(flashS); let flashT = 0;
function boom(x, y, z, sea) {
  sfx.hit(); noise(1.2, 0.35, 260); flashS.position.set(x, y + 2, z); flashS.visible = !sea; flashT = 0.6;
  for (let i = 0; i < 22; i++) puff(x + rnd(-5, 5), y + rnd(0, 4), z + rnd(-5, 5), rnd(2, 4.5), sea ? 0xffffff : (i % 3 ? 0x2a2a2a : 0xff8a2a), rnd(1.6, 3.2), rnd(1, 5));
}
function crashPlane(pl, sea) {
  boom(pl.x, Math.max(1, pl.y), pl.z, sea); pl.state = 'wreck'; pl.t = 12; pl.g.visible = false; pl.lb.visible = false; pl.s = 0; pl.thr = 0;
  if (P.plane !== pl) return;
  P.plane = null; P.x = pl.x; P.z = pl.z; mode = 'cut'; sfx.fail(); big('CRASHED', sea ? 'Ditched in the sea' : 'The aircraft is a write-off', 'fail', 2800);
  setTimeout(() => { const t = L('training'); P.x = t.x; P.z = t.z + 4; P.h = 0; P.g.visible = true; P.g.position.set(P.x, 0, P.z); camSnap = true; $('speed').classList.add('hidden'); mode = 'play';
    toast('Patched up at the Training Centre. Land with the speed up, wings level and a gentle descent.', 6000); }, 2600);
}
function groundAt(pl, x, z) {
  let g = 0;
  for (const k of COL) { if (k.off || pl.cols.includes(k) || x < k.x0 || x > k.x1 || z < k.z0 || z > k.z1 || (k.x1 - k.x0) * (k.z1 - k.z0) < 4) continue; if (k.h <= pl.y + 1 && k.h > g) g = k.h; }
  return g;
}
function heliStep(pl, dt, c) {
  pl.rpm = clamp(pl.rpm + (c.abandon ? -0.2 : 0.45) * dt, 0, 1);
  const px = pl.x, pz = pl.z, ready = pl.rpm > 0.85, gh0 = groundAt(pl, pl.x, pl.z), onG = pl.y <= gh0 + 0.02;
  if (!ready && !c.abandon && pl === P.plane && !pl.spinMsg) { pl.spinMsg = 1; toast('Rotor spinning up…'); }
  if (ready) pl.spinMsg = 0;
  const tvy = c.abandon ? -12 * (1 - pl.rpm * 0.5) : !ready ? (onG ? 0 : -3) : c.lift > 0 ? c.lift * 9 : c.lift * 7;
  pl.vy += (tvy - pl.vy) * Math.min(1, dt * 2.2);
  const air = !onG || pl.vy > 0.5, fx = Math.sin(pl.h), fz = Math.cos(pl.h), rx = -fz, rz = fx;
  const df = air && ready ? c.fwd * (c.fwd > 0 ? 34 : 12) : 0, ds = air && ready ? c.strafe * 12 : 0, k = Math.min(1, dt * (air ? 0.9 : 4));
  pl.vx += (fx * df + rx * ds - pl.vx) * k; pl.vz += (fz * df + rz * ds - pl.vz) * k;
  if (ready || !onG) pl.h -= c.turn * 1.5 * dt;
  pl.x += pl.vx * dt; pl.z += pl.vz * dt; pl.y = Math.min(300, pl.y + pl.vy * dt); pl.s = Math.hypot(pl.vx, pl.vz);
  const lf = pl.vx * fx + pl.vz * fz, ls = pl.vx * rx + pl.vz * rz;
  pl.p += (-lf / 34 * 0.3 - pl.p) * Math.min(1, dt * 3); pl.r += (ls / 12 * 0.25 + c.turn * 0.12 * (air ? 1 : 0) - pl.r) * Math.min(1, dt * 3);
  // airspace
  const far = Math.hypot(pl.x - 280, pl.z + 30); if (far > 900) { pl.vx -= (pl.x - 280) / far * 20 * dt; pl.vz -= (pl.z + 30) / far * 20 * dt; if (pl === P.plane && !pl.warn) { pl.warn = 1; toast('Leaving Vista Bay airspace – turn back.'); } } else pl.warn = 0;
  // ground / rooftops / sea
  const gh = groundAt(pl, pl.x, pl.z), sea = !onLand(pl.x, pl.z);
  if (pl.y <= gh) {
    if (sea && gh === 0) { crashPlane(pl, true); return; }
    if (pl.vy < -7.5 || pl.s > 14) { crashPlane(pl, false); return; }
    if (!pl.landed && pl === P.plane) { toast(gh > 0 ? '<b style="color:#5fe36a">Rooftop landing!</b>' : '<b style="color:#5fe36a">Touchdown.</b>'); sfx.ok(); }
    pl.y = gh; pl.vy = Math.max(0, pl.vy); pl.vx *= Math.exp(-6 * dt); pl.vz *= Math.exp(-6 * dt); pl.p *= 0.8; pl.r *= 0.8; pl.landed = true;
  } else pl.landed = false;
  // nose, tail and rotor tips against anything taller than us
  const ch = Math.cos(pl.h), sh = Math.sin(pl.h);
  for (const [lx, lz, dy] of [[0, 2.9, 1.5], [0, -6.3, 2.9], [5.3, 0.3, 3.5], [-5.3, 0.3, 3.5], [0, 5.6, 3.5]]) {
    const wx = pl.x + lx * ch + lz * sh, wz = pl.z - lx * sh + lz * ch, wy = pl.y + dy;
    for (const q of COL) {
      if (q.off || pl.cols.includes(q) || wy > q.h + 0.2 || pl.y >= q.h - 0.6 || wx < q.x0 || wx > q.x1 || wz < q.z0 || wz > q.z1) continue;
      if (pl.s > 10 || pl.vy < -8) { crashPlane(pl, false); return; }
      pl.x = px; pl.z = pz; pl.vx = pl.vz = 0; break;
    }
  }
  placePlane(pl);
}
function planeExit() {
  const pl = P.plane;
  if (pl.T.heli ? pl.landed : pl.y <= 0.01) {
    if (pl.s > 6) { toast('Slow down before getting out – hold <kbd>Space</kbd> for the brakes.'); return; }
    P.plane = null; pl.state = 'away'; pl.thr = 0; pl.s = 0; const off = pl.fusR + (pl.spec === 'light' ? 1.4 : 2.5);
    P.x = pl.x + Math.cos(pl.h) * off; P.z = pl.z - Math.sin(pl.h) * off; const [qx, qz] = pushOut(P.x, P.z, 0.45); P.x += qx; P.z += qz; P.h = pl.h;
    P.g.visible = true; P.g.position.set(P.x, 0, P.z); sfx.door(); $('speed').classList.add('hidden'); placePlane(pl);
    if (pl.y > 0.5) toast('You take the stairs down to the street.'); return;
  }
  if (pl.y - (pl.T.heli ? groundAt(pl, pl.x, pl.z) : 0) < 15) { toast('Too low to bail out – climb above 15 m, or land.'); return; }
  P.plane = null; pl.state = 'bail';
  P.para = { x: pl.x - Math.sin(pl.h) * 3, y: pl.y - 2, z: pl.z - Math.cos(pl.h) * 3, h: pl.h, vx: Math.sin(pl.h) * pl.s * 0.4, vz: Math.cos(pl.h) * pl.s * 0.4, vy: 0, open: 0 };
  P.g.visible = true; sfx.door(); noise(0.7, 0.12, 2500); big('BAIL OUT!', TOUCH ? 'Tap ENTER/EXIT to open the parachute' : 'Press F to open the parachute', '', 2400);
}
const chute = (() => {
  const g = new THREE.Group(), t = ctex(256, 64, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ff8c1a' : '#ffffff'; x.fillRect(i * 32, 0, 32, h); } });
  const can = new THREE.Mesh(new THREE.SphereGeometry(3.4, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2.4), new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide })); can.scale.y = 0.5; can.position.y = 4.4; g.add(can);
  const pts = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; pts.push(new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(Math.cos(a) * 3.0, 4.6, Math.sin(a) * 3.0)); }
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x333333 })));
  g.visible = false; scene.add(g); return g;
})();
function openChute(auto) { const q = P.para; if (!q || q.open) return; q.open = 0.02; noise(0.4, 0.15, 900); sfx.ok(); toast(auto ? 'Parachute auto-deployed at 45 m.' : (TOUCH ? 'Parachute open – stick to steer and glide.' : 'Parachute open – <kbd>A</kbd><kbd>D</kbd> steer · <kbd>W</kbd>/<kbd>S</kbd> glide faster / slower.'), 4500); }
function updatePara(dt) {
  const q = P.para, f = clamp((keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - joy.y, -1, 1), t = clamp((keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x, -1, 1), u = P.g.userData;
  if (!q.open) {
    q.vy = Math.max(-48, q.vy - 9.8 * dt); q.vx *= Math.exp(-0.6 * dt); q.vz *= Math.exp(-0.6 * dt); q.h -= t * 1.5 * dt;
    q.vx += Math.sin(q.h) * Math.max(0, f) * 4 * dt; q.vz += Math.cos(q.h) * Math.max(0, f) * 4 * dt;
    if (q.y < 45) openChute(true);
    u.armL.rotation.x = u.armR.rotation.x = -1.4; u.armL.rotation.z = 0.6; u.armR.rotation.z = -0.6; u.legL.rotation.x = 0.3; u.legR.rotation.x = -0.3;
  } else {
    q.open = Math.min(1, q.open + dt * 2.5); q.vy += (-4.2 - q.vy) * Math.min(1, dt * 2); q.h -= t * 1.1 * dt;
    const fs = 7 + f * 3.5; q.vx += (Math.sin(q.h) * fs - q.vx) * Math.min(1, dt * 1.5); q.vz += (Math.cos(q.h) * fs - q.vz) * Math.min(1, dt * 1.5);
    u.armL.rotation.x = u.armR.rotation.x = -2.9; u.armL.rotation.z = u.armR.rotation.z = 0; u.legL.rotation.x = u.legR.rotation.x = 0;
  }
  q.x += q.vx * dt; q.z += q.vz * dt; q.y += q.vy * dt; P.x = q.x; P.z = q.z; P.h = q.h;
  P.g.position.set(q.x, Math.max(0, q.y), q.z); P.g.rotation.y = q.h; P.g.rotation.x = q.open ? 0 : 1.25;
  chute.visible = !!q.open; chute.position.set(q.x, Math.max(0, q.y), q.z); chute.rotation.y = q.h; chute.scale.setScalar(Math.max(0.05, q.open));
  $('speed').innerHTML = `ALT ${Math.max(0, Math.round(q.y))}<small> M · ${q.open ? 'CANOPY OPEN' : 'FREEFALL'}</small>`; $('speed').classList.remove('hidden');
  $('prompt').classList.add('hidden'); $('stam').classList.add('hidden');
  if (q.y <= 0) endPara(true);
}
function endPara(landed) {
  const q = P.para; if (!q) return; P.para = null; chute.visible = false; const u = P.g.userData;
  P.g.rotation.x = 0; u.armL.rotation.set(0, 0, 0); u.armR.rotation.set(0, 0, 0); u.legL.rotation.x = u.legR.rotation.x = 0;
  const [qx, qz] = pushOut(q.x, q.z, 0.45); P.x = q.x + qx; P.z = q.z + qz; P.g.position.set(P.x, 0, P.z); P.footSp = 0; $('speed').classList.add('hidden');
  if (!landed) return;
  const sea = !onLand(q.x, q.z);
  puff(P.x, 0.3, P.z, 1.5, 0xc8bca4, 1, 0.5); toast(sea ? 'Splashdown! You swam back to shore.' : '<b style="color:#5fe36a">Nice landing.</b>', 3500);
}
function updatePlanes(dt) {
  for (const pl of PLANES) {
    if (pl.T.heli) { pl.rotor.rotation.y += pl.rpm * dt * 38; pl.tr.rotation.x += pl.rpm * dt * 60; pl.disc.material.opacity = pl.rpm * 0.16; if (pl.state !== 'player' && pl.state !== 'bail') pl.rpm = Math.max(0, pl.rpm - dt * 0.25); }
    if (pl.state === 'bail' && pl.T.heli) { heliStep(pl, dt, { abandon: true, fwd: 0, strafe: 0, turn: 0.4, lift: 0 }); if (pl.state === 'bail' && pl.landed && pl.s < 1) pl.state = 'away'; }
    else if (pl.state === 'bail') { flyStep(pl, dt, { thrD: -0.3, pitch: -0.3, roll: pl.r >= 0 ? 0.35 : -0.35, brake: true }); if (pl.state === 'bail' && pl.y <= 0 && pl.s < 1) pl.state = 'away'; }
    else if (pl.state === 'wreck') { pl.t -= dt; if (pl.t <= 0) resetPlane(pl); }
    else if (pl.state === 'away' && Math.hypot(P.x - pl.x, P.z - pl.z) > 160) resetPlane(pl);
  }
  if (flashT > 0) { flashT -= dt; flashS.material.opacity = Math.max(0, flashT / 0.6); flashS.scale.setScalar(10 + (0.6 - flashT) * 50); if (flashT <= 0) flashS.visible = false; }
}

/* ───────── heat & CAAS inspectors ───────── */
let heat = 0, evadeT = 0, bustT = 0, heatCd = 0, copSpawnT = 0;
const cops = [];
function addHeat(n, why) { if (mode === 'title') return; heat = Math.min(5, heat + n); evadeT = 0; sfx.star(); toast(`<b style="color:#ff4b4b">${'★'.repeat(n)}</b> ${why}`); hudStars(); }
function hudStars() { const el = $('stars'); [...el.children].forEach((s, i) => s.classList.toggle('on', i < heat)); el.classList.toggle('flash', heat > 0 && evadeT > 0.5); }
function updateHeat(dt) {
  heatCd = Math.max(0, heatCd - dt);
  // spawn / dismiss inspectors
  const want = heat; copSpawnT -= dt;
  if (cops.length < want && copSpawnT <= 0) {
    copSpawnT = 2.5; const ids = shuffle([...Array(NX * NZ).keys()]).filter(id => { const p = npos(id), d = Math.hypot(p.x - P.x, p.z - P.z); return d > 70 && d < 170 && !vehicles.some(v => Math.hypot(v.x - p.x, v.z - p.z) < 10); });
    if (ids.length) { const p = npos(ids[0]), c = spawnVeh('caas', p.x, p.z, Math.atan2(P.x - p.x, P.z - p.z), 'cop'); c.ai.role = 'cop'; cops.push(c); }
  }
  let seen = false, nearD = 1e9;
  for (let i = cops.length - 1; i >= 0; i--) {
    const c = cops[i], d = Math.hypot(c.x - P.x, c.z - P.z); nearD = Math.min(nearD, d);
    if (heat === 0 || i >= heat) { // leave
      driveTo(c, c.x + Math.sin(c.h) * 30, c.z + Math.cos(c.h) * 30, 14, dt); if (d > 110) { removeVeh(c); cops.splice(i, 1); } continue;
    }
    const los = d < 140 && !(P.plane && P.plane.y > 25) && !P.para && !segBlocked(c.x, c.z, P.x, P.z); if (los && d < 75) seen = true;
    let tx = P.x, tz = P.z;
    if (!los) { c.ai.pt = (c.ai.pt || 0) - dt; if (c.ai.pt <= 0 || !c.ai.path) { c.ai.pt = 0.6; c.ai.path = bfs(nearestNode(c.x, c.z), nearestNode(P.x, P.z)); } const pth = c.ai.path; if (pth.length > 1) { let k = 0; const p0 = npos(pth[0]); if (Math.hypot(p0.x - c.x, p0.z - c.z) < 9) k = 1; const p = npos(pth[k]); tx = p.x; tz = p.z; } }
    else if (P.veh) { tx += P.veh.vx * 0.5; tz += P.veh.vz * 0.5; }
    const tsp = d < 14 ? Math.max(5, pSpeed() + 4) : 40;
    driveTo(c, tx, tz, tsp, dt);
    if (c.g.userData.bar) { const on = (now * 4 | 0) % 2; c.g.userData.bar[0].visible = !!on; c.g.userData.bar[1].visible = !on; }
  }
  if (heat > 0) {
    if (!seen) { evadeT += dt; if (evadeT > 5 + heat * 1.5) { heat--; evadeT = 0; toast(heat ? 'You lost an inspector…' : '<b style="color:#5fe36a">Heat gone.</b> The inspectors have moved on.'); } } else evadeT = 0;
    const close = cops.some(c => Math.hypot(c.x - P.x, c.z - P.z) < (P.veh ? 7.5 : 6)); const slow = pSpeed() < (P.veh ? 2.5 : 3);
    bustT = close && slow ? bustT + dt : Math.max(0, bustT - dt * 2); if (bustT > (P.veh ? 2 : 1.2)) busted();
  } else { evadeT = 0; bustT = 0; }
  hudStars();
  if (sir) { const a = AC.currentTime; sir.o.frequency.setTargetAtTime(((now * 2.2) | 0) % 2 ? 960 : 720, a, 0.02); sir.g.gain.setTargetAtTime(heat > 0 && mode === 'play' && nearD < 140 ? 0.018 * (1 - nearD / 140) : 0, a, 0.1); }
}
function clearHeat() { heat = 0; evadeT = 0; bustT = 0; hudStars(); }
function busted() {
  save.stats.busted++; const fine = Math.min(save.cash, 300); save.cash -= fine; persist(); sfx.bust(); clearHeat();
  if (MS) failMission('Busted by CAAS', true);
  big('BUSTED', fine ? `Licence suspended · -$${fine}` : 'Licence suspended', 'bust', 2800); mode = 'cut'; bustT = 0;
  setTimeout(() => {
    if (P.veh) { P.veh.driver = null; P.veh.in = { thr: 0, steer: 0, hb: 1 }; P.veh = null; P.g.visible = true; }
    if (P.plane) { resetPlane(P.plane); P.plane = null; P.g.visible = true; } if (P.para) endPara();
    cops.forEach(removeVeh); cops.length = 0; const t = L('training'); P.x = t.x; P.z = t.z + 4; P.h = 0; P.g.position.set(P.x, 0, P.z); camSnap = true;
    const keys2 = Object.keys(FACTS), k = keys2[Math.random() * keys2.length | 0]; unlockFact(k, true);
    showPanel(`<div class="card" style="--tc:#4fa3ff"><div class="ey">Training Centre · Licence suspension review</div><h2>Back to basics</h2>
      <div class="muted" style="margin-bottom:8px">Your licence is restored after a refresher. Read it before heading out again:</div>${factHTML(k)}
      <div class="row sp"><span class="muted">Tip: lose ★ heat by staying out of sight, or visit the pink <b style="color:#ff6fc8">R</b> Records Desk.</span><button class="btn" id="go">Back to work ▸</button></div></div>`);
    $('go').onclick = () => { sfx.click(); hidePanel(); };
  }, 2600);
}

/* ───────── markers & blips ───────── */
const markers = [];
const ringGeo = new THREE.RingGeometry(3.6, 4.4, 40), beamGeo = new THREE.CylinderGeometry(4, 4, 3, 28, 1, true), coneGeo = new THREE.ConeGeometry(0.9, 1.8, 4);
function addMarker(x, z, color, label, o = {}) {
  const g = new THREE.Group(), c = new THREE.Color(color);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.1; g.add(ring);
  const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false })); beam.position.y = 1.5; g.add(beam);
  const cone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ color: c })); cone.rotation.x = Math.PI; cone.position.y = 7; g.add(cone);
  if (label) { const s = textSprite(label, { size: 42, scale: o.sc || 0.055, edge: color, fg: '#fff' }); s.position.y = 11 + (label.split('\n').length - 1) * 1.1; g.add(s); }
  g.position.set(x, 0, z); scene.add(g); const m = Object.assign({ g, x, z, color, cone, r: o.r || 5.2 }, o); markers.push(m); return m;
}
function removeMarker(m) { scene.remove(m.g); const i = markers.indexOf(m); if (i >= 0) markers.splice(i, 1); if (m.npc) scene.remove(m.npc); }
function clearMarkers() { markers.slice().forEach(removeMarker); }
// contacts
const contactRT = {};
Object.entries(CONTACTS).forEach(([k, c]) => {
  const p = L(c.loc), g = makePerson(Object.assign({ skin: 0xd9a066 }, c.look)); g.position.set(p.x, 0, p.z - 2.2); scene.add(g);
  const lt = textSprite(k, { size: 90, bg: null, fg: c.color, scale: 0.032, depth: false }); lt.position.set(p.x, 5.2, p.z - 2.2); scene.add(lt);
  const cor = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1.6, 24, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(c.color), transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); cor.position.set(p.x, 0.8, p.z + 1.5); scene.add(cor);
  contactRT[k] = { g, lt, cor, x: p.x, z: p.z + 1.5 };
});
const recMark = (() => { const p = L('records'); const cor = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 1.6, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xff6fc8, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false })); cor.position.set(p.x, 0.8, p.z); scene.add(cor);
  const s = textSprite('R', { size: 90, bg: null, fg: '#ff6fc8', scale: 0.05, depth: false }); s.position.set(p.x, 5.2, p.z); scene.add(s); return { x: p.x, z: p.z, cd: 0 }; })();
function contactMission(k) {
  const list = MISSIONS.filter(m => m.c === k), next = list.find(m => !save.done[m.id]);
  if (!next) return null; if (k !== 'O' && !CONTACTS[k].island && !save.done.m1) return null; if (next.final && mainDone() < 8) return null; return next;
}
const examOpen = () => !!save.done.m9;
function contactActive(k) { return !!contactMission(k) || (k === 'I' && examOpen()) || (k === 'T' && cayDone()); }
// hidden logbook pages
const PAGE_POS = [[-232, -252], [232, -250], [-160, -130], [186, -146], [40, -150], [-196, -72], [196, -76], [-80, 64], [190, 60], [-232, 100], [-225, 218], [200, 196], [775, -142], [775, 128], [505, 132], [480, -90]];
const pageRT = PAGE_POS.map(([x, z], i) => {
  if (save.pages[i]) return null;
  const g = new THREE.Group(), pg = box(1.2, 1.6, 0.06, new THREE.MeshBasicMaterial({ color: 0xfff6d8 }), 0, 1.6, 0, g);
  box(0.8, 0.07, 0.07, 0x7a6a50, 0, 1.9, 0.04, g).visible = true; box(0.8, 0.07, 0.07, 0x7a6a50, 0, 1.6, 0.04, g); box(0.6, 0.07, 0.07, 0x7a6a50, 0, 1.3, 0.04, g);
  const glow = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.5 })); glow.position.y = 0.06; g.add(glow);
  g.position.set(x, 0, z); scene.add(g); return { g, x, z, i, pg };
});

/* ───────── missions ───────── */
let MS = null;
function startMission(m) {
  PLANES.forEach(pl => { if (pl.state !== 'parked') resetPlane(pl); });
  MS = { m, k: -1, wrong: 0 }; clearMarkers(); sfx.click();
  big(m.name.toUpperCase(), `${CONTACTS[m.c].name} · ${m.topic ? TOPICS[m.topic].name : 'Final mission'}`, '', 2400);
  setTimeout(() => { if (MS && MS.m === m && MS.k === -1) nextStep(); }, 900);
}
const step = () => MS.m.steps[MS.k];
function nextStep() {
  if (!MS) return; MS.k++; clearMarkers(); MS.target = null; MS.timer = null; MS.items = null; MS.done = false; $('timer').classList.add('hidden'); $('chase').classList.add('hidden'); setObj('');
  if (MS.k >= MS.m.steps.length) { passMission(); return; }
  const s = step();
  if (s.t === 'talk') cutscene(s.lines, nextStep);
  else if (s.t === 'quiz') panelQuiz(s, nextStep, MS.m);
  else if (s.t === 'check') panelCheck(s, nextStep);
  else if (s.t === 'sort') panelSort(s, nextStep);
  else if (s.t === 'goto') { const p = L(s.loc); MS.goal = addMarker(p.x, p.z, '#ffc83d', null); MS.target = p; setObj(s.text); MS.timer = s.time; }
  else if (s.t === 'choose') {
    const opts = s.opts === 'books' ? ['AIRCRAFT', 'ENGINE', 'PROPELLER', 'MODIFICATION'].map((n, i) => ({ loc: 'cab' + i, label: n + '\nLOG BOOK', ok: i === s.ans, why: i === s.ans ? '' : s.why })) : s.opts;
    MS.opts = opts.map(o => { const p = L(o.loc), m = addMarker(p.x, p.z, '#ffc83d', o.label, { ok: o.ok, why: o.why, sc: 0.045, r: s.opts === 'books' ? 4.5 : 5.2 });
      if (s.people) { m.npc = makePerson({ shirt: 0x26a65b, vest: 0xd4ff3a, hat: 0xffffff }); m.npc.position.set(p.x, 0, p.z - 1.5); scene.add(m.npc); } return m; });
    MS.target = averageOf(opts.map(o => L(o.loc))); setObj(s.text); MS.timer = s.time;
  }
  else if (s.t === 'collect') { MS.items = s.items.map(it => { const p = L(it.loc), m = addMarker(p.x, p.z, s.blind ? '#ffc83d' : it.ok ? '#5fe36a' : '#ff4b4b', it.label, { it, r: 4.6, sc: 0.045 }); return m; }); MS.need = s.items.filter(i => i.ok).length; MS.got = 0; setObj(s.text); MS.timer = s.time; MS.target = averageOf(s.items.map(i => L(i.loc))); }
  else if (s.t === 'chase') startChase(s);
  if (MS.timer) $('timer').classList.remove('hidden');
}
const averageOf = ps => ({ x: ps.reduce((a, p) => a + p.x, 0) / ps.length, z: ps.reduce((a, p) => a + p.z, 0) / ps.length });
function startChase(s) {
  let route, p0;
  if (s.route) { route = s.route.map(L); p0 = route[0]; }
  else { const a = L(s.from), b = L(s.to), n0 = nearestNode(a.x, a.z), n1 = nearestNode(b.x, b.z); p0 = npos(n0); route = bfs(n0, n1).map(npos); route.push(b); }
  let h = route.length > 1 ? Math.atan2(route[1].x - p0.x, route[1].z - p0.z) : 0;
  vehicles.filter(v => v.driver !== 'player' && Math.hypot(v.x - p0.x, v.z - p0.z) < 9).forEach(v => { if (v.driver === 'cop') cops.splice(cops.indexOf(v), 1); removeVeh(v); });
  const t = spawnVeh(s.veh, p0.x, p0.z, h, 'npc', s.veh === 'van' ? 0x333333 : undefined); t.driver = 'target'; t.ai.role = 'target'; t.ai.route = route; t.ai.k = 1; t.ai.wait = true;
  const lb = textSprite(s.who || 'TARGET', { size: 40, scale: 0.04, edge: '#ff4b4b' }); lb.position.y = t.s.h + 3.5; t.g.add(lb);
  MS.chase = { v: t, hits: 0, need: s.hits, slow: s.slow || 0.8, s }; MS.target = t; setObj(s.text); hudChase();
  $('chase').classList.remove('hidden');
}
function hudChase() { const c = MS && MS.chase; if (!c) return; $('chaseT').textContent = `${(c.s.who || 'TARGET').toUpperCase()} · ${c.hits}/${c.need}`; $('chaseF').style.width = (100 - c.hits / c.need * 100) + '%'; }
function chaseHit() {
  const c = MS && MS.chase; if (!c || MS.done) return; c.hits++; sfx.hit(); hudChase(); c.v.ai.wait = false;
  if (c.hits >= c.need) { MS.done = true; c.v.driver = 'npc'; c.v.ai.role = 'stopped'; c.v.in = { thr: 0, steer: 0, hb: 1 }; big('STOPPED!', c.s.who || '', '', 1600); sfx.ok();
    setTimeout(() => { if (MS && MS.chase === c) { cleanupChase(); nextStep(); } }, 1600); }
  else toast(`Hit! <b>${c.hits}/${c.need}</b>`);
}
function cleanupChase() { const c = MS && MS.chase; if (!c) return; const v = c.v; MS.chase = null; setTimeout(() => { if (v !== P.veh) removeVeh(v); }, 4000); }
function updateTarget(v, dt) {
  const ai = v.ai, c = MS && MS.chase;
  if (ai.role === 'stopped') { driveTo(v, v.x, v.z, 0, dt); return; }
  if (ai.wait) { v.in = { thr: 0, steer: 0, hb: 1 }; if (Math.hypot(P.x - v.x, P.z - v.z) < 60) { ai.wait = false; toast('They spotted you – <b>go!</b>'); } return; }
  const p = ai.route[ai.k]; if (!p) return;
  if (Math.hypot(p.x - v.x, p.z - v.z) < (ai.k === ai.route.length - 1 ? 8 : 7)) { ai.k++; if (ai.k >= ai.route.length && c && !MS.done) { failMission('They got away'); return; } }
  driveTo(v, p.x, p.z, v.s.max * (c ? c.slow : 0.8), dt);
}
function updateMission(dt) {
  if (!MS || MS.k < 0 || MS.done) return; const s = step(); if (!s) return;
  if (MS.timer != null) { MS.timer -= dt; const t = Math.max(0, Math.ceil(MS.timer)); $('timer').textContent = `${(t / 60) | 0}:${String(t % 60).padStart(2, '0')}`; $('timer').classList.toggle('low', t <= 10); if (MS.timer <= 0) { failMission('Out of time'); return; } }
  const inside = m => { const i = !P.plane && !P.para && Math.hypot(P.x - m.x, P.z - m.z) < m.r; if (!m.armed) { if (!i) m.armed = true; return false; } return i; };
  if (s.t === 'goto' && MS.goal && inside(MS.goal)) { sfx.ok(); MS.done = true; setTimeout(nextStep, 250); }
  else if (s.t === 'choose') {
    for (const m of MS.opts) { if (!markers.includes(m) || !inside(m)) continue;
      if (m.ok) { sfx.ok(); save.stats.right++; toast(`<b style="color:#5fe36a">Correct.</b> ${s.why || ''}`, 4200); MS.done = true; setTimeout(nextStep, 400); }
      else { save.stats.wrong++; MS.wrong++; sfx.bad(); addHeat(1, 'Wrong call'); toast(`<b style="color:#ff4b4b">Wrong.</b> ${m.why || ''}`, 6000); removeMarker(m); }
      break; }
  }
  else if (s.t === 'collect') {
    for (const m of MS.items) { if (!markers.includes(m) || !inside(m)) continue; removeMarker(m);
      if (m.it.ok) { MS.got++; sfx.pick(); toast(`Collected <b>${esc(m.it.label)}</b> · ${MS.got}/${MS.need}`); if (MS.got >= MS.need) { MS.done = true; save.stats.right++; setTimeout(nextStep, 500); } }
      else { save.stats.wrong++; MS.wrong++; sfx.bad(); addHeat(1, 'Junk in the tech log'); toast(`<b style="color:#ff4b4b">Not a tech log entry.</b> ${m.it.why}`, 5000); } }
  }
  markers.forEach(m => { m.cone.position.y = 7 + Math.sin(now * 3) * 0.5; m.cone.rotation.y += dt * 2; });
}
function failMission(reason, quiet) {
  if (!MS) return; const m = MS.m; if (MS.chase) { const v = MS.chase.v; MS.chase = null; if (v !== P.veh) removeVeh(v); }
  clearMarkers(); MS = null; $('timer').classList.add('hidden'); $('chase').classList.add('hidden'); setObj('');
  if (!quiet) { sfx.fail(); big('MISSION FAILED!', reason, 'fail', 3000); }
  help(`Go back to <b style="color:${CONTACTS[m.c].color}">${m.c}</b> to retry <b>${m.name}</b>.`, 5000);
}
function passMission() {
  const m = MS.m; MS = null; save.done[m.id] = true; save.cash += m.cash; persist(); sfx.pass(); setObj('');
  big('MISSION PASSED!', `$${m.cash} · RESPECT +`, '', 3600); hudCash(); hudRank();
  setTimeout(() => {
    if (m.id === 'm1') help('New contacts on your radar: <b style="color:#7dff8a">C</b> Chief Engineer, <b style="color:#ffcf3f">Q</b> Quality, <b style="color:#ff7ad9">K</b> Captain.', 8000);
    else if (m.final) help('<b style="color:#ff5252">I</b> at the CAAS Office: the <b>Licence Board</b> exam is open.', 8000);
    else if (m.island && cayDone()) help('Design Cay complete! <b style="color:#9b8cff">T</b> – Dr. Ortiz – has the <b>Design Board</b> exam.', 8000);
    else if (m.island) { const nx = ['T', 'S', 'P'].find(k => contactMission(k)); if (nx) help(`Next on Design Cay: <b style="color:${CONTACTS[nx].color}">${nx}</b> – ${CONTACTS[nx].name}.`, 6000); }
    else if (mainDone() === 8) help('All contacts done! <b style="color:#ff5252">I</b> – Inspector Farah at the CAAS Office – has the final job.', 8000);
    else { const nx = Object.keys(CONTACTS).find(k => !CONTACTS[k].island && contactMission(k)); if (nx) help(`Next: <b style="color:${CONTACTS[nx].color}">${nx}</b> – ${CONTACTS[nx].name} (${CONTACTS[nx].role}).`, 6000); }
  }, 3800);
}
function updateContacts(dt) {
  const air = !!(P.plane || P.para);
  for (const [k, rt] of Object.entries(contactRT)) {
    const act = contactActive(k); rt.lt.visible = act && Math.hypot(P.x - rt.x, P.z - rt.z) > 9; rt.cor.visible = act; rt.cor.material.opacity = 0.25 + Math.sin(now * 3) * 0.1;
    const inside = Math.hypot(P.x - rt.x, P.z - rt.z) < 3.2, enter = inside && !rt.was; rt.was = inside;
    if (!act || MS || mode !== 'play' || !enter || air) continue;
    if (heat > 0) { toast('Lose your ★ heat first – stay out of sight, or answer at the pink <b style="color:#ff6fc8">R</b> Records Desk.'); continue; }
    if (P.veh) P.veh.vx = P.veh.vz = 0;
    const m = contactMission(k); if (m) startMission(m); else if (k === 'I') openExam(); else if (k === 'T') openExam('design');
  }
  // records desk
  const rin = Math.hypot(P.x - recMark.x, P.z - recMark.z) < 3.4, renter = rin && !recMark.was; recMark.was = rin;
  if (mode === 'play' && renter && !air) {
    if (heat === 0) { toast('<b style="color:#ff6fc8">Records Desk</b> – come back with ★ heat and answer a question to clear it.'); }
    else { if (P.veh) P.veh.vx = P.veh.vz = 0; const q = EXAM[Math.random() * EXAM.length | 0];
      panelQuiz(Object.assign({ single: true }, q), ok => { if (ok) { clearHeat(); cops.forEach(c => { c.ai.path = null; }); toast('<b style="color:#5fe36a">Paperwork in order.</b> Heat cleared.'); } else addHeat(1, 'Bad paperwork at the Records Desk'); }, null, 'Records Desk · answer correctly to clear your heat'); }
  }
  // pages
  pageRT.forEach((p, i) => { if (!p) return; p.g.rotation.y += dt * 1.6; p.pg.position.y = 1.6 + Math.sin(now * 2 + i) * 0.2;
    if (!air && Math.hypot(P.x - p.x, P.z - p.z) < 3.2) { scene.remove(p.g); pageRT[i] = null; save.pages[i] = 1; save.cash += 100; persist(); sfx.page(); hudCash(); const k = PAGES[i]; unlockFact(k, true);
      const n = Object.keys(save.pages).length; big(`LOGBOOK PAGE ${n}/${PAGES.length}`, '+$100', '', 2200); toast(`📓 ${strip(FACTS[k].x)}`, 7000);
      if (n === PAGES.length) { save.cash += 1000; persist(); setTimeout(() => big('ALL PAGES FOUND', '+$1000 bonus', '', 3000), 2400); } } });
}

/* ───────── UI: HUD helpers ───────── */
function setObj(h) { $('obj').innerHTML = h; }
function help(h, ms = 5000) { const e = $('help'); e.innerHTML = h; e.style.opacity = 1; clearTimeout(help.t); help.t = setTimeout(() => { e.style.opacity = 0; }, ms); }
function toast(h, ms = 3500) { const e = $('toast'); e.innerHTML = h; e.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('show'), ms); }
function big(t, s, cls, ms = 2500) { const e = $('big'); e.className = 'out ' + (cls || ''); e.firstElementChild.textContent = t; e.lastElementChild.textContent = s || ''; e.style.opacity = 1; clearTimeout(big.t); big.t = setTimeout(() => { e.style.opacity = 0; }, ms); }
function hudCash() { $('cash').textContent = '$' + String(Math.max(0, save.cash)).padStart(8, '0'); }
function hudRank() { $('rank').textContent = rank().toUpperCase(); }
function unlockFact(k, quiet) { if (!FACTS[k] || save.facts[k]) return false; save.facts[k] = 1; persist(); if (!quiet) toast(`📓 Notebook · <b>${TOPICS[FACTS[k].t].name}</b> +1`, 2500); return true; }
function factHTML(k, locked) { const f = FACTS[k], t = TOPICS[f.t]; return `<div class="fact ${locked ? 'lk' : ''}" style="--tc:${t.color}"><small>${f.s}</small>${locked ? 'Locked – keep playing to reveal this entry.' : f.x}</div>`; }

/* ───────── cutscenes ───────── */
let subAdvance = null;
function cutscene(lines, done) {
  mode = 'cut'; document.body.classList.add('cut'); $('sub').classList.remove('hidden'); $('subnav').classList.remove('hidden'); $('prompt').classList.add('hidden');
  $('subhint').textContent = TOUCH ? 'Tap ▸' : 'Click / Space ▸';
  let i = 0;
  const show = () => {
    const [who, text, fact] = lines[i], c = CONTACTS[who];
    const name = who === 'N' ? '' : `<span class="who" style="color:${c.color}">${c.name}:</span>`;
    const isNew = fact ? unlockFact(fact, true) : false;
    $('sub').innerHTML = `${name}${text}${fact ? `<br><span class="note">📓 ${isNew ? 'Added to notebook' : 'In your notebook'} · ${FACTS[fact].s}</span>` : ''}`; sfx.click();
  };
  const end = () => { subAdvance = null; document.body.classList.remove('cut'); $('sub').classList.add('hidden'); $('subnav').classList.add('hidden'); mode = 'play'; done && done(); };
  subAdvance = () => { i++; if (i >= lines.length) end(); else show(); };
  $('skip').onclick = e => { e.stopPropagation(); lines.forEach(l => l[2] && unlockFact(l[2], true)); end(); };
  show();
}

/* ───────── panels ───────── */
const ui = $('ui'), panel = $('panel');
function showPanel(html) { panel.innerHTML = html; ui.classList.remove('hidden'); ui.scrollTop = 0; mode = 'cut'; $('prompt').classList.add('hidden'); }
function hidePanel() { ui.classList.add('hidden'); mode = 'play'; }
function topicColor(m) { return m && m.topic ? TOPICS[m.topic].color : '#ffc83d'; }
function panelQuiz(s, done, m, ey) {
  const opts = shuffle([s.a, ...s.wrong]); let tries = 0;
  showPanel(`<div class="card" style="--tc:${topicColor(m)}"><div class="ey">${ey || (m ? `${esc(m.name)} · ${CONTACTS[m.c].name}` : 'Question')}</div><div class="q">${s.q}</div>
    <div class="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join('')}</div><div id="fb"></div><div class="row sp" id="nav"></div></div>`);
  panel.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const ok = opts[+b.dataset.i] === s.a; tries++;
    if (ok) { b.classList.add('ok'); panel.querySelectorAll('.opt').forEach(x => x.disabled = true); sfx.ok(); if (tries === 1) save.stats.right++;
      $('fb').innerHTML = `<div class="fb ok"><b>${tries === 1 ? 'Correct.' : 'That\'s it.'}</b> ${s.why} <span class="muted">(${s.s})</span></div>`;
      $('nav').innerHTML = `<span></span><button class="btn" id="go">Continue ▸</button>`; $('go').onclick = () => { sfx.click(); hidePanel(); done(s.single ? tries === 1 : true); }; $('go').focus(); }
    else { b.classList.add('bad'); b.disabled = true; sfx.bad(); save.stats.wrong++;
      if (s.single) { panel.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (opts[+x.dataset.i] === s.a) x.classList.add('ok'); });
        $('fb').innerHTML = `<div class="fb bad"><b>Wrong.</b> Answer: <b>${s.a}</b>. ${s.why} <span class="muted">(${s.s})</span></div>`;
        $('nav').innerHTML = `<span></span><button class="btn" id="go">Continue ▸</button>`; $('go').onclick = () => { sfx.click(); hidePanel(); done(false); }; }
      else $('fb').innerHTML = `<div class="fb bad"><b>Not quite.</b> Think again – try another answer.</div>`; }
  });
}
function panelCheck(s, done) {
  const m = MS && MS.m, items = shuffle(s.items.map((it, i) => ({ t: it[0], ok: it[1], i }))), sel = new Set();
  const render = (res) => {
    showPanel(`<div class="card" style="--tc:${topicColor(m)}"><div class="ey">${esc(s.title)}</div><div class="q">${s.prompt}</div>
      <div class="opts">${items.map((it, k) => `<button class="opt ${res ? (it.ok ? 'ok' : sel.has(k) ? 'bad' : '') : sel.has(k) ? 'sel' : ''}" data-k="${k}" ${res ? 'disabled' : ''}>${sel.has(k) ? '☑' : '☐'} ${it.t}</button>`).join('')}</div>
      ${res ? `<div class="fb ${res.ok ? 'ok' : 'bad'}"><b>${res.ok ? 'All correct.' : 'Not quite – the green ones are correct.'}</b> ${s.why}</div>` : ''}
      <div class="row sp"><span class="muted">${res ? '' : 'Tap to select, then submit.'}</span>${res ? (res.ok ? '<button class="btn" id="go">Continue ▸</button>' : '<button class="btn g" id="re">Try again</button>') : '<button class="btn" id="sub2">Submit</button>'}</div></div>`);
    if (!res) { panel.querySelectorAll('.opt').forEach(b => b.onclick = () => { const k = +b.dataset.k; sel.has(k) ? sel.delete(k) : sel.add(k); sfx.click(); render(); }); $('sub2').onclick = () => { const ok = items.every((it, k) => it.ok === sel.has(k)); ok ? (sfx.ok(), save.stats.right++) : (sfx.bad(), save.stats.wrong++); render({ ok }); }; }
    else if (res.ok) $('go').onclick = () => { sfx.click(); hidePanel(); done(); }; else $('re').onclick = () => { sel.clear(); sfx.click(); render(); };
  };
  render();
}
function panelSort(s, done) {
  const m = MS && MS.m, items = shuffle(s.items.map(it => ({ t: it[0], b: it[1] }))), pick = items.map(() => -1);
  const render = (res) => {
    showPanel(`<div class="card" style="--tc:${topicColor(m)}"><div class="ey">${esc(s.title)}</div><div class="q">${s.prompt}</div>
      ${items.map((it, k) => `<div class="srt"><span>${it.t}</span><div class="bins">${s.bins.map((b, j) => `<button class="bin ${res ? (j === it.b ? 'ok' : pick[k] === j ? 'bad' : '') : pick[k] === j ? 'on' : ''}" data-k="${k}" data-j="${j}" ${res ? 'disabled' : ''}>${b}</button>`).join('')}</div></div>`).join('')}
      ${res ? `<div class="fb ${res.ok ? 'ok' : 'bad'}"><b>${res.ok ? 'All correct.' : 'Some are in the wrong place – green shows the right answer.'}</b> ${s.why}</div>` : ''}
      <div class="row sp"><span class="muted"></span>${res ? (res.ok ? '<button class="btn" id="go">Continue ▸</button>' : '<button class="btn g" id="re">Try again</button>') : `<button class="btn" id="sub2" ${pick.includes(-1) ? 'disabled' : ''}>Submit</button>`}</div></div>`);
    if (!res) { panel.querySelectorAll('.bin').forEach(b => b.onclick = () => { pick[+b.dataset.k] = +b.dataset.j; sfx.click(); render(); }); $('sub2').onclick = () => { const ok = items.every((it, k) => it.b === pick[k]); ok ? (sfx.ok(), save.stats.right++) : (sfx.bad(), save.stats.wrong++); render({ ok }); }; }
    else if (res.ok) $('go').onclick = () => { sfx.click(); hidePanel(); done(); }; else $('re').onclick = () => { pick.fill(-1); sfx.click(); render(); };
  };
  render();
}

/* ───────── pause menu ───────── */
let menuTab = 'missions';
function openMenu(tab) { menuTab = tab || menuTab; mode = 'menu'; $('prompt').classList.add('hidden'); if (window.speechSynthesis) speechSynthesis.cancel(); renderMenu(); }
function closeMenu() { ui.classList.add('hidden'); mode = 'play'; }
function renderMenu() {
  const tabs = [['missions', 'Missions'], ['map', 'Map'], ['notebook', 'Notebook'], ['stats', 'Stats'], ['help', 'Controls']];
  let body = '';
  if (menuTab === 'missions') body = Object.entries(CONTACTS).map(([k, c]) => `<div class="ey" style="--tc:${c.color};margin-top:12px">${k} · ${c.name} – ${c.role}</div>` + MISSIONS.filter(m => m.c === k).map(m => { const st = save.done[m.id] ? '✅ Passed' : contactMission(k) === m ? '▶ Available' : '🔒 Locked';
    return `<div class="ml"><span class="l" style="background:${c.color}">${k}</span><span><b>${m.name}</b> <span class="muted">· ${m.topic ? TOPICS[m.topic].name : 'All four topics'}</span></span><span>${st}</span></div>`; }).join('')).join('')
      + `<div class="ml" style="margin-top:12px"><span class="l" style="background:#ff5252">L</span><span><b>Licence Board exam</b> <span class="muted">· CAAS Office</span></span><span>${save.exam >= 8 ? `✅ ${save.exam}/10` : examOpen() ? '▶ Available' : '🔒 After the final mission'}</span></div>`
      + `<div class="ml"><span class="l" style="background:#9b8cff">B</span><span><b>Design Board exam</b> <span class="muted">· Design Cay, Dr. Ortiz</span></span><span>${(save.exam2 || 0) >= 8 ? `✅ ${save.exam2}/10` : cayDone() ? '▶ Available' : '🔒 After the six Design Cay missions'}</span></div>`;
  else if (menuTab === 'map') body = '<canvas id="bigmap" width="1050" height="500" style="width:100%;display:block;margin:auto;border-radius:6px"></canvas><div class="muted" style="text-align:center;margin-top:6px">Coloured letters = contacts · ★ yellow = current objective · R = Records Desk · white arrow = you</div>';
  else if (menuTab === 'notebook') body = Object.entries(TOPICS).map(([t, o]) => { const ks = Object.keys(FACTS).filter(k => FACTS[k].t === t), n = ks.filter(k => save.facts[k]).length;
    return `<div class="ey" style="--tc:${o.color};margin-top:14px">${o.name} · ${n}/${ks.length}</div>${ks.map(k => factHTML(k, !save.facts[k])).join('')}`; }).join('');
  else if (menuTab === 'stats') { const s = save.stats, f = Object.keys(save.facts).length, nf = Object.keys(FACTS).length;
    body = `<div class="opts" style="grid-template-columns:repeat(2,1fr)">${[['Missions passed', `${Object.keys(save.done).length}/${MISSIONS.length}`], ['Notebook', `${f}/${nf}`], ['Logbook pages', `${Object.keys(save.pages).length}/${PAGES.length}`], ['Cash', '$' + save.cash], ['First-try answers', s.right], ['Wrong answers', s.wrong], ['Vehicles taken', s.jacked], ['Pedestrians bumped', s.peds], ['Times busted', s.busted], ['Licence Board', save.exam ? save.exam + '/10' : '–'], ['Design Board', save.exam2 ? save.exam2 + '/10' : '–']].map(([a, b]) => `<div class="ml" style="grid-template-columns:1fr auto"><span class="muted">${a}</span><b>${b}</b></div>`).join('')}</div>`; }
  else body = `<div class="keys">${TOUCH ? 'Stick: walk / drive (push fully, or hold RUN, to sprint) · ENTER/EXIT: get in or out · BRAKE: handbrake · CAM: camera · ☰: this menu<br>Aircraft: ENTER next to a plane · stick to climb/dive and bank (throttle is automatic, BRAKE slows) · ENTER/EXIT in the air to bail out, again to open the parachute<br>Helicopters: stick to fly forward and turn · ▲ UP / ▼ DOWN to climb and descend' :
    '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / arrows – walk or drive · hold <kbd>Shift</kbd> to run (uses stamina)<br><kbd>F</kbd> enter / exit / take a vehicle · <kbd>Space</kbd> handbrake · <kbd>H</kbd> horn<br><kbd>R</kbd> radio (Ramp FM / Tower Talk reads your notebook) · <kbd>C</kbd> camera · mouse wheel zoom<br><kbd>Esc</kbd> missions · <kbd>M</kbd> map · <kbd>N</kbd> notebook<br><b>Aircraft</b>: <kbd>F</kbd> next to a plane to board · <kbd>W</kbd>/<kbd>S</kbd> throttle · <kbd>↑</kbd> climb <kbd>↓</kbd> dive · <kbd>A</kbd><kbd>D</kbd> bank · <kbd>Space</kbd> brakes · <kbd>F</kbd> in the air to bail out, <kbd>F</kbd> again to open the parachute<br><b>Helicopters</b>: <kbd>↑</kbd>/<kbd>Space</kbd> climb · <kbd>↓</kbd>/<kbd>Shift</kbd> descend · <kbd>W</kbd>/<kbd>S</kbd> forward/back · <kbd>A</kbd><kbd>D</kbd> turn · <kbd>←</kbd><kbd>→</kbd> strafe · land on the ground or a rooftop'}</div>
    <div class="fact" style="--tc:#ffc83d;margin-top:12px"><b>How it works.</b> Walk or drive into a contact's coloured marker to start a mission. Taking occupied vehicles, hitting pedestrians, ramming inspectors and wrong calls add <b>★ heat</b>: CAAS inspectors chase you. Stay out of sight to lose it, or clear it by answering a question at the pink <b style="color:#ff6fc8">R</b> Records Desk. If they box you in, you're <b>busted</b>. Hidden <b>logbook pages</b> around the island add notebook entries.</div>`;
  showPanel(`<div class="card" style="--tc:#ffc83d"><div class="row sp" style="margin:0"><h2 style="margin:0">Paused</h2><div class="row" style="margin:0"><button class="btn g" id="gfx">Graphics: ${HQ() ? 'High' : 'Low'}</button><button class="btn g" id="mute">${save.mute ? '🔇 Sound off' : '🔊 Sound on'}</button><button class="btn" id="res">Resume ▸</button></div></div>
    <div class="tabs">${tabs.map(([k, n]) => `<button class="tab ${k === menuTab ? 'on' : ''}" data-t="${k}">${n}</button>`).join('')}</div>${body}
    <div class="row sp"><a href="../index.html" class="muted" style="font-size:13px">◂ All games</a><span class="muted" style="font-size:13px">${esc(save.name || 'Engineer')} · ${rank()}</span></div></div>`);
  mode = 'menu';
  panel.querySelectorAll('.tab').forEach(b => b.onclick = () => { sfx.click(); menuTab = b.dataset.t; renderMenu(); });
  $('res').onclick = () => { sfx.click(); closeMenu(); };
  $('mute').onclick = () => { save.mute = !save.mute; persist(); if (master) master.gain.value = save.mute ? 0 : 1; renderMenu(); };
  $('gfx').onclick = () => { save.gfx = HQ() ? 'low' : 'high'; persist(); renderer.shadowMap.enabled = HQ(); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, HQ() ? 1.75 : 1)); resize(); document.body.classList.toggle('hq', HQ());
    scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); }); renderMenu(); };
  if ($('bigmap')) drawBigMap($('bigmap'));
}

/* ───────── exam & certificate ───────── */
function openExam(kind) {
  const D = kind === 'design', bank = D ? DEXAM : EXAM, board = D ? 'Design Board' : 'Licence Board', key = D ? 'exam2' : 'exam';
  const qs = shuffle(bank).slice(0, 10); let i = 0, score = 0; const missed = [];
  const ask = () => {
    if (i >= qs.length) return result(); const s = qs[i];
    panelQuiz(Object.assign({ single: true }, s), ok => { if (ok) score++; else missed.push(s); i++; setTimeout(ask, 0); }, null, `${board} · Question ${i + 1} of ${qs.length} · Score ${score}`);
  };
  const result = () => {
    const pass = score >= 8; if (score > (save[key] || 0)) save[key] = score; persist(); pass ? sfx.pass() : sfx.fail(); hudRank();
    showPanel(`<div class="card" style="--tc:${D ? '#9b8cff' : '#ff5252'}"><div class="ey">${D ? 'Design Cay · Design Board' : 'CAAS Licence Board'}</div><h2>${pass ? 'Approved' : 'Not yet'} · ${score}/10</h2>
      ${pass ? `<div class="cert"><div class="ey" style="--tc:#ffc83d">Certificate of completion</div><div style="margin-top:8px">This certifies that</div><div class="nm">${esc(save.name || 'Engineer')}</div>
      <div>completed <b>PENCIL WHIP${D ? ' – DESIGN CAY' : ''}</b> and passed the ${board} with <b>${score}/10</b><br><span class="muted">${D ? 'Type Certificate · Supplemental Type Certificate · Singapore Technical Standard Order' : 'Aircraft Maintenance · Certificate of Release to Service · Certificate of Maintenance Review · Technical Log'}</span></div></div>` : `<div class="muted">You need 8 out of 10. Review the Notebook (N), then talk to ${D ? 'Dr. Ortiz' : 'Inspector Farah'} again.</div>`}
      ${missed.length ? `<div class="ey" style="margin-top:14px">Review these</div>${missed.map(q => `<div class="fact" style="--tc:#ff4b4b"><b>${q.q}</b><br>✔ ${q.a} <span class="muted">– ${q.why} (${q.s})</span></div>`).join('')}` : ''}
      <div class="row sp"><span class="muted">${pass ? 'The island is yours – keep exploring and finding logbook pages.' : ''}</span><button class="btn" id="go">Back to the island ▸</button></div></div>`);
    $('go').onclick = () => { sfx.click(); hidePanel(); };
  };
  ask();
}

/* ───────── minimap ───────── */
const MAPC = document.createElement('canvas'); MAPC.width = 2100; MAPC.height = 1000; const MS_SC = 2; // px per metre; world x -250..800, z -265..235
const W2M = (x, z) => [(x + 250) * MS_SC, (z + 265) * MS_SC];
{ const x = MAPC.getContext('2d'); x.fillStyle = '#2b6fa5'; x.fillRect(0, 0, 2100, 1000);
  const r = (x0, z0, x1, z1, c) => { const [a, b] = W2M(x0, z0), [cc, d] = W2M(x1, z1); x.fillStyle = c; x.fillRect(a, b, cc - a, d - b); };
  r(-238, -262, 238, 212, '#5f9a52'); r(-238, -262, 238, -80, '#9a9ea4'); r(-238, 165, 238, 212, '#d8c890'); r(-229, 205, -221, 222, '#8a6a45'); r(-235, -248, 235, -216, '#4a4e55');
  for (let i = 0; i < NX; i++) r(XL[i] - RH, ZL[0], XL[i] + RH, ZL[NZ - 1], '#3b3f46'); for (let j = 0; j < NZ; j++) r(XL[0], ZL[j] - RH, XL[NX - 1], ZL[j] + RH, ZL[j] <= -80 ? '#7c8188' : '#3b3f46');
  r(470, -150, 790, 150, '#d8c890'); r(484, -136, 776, 136, '#5f9a52'); r(230, -8, 480, 8, '#3b3f46'); r(505, -147, 755, -129, '#4a4e55');
  [[232, -7, 500, 7], [500, -7, 760, 7], [500, -127, 760, -113], [500, 113, 760, 127], [493, -127, 507, 127], [753, -127, 767, 127]].forEach(q => r(q[0], q[1], q[2], q[3], '#3b3f46'));
  COL.forEach(c => !c.plane && r(c.x0, c.z0, c.x1, c.z1, c.h > 6 ? '#1d2430' : '#3d4654')); }
const mini = $('mini'), mx = mini.getContext('2d');
function routePts() {
  if (!MS || !MS.target) return null; const t = MS.target, a = nearestNode(P.x, P.z), b = nearestNode(t.x, t.z);
  const pts = [[P.x, P.z]]; if (Math.hypot(t.x - P.x, t.z - P.z) > 40) bfs(a, b).forEach(id => { const p = npos(id); pts.push([p.x, p.z]); }); pts.push([t.x, t.z]); return pts;
}
function blips() {
  const b = [];
  Object.entries(contactRT).forEach(([k, rt]) => { if (contactActive(k) && !MS) b.push({ x: rt.x, z: rt.z, t: k, c: CONTACTS[k].color }); });
  b.push({ x: recMark.x, z: recMark.z, t: 'R', c: '#ff6fc8', small: true });
  PLANES.forEach(pl => { if (pl !== P.plane && pl.state !== 'wreck') b.push({ x: pl.x, z: pl.z, t: pl.T.heli ? 'H' : '✈', c: '#e8eef8', small: true }); });
  markers.forEach(m => b.push({ x: m.x, z: m.z, c: m.color, dot: true }));
  cops.forEach(c => b.push({ x: c.x, z: c.z, c: (now * 4 | 0) % 2 ? '#ff3b3b' : '#3b6bff', dot: true, sm: true }));
  if (MS && MS.chase) b.push({ x: MS.chase.v.x, z: MS.chase.v.z, c: '#ff3b3b', dot: true, big: true });
  return b;
}
const mapYaw = () => save.cam === 2 ? Math.PI : camYaw;
function drawMini() {
  const w = mini.width, R = w / 2, zoom = (P.veh ? 1.25 : 1.6) * (1 - Math.min(0.35, pSpeed() / 100)); // px per metre on minimap
  mx.save(); mx.clearRect(0, 0, w, w); mx.beginPath(); mx.arc(R, R, R, 0, 6.283); mx.clip(); mx.fillStyle = '#2b6fa5'; mx.fillRect(0, 0, w, w);
  mx.translate(R, R); mx.rotate(Math.PI + mapYaw()); mx.scale(zoom / MS_SC, zoom / MS_SC); const [px, pz] = W2M(P.x, P.z); mx.translate(-px, -pz); mx.drawImage(MAPC, 0, 0);
  const rp = routePts(); if (rp) { mx.strokeStyle = '#ff6fc8'; mx.lineWidth = 7 * MS_SC / zoom; mx.lineJoin = 'round'; mx.beginPath(); rp.forEach(([x, z], i) => { const [a, b] = W2M(x, z); i ? mx.lineTo(a, b) : mx.moveTo(a, b); }); mx.stroke(); }
  mx.restore();
  // blips (clamped to rim)
  const c = Math.cos(Math.PI + mapYaw()), s = Math.sin(Math.PI + mapYaw());
  blips().forEach(b => { let dx = (b.x - P.x) * zoom, dz = (b.z - P.z) * zoom; let x = dx * c - dz * s, y = dx * s + dz * c; const d = Math.hypot(x, y), lim = R - 18; if (d > lim) { x *= lim / d; y *= lim / d; }
    if (b.dot) { mx.fillStyle = b.c; mx.strokeStyle = '#000'; mx.lineWidth = 3; mx.beginPath(); mx.arc(R + x, R + y, b.big ? 14 : b.sm ? 9 : 11, 0, 6.283); mx.fill(); mx.stroke(); }
    else { mx.fillStyle = '#000'; mx.beginPath(); mx.arc(R + x, R + y, b.small ? 15 : 19, 0, 6.283); mx.fill(); mx.fillStyle = b.c; mx.font = `900 ${b.small ? 22 : 28}px Impact, Arial Black, sans-serif`; mx.textAlign = 'center'; mx.textBaseline = 'middle'; mx.fillText(b.t, R + x, R + y + 1); } });
  // player arrow + north
  mx.fillStyle = '#fff'; mx.strokeStyle = '#000'; mx.lineWidth = 3; mx.beginPath(); mx.moveTo(R, R - 16); mx.lineTo(R + 11, R + 12); mx.lineTo(R, R + 6); mx.lineTo(R - 11, R + 12); mx.closePath(); mx.fill(); mx.stroke();
  const ax = R + s * (R - 16), ay = R - c * (R - 16);
  mx.fillStyle = '#000'; mx.beginPath(); mx.arc(ax, ay, 14, 0, 6.283); mx.fill(); mx.fillStyle = '#fff'; mx.font = '900 20px Arial'; mx.textAlign = 'center'; mx.textBaseline = 'middle'; mx.fillText('N', ax, ay + 1);
}
function drawBigMap(cv) {
  const x = cv.getContext('2d'), k = cv.width / MAPC.width; x.drawImage(MAPC, 0, 0, cv.width, cv.height);
  const at = (wx, wz) => { const [a, b] = W2M(wx, wz); return [a * k, b * k]; };
  [['Hangar', -160, -124], ['Stand A', -80, -100], ['Stand B', 0, -100], ['Stand C', 80, -100], ['GA Apron', 160, -100], ['Workshop', -160, -52], ['Ops Centre', -80, -50], ['Crew Centre', 0, -52], ['Quality', 80, -52], ['Log Book Archive', 160, -66], ['Training Centre', -160, 52], ['CAAS Office', 80, 54], ['Car park', -80, 44], ['Mall', 0, 120], ['Runway', 0, -232], ['Jetty', -225, 200], ['Bridge', 355, -14], ['DESIGN CAY', 630, -100], ['TC Centre', 560, -58], ['DOA', 630, -58], ['STC Hangar', 705, -58], ['STSO Plant', 560, 58], ['Production', 630, 58], ['Data Vault', 705, 58], ['Test Strip', 630, -138]].forEach(([n, wx, wz]) => {
    const [a, b] = at(wx, wz); x.font = '700 15px Segoe UI, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 4; x.strokeStyle = '#000'; x.strokeText(n, a, b); x.fillStyle = '#fff'; x.fillText(n, a, b); });
  const rp = routePts(); if (rp) { x.strokeStyle = '#ff6fc8'; x.lineWidth = 5; x.beginPath(); rp.forEach(([wx, wz], i) => { const [a, b] = at(wx, wz); i ? x.lineTo(a, b) : x.moveTo(a, b); }); x.stroke(); }
  blips().forEach(b => { const [a, c] = at(b.x, b.z); if (b.dot) { x.fillStyle = b.c; x.beginPath(); x.arc(a, c, 9, 0, 6.283); x.fill(); x.strokeStyle = '#000'; x.lineWidth = 2; x.stroke(); } else { x.fillStyle = '#000'; x.beginPath(); x.arc(a, c, 15, 0, 6.283); x.fill(); x.fillStyle = b.c; x.font = '900 20px Impact, Arial Black'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(b.t, a, c + 1); } });
  pageRT.forEach(p => { if (p && Object.keys(save.pages).length >= 6) { const [a, c] = at(p.x, p.z); x.fillStyle = '#fff6d8'; x.fillRect(a - 4, c - 5, 8, 10); } });
  const [a, c] = at(P.x, P.z); x.save(); x.translate(a, c); x.rotate(Math.PI - P.h); x.fillStyle = '#fff'; x.strokeStyle = '#000'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -12); x.lineTo(9, 9); x.lineTo(0, 4); x.lineTo(-9, 9); x.closePath(); x.fill(); x.stroke(); x.restore();
}

/* ───────── camera ───────── */
let camYaw = 0, camSnap = true, camZoom = 1;
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function camAir(dt) {
  const pl = P.plane, q = P.para, x = pl ? pl.x : q.x, y = Math.max(0, pl ? pl.y : q.y), z = pl ? pl.z : q.z, h = pl ? pl.h : q.h;
  camYaw += wrap(h - camYaw) * (camSnap ? 1 : 1 - Math.exp(-dt * 2.2));
  if (save.cam === 2) { camPos.set(x, y + 80 * camZoom, z + 14); camLook.set(x, y, z); }
  else { const far = save.cam === 1 ? 1.6 : 1, dist = (pl ? pl.len * 0.9 + 12 : 9) * far * camZoom, ht = (pl ? 3 + pl.len * 0.12 : 3.2) * far * camZoom;
    camPos.set(x - Math.sin(camYaw) * dist, Math.max(1.5, y + ht), z - Math.cos(camYaw) * dist); camLook.set(x + Math.sin(camYaw) * 6, y + (pl ? 2 : 1.2), z + Math.cos(camYaw) * 6); }
  if (camSnap) camera.position.copy(camPos); else camera.position.lerp(camPos, 1 - Math.exp(-dt * 6));
  camera.lookAt(camLook); camSnap = false; camera.fov = 62 + (pl ? Math.min(14, pl.s * 0.12) : q && !q.open ? 10 : 0); camera.updateProjectionMatrix();
}
function updateCamera(dt) {
  if (P.plane || P.para) { camAir(dt); return; }
  const v = P.veh, h = v ? (fwdSpd(v) < -2 ? v.h : v.h) : P.h, x = P.x, z = P.z;
  camYaw += wrap(h - camYaw) * (camSnap ? 1 : 1 - Math.exp(-dt * (v ? 2.8 : 4)));
  const far = save.cam === 1;
  if (save.cam === 2) { const H = (v ? 70 : 48) * camZoom + (v ? spd(v) * 0.8 : 0); camPos.set(x, H, z + H * 0.18); camLook.set(x, 0, z); }
  else {
    let dist = (v ? 11 + v.s.len * 0.4 + spd(v) * 0.08 : 6.5) * (far ? 1.7 : 1) * camZoom, ht = (v ? 4.6 + v.s.h * 0.6 : 3) * (far ? 1.6 : 1) * camZoom;
    let cx = x - Math.sin(camYaw) * dist, cz = z - Math.cos(camYaw) * dist;
    for (let k = 0; k < 6 && segBlocked(x, z, cx, cz, ht + 0.5); k++) { dist *= 0.72; cx = x - Math.sin(camYaw) * dist; cz = z - Math.cos(camYaw) * dist; }
    camPos.set(cx, ht, cz); camLook.set(x + Math.sin(camYaw) * 4, v ? 1.6 : 1.5, z + Math.cos(camYaw) * 4);
  }
  if (camSnap) camera.position.copy(camPos); else camera.position.lerp(camPos, 1 - Math.exp(-dt * 7));
  camera.lookAt(camLook); camSnap = false;
  camera.fov = 62 + (v ? Math.min(12, spd(v) * 0.35) : 0); camera.updateProjectionMatrix();
}

/* ───────── title & intro ───────── */
function title() {
  mode = 'title'; $('hud').classList.add('hidden');
  const started = Object.keys(save.done).length || save.intro;
  showPanel(`<div style="max-width:860px;margin:auto">
    <div class="row sp" style="margin:0 0 8px"><div class="ey" style="--tc:#ffc83d">ME2804 Air Legislation · Open-world maintenance caper</div><a class="btn g" href="../index.html" style="text-decoration:none;font-size:16px">◂ All games</a></div>
    <div class="logo out">PENCIL <span>WHIP</span></div>
    <div class="out" style="font:400 22px var(--big);letter-spacing:2px;color:#9fd3ff;margin-top:4px">VISTA BAY AIRPORT</div>
    <div class="card" style="margin-top:16px">
      <div style="font-size:16px;line-height:1.55">A crew called <b>Pencil Whip</b> is signing off aircraft maintenance that was never done. You're a newly licensed aircraft engineer. Drive anything on the island, work missions for five contacts, and learn the rules they're breaking:</div>
      <div class="opts" style="grid-template-columns:repeat(2,1fr);margin-top:12px">${Object.entries(TOPICS).map(([k, t]) => { const ks = Object.keys(FACTS).filter(f => FACTS[f].t === k), n = ks.filter(f => save.facts[f]).length; return `<div class="ml" style="grid-template-columns:auto 1fr auto"><span style="width:12px;height:12px;border-radius:50%;background:${t.color}"></span><b>${t.name}</b><span class="muted">${n}/${ks.length}</span></div>`; }).join('')}</div>
      <div class="row"><input type="text" id="nm" maxlength="18" placeholder="Your name (for the certificate)" value="${esc(save.name)}" autocomplete="off" style="flex:1;min-width:200px"></div>
      <div class="keys" style="margin-top:10px">${TOUCH ? 'Left stick: walk/drive · RUN: sprint · ENTER/EXIT button: get in vehicles · BRAKE: handbrake' : '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk / drive · <kbd>Shift</kbd> run · <kbd>F</kbd> enter or take a vehicle · <kbd>Space</kbd> handbrake · <kbd>Esc</kbd> menu · <kbd>M</kbd> map · <kbd>N</kbd> notebook'}</div>
      <div class="row sp"><span class="muted">${started ? `${Object.keys(save.done).length}/${MISSIONS.length} missions · $${save.cash} · progress saved on this device` : `${MISSIONS.length} missions on two islands · ${PAGES.length} hidden logbook pages · two exams`}</span>
      <div class="row" style="margin:0">${started ? '<button class="btn g" id="reset">New game</button>' : ''}<button class="btn" id="start" style="font-size:24px;padding:12px 30px">${started ? 'Continue ▸' : 'Start ▸'}</button></div></div>
    </div></div>`);
  mode = 'title';
  $('nm').oninput = e => { save.name = e.target.value.trim(); persist(); };
  $('start').onclick = () => { au(); loops(); sfx.click(); begin(); };
  if ($('reset')) $('reset').onclick = () => { if (!confirm('Erase all progress and start again?')) return; try { localStorage.removeItem(SKEY); } catch (e) {} location.reload(); };
}
function begin() {
  ui.classList.add('hidden'); $('hud').classList.remove('hidden'); hudCash(); hudRank(); hudStars(); camSnap = true; mode = 'play';
  if (!save.intro) {
    cutscene([
      ['N', 'Vista Bay Airport. Aircraft come and go – and every one needs its maintenance done properly, and signed for properly.'],
      ['N', 'But a crew called <b>PENCIL WHIP</b> has been signing off work that was never done.'],
      ['N', "You're a newly licensed aircraft engineer. Work for the contacts on your radar, learn the rules, and shut Pencil Whip down."],
      ['N', "Drive anything – press <b>F</b> near a vehicle. Break the rules and <b>CAAS inspectors</b> come after you <b style=\"color:#ff4b4b\">★</b>."],
      ['N', "And east across the bridge lies <b>Design Cay</b> – the island where aircraft designs get approved: Type Certificates, STCs and STSOs."]
    ], () => { save.intro = true; persist(); help('Head to <b style="color:#4fc3ff">O</b> on your radar – Rina at the <b>Ops Centre</b>. Walk into her blue marker.', 9000); });
  } else { const nx = Object.keys(CONTACTS).find(k => !CONTACTS[k].island && contactMission(k)); if (nx) help(`Next: <b style="color:${CONTACTS[nx].color}">${nx}</b> – ${CONTACTS[nx].name}.`, 6000); }
}

/* ───────── world population ───────── */
{ const t = L('training'); P.x = t.x - 4; P.z = t.z + 4; P.h = Math.PI * 0.75; }
spawnVeh('van', -150, 14, -Math.PI / 2); spawnVeh('sedan', -172, 14, Math.PI / 2, null, 0xd8343a);
spawnVeh('follow', -138, -94, Math.PI / 2); spawnVeh('tug', -62, -96, Math.PI / 2); spawnVeh('tug', 18, -96, -Math.PI / 2); spawnVeh('cart', 100, -96, Math.PI / 2); spawnVeh('truck', 140, -96, -Math.PI / 2);
spawnVeh('van', -100, -14, 0); spawnVeh('van', 600, 22, Math.PI / 2); spawnVeh('sedan', 668, -22, -Math.PI / 2, null, 0x5b4bc4); spawnVeh('follow', 520, -132, Math.PI / 2); spawnVeh('cart', 46, -14, Math.PI); spawnVeh('caas', 64, 16, Math.PI / 2); spawnVeh('caas', 96, 16, -Math.PI / 2);
for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) if (Math.random() < 0.8) spawnVeh(Math.random() < 0.2 ? 'van' : 'sedan', -98 + i * 9, 36 + k * 16, k ? Math.PI : 0);
for (let i = 0; i < 12; i++) spawnTraffic(false, false);
for (let i = 0; i < 4; i++) spawnTraffic(false, true);
for (let i = 0; i < NX - 1; i++) for (let j = 2; j < NZ - 1; j++) { const cx = (XL[i] + XL[i + 1]) / 2, cz = (ZL[j] + ZL[j + 1]) / 2; for (let k = 0; k < 2; k++) spawnPed(cx, cz); }

/* ───────── main loop ───────── */
let now = 0, last = performance.now(), trafficT = 0;
function update(dt) {
  now += dt;
  updatePlayer(dt);
  for (const v of vehicles) { if (v.ai.role === 'traffic' && v.driver === 'npc') updateTraffic(v, dt); else if (v.ai.role === 'target') updateTarget(v, dt); else if (!v.driver) v.in = { thr: 0, steer: 0, hb: 1 }; }
  updateHeat(dt);
  for (const v of vehicles) stepVeh(v, dt);
  vehPairs();
  if (P.veh) { P.x = P.veh.x; P.z = P.veh.z; P.h = P.veh.h; if (P.veh.crash > 7) sfx.crash(P.veh.crash); }
  for (const v of vehicles) v.crash = 0;
  updatePeds(dt);
  for (const v of vehicles) if (v === P.veh || v.driver === 'target' || v.driver === 'cop') vehFX(v, dt);
  updateFX(dt);
  tod = (tod + dt / 30) % 24; if ((now | 0) % 20 === 0 && ((now - dt) | 0) % 20 !== 0) { save.tod = tod; persist(); }
  $('clock').textContent = clockStr();
  document.body.classList.toggle('inveh', !!(P.veh || P.plane)); document.body.classList.toggle('inheli', !!(P.plane && P.plane.T.heli));
  updatePlanes(dt);
  if (!save.cay && P.x > 470 && !P.plane && !P.para) { save.cay = 1; persist(); big('DESIGN CAY', 'Type Certificate · STC · STSO', '', 3200); help('Contacts here: <b style="color:#9b8cff">T</b> Type Certification · <b style="color:#ff9b42">S</b> STC Mod Hangar · <b style="color:#3fe0c5">P</b> STSO Parts Plant. Finish all six for the <b>Design Board</b> exam.', 10000); }
  updateMission(dt); updateContacts(dt);
  trafficT -= dt; if (trafficT <= 0) { trafficT = 3; const n = vehicles.filter(v => v.ai.role === 'traffic' && v.driver === 'npc').length; if (n < 14 && vehicles.length < 48) spawnTraffic(true, Math.random() < 0.25); }
  // engine note
  if (eng) { const a = AC.currentTime, on = P.veh && mode === 'play'; eng.o.frequency.setTargetAtTime(45 + (P.veh ? Math.abs(fwdSpd(P.veh)) * 3.4 + (P.veh.in.thr > 0 ? 18 : 0) : 0), a, 0.05); eng.g.gain.setTargetAtTime(on ? 0.035 : 0, a, 0.08); }
  if (P.veh) { $('speed').innerHTML = `${Math.round(spd(P.veh) * 3.6)}<small> KM/H</small>`; }
  else if (P.plane && P.plane.T.heli) { const pl = P.plane;
    $('speed').innerHTML = `${Math.round(pl.s * 3.6)}<small> KM/H · ALT ${Math.round(pl.y)} M · ROTOR ${Math.round(pl.rpm * 100)}%</small>`;
    if (eng) { eng.o.frequency.setTargetAtTime(45 + pl.rpm * 38 + pl.s * 0.6, AC.currentTime, 0.05); eng.g.gain.setTargetAtTime(mode === 'play' ? 0.03 * pl.rpm : 0, AC.currentTime, 0.1); }
    update.chop = (update.chop || 0) - dt; if (pl.rpm > 0.15 && update.chop <= 0) { update.chop = 0.11 / pl.rpm; noise(0.06, 0.05 * pl.rpm, 260); } }
  else if (P.plane) { const pl = P.plane, stall = pl.y > 0.5 && pl.s < pl.T.stall * 1.12;
    $('speed').innerHTML = `${Math.round(pl.s * 3.6)}<small> KM/H · ALT ${Math.round(pl.y)} M · THR ${Math.round(pl.thr * 100)}%</small>${stall ? ' <small style="color:#ff4b4b">STALL</small>' : ''}`;
    if (stall && Math.random() < dt * 3) tone(880, 0.08, 'square', 0.04);
    if (eng) { eng.o.frequency.setTargetAtTime(70 + pl.s * 1.4 + pl.thr * 70, AC.currentTime, 0.05); eng.g.gain.setTargetAtTime(mode === 'play' ? 0.045 : 0, AC.currentTime, 0.1); } }
  // tower talk radio
  if (P.veh && save.radio === 2) { talkT -= dt; if (talkT <= 0) { talkT = 15; const ks = Object.keys(save.facts).length ? Object.keys(save.facts) : Object.keys(FACTS), k = ks[Math.random() * ks.length | 0], txt = strip(FACTS[k].x);
    $('ticker').innerHTML = `📻 <b>TOWER TALK</b> · ${txt}`; $('ticker').style.opacity = 1; clearTimeout(update.tk); update.tk = setTimeout(() => { $('ticker').style.opacity = 0; }, 9000);
    try { if (window.speechSynthesis && !save.mute) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.rate = 1.05; u.volume = 0.8; speechSynthesis.speak(u); } } catch (e) {} } }
  if (aircraft['9V-VBX']) { const vbx = PLANES.find(q => q.reg === '9V-VBX'); aircraft['9V-VBX'].userData.prop.rotation.z += dt * (2 + (vbx ? vbx.thr * 45 + (vbx.state === 'player' ? 8 : 0) : 0)); }
}
function tick(t) {
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  if (mode === 'play') { update(dt); drawMini(); }
  else if (mode === 'title') { now += dt; camYaw += dt * 0.08; updateFX(dt); camera.position.set(Math.sin(now * 0.05) * 160, 70, Math.cos(now * 0.05) * 160 - 40); camera.lookAt(0, 0, -40); }
  if (mode !== 'title') updateCamera(dt);
  applyTOD(mode === 'title' ? 0 : P.x, mode === 'title' ? -40 : P.z); skyDome.position.copy(camera.position);
  renderer.render(scene, camera); requestAnimationFrame(tick);
}
hudCash(); hudRank(); title(); requestAnimationFrame(tick);
window.__pw = { P, vehicles, peds, cops, LOC, COL, save, MISSIONS, mode: () => mode, MS: () => MS, heat: () => heat, addHeat, startMission, nextStep, chaseHit, pushOut, enterExit, busted, markers,
  tp: (x, z) => { if (P.veh) { P.veh.x = x; P.veh.z = z; P.veh.vx = P.veh.vz = 0; } P.x = x; P.z = z; camSnap = true; }, advance: () => subAdvance && subAdvance(), openMenu, pageRT, clearHeat, contactRT, setTod: t => { tod = t; }, tod: () => tod, PLANES, keys, boardPlane };
})();
