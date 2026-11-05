'use strict';
/* ═════════════ Air Legislation Academy – ME2804 3D learning game ═════════════ */
const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hex = c => '#' + c.toString(16).padStart(6, '0');
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ───────── save data ───────── */
let save = { name: '', done: {}, stars: [], exam: 0, briefed: {} };
try { Object.assign(save, JSON.parse(localStorage.getItem('ala_save') || '{}')); } catch (e) {}
const persist = () => { try { localStorage.setItem('ala_save', JSON.stringify(save)); } catch (e) {} };
const RANKS = [[0, 'Cadet'], [200, 'Apprentice Engineer'], [600, 'Aircraft Technician'], [1100, 'Aerospace Engineer'], [1700, 'Chief Engineer']];
const totalXP = () => Object.values(save.done).reduce((s, d) => s + d.xp, 0) + save.stars.length * 5 + (save.exam >= 8 ? 200 : 0);
const rankOf = xp => { let r = RANKS[0], nx = null; for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i][0]) { r = RANKS[i]; nx = RANKS[i + 1] || null; } return { r, nx }; };
const doneCount = () => ZONES.filter(z => save.done[z.id]).length;

/* ───────── three.js setup ───────── */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0ff);
scene.fog = new THREE.Fog(0x8fd0ff, 140, 480);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1500);
scene.add(new THREE.HemisphereLight(0xffffff, 0x6b8e5a, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 0.75); sun.position.set(80, 150, 60); scene.add(sun);
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const mats = {};
const M = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
function B(parent, w, h, d, color, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(color)); m.position.set(x, y + h / 2, z); parent.add(m); return m; }
function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function label(text, o = {}) {
  const w = o.w || 512, h = o.h || 128, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.fillStyle = o.bg || 'rgba(16,32,59,.88)'; rr(x, 4, 4, w - 8, h - 8, 26); x.fill();
  if (o.border) { x.strokeStyle = o.border; x.lineWidth = 6; x.stroke(); }
  let size = o.size || 54; x.font = `bold ${size}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = o.fg || '#fff';
  while (x.measureText(text).width > w - 40 && size > 16) { size -= 2; x.font = `bold ${size}px sans-serif`; }
  x.fillText(text, w / 2, h / 2 + 3);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  const sc = o.scale || [8, 2]; s.scale.set(sc[0], sc[1], 1); return s;
}

/* ───────── models ───────── */
function faceTex(skin) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = hex(skin); x.fillRect(0, 0, 64, 64); x.fillStyle = '#222';
  x.fillRect(16, 22, 8, 10); x.fillRect(40, 22, 8, 10); x.lineWidth = 4; x.strokeStyle = '#222'; x.beginPath(); x.arc(32, 38, 12, 0.2, Math.PI - 0.2); x.stroke();
  return new THREE.CanvasTexture(c);
}
function makeChar(o) {
  const g = new THREE.Group(), skin = o.skin || 0xf1c27d;
  const hd = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), [M(skin), M(skin), M(skin), M(skin), new THREE.MeshLambertMaterial({ map: faceTex(skin) }), M(skin)]);
  hd.position.y = 3.65; g.add(hd);
  B(g, 1.8, 1.9, 1, o.shirt || 0x2e86de, 0, 1.5, 0);
  B(g, 1.85, 0.5, 1.05, o.accent || 0xffffff, 0, 2.5, 0);
  const mkLimb = (w, h, color, x, y) => { const p = new THREE.Group(); p.position.set(x, y, 0); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), M(color)); m.position.y = -h / 2; p.add(m); g.add(p); return p; };
  const legL = mkLimb(0.85, 1.55, o.pants || 0x34495e, -0.45, 1.55), legR = mkLimb(0.85, 1.55, o.pants || 0x34495e, 0.45, 1.55);
  const armL = mkLimb(0.8, 1.7, skin, -1.3, 3.35), armR = mkLimb(0.8, 1.7, skin, 1.3, 3.35);
  if (o.hat !== undefined) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.55, 14), M(o.hat)); h.position.y = 4.55; g.add(h); B(g, 1.9, 0.12, 1.9, o.hat, 0, 4.25, 0.1); }
  else B(g, 1.5, 0.5, 1.5, o.hair || 0x3b2a1a, 0, 4.2, -0.05);
  g.userData = { legL, legR, armL, armR };
  return g;
}
function animChar(g, t, moving, air) {
  const u = g.userData, s = moving ? Math.sin(t * 11) * 0.9 : 0;
  u.legL.rotation.x = air ? 0.5 : s; u.legR.rotation.x = air ? -0.5 : -s;
  u.armL.rotation.x = air ? -2.6 : -s; u.armR.rotation.x = air ? -2.6 : s;
  if (!moving && !air) { u.armL.rotation.x = Math.sin(t * 2) * 0.05; u.armR.rotation.x = -Math.sin(t * 2) * 0.05; }
}
function makePlane(body = 0xffffff, accent = 0xe74c3c) {
  const g = new THREE.Group();
  B(g, 1.7, 1.7, 8, body, 0, -0.85, 0); B(g, 12, 0.3, 2.2, accent, 0, -0.1, 0.4); B(g, 4.4, 0.25, 1.3, accent, 0, 0, -3.6); B(g, 0.25, 2, 1.5, accent, 0, 0.6, -3.5);
  B(g, 1.3, 0.7, 1.9, 0x5dade2, 0, 0.35, 1.2);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.4, 10), M(accent)); nose.rotation.x = Math.PI / 2; nose.position.z = 4.6; g.add(nose);
  const prop = B(g, 0.3, 3.4, 0.2, 0x333333, 0, -2.5, 5.4); g.userData.prop = prop;
  B(g, 0.3, 0.8, 0.3, 0x333, -2.2, -1.05, 1); B(g, 0.3, 0.8, 0.3, 0x333, 2.2, -1.05, 1);
  return g;
}
function makeDrone() {
  const g = new THREE.Group(); B(g, 2.2, 0.7, 2.2, 0xffffff, 0, 0, 0); B(g, 0.9, 0.7, 0.9, 0x222222, 0, -0.7, 0.6); g.userData.rot = [];
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { B(g, 1.9, 0.18, 0.3, 0xe84393, a * 1.1, 0.25, b * 1.1).rotation.y = Math.atan2(a, b) + 0.8;
    const r = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.05, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 })); r.position.set(a * 1.9, 0.7, b * 1.9); g.add(r); g.userData.rot.push(r); });
  return g;
}

/* ───────── world ───────── */
const anim = [], colliders = [], world = new THREE.Group(); scene.add(world);
const ocean = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshLambertMaterial({ color: 0x3a9be8 })); ocean.rotation.x = -Math.PI / 2; ocean.position.y = -2.3; world.add(ocean);
const ISLE = 114;
{ const sand = new THREE.Mesh(new THREE.CylinderGeometry(ISLE + 9, ISLE + 13, 3, 56), M(0xe9d7a0)); sand.position.y = -2.4; world.add(sand);
  const isl = new THREE.Mesh(new THREE.CylinderGeometry(ISLE, ISLE + 3, 4, 56), M(0x6dbb55)); isl.position.y = -2; world.add(isl);
  const hub = new THREE.Mesh(new THREE.CircleGeometry(16, 48), M(0xd7dde6)); hub.rotation.x = -Math.PI / 2; hub.position.y = 0.06; world.add(hub);
  const hub2 = new THREE.Mesh(new THREE.RingGeometry(10, 11, 48), M(0x2e86de)); hub2.rotation.x = -Math.PI / 2; hub2.position.y = 0.09; world.add(hub2); }

const R = 66, RT = [];   // zone ring radius
const zoneRT = ZONES.map((def, i) => {
  const th = -Math.PI / 2 + i * (Math.PI * 2 / ZONES.length), px = Math.cos(th) * R, pz = Math.sin(th) * R;
  const g = new THREE.Group(); g.position.set(px, 0, pz); g.rotation.y = Math.atan2(-px, -pz); world.add(g); g.updateMatrixWorld(true);
  // path
  const pathLen = R - 16 - 9, pm = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, pathLen), M(0xcfc3a0));
  pm.position.set(px * (16 + pathLen / 2 + 0) / R + 0, 0.05, pz * (16 + pathLen / 2) / R); pm.rotation.y = Math.atan2(px, pz); world.add(pm);
  // base building
  const c = def.color, dark = new THREE.Color(c).multiplyScalar(0.55).getHex();
  B(g, 28, 0.5, 24, 0x9aa5b1, 0, 0, 0);
  B(g, 18, 10, 12, c, 0, 0.5, -2); B(g, 19.6, 0.8, 13.2, dark, 0, 10.5, -2); B(g, 3.6, 5, 0.4, 0x2c3e50, 0, 0.5, 4.1);
  [-6, 6].forEach(x => [3.5, 7].forEach(y => B(g, 2.4, 2, 0.3, 0xcdeeff, x, y, 4.05)));
  const sign = label(`${i + 1}  ${def.name}`, { w: 640, h: 128, scale: [19, 3.8], border: hex(c) }); sign.position.set(0, 15.5, 4.5); g.add(sign);
  decorate(def.id, g, c, dark);
  // npc
  const npc = makeChar({ shirt: def.npcLook.shirt, hat: def.npcLook.hat, skin: [0xf1c27d, 0xc68642, 0xe0ac69, 0x8d5524][i % 4] });
  npc.position.copy(g.localToWorld(new THREE.Vector3(0, 0, 12.5))); npc.rotation.y = g.rotation.y; world.add(npc);
  const npcPos = npc.position.clone();
  const nm = label(def.npc, { w: 400, h: 90, scale: [6.5, 1.5], size: 44 }); nm.position.set(0, 6.6, 0); npc.add(nm);
  let mark = label('❗', { w: 128, h: 128, scale: [2.6, 2.6], bg: 'rgba(0,0,0,0)', size: 90 }); mark.position.set(0, 8.7, 0); npc.add(mark);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(5.5, 32), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.35 })); pad.rotation.x = -Math.PI / 2; pad.position.set(npcPos.x, 0.12, npcPos.z); world.add(pad);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 90, 14, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }));
  beam.position.set(px, 60, pz); world.add(beam);
  colliders.push({ x: g.localToWorld(new THREE.Vector3(0, 0, -2)).x, z: g.localToWorld(new THREE.Vector3(0, 0, -2)).z, r: 11.4 });
  const z = { def, g, npc, npcPos, mark, beam, pad, px, pz, idx: i, baseFront: g.localToWorld(new THREE.Vector3(0, 0, 18)) };
  anim.push((t) => { npc.position.y = Math.abs(Math.sin(t * 2 + i)) * 0.15; mark.position.y = 8.7 + Math.sin(t * 3 + i) * 0.35; beam.material.opacity = 0.2 + Math.sin(t * 2 + i) * 0.08; });
  return z;
});
function setMark(z) { z.npc.remove(z.mark); z.mark = label(save.done[z.def.id] ? '✅' : '❗', { w: 128, h: 128, scale: [2.6, 2.6], bg: 'rgba(0,0,0,0)', size: 90 }); z.mark.position.set(0, 8.7, 0); z.npc.add(z.mark); }
function updateVisuals() { zoneRT.forEach(z => { setMark(z); const d = !!save.done[z.def.id]; z.beam.material.color.setHex(d ? 0xf1c40f : z.def.color); z.pad.material.color.setHex(d ? 0xf1c40f : z.def.color); }); }

function decorate(id, g, c, dark) {
  const spin = (m, s) => anim.push((t, dt) => m.rotation.y += dt * s);
  if (id === 'history') { const r = new THREE.Mesh(new THREE.CylinderGeometry(9.2, 9.2, 12.6, 24), M(dark)); r.rotation.x = Math.PI / 2; r.scale.y = 0.55; r.position.set(0, 11, -2); g.add(r);
    const p = makePlane(0xffffff, 0xe67e22); p.position.set(-10, 2.4, 13); p.rotation.y = 0.5; p.scale.setScalar(0.9); g.add(p); spin(p.userData.prop, 0); anim.push((t) => p.userData.prop.rotation.z = t * 40); }
  if (id === 'chicago' || id === 'act') { for (let k = -3; k <= 3; k++) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 9.5, 12), M(0xf5f5f5)); col.position.set(k * 2.6, 5.3, 5.2); g.add(col); }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(12, 4.2, 4), M(dark)); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.75; roof.position.set(0, 13, -1.5); g.add(roof);
    if (id === 'act') { const d = new THREE.Mesh(new THREE.SphereGeometry(4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(0xf5f5f5)); d.position.set(0, 11.2, -3); g.add(d); } }
  if (id === 'icao') { B(g, 8, 24, 8, 0x5dade2, 0, 0.5, -9); B(g, 8.2, 1, 8.2, 0x1b4f72, 0, 24.5, -9);
    [-1, 1].forEach(s => { B(g, 0.3, 12, 0.3, 0xbdc3c7, s * 12, 0.5, 8); B(g, 4, 2.4, 0.2, 0x2e86de, s * 14, 9.8, 8); });
    const gl = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12), M(0x2e86de)); gl.position.set(0, 12.5, -2); g.add(gl); spin(gl, 1); }
  if (id === 'works') { const d = new THREE.Mesh(new THREE.SphereGeometry(7.5, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(0xcdb4e6)); d.position.set(0, 11, -2); g.add(d);
    [['Assembly', -9, 0xe67e22], ['Council', 0, 0x2e86de], ['Secretariat', 9, 0x27ae60]].forEach(([n, x, col]) => { B(g, 5, 2.4, 2.4, col, x, 0.5, 8.2); const l = label(n, { w: 300, h: 80, scale: [5, 1.35], size: 40 }); l.position.set(x, 4.8, 8.2); g.add(l); }); }
  if (id === 'states') { B(g, 6, 1.6, 6, 0xbdc3c7, 0, 0.5, 6.5);
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d'); x.fillStyle = '#1f6fb5'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#4caf50';
    const rg = mulberry(7); for (let k = 0; k < 26; k++) { x.beginPath(); x.ellipse(rg() * 512, 30 + rg() * 190, 14 + rg() * 40, 10 + rg() * 26, rg() * 3, 0, 7); x.fill(); }
    const gb = new THREE.Mesh(new THREE.SphereGeometry(5.2, 28, 20), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(cv) })); gb.position.set(0, 9.4, 6.5); g.add(gb); spin(gb, 0.5);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, fx = Math.cos(a) * 9, fz = 6.5 + Math.sin(a) * 9; B(g, 0.2, 5, 0.2, 0xdddddd, fx, 0.5, fz); B(g, 1.8, 1.1, 0.12, [0xe74c3c, 0x2e86de, 0xf1c40f, 0x27ae60, 0xffffff][k % 5], fx + 0.9, 4, fz); } }
  if (id === 'sar') { for (let k = 0; k < 6; k++) for (let l = 0; l < 3; l++) B(g, 2, 2, 2, [0xf39c12, 0xe67e22, 0xf5d76e][(k + l) % 3], -11 + (k % 2) * 0 + (k < 3 ? -2.5 : 24.5) - 2.5 * 0, 0.5 + l * 2.1, -6 + (k % 3) * 3);
    B(g, 4, 14, 4, 0xd4ac0d, 0, 10.9, -6); const b = label('SAR', { w: 200, h: 90, scale: [4, 1.8] }); b.position.set(0, 26.5, -6); g.add(b); }
  if (id === 'ano') { [-1, 1].forEach(s => B(g, 1.4, 9, 1.4, 0xf5f5f5, s * 6.5, 0.5, 8)); B(g, 15, 1.6, 1.6, 0x1e8449, 0, 9.5, 8); const l = label('ANO CHECKPOINT', { w: 512, h: 90, scale: [10, 1.8], size: 44 }); l.position.set(0, 11.8, 8); g.add(l);
    B(g, 3, 3.4, 3, 0x2c3e50, 9, 0.5, 9); const arm = new THREE.Group(); arm.position.set(-6.5, 3, 8); g.add(arm); const bar = B(arm, 12, 0.5, 0.5, 0xe74c3c, 6, 0, 0); anim.push(t => arm.rotation.z = (Math.sin(t * 0.8) * 0.5 + 0.5) * 1.1); }
  if (id === 'uas') { const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(20, 14, 16)), new THREE.LineBasicMaterial({ color: 0xe84393 })); cage.position.set(0, 7.5, 12); g.add(cage);
    [-6, 0, 6].forEach((x, k) => { const pd = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.15, 20), M(0x2d3436)); pd.position.set(x, 0.6, 12); g.add(pd);
      const d = makeDrone(); d.position.set(x, 4 + k * 1.6, 12); g.add(d); anim.push((t) => { d.position.y = 4 + k * 1.6 + Math.sin(t * 2 + k) * 0.6; d.rotation.y = t * 0.6; d.userData.rot.forEach(r => r.rotation.y = t * 30); }); }); }
}

/* hub */
{ B(world, 6, 1.2, 6, 0xbdc3c7, -3, 0, -3); const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 5, 10), M(0x2e86de)); col.position.y = 3.2; world.add(col);
  const hp = makePlane(0xffffff, 0xf1c40f); hp.position.y = 8.5; hp.scale.setScalar(0.9); world.add(hp); anim.push((t) => { hp.rotation.y = t * 0.7; hp.rotation.z = 0.25; hp.userData.prop.rotation.z = t * 40; });
  const t = label('AIR LEGISLATION ACADEMY', { w: 640, h: 110, scale: [14, 2.4], size: 52, border: '#f1c40f' }); t.position.y = 14; world.add(t);
  colliders.push({ x: 0, z: 0, r: 3.6 }); }
const examiner = makeChar({ shirt: 0x111111, accent: 0xf1c40f, hat: 0x111111, skin: 0xe0ac69, pants: 0x111111 }); examiner.position.set(0, 0, 8); world.add(examiner);
{ const nm = label('Chief Examiner', { w: 440, h: 90, scale: [7, 1.5], size: 46, border: '#f1c40f' }); nm.position.y = 6.6; examiner.add(nm); }
const examPos = examiner.position.clone();

/* trees / clouds / stars */
{ const rg = mulberry(42); let n = 0, tries = 0;
  while (n < 70 && tries++ < 2000) { const a = rg() * 7, r = 20 + rg() * 92, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (zoneRT.some(zn => Math.hypot(x - zn.px, z - zn.pz) < 24) || zoneRT.some(zn => Math.hypot(x - zn.npcPos.x, z - zn.npcPos.z) < 14)) continue;
    if (zoneRT.some(zn => { const a1 = Math.atan2(zn.pz, zn.px), d = Math.abs(Math.atan2(Math.sin(a - a1), Math.cos(a - a1))); return d < 0.2 && r < R + 12; })) continue;
    const t = new THREE.Group(); const s = 0.55 + rg() * 0.5; B(t, 1, 3.2, 1, 0x8a5a2b, 0, 0, 0); B(t, 4.2, 3, 4.2, 0x2e9d4a, 0, 3, 0); B(t, 2.8, 2.4, 2.8, 0x37b457, 0, 6, 0); t.scale.setScalar(s); t.position.set(x, 0, z); world.add(t); colliders.push({ x, z, r: 1.3 * s }); n++; } }
const clouds = []; { const rg = mulberry(9); for (let i = 0; i < 16; i++) { const c = new THREE.Group(); for (let k = 0; k < 5; k++) { const m = B(c, 12 + rg() * 12, 5 + rg() * 3, 8 + rg() * 8, 0xffffff, k * 9 - 18, rg() * 3, rg() * 8 - 4); m.material = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 }); }
  c.position.set(rg() * 700 - 350, 90 + rg() * 60, rg() * 700 - 350); scene.add(c); clouds.push(c); } }
const stars = [];
{ const rg = mulberry(1234); let n = 0, tries = 0;
  while (n < FACTS.length && tries++ < 3000) { const a = rg() * 7, r = 14 + rg() * 95, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (zoneRT.some(zn => Math.hypot(x - zn.px, z - zn.pz) < 18) || stars.some(s => Math.hypot(s.x - x, s.z - z) < 14)) continue;
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(1.1), new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0xb8860b })); m.scale.y = 1.4; m.position.set(x, 2.4, z); world.add(m);
    stars.push({ m, x, z, i: n, got: save.stars.includes(n) }); if (save.stars.includes(n)) m.visible = false; n++; } }

/* ───────── player ───────── */
const player = makeChar({ shirt: 0x1abc9c, accent: 0xf1c40f, hat: 0xf1c40f, skin: 0xf1c27d, pants: 0x2c3e50 }); world.add(player);
const P = { pos: new THREE.Vector3(0, 0, 26), vy: 0, heading: Math.PI, air: false };
let camYaw = 0, camPitch = 0.38, camDist = 17;
let mode = 'title';   // title | explore | modal | crates | flight
const keys = {}, joy = { x: 0, y: 0 };
let timeT = 0;

function resolveCollide(p) {
  for (const c of colliders) { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), min = c.r + 0.9; if (d < min && d > 0.001) { p.x = c.x + dx / d * min; p.z = c.z + dz / d * min; } }
  const r = Math.hypot(p.x, p.z); if (r > ISLE - 2) { p.x *= (ISLE - 2) / r; p.z *= (ISLE - 2) / r; }
}
function updateExplore(dt) {
  const fw = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) + (-joy.y), rt = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
  let vx = -Math.sin(camYaw) * fw + Math.cos(camYaw) * rt, vz = -Math.cos(camYaw) * fw - Math.sin(camYaw) * rt;
  const len = Math.hypot(vx, vz), moving = len > 0.1; const run = keys.ShiftLeft || keys.ShiftRight; const sp = run ? 24 : 15;
  if (moving) { vx /= Math.max(len, 1); vz /= Math.max(len, 1); P.pos.x += vx * sp * dt; P.pos.z += vz * sp * dt; const target = Math.atan2(vx, vz); let d = target - P.heading; d = Math.atan2(Math.sin(d), Math.cos(d)); P.heading += d * Math.min(1, dt * 14); }
  if (keys.Space && !P.air) { P.vy = 15; P.air = true; }
  P.vy -= 42 * dt; P.pos.y += P.vy * dt; if (P.pos.y <= 0) { P.pos.y = 0; P.vy = 0; P.air = false; }
  resolveCollide(P.pos);
  player.position.copy(P.pos); player.rotation.y = P.heading; animChar(player, timeT, moving, P.air);
}
function updateCamera(dt, snap) {
  const tx = P.pos.x, ty = P.pos.y + 3.4, tz = P.pos.z;
  const cx = tx + Math.sin(camYaw) * Math.cos(camPitch) * camDist, cy = Math.max(1.2, ty + Math.sin(camPitch) * camDist), cz = tz + Math.cos(camYaw) * Math.cos(camPitch) * camDist;
  camera.position.set(cx, cy, cz); camera.lookAt(tx, ty, tz);
}

/* ───────── input ───────── */
const GAME_KEYS = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (GAME_KEYS.includes(e.code) && mode !== 'modal' && mode !== 'title') e.preventDefault();
  keys[e.code] = true;
  if (e.repeat) return;
  if (e.code === 'KeyE' || e.code === 'Enter') act();
  if (e.code === 'Escape') escape();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
let drag = null;
canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => { if (!drag || mode === 'flight') return; camYaw -= (e.clientX - drag.x) * 0.0055; camPitch = clamp(camPitch + (e.clientY - drag.y) * 0.004, 0.05, 1.25); drag.x = e.clientX; drag.y = e.clientY; });
canvas.addEventListener('pointerup', () => drag = null);
canvas.addEventListener('wheel', e => { camDist = clamp(camDist + e.deltaY * 0.01, 8, 30); }, { passive: true });
if ('ontouchstart' in window) {
  $('touch').classList.remove('hidden'); const st = $('stick'), kn = $('knob'); let id = null;
  const mv = e => { const r = st.getBoundingClientRect(), dx = e.clientX - (r.left + 60), dy = e.clientY - (r.top + 60), d = Math.min(1, Math.hypot(dx, dy) / 50), a = Math.atan2(dy, dx); joy.x = Math.cos(a) * d; joy.y = Math.sin(a) * d; kn.style.left = 35 + joy.x * 40 + 'px'; kn.style.top = 35 + joy.y * 40 + 'px'; };
  st.addEventListener('pointerdown', e => { id = e.pointerId; st.setPointerCapture(id); mv(e); });
  st.addEventListener('pointermove', e => { if (e.pointerId === id) mv(e); });
  const end = () => { id = null; joy.x = joy.y = 0; kn.style.left = kn.style.top = '35px'; }; st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  $('bJump').addEventListener('pointerdown', () => { keys.Space = true; setTimeout(() => keys.Space = false, 150); });
  $('bAct').addEventListener('pointerdown', act);
}

/* ───────── HUD ───────── */
const toastEl = $('toast'); let toastT = 0;
function toast(html, ms = 3200) { toastEl.innerHTML = html; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), ms); }
function hitFlash() { const f = $('fb-hit'); f.style.transition = 'none'; f.style.opacity = 1; requestAnimationFrame(() => { f.style.transition = 'opacity .5s'; f.style.opacity = 0; }); }
let lastRank = null;
function nextZone() { return zoneRT.find(z => !save.done[z.def.id]) || null; }
function refreshHUD(quiet) {
  const xp = totalXP(), { r, nx } = rankOf(xp);
  $('pname').textContent = save.name; $('rank').textContent = r[1]; $('xptxt').textContent = xp + ' XP' + (nx ? ` / ${nx[0]}` : ' (MAX)'); $('startxt').textContent = save.stars.length + '/' + FACTS.length;
  $('xpfill').style.width = (nx ? (xp - r[0]) / (nx[0] - r[0]) * 100 : 100) + '%';
  const nz = nextZone();
  $('qlist').innerHTML = zoneRT.map(z => `<div class="q ${save.done[z.def.id] ? 'done' : z === nz ? 'next' : ''}"><span class="dot" style="background:${save.done[z.def.id] ? '#7dffa8' : hex(z.def.color)}"></span>${z.idx + 1}. ${z.def.name}${save.done[z.def.id] ? ' ✔ ' + save.done[z.def.id].pct + '%' : ''}</div>`).join('') + `<div class="q ${doneCount() === ZONES.length ? (save.exam >= 8 ? 'done' : 'next') : ''}"><span class="dot" style="background:#f1c40f"></span>🎓 Final Exam${save.exam >= 8 ? ' ✔ ' + save.exam + '/10' : ''}</div>`;
  if (mode !== 'crates' && mode !== 'flight') setObj(nz ? `Next: visit <b>${nz.idx + 1}. ${nz.def.name}</b> (glowing beacon on the map)` : (save.exam >= 8 ? '🏆 Licensed! Explore & collect all ⭐ stars' : '🎓 All zones done – see the <b>Chief Examiner</b> at the Academy hub!'));
  if (lastRank && lastRank !== r[1] && !quiet) toast(`🎖️ Rank up! You are now a <b>${r[1]}</b>`, 4500); lastRank = r[1];
}
const setObj = h => { $('obj').innerHTML = h; };
const setHint = h => { $('hint').innerHTML = h; };
const EXPLORE_HINT = 'WASD / Arrows: move · Shift: run · Space: jump<br>Drag mouse: look · Wheel: zoom · E: talk / interact';

/* ───────── panels ───────── */
const overlay = $('overlay'), panelEl = $('panel');
function showPanel(html, color) { panelEl.style.setProperty('--zc', hex(color || 0x2e86de)); panelEl.innerHTML = html; overlay.classList.remove('hidden'); panelEl.style.animation = 'none'; void panelEl.offsetWidth; panelEl.style.animation = ''; panelEl.scrollTop = 0; mode = 'modal'; drag = null; }
function hidePanel() { overlay.classList.add('hidden'); mode = 'explore'; setHint(EXPLORE_HINT); refreshHUD(); }
const q$ = s => panelEl.querySelector(s), qa$ = s => panelEl.querySelectorAll(s);

/* ───────── zone dialogue ───────── */
let activeZone = null;
function openZone(z) {
  activeZone = z; const d = z.def, done = save.done[d.id], br = save.briefed[d.id];
  showPanel(`<span class="tag">Zone ${z.idx + 1} · ${d.topic}</span><h2>${d.name}</h2>
  <div class="npc"><div class="face">🧑‍✈️</div><div class="say"><b>${d.npc}:</b> ${d.intro}</div></div>
  ${done ? `<div class="fb ok">✅ Badge earned – best score <b>${done.pct}%</b> (+${done.xp} XP)</div>` : ''}
  <div class="row"><button class="btn alt" id="cl">Not now</button><span style="display:flex;gap:8px;flex-wrap:wrap">
  <button class="btn ${br ? 'alt' : ''}" id="br">📖 ${br ? 'Review briefing' : 'Start briefing'}</button>
  <button class="btn go" id="ch" ${br ? '' : 'disabled title="Read the briefing first"'}>🎯 ${done ? 'Replay challenges' : 'Start challenges'}</button></span></div>`, d.color);
  q$('#cl').onclick = hidePanel; q$('#br').onclick = () => runCards(z, 0); q$('#ch').onclick = () => runStages(z, 0, { ft: 0, n: 0 });
}
function runCards(z, i) {
  const d = z.def, c = d.cards[i], last = i === d.cards.length - 1;
  showPanel(`<span class="tag">${d.name} · Briefing ${i + 1}/${d.cards.length}</span>
  <div class="card"><span class="src">${c.s}</span><div class="big">${c.i}</div><h3>${c.t}</h3>${c.b}</div>
  <div class="row"><button class="btn alt" id="pv" ${i ? '' : 'disabled'}>◀ Back</button><div class="dots">${d.cards.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
  <button class="btn ${last ? 'go' : ''}" id="nx">${last ? '✔ Got it!' : 'Next ▶'}</button></div>`, d.color);
  q$('#pv').onclick = () => runCards(z, i - 1);
  q$('#nx').onclick = () => { if (!last) return runCards(z, i + 1); save.briefed[d.id] = true; persist(); openZone(z); toast('🎯 Challenges unlocked! Prove what you learned.'); };
}
function runStages(z, i, stats) {
  const sts = z.def.stages; if (i >= sts.length) return finishZone(z, stats);
  const st = sts[i], next = s => { stats.ft += s.ft; stats.n += s.n; runStages(z, i + 1, stats); };
  const head = `<span class="tag">${z.def.name} · Challenge ${i + 1}/${sts.length}</span>`;
  ({ quiz: runQuiz, order: runOrder, sort: runSort, crates: startCrates, flight: startFlight })[st.type](z, st, next, head);
}
function finishZone(z, s) {
  const pct = Math.round(s.ft / s.n * 100), xp = 100 + pct, prev = save.done[z.def.id], first = !prev;
  if (!prev || xp > prev.xp) save.done[z.def.id] = { xp, pct }; persist(); updateVisuals(); refreshHUD();
  const stars = pct >= 90 ? '⭐⭐⭐' : pct >= 70 ? '⭐⭐' : '⭐';
  showPanel(`<div style="text-align:center"><div class="big-sc">🏅</div><h2>${first ? 'Badge earned!' : 'Challenge complete'}</h2><h3>${z.def.name}</h3>
  <div style="font-size:30px">${stars}</div><p style="font-size:18px">First-try accuracy: <b>${pct}%</b> (${s.ft}/${s.n})<br>+<b>${xp}</b> XP</p>
  ${pct < 100 ? '<p style="color:#667">Tip: replay the challenges to improve your score!</p>' : '<p>Perfect run! 🎉</p>'}
  <p><b>${doneCount()}/${ZONES.length}</b> training zones complete${doneCount() === ZONES.length ? ' – visit the <b>Chief Examiner</b> at the hub for your final exam!' : ''}</p>
  <div class="row" style="justify-content:center"><button class="btn alt" id="rp">🔁 Replay</button><button class="btn go" id="ok">Continue exploring ▶</button></div></div>`, z.def.color);
  q$('#rp').onclick = () => runStages(z, 0, { ft: 0, n: 0 }); q$('#ok').onclick = hidePanel;
}

/* ───────── stage: quiz ───────── */
let examMissed = [];
function runQuiz(z, st, done, head, exam) {
  const qs = st.qs; let k = 0, ft = 0; const d = z.def;
  const show = () => {
    const q = qs[k], opts = shuffle([q.a, ...q.wrong]); let wrongOnce = false;
    showPanel(`${head || ''}<h3>${st.title} · ${k + 1}/${qs.length}</h3><div class="bar"><i style="width:${k / qs.length * 100}%"></i></div>
    <div style="font-size:18px;font-weight:700;line-height:1.4">${q.q}</div><div class="opts">${opts.map((o, j) => `<button class="opt" data-j="${j}">${o}</button>`).join('')}</div>
    <div id="fbk"></div><div class="row"><span></span><button class="btn go hidden" id="nx">${k === qs.length - 1 ? 'Finish ▶' : 'Next ▶'}</button></div>`, d.color);
    const all = qa$('.opt'), fb = q$('#fbk'), nx = q$('#nx');
    all.forEach(b => b.onclick = () => {
      const ok = opts[+b.dataset.j] === q.a;
      if (ok) { b.classList.add('ok'); all.forEach(x => x.disabled = true); if (!wrongOnce) ft++; fb.className = 'fb ok'; fb.innerHTML = '✅ <b>Correct!</b> ' + q.w; nx.classList.remove('hidden'); }
      else { wrongOnce = true; b.classList.add('bad'); b.disabled = true; hitFlash();
        if (exam) { all.forEach(x => { x.disabled = true; if (opts[+x.dataset.j] === q.a) x.classList.add('ok'); }); fb.className = 'fb bad'; fb.innerHTML = '❌ ' + q.w; nx.classList.remove('hidden'); examMissed.push(q.zid); }
        else { fb.className = 'fb bad'; fb.innerHTML = '❌ Not quite – think back to the briefing and try another answer.'; } }
    });
    nx.onclick = () => { k++; k < qs.length ? show() : done({ ft, n: qs.length }); };
  };
  show();
}
/* ───────── stage: order ───────── */
function runOrder(z, st, done, head) {
  const n = st.items.length, view = shuffle(st.items.map((t, i) => ({ t, i }))), placed = new Set(), miss = new Set(); let k = 0;
  const draw = (shake, msg) => {
    showPanel(`${head}<h3>${st.title}</h3><p style="margin:0 0 6px">${st.prompt}</p><div class="slots">${st.items.map((t, i) => `<div class="slot ${i < k ? 'f' : ''} ${shake && i === k ? 'shake' : ''}"><span>${i + 1}.</span>${i < k ? st.items[i] : ''}</div>`).join('')}</div>
    <div class="opts">${view.filter(v => !placed.has(v.i)).map(v => `<button class="opt" data-i="${v.i}">${v.t}</button>`).join('')}</div>
    <div id="fbk">${msg ? `<div class="fb bad">${msg}</div>` : ''}</div>`, z.def.color);
    qa$('.opt').forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (i === k) { placed.add(i); k++; if (k === n) { showPanel(`${head}<h3>${st.title}</h3><div class="slots">${st.items.map((t, j) => `<div class="slot f"><span>${j + 1}.</span>${t}</div>`).join('')}</div><div class="fb ok">✅ Perfect order!</div><div class="row"><span></span><button class="btn go" id="nx">Next ▶</button></div>`, z.def.color); q$('#nx').onclick = () => done({ ft: n - miss.size, n }); } else draw(false); }
      else { miss.add(k); hitFlash(); draw(true, `❌ That is not position ${k + 1}. Think back to the briefing!`); }
    });
  };
  draw(false);
}
/* ───────── stage: sort ───────── */
function runSort(z, st, done, head) {
  const items = shuffle(st.items); let k = 0, ft = 0;
  const show = () => {
    const [txt, b, why] = items[k]; let wrongOnce = false;
    showPanel(`${head}<h3>${st.title} · ${k + 1}/${items.length}</h3><div class="bar"><i style="width:${k / items.length * 100}%"></i></div><p style="margin:0">${st.prompt}</p>
    <div class="card" style="min-height:0;margin:10px 0;font-weight:700;font-size:19px">${txt}</div>
    <div class="bk" style="grid-template-columns:repeat(${st.buckets.length},1fr)">${st.buckets.map((n, j) => `<button class="opt" data-j="${j}" style="text-align:center">${n}</button>`).join('')}</div>
    <div id="fbk"></div><div class="row"><span></span><button class="btn go hidden" id="nx">${k === items.length - 1 ? 'Finish ▶' : 'Next ▶'}</button></div>`, z.def.color);
    const all = qa$('.opt'), fb = q$('#fbk'), nx = q$('#nx');
    all.forEach(x => x.onclick = () => {
      if (+x.dataset.j === b) { x.classList.add('ok'); all.forEach(y => y.disabled = true); if (!wrongOnce) ft++; fb.className = 'fb ok'; fb.innerHTML = '✅ <b>Correct!</b> ' + why; nx.classList.remove('hidden'); }
      else { wrongOnce = true; x.classList.add('bad'); x.disabled = true; hitFlash(); fb.className = 'fb bad'; fb.innerHTML = '❌ Not quite – try the other option.'; }
    });
    nx.onclick = () => { k++; k < items.length ? show() : done({ ft, n: items.length }); };
  };
  show();
}

/* ───────── stage: warehouse dash (3D crates) ───────── */
let CR = null;
function startCrates(z, st, done) {
  hidePanelKeepMode(); mode = 'crates'; camDist = 25; camPitch = 0.45; camYaw = Math.atan2(-z.px, -z.pz); setHint('WASD: run · Shift: sprint · <b>E</b>: deliver to the nearest crate · Esc: quit');
  const grp = new THREE.Group(); world.add(grp); const n = st.labels.length, sp = 5.6;
  const crates = st.labels.map((l, i) => { const lp = new THREE.Vector3((i - (n - 1) / 2) * sp, 0, 20); const wp = z.g.localToWorld(lp);
    const m = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.6, 3.6), new THREE.MeshLambertMaterial({ color: 0xc8963e })); m.position.set(wp.x, 1.8, wp.z); m.rotation.y = z.g.rotation.y; grp.add(m);
    B(grp, 3.8, 0.4, 3.8, 0x8a5a2b, wp.x, 0, wp.z); const s = label(l, { w: 300, h: 100, scale: [5.2, 1.7], size: 56, border: '#f1c40f' }); s.position.set(wp.x, 5.6, wp.z); grp.add(s); return { l, m, x: wp.x, z: wp.z }; });
  CR = { z, st, done, grp, crates, rounds: shuffle(st.rounds), k: 0, ft: 0, miss: false };
  P.pos.copy(z.g.localToWorld(new THREE.Vector3(0, 0, 14))); crateObj();
  toast('📦 Run to the crate that matches the description, then press <b>E</b>!', 4500);
}
function hidePanelKeepMode() { overlay.classList.add('hidden'); }
function crateObj() { const r = CR.rounds[CR.k]; setObj(`📦 ${CR.k + 1}/${CR.rounds.length} · Deliver: <i>${r[0]}</i>`); }
function nearestCrate() { let b = null, bd = 5.5; CR.crates.forEach(c => { const d = Math.hypot(c.x - P.pos.x, c.z - P.pos.z); if (d < bd) { bd = d; b = c; } }); return b; }
function crateAct() {
  const c = nearestCrate(); if (!c) return; const r = CR.rounds[CR.k];
  if (c.l === r[1]) { c.m.material.color.setHex(0x2ecc71); setTimeout(() => c.m.material.color.setHex(0xc8963e), 600); if (!CR.miss) CR.ft++; CR.miss = false; CR.k++; toast(`✅ Delivered to <b>${c.l}</b>!`, 1600);
    if (CR.k >= CR.rounds.length) { const res = { ft: CR.ft, n: CR.rounds.length }, cb = CR.done; endCrates(); cb(res); } else crateObj(); }
  else { c.m.material.color.setHex(0xe74c3c); setTimeout(() => c.m.material.color.setHex(0xc8963e), 600); CR.miss = true; hitFlash(); toast(`❌ <b>${c.l}</b> is not right. Re-read the description!`, 2200); }
}
function endCrates() { camDist = 17; world.remove(CR.grp); CR = null; mode = 'explore'; setHint(EXPLORE_HINT); refreshHUD(); }

/* ───────── stage: flight challenge ───────── */
let FL = null;
const GCOL = [0x3498db, 0xe67e22, 0x9b59b6];
function startFlight(z, st, done) {
  hidePanelKeepMode(); mode = 'flight'; player.visible = false;
  const pl = makePlane(0xffffff, 0xe74c3c); pl.scale.setScalar(0.9); pl.rotation.order = 'YXZ'; world.add(pl);
  FL = { z, st, done, pl, pos: new THREE.Vector3(z.px * 1.25, 28, z.pz * 1.25), yaw: Math.atan2(-z.px, -z.pz), pitch: 0, roll: 0, k: 0, ft: 0, miss: false, qs: shuffle(st.qs), gates: [], grp: new THREE.Group() };
  world.add(FL.grp); setHint('✈️ <b>W / S</b>: climb / descend · <b>A / D</b>: turn · <b>Shift</b>: boost · Esc: quit<br>Fly through the gate with the correct answer!');
  spawnGates();
}
function spawnGates() {
  FL.grp.children.slice().forEach(c => FL.grp.remove(c)); FL.gates = [];
  const q = FL.qs[FL.k]; let c;
  for (let t = 0; t < 40; t++) { const a = rnd(0, 7), r = rnd(40, 150); c = new THREE.Vector3(Math.cos(a) * r, rnd(32, 75), Math.sin(a) * r); if (c.distanceTo(FL.pos) > 90) break; }
  const opts = shuffle([q.a, ...shuffle(q.wrong).slice(0, 2)]);
  opts.forEach((o, i) => { const ang = i / 3 * Math.PI * 2, gp = new THREE.Vector3(c.x + Math.cos(ang) * 30, c.y + [0, 9, -7][i], c.z + Math.sin(ang) * 30);
    const g = new THREE.Group(); g.position.copy(gp); const ring = new THREE.Mesh(new THREE.TorusGeometry(7, 0.8, 10, 32), new THREE.MeshLambertMaterial({ color: GCOL[i], emissive: GCOL[i], emissiveIntensity: 0.5 })); g.add(ring);
    const lb = label(o, { w: 420, h: 110, scale: [11, 2.9], size: 62, border: hex(GCOL[i]) }); lb.position.y = 10.5; g.add(lb);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 300, 8, 1, true), new THREE.MeshBasicMaterial({ color: GCOL[i], transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })); beam.position.y = 140; g.add(beam);
    ring.lookAt(FL.pos.clone().sub(gp).add(gp)); FL.grp.add(g); FL.gates.push({ g, ring, p: gp, text: o, ok: o === q.a, dead: false, col: GCOL[i] }); });
  setObj(`✈️ ${FL.k + 1}/${FL.qs.length} · ${q.q}`);
}
function updateFlight(dt) {
  const f = FL, up = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0), turn = (keys.KeyA || keys.ArrowLeft ? 1 : 0) - (keys.KeyD || keys.ArrowRight ? 1 : 0) + (-joy.x);
  f.pitch += (up * 0.6 - f.pitch) * Math.min(1, dt * 2.5) ; f.yaw += turn * dt * 1.3; f.roll += (turn * 0.7 - f.roll) * Math.min(1, dt * 4);
  const sp = (keys.ShiftLeft || keys.ShiftRight) ? 52 : 34, fw = new THREE.Vector3(Math.sin(f.yaw) * Math.cos(f.pitch), Math.sin(f.pitch), Math.cos(f.yaw) * Math.cos(f.pitch));
  f.pos.addScaledVector(fw, sp * dt);
  if (f.pos.y < 5) { f.pos.y = 5; f.pitch = Math.max(f.pitch, 0.1); } if (f.pos.y > 140) { f.pos.y = 140; f.pitch = Math.min(f.pitch, 0); }
  const r = Math.hypot(f.pos.x, f.pos.z); if (r > 230) { const to = Math.atan2(-f.pos.x, -f.pos.z); let d = to - f.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); f.yaw += d * dt * 1.5; if (!f.warn) { f.warn = 1; toast('↩️ Out of range – turning back to the academy', 1800); setTimeout(() => f.warn = 0, 2500); } }
  f.pl.position.copy(f.pos); f.pl.rotation.set(-f.pitch, f.yaw, -f.roll); f.pl.userData.prop.rotation.z = timeT * 50; P.pos.set(f.pos.x, 0, f.pos.z);
  const cp = f.pos.clone().addScaledVector(fw, -24).add(new THREE.Vector3(0, 8, 0)); camera.position.lerp(cp, Math.min(1, dt * 5)); camera.lookAt(f.pos.clone().addScaledVector(fw, 14));
  f.gates.forEach(g => { g.ring.rotation.z += dt * 0.6; if (g.dead) return; if (g.p.distanceTo(f.pos) < 8.5) hitGate(g); });
  const live = f.gates.filter(g => !g.dead); if (live.length) { const cen = live.reduce((a, g) => a.add(g.p), new THREE.Vector3()).multiplyScalar(1 / live.length); $('prompt').classList.remove('hidden'); $('prompt').innerHTML = `🎯 Gates: ${Math.round(cen.distanceTo(f.pos))} m · Alt ${Math.round(f.pos.y)} m`; }
}
function hitGate(g) {
  const q = FL.qs[FL.k];
  if (g.ok) { if (!FL.miss) FL.ft++; FL.miss = false; toast(`✅ <b>${g.text}</b> – ${q.w}`, 3500); FL.k++;
    if (FL.k >= FL.qs.length) { const res = { ft: FL.ft, n: FL.qs.length }, cb = FL.done; endFlight(); cb(res); } else spawnGates(); }
  else { g.dead = true; FL.miss = true; g.g.visible = false; hitFlash(); toast(`❌ <b>${g.text}</b> is not correct – try another gate`, 2200); }
}
function endFlight() { world.remove(FL.pl); world.remove(FL.grp); player.visible = true; P.pos.set(FL.z.npcPos.x, 0, FL.z.npcPos.z).lerp(new THREE.Vector3(0, 0, 0), 0.12); FL = null; mode = 'explore'; $('prompt').classList.add('hidden'); setHint(EXPLORE_HINT); refreshHUD(); camera.position.set(0, 20, 20); }

/* ───────── interaction & exam ───────── */
function act() {
  if (mode === 'crates') return crateAct();
  if (mode !== 'explore') return;
  const t = nearestTarget(); if (!t) return;
  if (t.z) openZone(t.z); else openExam();
}
function escape() {
  if (mode === 'crates') { const z = CR.z; endCrates(); openZone(z); }
  else if (mode === 'flight') { const z = FL.z; endFlight(); openZone(z); }
  else if (mode === 'modal' && !overlay.classList.contains('hidden') && panelEl.querySelector('#cl')) hidePanel();
}
function nearestTarget() {
  let b = null, bd = 7.5; zoneRT.forEach(z => { const d = Math.hypot(z.npcPos.x - P.pos.x, z.npcPos.z - P.pos.z); if (d < bd) { bd = d; b = { z }; } });
  const de = Math.hypot(examPos.x - P.pos.x, examPos.z - P.pos.z); if (de < bd) b = { exam: true }; return b;
}
function openExam() {
  const dc = doneCount(), ready = dc === ZONES.length, col = 0xf1c40f;
  if (!ready) return showPanel(`<span class="tag">Final Exam</span><h2>🎓 Chief Examiner</h2><div class="npc"><div class="face">🧑‍⚖️</div><div class="say">You have completed <b>${dc}/${ZONES.length}</b> training zones. Earn every badge first – then come back and I'll test everything you've learned.</div></div><div class="row"><span></span><button class="btn" id="ok">OK</button></div>`, col), q$('#ok').onclick = hidePanel;
  showPanel(`<span class="tag">Final Exam</span><h2>🎓 Chief Examiner</h2><div class="npc"><div class="face">🧑‍⚖️</div><div class="say">All 9 zones cleared – impressive! Answer <b>10 questions</b> from across the syllabus. One attempt each. Score <b>8 or more</b> to earn your Licence.${save.exam ? `<br>Your best: <b>${save.exam}/10</b>` : ''}</div></div>
  <div class="row"><button class="btn alt" id="cl">Not yet</button><span style="display:flex;gap:8px;flex-wrap:wrap">${save.exam >= 8 ? '<button class="btn alt" id="ct">📜 View certificate</button>' : ''}<button class="btn go" id="go">Begin exam ▶</button></span></div>`, col);
  q$('#cl').onclick = hidePanel; if (save.exam >= 8) q$('#ct').onclick = () => showCert(save.exam); q$('#go').onclick = startExam;
}
function startExam() {
  const pool = []; ZONES.forEach(z => z.stages.forEach(s => { if (s.qs) s.qs.forEach(q => pool.push({ ...q, zid: z.name })); }));
  examMissed = []; const qs = shuffle(pool).slice(0, 10);
  runQuiz({ def: { color: 0xf1c40f, name: 'Final Exam' } }, { title: 'Final exam', qs }, res => {
    const score = res.ft; const best = Math.max(save.exam, score); const firstPass = save.exam < 8 && score >= 8; save.exam = best; persist(); refreshHUD(true);
    if (score >= 8) { showCert(score, firstPass); }
    else { const weak = [...new Set(examMissed)];
      showPanel(`<div style="text-align:center"><div class="big-sc">📚</div><h2>Score: ${score}/10</h2><p>You need 8 to pass. Revise these zones and try again:</p><p><b>${weak.join('<br>') || '—'}</b></p><div class="row" style="justify-content:center"><button class="btn go" id="ok">Back to the academy</button></div></div>`, 0xf1c40f); q$('#ok').onclick = hidePanel; }
  }, '<span class="tag">Final Exam</span>', true);
}
function showCert(score, first) {
  const dt = new Date().toLocaleDateString('en-SG', { year: 'numeric', month: 'long', day: 'numeric' });
  showPanel(`<div class="cert"><div style="font-size:44px">🎖️</div><div style="letter-spacing:3px;font-size:13px">AIR LEGISLATION ACADEMY · ME2804</div><h1>Certificate of Competence</h1><div>This certifies that</div><div class="nm">${save.name}</div>
  <div>has mastered the Chicago Convention, ICAO, the Air Navigation Act, SAR &amp; Regulations and UAS rules in Singapore, and is hereby a</div><h1 style="font-size:24px">Licensed Air Legislation Engineer</h1><div>Exam score <b>${score}/10</b> · ${dt}</div></div>
  <div class="row" style="justify-content:center"><button class="btn go" id="ok">Continue ▶</button></div>`, 0xf1c40f); q$('#ok').onclick = hidePanel;
  if (first) toast('🏆 Licence earned! +200 XP', 5000);
}

/* ───────── minimap ───────── */
const mm = $('mini'), mx = mm.getContext('2d');
function drawMini() {
  const S = 320, c = S / 2, sc = 140 / 125; mx.clearRect(0, 0, S, S); mx.save(); mx.beginPath(); mx.arc(c, c, c - 2, 0, 7); mx.clip();
  mx.fillStyle = '#3a9be8'; mx.fillRect(0, 0, S, S); mx.fillStyle = '#6dbb55'; mx.beginPath(); mx.arc(c, c, ISLE * sc, 0, 7); mx.fill();
  const nz = nextZone(); mx.font = 'bold 22px sans-serif'; mx.textAlign = 'center'; mx.textBaseline = 'middle';
  zoneRT.forEach(z => { const x = c + z.px * sc, y = c + z.pz * sc, d = save.done[z.def.id]; mx.fillStyle = d ? '#f1c40f' : hex(z.def.color); mx.beginPath(); mx.arc(x, y, 14, 0, 7); mx.fill();
    if (z === nz && mode !== 'flight') { mx.strokeStyle = '#fff'; mx.lineWidth = 4; mx.beginPath(); mx.arc(x, y, 18 + Math.sin(timeT * 5) * 3, 0, 7); mx.stroke(); } mx.fillStyle = '#fff'; mx.fillText(z.idx + 1, x, y + 1); });
  mx.fillStyle = '#16233a'; mx.beginPath(); mx.arc(c, c, 8, 0, 7); mx.fill();
  if (FL) FL.gates.forEach(g => { if (g.dead) return; mx.fillStyle = hex(g.col); mx.beginPath(); mx.arc(c + g.p.x * sc, c + g.p.z * sc, 8, 0, 7); mx.fill(); mx.strokeStyle = '#fff'; mx.lineWidth = 3; mx.stroke(); });
  const px = c + P.pos.x * sc, py = c + P.pos.z * sc, h = FL ? FL.yaw : P.heading; mx.translate(px, py); mx.rotate(-h + Math.PI); mx.fillStyle = '#e74c3c'; mx.beginPath(); mx.moveTo(0, -14); mx.lineTo(10, 10); mx.lineTo(-10, 10); mx.closePath(); mx.fill(); mx.strokeStyle = '#fff'; mx.lineWidth = 3; mx.stroke();
  mx.restore();
}

/* ───────── main loop ───────── */
let last = performance.now();
function tick(now) {
  requestAnimationFrame(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now; timeT += dt;
  anim.forEach(f => f(timeT, dt)); clouds.forEach(c => { c.position.x += dt * 2; if (c.position.x > 380) c.position.x = -380; });
  stars.forEach(s => { if (s.got) return; s.m.rotation.y += dt * 2; s.m.position.y = 2.6 + Math.sin(timeT * 2.5 + s.i) * 0.5; });
  examiner.position.y = Math.abs(Math.sin(timeT * 2)) * 0.12; examiner.rotation.y = Math.atan2(P.pos.x - examPos.x, P.pos.z - examPos.z);
  if (mode === 'title') { camYaw += dt * 0.12; P.pos.set(0, 0, 26); player.position.copy(P.pos); animChar(player, timeT, false, false); updateCamera(dt); camera.position.y += 18; camera.lookAt(0, 4, 0); }
  else if (mode === 'explore' || mode === 'crates') {
    updateExplore(dt); updateCamera(dt);
    zoneRT.forEach(z => { const dx = P.pos.x - z.npcPos.x, dz = P.pos.z - z.npcPos.z; z.npc.rotation.y = Math.hypot(dx, dz) < 22 ? Math.atan2(dx, dz) : z.g.rotation.y; });
    stars.forEach(s => { if (!s.got && Math.hypot(s.x - P.pos.x, s.z - P.pos.z) < 3 && P.pos.y < 5) { s.got = true; s.m.visible = false; save.stars.push(s.i); persist(); refreshHUD(); toast(`⭐ <b>${FACTS[s.i][0]}</b> – ${FACTS[s.i][1]} <i>(+5 XP)</i>`, 5500); } });
    const pr = $('prompt'); if (mode === 'crates') { const c = nearestCrate(); if (c) { pr.classList.remove('hidden'); pr.innerHTML = `Press <b>E</b> – deliver to <b>${c.l}</b>`; } else pr.classList.add('hidden'); }
    else { const t = nearestTarget(); if (t) { pr.classList.remove('hidden'); pr.innerHTML = t.z ? `Press <b>E</b> – talk to ${t.z.def.npc}` : 'Press <b>E</b> – talk to the Chief Examiner'; } else pr.classList.add('hidden'); }
  }
  else if (mode === 'flight') updateFlight(dt);
  else if (mode === 'modal') { updateCamera(dt); }
  if (mode !== 'flight' && mode !== 'explore' && mode !== 'crates' && mode !== 'title') $('prompt').classList.add('hidden');
  drawMini(); renderer.render(scene, camera);
}

/* ───────── boot ───────── */
$('nameIn').value = save.name || '';
$('startBtn').onclick = () => {
  save.name = ($('nameIn').value.trim() || 'Engineer').slice(0, 18); persist();
  $('title').classList.add('hidden'); $('hud').classList.remove('hidden'); mode = 'explore'; camYaw = 0; updateVisuals(); refreshHUD(true); setHint(EXPLORE_HINT);
  toast(`Welcome, <b>${save.name}</b>! Follow the beacons – start with <b>zone 1</b>. Collect ⭐ for bonus XP.`, 6000);
};
$('resetBtn').onclick = () => { if (confirm('Erase all saved progress?')) { try { localStorage.removeItem('ala_save'); } catch (e) {} location.reload(); } };
updateVisuals();
window.__g = { get FL() { return FL; }, setYaw: v => { camYaw = v; camPitch = 0.3; camDist = 26; }, P, zoneRT, stars, openZone, runStages, get mode() { return mode; }, save, camera, openExam, finishZone };
requestAnimationFrame(tick);
