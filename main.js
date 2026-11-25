import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GROUPS, PROJECTS, ABOUT, CHIPS } from './data/projects.js';

const COL = { ink: '#08080a', ink2: '#141417', bone: '#ece6da', dim: '#a8a297', accent: '#ff5a1f' };
const mobile = matchMedia('(max-width: 720px)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (id) => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const rand = mulberry(7);
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------------- layout ---------------- */
const R = 3.4;                 // tunnel radius
const GROUP_LEN = 13;          // tunnel length per group
const Z0 = -3;                 // where group 01 starts
const Z_END = Z0 - GROUPS.length * GROUP_LEN - 2;   // the second "me" waits here
const CAM_START = 4.6;
const CAM_STOP = Z_END + 5.4;
const CARD_W = 1.5, CARD_H = CARD_W / 0.727;
const NAME_W = mobile ? 2.5 : 2.55;   // width of the dot name in world units
const AV_X = mobile ? 0 : 2.4, AV_Y = mobile ? 0.9 : 0.5;

const groupStart = (g) => Z0 - g * GROUP_LEN;
const SIDE_ANGLES = [Math.PI + 0.22, -0.24, Math.PI - 0.3, 0.3, Math.PI + 0.05, -0.08];
const cards = PROJECTS.map((p, idx) => {
  const g = GROUPS.findIndex((x) => x.id === p.group);
  const inGroup = PROJECTS.filter((q) => q.group === p.group);
  const i = inGroup.indexOf(p);
  const z = groupStart(g) - 1.6 - (i + 0.5) * ((GROUP_LEN - 1.6) / inGroup.length);
  const a = SIDE_ANGLES[(i + g) % SIDE_ANGLES.length];
  return { p, idx, g, z, a, num: String(idx + 1).padStart(2, '0') };
});

function wallMatrix(a, z, sx, sy, inset = 0) {
  const o = new THREE.Object3D();
  const r = R - inset;
  o.position.set(Math.cos(a) * r, Math.sin(a) * r, z);
  const c = Math.cos(a) >= -1e-6 ? 1 : -1;
  o.up.set(-Math.sin(a) * c, Math.cos(a) * c, 0);
  o.lookAt(0, 0, z);
  o.scale.set(sx, sy, 1);
  o.updateMatrix();
  return o;
}

/* ---------------- renderer ---------------- */
const canvas = $('gl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
} catch (e) {
  noGL();
}
const PR = Math.min(devicePixelRatio || 1, mobile ? 1.6 : 2);
const scene = new THREE.Scene();
scene.background = new THREE.Color(COL.ink);
scene.fog = new THREE.Fog(COL.ink, 7, 27);
const camera = new THREE.PerspectiveCamera(mobile ? 72 : 60, innerWidth / innerHeight, 0.05, 80);
camera.position.set(0, 0, CAM_START);
camera.rotation.order = 'YXZ';

function resize() {
  if (!renderer) return;
  renderer.setPixelRatio(PR);
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

/* ---------------- drawing helpers (card art) ---------------- */
function wrap(ctx, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function cover(ctx, img, x, y, w, h, fy = 0.2) {
  const s = Math.max(w / img.width, h / img.height);
  const iw = img.width * s, ih = img.height * s;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) * fy, iw, ih); ctx.restore();
}
function grid(ctx, x, y, w, h, step, col) {
  ctx.fillStyle = col;
  for (let gx = x + step / 2; gx < x + w; gx += step) for (let gy = y + step / 2; gy < y + h; gy += step) ctx.fillRect(gx, gy, 1.5, 1.5);
}

// Each art draws a small technical illustration inside (x, y, w, h).
const ART = {
  car(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h * 0.56;
    c.strokeStyle = COL.bone; c.lineWidth = 3;
    // sonar cone
    for (let i = 1; i <= 4; i++) { c.globalAlpha = 0.9 - i * 0.18; c.strokeStyle = COL.accent; c.beginPath(); c.arc(cx, cy - 120, 40 + i * 34, -Math.PI * 0.75, -Math.PI * 0.25); c.stroke(); }
    c.globalAlpha = 1; c.strokeStyle = COL.bone;
    roundRect(c, cx - 78, cy - 118, 156, 236, 26); c.stroke();
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.fillStyle = COL.bone; roundRect(c, cx + dx * 92 - 16, cy + dy * 72 - 34, 32, 68, 8); c.fill(); }
    c.fillStyle = COL.accent; c.fillRect(cx - 34, cy - 40, 68, 46);
    c.fillStyle = COL.ink2; c.font = '600 15px "IBM Plex Mono"'; c.textAlign = 'center'; c.fillText('ESP32', cx, cy - 11);
    c.strokeStyle = COL.bone; c.lineWidth = 2; c.strokeRect(cx - 50, cy + 24, 100, 40);
    c.fillStyle = COL.bone; c.font = '13px "IBM Plex Mono"'; c.fillText('TB6612', cx, cy + 49);
    c.beginPath(); c.arc(cx - 22, cy - 106, 11, 0, 7); c.arc(cx + 22, cy - 106, 11, 0, 7); c.stroke();
    c.textAlign = 'left'; c.fillStyle = COL.accent; c.font = '14px "IBM Plex Mono"'; c.fillText('BRAKE < 25 cm', x + 22, y + 34);
  },
  folddrone(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2 + 10;
    c.strokeStyle = COL.bone; c.lineWidth = 3;
    const arms = [[-1, -1, 0.5], [1, -1, -0.5], [-1, 1, -0.5], [1, 1, 0.5]];
    arms.forEach(([dx, dy, fold], i) => {
      const ex = cx + dx * 120, ey = cy + dy * 92;
      c.setLineDash(i % 2 ? [8, 7] : []); c.beginPath(); c.moveTo(cx + dx * 30, cy + dy * 20); c.lineTo(ex, ey); c.stroke(); c.setLineDash([]);
      c.beginPath(); c.ellipse(ex, ey, 58, 14, fold, 0, 7); c.stroke();
      c.fillStyle = COL.bone; c.beginPath(); c.arc(ex, ey, 8, 0, 7); c.fill();
    });
    roundRect(c, cx - 46, cy - 34, 92, 68, 14); c.fillStyle = COL.ink2; c.fill(); c.stroke();
    c.beginPath(); c.arc(cx, cy, 18, 0, 7); c.fillStyle = COL.accent; c.fill();
    c.beginPath(); c.arc(cx, cy, 8, 0, 7); c.fillStyle = COL.ink2; c.fill();
    c.fillStyle = COL.dim; c.font = '14px "IBM Plex Mono"'; c.fillText('FOLD → FLY', x + 22, y + 34);
  },
  mp3(c, x, y, w, h) {
    const bw = 210, bh = 300, bx = x + (w - bw) / 2, by = y + (h - bh) / 2;
    c.fillStyle = '#1d1d22'; roundRect(c, bx, by, bw, bh, 26); c.fill();
    c.strokeStyle = COL.bone; c.lineWidth = 2.5; c.stroke();
    c.fillStyle = '#000'; c.fillRect(bx + 22, by + 26, bw - 44, 104);
    c.fillStyle = '#9fe7ff'; c.font = '600 13px "IBM Plex Mono"'; c.fillText('NOW PLAYING', bx + 32, by + 48);
    c.fillStyle = '#9fe7ff';
    for (let i = 0; i < 26; i++) { const hh = 6 + Math.abs(Math.sin(i * 1.7) * 30) * (0.6 + (i % 3) * 0.2); c.fillRect(bx + 32 + i * 6, by + 118 - hh, 4, hh); }
    c.beginPath(); c.arc(bx + bw / 2, by + 214, 46, 0, 7); c.strokeStyle = COL.dim; c.stroke();
    c.beginPath(); c.arc(bx + bw / 2, by + 214, 22, 0, 7); c.fillStyle = COL.accent; c.fill();
    c.fillStyle = COL.dim; for (let i = 0; i < 5; i++) c.fillRect(bx + 50 + i * 24, by + 276, 14, 3);
  },
  cricket(c, x, y, w, h) {
    const ox = x + 40, oy = y + 50, ow = w - 80, oh = h - 100;
    c.fillStyle = '#000'; c.fillRect(ox, oy, ow, oh);
    c.strokeStyle = '#9fe7ff'; c.lineWidth = 3; c.strokeRect(ox, oy, ow, oh);
    const px = 7; c.fillStyle = '#9fe7ff';
    // pitch trapezoid (dashed)
    c.setLineDash([10, 8]); c.beginPath(); c.moveTo(ox + ow * 0.42, oy + 40); c.lineTo(ox + ow * 0.58, oy + 40); c.lineTo(ox + ow * 0.72, oy + oh - 20); c.lineTo(ox + ow * 0.28, oy + oh - 20); c.closePath(); c.stroke(); c.setLineDash([]);
    // stumps
    for (let i = 0; i < 3; i++) c.fillRect(ox + ow * 0.47 + i * 10, oy + 30, 4, 22);
    // batsman (pixel blocks)
    const bm = [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [-1, 2], [2, 1], [3, 0], [0, 3], [1, 3], [0, 4], [1, 4], [-1, 5], [2, 5]];
    bm.forEach(([a, b]) => c.fillRect(ox + ow * 0.52 + a * px, oy + oh - 90 + b * px, px - 1, px - 1));
    c.fillStyle = COL.accent; c.beginPath(); c.arc(ox + ow * 0.5, oy + oh * 0.45, 7, 0, 7); c.fill();
    c.fillStyle = '#000'; c.fillRect(ox + 8, oy + 8, 112, 30); c.fillStyle = '#9fe7ff'; c.fillRect(ox + 10, oy + 10, 108, 26);
    c.fillStyle = '#000'; c.font = '600 15px "IBM Plex Mono"'; c.fillText('84/2  9.3', ox + 16, oy + 29);
  },
  ledger(c, x, y, w, h) {
    c.font = '15px "IBM Plex Mono"';
    const rows = ['shipped API route', 'fixed auth bug', 'wrote tests', 'deployed v2', 'mock interview', 'drill: SQL joins'];
    rows.forEach((r, i) => {
      const yy = y + 60 + i * 54;
      c.strokeStyle = COL.line || 'rgba(236,230,218,.2)'; c.beginPath(); c.moveTo(x + 30, yy + 18); c.lineTo(x + w - 30, yy + 18); c.stroke();
      c.fillStyle = i < 4 ? COL.accent : COL.dim; c.fillRect(x + 34, yy - 8, 16, 16);
      c.fillStyle = COL.bone; c.fillText(r, x + 66, yy + 5);
      c.fillStyle = COL.dim; c.fillText('✓ proof', x + w - 120, yy + 5);
    });
  },
  ghost(c, x, y, w, h) {
    const cols = 5, rows = 3, gw = (w - 80) / cols, gh = (h - 100) / rows;
    for (let i = 0; i < cols * rows; i++) {
      const gx = x + 40 + (i % cols) * gw + gw / 2, gy = y + 60 + Math.floor(i / cols) * gh + gh / 2;
      const ghost = i === 7;
      c.strokeStyle = ghost ? COL.accent : COL.bone; c.lineWidth = 2.5;
      c.setLineDash(ghost ? [6, 6] : []);
      c.beginPath(); c.arc(gx, gy - 14, 16, 0, 7); c.stroke();
      c.beginPath(); c.arc(gx, gy + 30, 28, Math.PI, 0); c.stroke();
      c.setLineDash([]);
    }
    c.fillStyle = COL.accent; c.font = '600 14px "IBM Plex Mono"'; c.fillText('1 FACULTY · 3 COLLEGES', x + 30, y + h - 26);
  },
  glucose(c, x, y, w, h) {
    const top = y + 60, bot = y + h - 60;
    c.fillStyle = 'rgba(255,90,31,.14)'; c.fillRect(x + 30, top + (bot - top) * 0.35, w - 60, (bot - top) * 0.3);
    c.strokeStyle = COL.bone; c.lineWidth = 3; c.beginPath();
    for (let i = 0; i <= 60; i++) { const xx = x + 30 + i * (w - 60) / 60; const v = 0.5 + 0.28 * Math.sin(i * 0.25) + 0.14 * Math.sin(i * 0.9 + 1); const yy = top + (bot - top) * (1 - v); i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
    c.stroke();
    c.fillStyle = COL.accent; c.beginPath(); c.arc(x + w - 30, top + (bot - top) * 0.42, 7, 0, 7); c.fill();
    c.fillStyle = COL.dim; c.font = '14px "IBM Plex Mono"'; c.fillText('TARGET RANGE', x + 36, top + (bot - top) * 0.35 - 10);
  },
  timeline(c, x, y, w, h) {
    const lx = x + 70; c.strokeStyle = COL.dim; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, y + 40); c.lineTo(lx, y + h - 40); c.stroke();
    const items = ['Blood test', 'Fever · 3 days', 'Dentist', 'X-ray report', 'Vitamin D'];
    c.font = '16px "IBM Plex Mono"';
    items.forEach((t, i) => { const yy = y + 70 + i * ((h - 120) / 4); c.fillStyle = i === 2 ? COL.accent : COL.bone; c.beginPath(); c.arc(lx, yy, 9, 0, 7); c.fill(); c.fillStyle = COL.bone; c.fillText(t, lx + 30, yy + 6); c.fillStyle = COL.dim; c.fillText(['JAN', 'MAR', 'JUN', 'AUG', 'OCT'][i], x + w - 80, yy + 6); });
  },
  translate(c, x, y, w, h) {
    const colW = (w - 110) / 2;
    for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(236,230,218,.55)'; c.fillRect(x + 30, y + 60 + i * 30, colW * (0.6 + 0.4 * ((i * 7) % 5) / 5), 9); }
    c.fillStyle = COL.accent; c.font = '600 34px "IBM Plex Mono"'; c.fillText('→', x + 30 + colW + 8, y + h / 2 + 10);
    for (let i = 0; i < 5; i++) { c.fillStyle = COL.bone; c.fillRect(x + w - 30 - colW, y + 80 + i * 44, colW * (0.5 + 0.5 * ((i * 3) % 4) / 4), 14); }
    c.fillStyle = COL.dim; c.font = '14px "IBM Plex Mono"'; c.fillText('LEGAL', x + 30, y + 36); c.fillText('PLAIN', x + w - 30 - colW, y + 36);
  },
  eye(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2 - 10;
    c.strokeStyle = COL.bone; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx - 150, cy); c.quadraticCurveTo(cx, cy - 46, cx + 150, cy); c.quadraticCurveTo(cx, cy + 46, cx - 150, cy); c.stroke();
    c.fillStyle = COL.bone; c.beginPath(); c.arc(cx, cy + 4, 20, 0, 7); c.fill();
    c.fillStyle = COL.ink2; c.fillRect(cx - 160, cy - 60, 320, 52);
    c.strokeStyle = COL.accent; c.beginPath(); c.moveTo(cx - 150, cy - 8); c.lineTo(cx + 150, cy - 8); c.stroke();
    for (let i = 0; i < 3; i++) { c.globalAlpha = 1 - i * 0.3; c.beginPath(); c.arc(cx, cy + 120, 26 + i * 22, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    c.globalAlpha = 1; c.fillStyle = COL.accent; c.font = '600 15px "IBM Plex Mono"'; c.fillText('EYES CLOSED 2.1 s → ALARM', x + 26, y + 36);
  },
  amr(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2 + 30;
    c.strokeStyle = COL.accent; c.lineWidth = 2.5;
    for (const a of [-0.9, 0, 0.9]) for (let i = 1; i <= 3; i++) { c.globalAlpha = 1 - i * 0.25; c.beginPath(); c.arc(cx + Math.sin(a) * 70, cy - Math.cos(a) * 70, 30 + i * 26, a - Math.PI / 2 - 0.4, a - Math.PI / 2 + 0.4); c.stroke(); }
    c.globalAlpha = 1; c.strokeStyle = COL.bone; c.lineWidth = 3;
    c.beginPath(); c.arc(cx, cy, 84, 0, 7); c.stroke();
    c.fillStyle = COL.bone; c.fillRect(cx - 104, cy - 30, 18, 60); c.fillRect(cx + 86, cy - 30, 18, 60);
    c.fillStyle = COL.accent; c.fillRect(cx - 30, cy - 20, 60, 40); c.fillStyle = COL.ink2; c.font = '600 14px "IBM Plex Mono"'; c.textAlign = 'center'; c.fillText('ESP32', cx, cy + 5); c.textAlign = 'left';
    c.setLineDash([6, 8]); c.strokeStyle = COL.dim; c.beginPath(); c.moveTo(x + 40, y + h - 40); c.quadraticCurveTo(cx - 120, cy + 60, cx, cy + 84); c.stroke(); c.setLineDash([]);
    c.fillStyle = COL.dim; c.font = '14px "IBM Plex Mono"'; c.fillText('3× SONAR · ENCODERS · IMU', x + 26, y + 36);
  },
  fire(c, x, y, w, h) {
    grid(c, x, y, w, h, 44, 'rgba(236,230,218,.25)');
    const pts = [[0.2, 0.3, 6], [0.3, 0.62, 5], [0.55, 0.42, 22], [0.58, 0.47, 9], [0.52, 0.38, 8], [0.78, 0.7, 6], [0.82, 0.28, 12], [0.4, 0.8, 5]];
    pts.forEach(([px, py, r]) => { c.fillStyle = r > 10 ? COL.accent : COL.bone; c.globalAlpha = r > 10 ? 0.9 : 0.6; c.beginPath(); c.arc(x + px * w, y + py * h, r, 0, 7); c.fill(); });
    c.globalAlpha = 1; c.strokeStyle = COL.accent; c.lineWidth = 2; c.beginPath(); c.arc(x + 0.55 * w, y + 0.42 * h, 56, 0, 7); c.stroke();
    c.fillStyle = COL.accent; c.font = '600 14px "IBM Plex Mono"'; c.fillText('SAME SPOT · 3+ DAYS', x + 0.55 * w + 66, y + 0.42 * h + 5);
  },
  court(c, x, y, w, h) {
    const cx = x + w / 2;
    c.strokeStyle = COL.bone; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx, y + 60); c.lineTo(cx, y + h - 70); c.moveTo(cx - 150, y + 100); c.lineTo(cx + 150, y + 130); c.moveTo(cx - 60, y + h - 70); c.lineTo(cx + 60, y + h - 70); c.stroke();
    for (const [dx, dy, col] of [[-150, 100, COL.bone], [150, 130, COL.accent]]) { c.strokeStyle = col; c.beginPath(); c.moveTo(cx + dx, y + dy); c.lineTo(cx + dx - 50, y + dy + 110); c.moveTo(cx + dx, y + dy); c.lineTo(cx + dx + 50, y + dy + 110); c.stroke(); c.beginPath(); c.arc(cx + dx, y + dy + 110, 50, 0, Math.PI); c.stroke(); }
    c.fillStyle = COL.accent; c.font = '600 15px "IBM Plex Mono"'; c.fillText('“ONLY 2 LEFT!” — GUILTY', x + 26, y + h - 26);
  },
  versus(c, x, y, w, h) {
    c.font = '15px "IBM Plex Mono"';
    const code = ['function pay(user, amt) {', '  if (amt > 0)', '    user.balance -= amt', '  save(user)', '}'];
    code.forEach((l, i) => { const yy = y + 80 + i * 34; if (i === 2) { c.fillStyle = 'rgba(255,90,31,.22)'; c.fillRect(x + 26, yy - 20, w - 52, 30); } c.fillStyle = i === 2 ? COL.accent : COL.bone; c.fillText(l, x + 36, yy); });
    c.fillStyle = COL.bone; c.font = '800 64px "Bricolage Grotesque"'; c.fillText('1', x + 60, y + h - 50); c.fillText('1', x + w - 100, y + h - 50);
    c.fillStyle = COL.accent; c.font = '600 22px "IBM Plex Mono"'; c.textAlign = 'center'; c.fillText('VS', x + w / 2, y + h - 62); c.textAlign = 'left';
    c.fillStyle = COL.dim; c.font = '14px "IBM Plex Mono"'; c.fillText('FIND THE FLAWED LINE · 60 s', x + 26, y + 36);
  },
  board(c, x, y, w, h) {
    const rowsB = [['01', 0.92, false], ['02', 0.9, false], ['03', 0.88, true], ['04', 0.8, false], ['05', 0.71, false], ['06', 0.6, false]];
    c.font = '600 16px "IBM Plex Mono"';
    rowsB.forEach(([n, v, me], i) => {
      const yy = y + 62 + i * 56;
      c.fillStyle = me ? COL.accent : COL.dim; c.fillText(n, x + 34, yy + 6);
      c.fillStyle = me ? COL.accent : 'rgba(236,230,218,.75)'; c.fillRect(x + 80, yy - 12, (w - 190) * v, 24);
      if (me) { c.fillStyle = COL.bone; c.fillText('← ME', x + 90 + (w - 190) * v, yy + 6); }
    });
    c.fillStyle = COL.dim; c.font = '14px "IBM Plex Mono"'; c.fillText('PUBLIC LEADERBOARD', x + 34, y + 30);
  },
  tree(c, x, y, w, h) {
    c.font = '16px "IBM Plex Mono"';
    const lines = ['repo/', '├ src/', '│ ├ server.js', '│ └ index.html', '├ README.md', '└ package.json'];
    lines.forEach((l, i) => { c.fillStyle = i === 2 ? COL.accent : COL.bone; c.fillText(l, x + 36, y + 60 + i * 32); });
    roundRect(c, x + w * 0.5, y + h - 140, w * 0.5 - 30, 96, 14); c.fillStyle = COL.bone; c.fill();
    c.fillStyle = COL.ink2; c.font = '15px "IBM Plex Mono"'; c.fillText('how does auth', x + w * 0.5 + 18, y + h - 104); c.fillText('work here?', x + w * 0.5 + 18, y + h - 80);
  },
  graph(c, x, y, w, h) {
    const N = [['a', 0.15, 0.25], ['b', 0.15, 0.6], ['×', 0.42, 0.42], ['c', 0.42, 0.8], ['+', 0.66, 0.6], ['tanh', 0.86, 0.6]];
    const E = [[0, 2], [1, 2], [2, 4], [3, 4], [4, 5]];
    const P = (n) => [x + n[1] * w, y + n[2] * h];
    c.strokeStyle = COL.dim; c.lineWidth = 2;
    E.forEach(([a, b]) => { const [x1, y1] = P(N[a]); const [x2, y2] = P(N[b]); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); });
    c.font = '600 16px "IBM Plex Mono"'; c.textAlign = 'center';
    N.forEach((n, i) => { const [nx, ny] = P(n); c.fillStyle = i === 5 ? COL.accent : COL.ink2; c.strokeStyle = COL.bone; c.beginPath(); c.arc(nx, ny, 30, 0, 7); c.fill(); c.stroke(); c.fillStyle = i === 5 ? COL.ink : COL.bone; c.fillText(n[0], nx, ny + 6); });
    c.textAlign = 'left'; c.fillStyle = COL.accent; c.font = '14px "IBM Plex Mono"'; c.fillText('∂L/∂a = −0.42', x + 26, y + 36);
  },
};
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

function drawArt(c, p, img, x, y, w, h) {
  c.fillStyle = COL.ink2; c.fillRect(x, y, w, h);
  if (img) { cover(c, img, x, y, w, h, p.fy); return; }
  grid(c, x, y, w, h, 22, 'rgba(236,230,218,.12)');
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  // the art functions are drawn for a ~564x430 box; scale to the real box
  const sx = w / 564, sy = h / 430; c.translate(x, y); c.scale(sx, sy);
  (ART[p.art] || (() => {}))(c, 0, 0, 564, 430);
  c.restore();
}

const CW = 600, CH = 826;
function cardCanvas(card, img) {
  const { p, num, g } = card;
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
  const c = cv.getContext('2d');
  c.fillStyle = COL.bone; c.fillRect(0, 0, CW, CH);
  drawArt(c, p, img, 18, 18, CW - 36, 430);
  c.fillStyle = COL.ink;
  c.font = '500 18px "IBM Plex Mono"'; c.fillStyle = COL.accent; c.fillText(num, 26, 492);
  c.fillStyle = '#6d675d'; c.textAlign = 'right'; c.fillText(GROUPS[g].name.toUpperCase(), CW - 26, 492); c.textAlign = 'left';
  let fs = 66; c.font = `800 ${fs}px "Bricolage Grotesque"`;
  while (c.measureText(p.title).width > CW - 52 && fs > 36) { fs -= 2; c.font = `800 ${fs}px "Bricolage Grotesque"`; }
  c.fillStyle = COL.ink; c.fillText(p.title, 24, 492 + fs + 6);
  c.font = '19px "IBM Plex Mono"'; c.fillStyle = '#34312c';
  wrap(c, p.line, CW - 52).slice(0, 3).forEach((l, i) => c.fillText(l, 26, 492 + fs + 50 + i * 28));
  // status chip
  c.font = '500 15px "IBM Plex Mono"';
  const st = p.status.toUpperCase(); const tw = c.measureText(st).width;
  c.fillStyle = COL.ink; c.fillRect(24, CH - 66, tw + 46, 38);
  c.fillStyle = COL.accent; c.beginPath(); c.arc(42, CH - 47, 5, 0, 7); c.fill();
  c.fillStyle = COL.bone; c.fillText(st, 56, CH - 42);
  c.fillStyle = '#6d675d'; c.textAlign = 'right'; c.fillText('OPEN ↗', CW - 26, CH - 42); c.textAlign = 'left';
  return cv;
}

/* ---------------- tile atlas (the wall) ---------------- */
const ATLAS_N = 8, TS = 256;
function atlasCanvas() {
  const cv = document.createElement('canvas'); cv.width = cv.height = ATLAS_N * TS;
  const c = cv.getContext('2d');
  for (let i = 0; i < ATLAS_N * ATLAS_N; i++) {
    const x = (i % ATLAS_N) * TS, y = Math.floor(i / ATLAS_N) * TS;
    const kind = i >= CHIPS.length ? 'pattern' : (i % 9 === 0 ? 'accent' : i % 7 === 3 ? 'bone' : 'dark');
    const bg = kind === 'accent' ? COL.accent : kind === 'bone' ? COL.bone : COL.ink2;
    const fg = kind === 'dark' || kind === 'pattern' ? COL.bone : COL.ink;
    c.fillStyle = bg; c.fillRect(x + 4, y + 4, TS - 8, TS - 8);
    if (kind === 'dark' || kind === 'pattern') { c.strokeStyle = 'rgba(236,230,218,.22)'; c.lineWidth = 2; c.strokeRect(x + 5, y + 5, TS - 10, TS - 10); }
    c.fillStyle = kind === 'dark' ? COL.dim : fg;
    c.font = '500 18px "IBM Plex Mono"'; c.fillText('#' + String(i).padStart(2, '0'), x + 20, y + 38);
    c.fillStyle = kind === 'dark' ? COL.accent : fg; c.fillRect(x + TS - 34, y + 24, 12, 12);
    if (kind === 'pattern') { pattern(c, i - CHIPS.length, x + 20, y + 56, TS - 40, TS - 80); continue; }
    c.fillStyle = fg;
    let fs = 34; c.font = `500 ${fs}px "IBM Plex Mono"`;
    const t = CHIPS[i].toUpperCase();
    let lines = wrap(c, t, TS - 40);
    while ((lines.length > 3 || lines.some((l) => c.measureText(l).width > TS - 40)) && fs > 18) { fs -= 2; c.font = `500 ${fs}px "IBM Plex Mono"`; lines = wrap(c, t, TS - 40); }
    lines.forEach((l, k) => c.fillText(l, x + 20, y + TS - 26 - (lines.length - 1 - k) * (fs + 6)));
  }
  return cv;
}
function pattern(c, k, x, y, w, h) {
  c.strokeStyle = COL.bone; c.fillStyle = COL.bone; c.lineWidth = 2.5;
  if (k === 0) grid(c, x, y, w, h, 14, COL.bone);
  if (k === 1 || k === 5) { c.strokeStyle = k === 1 ? COL.accent : COL.bone; c.beginPath(); for (let i = 0; i <= w; i += 3) { const yy = y + h / 2 + Math.sin(i * 0.08 * (k === 1 ? 1 : 2)) * h * 0.3 * (k === 5 ? Math.exp(-i / w) : 1); i ? c.lineTo(x + i, yy) : c.moveTo(x, yy); } c.stroke(); }
  if (k === 2) for (let i = 0; i < w; i += 6) { const bw = (i * 13) % 4 + 1; c.fillRect(x + i, y + 10, bw, h - 20); }
  if (k === 3) { c.strokeStyle = COL.accent; c.beginPath(); let hi = false; c.moveTo(x, y + h * 0.7); for (let i = 0; i < w; i += 24) { c.lineTo(x + i, y + (hi ? h * 0.3 : h * 0.7)); hi = !hi; c.lineTo(x + i, y + (hi ? h * 0.3 : h * 0.7)); } c.stroke(); }
  if (k === 4) for (let r = 12; r < w / 2; r += 14) { c.beginPath(); c.arc(x + w / 2, y + h / 2, r, 0, 7); c.stroke(); }
  if (k === 6) { for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x, y + 14 + i * 26); c.lineTo(x + 40 + i * 18, y + 14 + i * 26); c.lineTo(x + 70 + i * 18, y + 44 + i * 26 - 30); c.lineTo(x + w, y + 14 + i * 26); c.stroke(); c.beginPath(); c.arc(x + 40 + i * 18, y + 14 + i * 26, 5, 0, 7); c.fill(); } }
  if (k === 7) for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.strokeRect(x + 10 + i * 48, y + 6 + j * 36, 28, 20); if ((i + j) % 3 === 0) { c.fillStyle = COL.accent; c.fillRect(x + 10 + i * 48, y + 6 + j * 36, 28, 20); c.fillStyle = COL.bone; } }
}

/* ---------------- build scene ---------------- */
const U = { uT: { value: 0 }, uTime: { value: 0 }, uPR: { value: PR }, uCardFade: { value: 0 }, uRot: { value: new THREE.Matrix3() }, uAv: { value: new THREE.Vector3(AV_X, AV_Y, 0) }, uEnd: { value: new THREE.Vector3(mobile ? 0 : 0.55, mobile ? 0.9 : 0.95, Z_END) }, uSize: { value: mobile ? 4.6 : 3.9 }, uHeight: { value: innerHeight } };
const mainMeshes = [];
let tiles;

async function build() {
  await Promise.all([
    document.fonts.load('800 60px "Bricolage Grotesque"'),
    document.fonts.load('500 20px "IBM Plex Mono"'),
    document.fonts.load('400 20px "IBM Plex Mono"'),
  ]).catch(() => {});
  const imgs = await Promise.all(PROJECTS.map((p) => p.img ? loadImg(p.img) : null));

  const aniso = renderer.capabilities.getMaxAnisotropy();
  // main cards
  const plane = new THREE.PlaneGeometry(1, 1);
  cards.forEach((card, i) => {
    card.img = imgs[i];
    card.canvas = cardCanvas(card, imgs[i]);
    const tex = new THREE.CanvasTexture(card.canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, fog: true });
    const mesh = new THREE.Mesh(plane, mat);
    const o = wallMatrix(card.a, card.z, CARD_W, CARD_H, 0.12);
    mesh.position.copy(o.position); mesh.quaternion.copy(o.quaternion); mesh.scale.copy(o.scale);
    card.wallPos = o.position.clone(); card.wallQuat = o.quaternion.clone(); card.wallMatrix = o.matrix.clone();
    const glow = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: COL.accent, transparent: true, opacity: 0, fog: true }));
    glow.position.z = -0.002; glow.scale.set(1.05, 1.04, 1); mesh.add(glow);
    mesh.userData = { card, glow, hover: 0 };
    scene.add(mesh); mainMeshes.push(mesh); card.mesh = mesh;
  });

  // wall tiles
  const list = [];
  const zTop = 1.5, zBot = Z_END - 2.5;
  const COLS = 24;
  for (let z = zTop; z > zBot; z -= 0.92) {
    for (let k = 0; k < COLS; k++) {
      const a = (k / COLS) * Math.PI * 2 + (rand() - 0.5) * 0.12 + (Math.round(z) % 2) * 0.13;
      const floorGap = Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2)));
      if (floorGap < 0.62) continue;
      if (rand() < 0.3) continue;
      const zz = z + (rand() - 0.5) * 0.3;
      const blocked = cards.some((cd) => {
        const da = Math.abs(Math.atan2(Math.sin(a - cd.a), Math.cos(a - cd.a))) * R;
        return da < CARD_H / 2 + 0.55 && Math.abs(zz - cd.z) < CARD_W / 2 + 0.55;
      });
      if (blocked) continue;
      const s = 0.42 + rand() * 0.4;
      list.push({ a, z: zz, s, tile: Math.floor(rand() * ATLAS_N * ATLAS_N), shade: 0.45 + rand() * 0.55 });
    }
  }
  const atlas = new THREE.CanvasTexture(atlasCanvas()); atlas.colorSpace = THREE.SRGBColorSpace; atlas.anisotropy = aniso;
  const tileGeo = new THREE.PlaneGeometry(1, 1);
  const aTile = new Float32Array(list.length), aShade = new Float32Array(list.length);
  const tileMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: atlas }, uCardFade: U.uCardFade, uTime: U.uTime },
    transparent: true, depthWrite: false,
    vertexShader: `
      attribute float aTile; attribute float aShade;
      varying vec2 vUv; varying float vFog; varying float vShade;
      void main(){
        vec2 cell = vec2(mod(aTile, 8.), floor(aTile / 8.));
        vUv = vec2((cell.x + uv.x) / 8., 1. - (cell.y + 1. - uv.y) / 8.);
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.);
        vFog = smoothstep(27., 7., -mv.z); vShade = aShade;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D map; uniform float uCardFade;
      varying vec2 vUv; varying float vFog; varying float vShade;
      void main(){
        vec4 t = texture2D(map, vUv);
        gl_FragColor = vec4(t.rgb * vShade, t.a * uCardFade * vFog);
        #include <colorspace_fragment>
      }`,
  });
  tiles = new THREE.InstancedMesh(tileGeo, tileMat, list.length);
  list.forEach((t, i) => { const o = wallMatrix(t.a, t.z, t.s, t.s); tiles.setMatrixAt(i, o.matrix); t.matrix = o.matrix; aTile[i] = t.tile; aShade[i] = t.shade; });
  tileGeo.setAttribute('aTile', new THREE.InstancedBufferAttribute(aTile, 1));
  tileGeo.setAttribute('aShade', new THREE.InstancedBufferAttribute(aShade, 1));
  scene.add(tiles);

  // gates + floor labels
  GROUPS.forEach((g, i) => {
    const z = groupStart(i);
    const ring = new THREE.Mesh(new THREE.RingGeometry(R - 0.05, R + 0.02, 128), new THREE.MeshBasicMaterial({ color: COL.accent, transparent: true, opacity: 0, fog: true, side: THREE.DoubleSide }));
    ring.position.z = z; scene.add(ring); g.ring = ring;
    const lc = document.createElement('canvas'); lc.width = 1024; lc.height = 256; const c = lc.getContext('2d');
    c.fillStyle = COL.accent; c.font = '500 44px "IBM Plex Mono"'; c.fillText(g.no, 20, 70);
    c.fillStyle = COL.bone; c.font = '800 150px "Bricolage Grotesque"'; c.fillText(g.name.toUpperCase(), 14, 228);
    const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = aniso;
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: lt, transparent: true, opacity: 0, fog: true, depthWrite: false }));
    lab.rotation.x = -Math.PI / 2; lab.position.set(-0.6, -R + 0.55, z - 2.6); scene.add(lab); g.label = lab;
  });

  buildPoints(nameCloud(), list);
  buildIntro();
}

function loadImg(src) { return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }

// My name as a 3D block of dots: front face, lit edges, faint back face.
function nameCloud() {
  const lines = ['PRANAV', 'VERMA'];
  const fs = 260, lh = fs * 0.86;
  const cv = document.createElement('canvas'); const c = cv.getContext('2d');
  c.font = `800 ${fs}px "Bricolage Grotesque"`;
  const w = Math.ceil(Math.max(...lines.map((l) => c.measureText(l).width))) + 20;
  cv.width = w; cv.height = Math.ceil(lh * lines.length + fs * 0.25);
  c.font = `800 ${fs}px "Bricolage Grotesque"`; c.fillStyle = '#fff'; c.textBaseline = 'alphabetic';
  lines.forEach((l, i) => c.fillText(l, 10, fs * 0.92 + i * lh));
  const { data, width, height } = c.getImageData(0, 0, cv.width, cv.height);
  const on = (x, y) => x >= 0 && y >= 0 && x < width && y < height && data[(y * width + x) * 4 + 3] > 128;
  let filled = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > 128) filled++;
  const want = mobile ? 15000 : 30000;
  const pFront = (want * 0.62) / filled, pBack = (want * 0.18) / filled;
  const out = []; const depth = 0.045;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!on(x, y)) continue;
    const edge = !on(x - 3, y) || !on(x + 3, y) || !on(x, y - 3) || !on(x, y + 3);
    const nx = (x - width / 2) / width, ny = -(y - height / 2) / width;
    if (rand() < pFront) out.push(nx + rand() / width, ny, depth, 0.6 + rand() * 0.4);
    if (rand() < pBack) out.push(nx, ny, -depth, 0.25 + rand() * 0.2);
    if (edge && rand() < pFront * 1.6) out.push(nx, ny, (rand() * 2 - 1) * depth, 0.75 + rand() * 0.25);
  }
  return new Float32Array(out);
}

function buildPoints(buf, tileList) {
  const count = buf.length / 4;
  const pos = new Float32Array(count * 3), end = new Float32Array(count * 3), aR = new Float32Array(count * 4);
  const v = new THREE.Vector3();
  for (let j = 0; j < count; j++) {
    const x = buf[j * 4], y = buf[j * 4 + 1], z = buf[j * 4 + 2], l = buf[j * 4 + 3];
    pos.set([x * NAME_W, y * NAME_W, z * NAME_W], j * 3);
    const r = rand();
    const role = r < 0.34 ? 1 : 0;
    if (role === 0) {
      let m;
      if (rand() < 0.42) { const cd = cards[Math.floor(rand() * cards.length)]; m = cd.wallMatrix; v.set(rand() - 0.5, rand() - 0.5, 0.01); v.applyMatrix4(new THREE.Matrix4().copy(m).scale(new THREE.Vector3(1, 1, 1))); }
      else { const t = tileList[Math.floor(rand() * tileList.length)]; v.set(rand() - 0.5, rand() - 0.5, 0.01).applyMatrix4(t.matrix); }
      end.set([v.x, v.y, v.z], j * 3);
    }
    const dist = Math.hypot(x, y) * 1.4;
    aR.set([clamp(rand() * 0.55 + dist * 0.6 + (role ? 0.15 : 0)), l, role, rand()], j * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 3));
  geo.setAttribute('aR', new THREE.BufferAttribute(aR, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, Z_END / 2), 200);
  const mat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uT, uTime, uPR, uCardFade, uSize, uHeight; uniform mat3 uRot; uniform vec3 uAv, uEnd;
      attribute vec3 aEnd; attribute vec4 aR;
      varying float vA; varying float vLum; varying float vAcc;
      void main(){
        vec3 local = uRot * position;
        float breath = sin(uTime * 1.4 + position.y * 5. + aR.w * 6.2831) * 0.018;
        vec3 start = uAv + local * (1. + breath * 0.4) + normalize(position + vec3(0., 0., .001)) * breath * 0.5;
        bool toMe = aR.z > 0.5;
        vec3 dst = toMe ? uEnd + local * 0.92 : aEnd;
        float t = clamp((uT - aR.x * 0.45) / 0.55, 0., 1.);
        float e = t * t * (3. - 2. * t);
        vec3 p = mix(start, dst, e);
        float arc = sin(e * 3.14159);
        vec2 dir = normalize(position.xy + vec2(0.0001, 0.));
        p.xy += dir * arc * (toMe ? 0.9 : 1.8) * (0.4 + aR.w);
        p.z += arc * (aR.w - 0.5) * 2.5;
        // landed dots shimmer on the wall
        p += (1. - step(e, 0.999)) * vec3(0., 0., sin(uTime * 2. + aR.w * 40.) * 0.01);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        float size = uSize * (0.75 + aR.y * 0.5) * (1. + arc * 0.8);
        gl_PointSize = size * uPR * (uHeight / 900.) * (3.2 / max(0.4, -mv.z));
        float fog = smoothstep(30., 6., -mv.z);
        float landed = step(0.999, e);
        float fade = toMe ? 1. : mix(1., 0.1, uCardFade * landed);
        vA = fog * fade * (0.45 + aR.y * 0.55);
        vLum = aR.y; vAcc = step(0.955, aR.w);
      }`,
    fragmentShader: `
      varying float vA; varying float vLum; varying float vAcc;
      void main(){
        vec2 q = gl_PointCoord - 0.5; float d = length(q);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.1, d);
        vec3 bone = vec3(0.925, 0.902, 0.855);
        vec3 acc = vec3(1.0, 0.353, 0.122);
        vec3 col = mix(bone * (0.55 + vLum * 0.6), acc, vAcc);
        gl_FragColor = vec4(col, soft * vA);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);
}

/* ---------------- the race car: parked on the front page, then leads you through the tunnel ---------------- */
const intro = { wheels: [], fronts: [] };

// Open-wheel race car, my own model. Nose points to -z. Roughly 1 unit = 2.5 m.
const PAINT_GLOW = 0.45, PAINT_ENV = 0.3;   // measured: body renders ~#ff5d22 vs headline #ff5a1f
function buildCar() {
  const car = new THREE.Group();
  // paint tuned so the body reads as the same orange as the headline (#ff5a1f), with soft highlights only
  const paint = new THREE.MeshPhysicalMaterial({ color: COL.accent, emissive: COL.accent, emissiveIntensity: PAINT_GLOW, roughness: 0.45, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.25, envMapIntensity: PAINT_ENV });
  const carbon = new THREE.MeshStandardMaterial({ color: '#0d0d0f', roughness: 0.45, metalness: 0.5, envMapIntensity: 0.8 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#19191b', roughness: 0.8, metalness: 0, envMapIntensity: 0.7 });
  const metal = new THREE.MeshStandardMaterial({ color: '#2a2a2e', roughness: 0.3, metalness: 0.9 });
  const visor = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.1, metalness: 0.9 });
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent = car) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); parent.add(m); return m; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const UP = new THREE.Vector3(0, 1, 0);
  const rod = (a, b, r = 0.007, mat = carbon) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A); const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 6), mat); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(UP, d.normalize()); car.add(m); };
  // side profile (z, y) pushed out sideways, rounded, then pinched in plan view by `pinch(z)`
  const hull = (pts, width, pinch, bevel = 0.022) => {
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); sh.splineThru(pts.slice(1).map(([u, v]) => new THREE.Vector2(u, v))); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: width, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 20, steps: 1 });
    g.translate(0, 0, -width / 2); g.rotateY(-Math.PI / 2);
    const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const k = pinch(P.getZ(i), P.getY(i)); P.setX(i, P.getX(i) * k); }
    g.computeVertexNormals(); return g;
  };
  const sm = (a, b, v) => smooth(a, b, v);

  // main body: needle nose, cockpit, airbox hump, tight tail
  add(hull([[-1.13, 0.1], [-1.0, 0.125], [-0.7, 0.17], [-0.36, 0.245], [-0.3, 0.25], [-0.22, 0.235], [-0.04, 0.225], [0.02, 0.3], [0.1, 0.37], [0.2, 0.385], [0.4, 0.33], [0.7, 0.23], [0.98, 0.16], [1.02, 0.12], [1.0, 0.07], [0.3, 0.06], [-0.6, 0.065], [-1.0, 0.075], [-1.12, 0.085]],
    0.25, (z, y) => lerp(0.3, 1, sm(-1.13, -0.3, z)) * lerp(1, 0.38, sm(0.25, 1.0, z)) * lerp(1, 0.55, sm(0.25, 0.39, y))), paint);
  // sidepods: tall inlet, sloping down and pulled in at the back
  for (const sx of [-1, 1]) {
    const g = hull([[-0.2, 0.075], [-0.2, 0.2], [-0.17, 0.245], [0.0, 0.26], [0.35, 0.21], [0.7, 0.13], [0.86, 0.1], [0.86, 0.07], [0.3, 0.065]], 0.2, () => 1, 0.03);
    const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const z = P.getZ(i); P.setX(i, P.getX(i) * lerp(1, 0.45, sm(0.15, 0.86, z)) + sx * lerp(0.235, 0.1, sm(0.1, 0.86, z))); }
    g.computeVertexNormals(); add(g, paint);
    add(box(0.15, 0.085, 0.02), carbon, sx * 0.235, 0.185, -0.228);
    // mirror
    rod([sx * 0.13, 0.25, -0.24], [sx * 0.3, 0.285, -0.22], 0.005); add(box(0.07, 0.035, 0.02), carbon, sx * 0.31, 0.29, -0.215);
  }
  // floor with a raised edge
  add(box(0.64, 0.014, 1.55), carbon, 0, 0.052, 0.12);
  for (const sx of [-1, 1]) add(box(0.012, 0.03, 1.0), carbon, sx * 0.318, 0.066, 0.15);
  // airbox inlet + camera pod
  add(new THREE.SphereGeometry(0.045, 12, 8), carbon, 0, 0.345, 0.045).scale.set(1, 0.9, 0.5);
  add(box(0.13, 0.016, 0.03), carbon, 0, 0.41, 0.17);
  // driver + halo
  const helmet = add(new THREE.SphereGeometry(0.052, 18, 14), new THREE.MeshStandardMaterial({ color: COL.bone, roughness: 0.3 }), 0, 0.268, -0.1); helmet.scale.set(1, 1.05, 1.15);
  add(new THREE.SphereGeometry(0.046, 14, 8, 0, Math.PI * 2, 1.1, 0.75), visor, 0, 0.272, -0.112, -Math.PI / 2 + 0.25).scale.set(1.08, 1.2, 1.08);
  add(new THREE.TorusGeometry(0.105, 0.012, 8, 28, Math.PI), carbon, 0, 0.275, -0.1, -Math.PI / 2 + 0.12, 0, Math.PI);
  rod([0, 0.275, -0.205], [0, 0.215, -0.33], 0.011);
  // front wing: four stacked curved elements + endplates
  for (let i = 0; i < 4; i++) { const w = add(box(0.8, 0.008, 0.075), i < 3 ? carbon : paint, 0, 0.05 + i * 0.022, -1.17 + i * 0.05, 0.12 + i * 0.16); w.scale.x = 1 - i * 0.012; }
  for (const sx of [-1, 1]) { add(box(0.01, 0.1, 0.24), paint, sx * 0.402, 0.09, -1.1); add(box(0.05, 0.008, 0.2), carbon, sx * 0.38, 0.042, -1.1); }
  rod([-0.06, 0.1, -1.1], [-0.05, 0.07, -1.16], 0.008); rod([0.06, 0.1, -1.1], [0.05, 0.07, -1.16], 0.008);
  // rear wing: two elements, tall endplates, lower beam, centre pillar, rain light
  add(box(0.62, 0.012, 0.15), carbon, 0, 0.415, 0.99, 0.2);
  add(box(0.62, 0.01, 0.085), carbon, 0, 0.455, 1.07, 0.55);
  add(box(0.5, 0.01, 0.07), carbon, 0, 0.2, 1.03, 0.25);
  for (const sx of [-1, 1]) { add(box(0.012, 0.33, 0.3), paint, sx * 0.314, 0.325, 1.01); add(box(0.014, 0.1, 0.3), carbon, sx * 0.314, 0.44, 1.01); }
  rod([0, 0.16, 0.95], [0, 0.4, 0.99], 0.012);
  add(box(0.035, 0.07, 0.02), new THREE.MeshBasicMaterial({ color: COL.accent }), 0, 0.14, 1.06);
  // wheels: tyres with rounded shoulders, dark rims
  const tyre = (r, w) => { const h = w / 2, pts = [[r * 0.6, -h], [r * 0.88, -h], [r * 0.97, -h + 0.014], [r, -h + 0.034], [r, h - 0.034], [r * 0.97, h - 0.014], [r * 0.88, h], [r * 0.6, h]].map(([a, b]) => new THREE.Vector2(a, b)); return new THREE.LatheGeometry(pts, 36); };
  const tF = tyre(0.146, 0.125), tR = tyre(0.146, 0.165);
  for (const [sx, z, front] of [[-1, -0.72, 1], [1, -0.72, 1], [-1, 0.72, 0], [1, 0.72, 0]]) {
    const wd = front ? 0.125 : 0.165, hx = sx * (0.4 - wd / 2 + 0.0625), hy = 0.146;
    const hub = new THREE.Group(); hub.position.set(hx, hy, z); car.add(hub);
    const w = new THREE.Group(); hub.add(w);
    add(front ? tF : tR, rubber, 0, 0, 0, 0, 0, Math.PI / 2, w);
    add(new THREE.CylinderGeometry(0.092, 0.092, wd * 0.9, 24), metal, 0, 0, 0, 0, 0, Math.PI / 2, w);
    for (let k = 0; k < 5; k++) add(box(0.004, 0.16, 0.014), carbon, sx * (wd * 0.45 + 0.002), 0, 0, k * Math.PI / 5, 0, 0, w);
    intro.wheels.push(w); if (front) intro.fronts.push(hub);
    // wishbones + push rod
    const inX = sx * (front ? 0.07 : 0.1), outX = hx - sx * wd * 0.5;
    for (const [y0, y1] of [[front ? 0.2 : 0.2, 0.2], [0.085, 0.09]]) { rod([inX, y0, z - 0.2], [outX, y1, z]); rod([inX, y0, z + 0.16], [outX, y1, z]); }
    rod([inX, front ? 0.21 : 0.19, z + (front ? 0.02 : -0.05)], [outX, 0.1, z], 0.006);
  }
  // soft contact shadow so it sits on something
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; const g2 = gc.getContext('2d'); const gr = g2.createRadialGradient(64, 64, 10, 64, 64, 64); gr.addColorStop(0, 'rgba(255,90,31,.42)'); gr.addColorStop(0.5, 'rgba(255,90,31,.13)'); gr.addColorStop(1, 'rgba(255,90,31,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 128, 128);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.004; car.add(glow);
  return car;
}

function buildIntro() {
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;   // reflections for the paint
  intro.car = buildCar(); scene.add(intro.car);
  const key = new THREE.DirectionalLight(0xffffff, 1.6); intro.key = key; scene.add(key, key.target);
}

const SHOW_YAW = 1.95;   // opening pose: three-quarter view, nose to the left
const carPark = mobile ? [0, -0.4, 0.4] : [AV_X - 0.02, AV_Y - 1.36, 0.3];
const SIZE = mobile ? 0.85 : 1;
function setCarOpacity(o) {
  if (intro.opacity === o) return; intro.opacity = o;
  intro.car.traverse((m) => { if (!m.material) return; const mat = m.material; if (mat.userData.base === undefined) mat.userData.base = mat.opacity; mat.transparent = o < 1 || mat.userData.base < 1; mat.opacity = mat.userData.base * o; });
}
function updateIntro(time, p, cz) {
  // Two still scenes only: parked under the name at the start, parked by the name at the end.
  // No driving: it fades out as you start scrolling and fades back in when you reach the end.
  const c = intro.car;
  const atEnd = p > 0.5;
  const o = atEnd ? smooth(0.93, 0.975, p) : 1 - smooth(0.008, 0.05, p);
  c.visible = o > 0.01;
  if (!c.visible) return;
  setCarOpacity(o);
  const x = atEnd ? (mobile ? 0 : 1.4) : carPark[0];
  const y = atEnd ? (mobile ? -0.45 : -1.2) : carPark[1];
  const z = atEnd ? Z_END + 1.3 : carPark[2];
  c.position.set(x, y, z);
  c.rotation.set(0, atEnd ? Math.PI - 0.7 : SHOW_YAW, 0);
  c.scale.setScalar(SIZE * (atEnd ? 1.2 : (mobile ? 1.3 : 1.03)));
  for (const h of intro.fronts) h.rotation.y = 0.3;
  intro.key.position.set(x + 2.5, y + 4, z + 3); intro.key.target.position.set(x, y, z);
}

/* ---------------- UI: panel, index, depth nav ---------------- */
const panel = $('panel'); let openIdx = -1; let lastFocus = null;
function openPanel(i) {
  const card = cards[i]; const p = card.p; openIdx = i; lastFocus = document.activeElement;
  const media = $('pMedia'); media.innerHTML = '';
  media.classList.toggle('is-video', !!p.video);
  if (p.video) { const v = document.createElement('video'); v.src = p.video; v.poster = p.img; v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.controls = true; v.setAttribute('aria-label', p.title + ' demo video'); media.appendChild(v); }
  else if (card.img) { const im = new Image(); im.src = p.img; im.alt = p.title + ' screenshot'; media.appendChild(im); }
  else { const cv = document.createElement('canvas'); cv.width = 880; cv.height = 605; drawArt(cv.getContext('2d'), p, null, 0, 0, 880, 605); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', p.title + ' illustration'); media.appendChild(cv); }
  $('pMeta').innerHTML = `<b>${card.num}</b> / ${String(cards.length).padStart(2, '0')} · ${GROUPS[card.g].name}`;
  $('pTitle').textContent = p.title; $('pLine').textContent = p.line;
  $('pPoints').innerHTML = p.points.map((t) => `<li>${t}</li>`).join('');
  $('pStack').innerHTML = p.stack.map((t) => `<span>${t}</span>`).join('');
  $('pStatus').textContent = p.status;
  const l = $('pLink'); if (p.link) { l.href = p.link; l.hidden = false; l.textContent = p.link.includes('github') ? 'Code ↗' : 'Open live ↗'; } else l.hidden = true;
  panel.hidden = false; panel.querySelector('.panel-x').focus();
}
function closePanel() { $('pMedia').innerHTML = ''; panel.hidden = true; openIdx = -1; lastFocus && lastFocus.focus && lastFocus.focus(); }
panel.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closePanel(); });
$('pPrev').onclick = () => openPanel((openIdx + cards.length - 1) % cards.length);
$('pNext').onclick = () => openPanel((openIdx + 1) % cards.length);

const indexEl = $('index');
document.querySelector('#openIndex .count').textContent = cards.length;
$('indexList').innerHTML = GROUPS.map((g, gi) => `<section class="ix-group"><h4>${g.no} — ${g.name}</h4>${cards.filter((c) => c.g === gi).map((c) => `<button class="ix-row" data-i="${c.idx}"><span class="n">${c.num}</span><span class="t">${c.p.title}</span><span class="s">${c.p.status}</span></button>`).join('')}</section>`).join('');
$('openIndex').onclick = () => { indexEl.hidden = false; indexEl.querySelector('.panel-x').focus(); };
indexEl.addEventListener('click', (e) => {
  if (e.target.closest('[data-close-index]')) { indexEl.hidden = true; return; }
  const row = e.target.closest('.ix-row'); if (!row) return;
  const i = +row.dataset.i; indexEl.hidden = true; jumpToZ(cards[i].z + 3.2, true); openPanel(i);
});
const aboutEl = $('about');
const rows = (list, f) => list.map(f).join('');
$('aboutBody').innerHTML =
  `<section class="ix-group"><h4>Quick facts</h4>${rows(ABOUT.facts, ([k, v]) => `<div class="ab-row"><span class="k">${k}</span><span class="v">${v}</span></div>`)}</section>` +
  `<section class="ix-group"><h4>Results</h4>${rows(ABOUT.results, ([k, v]) => `<div class="ab-row"><span class="k hot">${k}</span><span class="v">${v}</span></div>`)}</section>` +
  `<section class="ix-group"><h4>Skills</h4>${rows(ABOUT.skills, ([k, v]) => `<div class="ab-row"><span class="k">${k}</span><span class="v">${v}</span></div>`)}</section>` +
  `<section class="ix-group"><h4>Campus</h4>${rows(ABOUT.campus, ([n, r, d]) => `<div class="ab-row"><span class="k">${r}</span><span class="v"><b>${n}</b><br>${d}</span></div>`)}</section>`;
$('openAbout').onclick = () => { aboutEl.hidden = false; aboutEl.querySelector('.panel-x').focus(); };
aboutEl.addEventListener('click', (e) => { if (e.target.closest('[data-close-about]')) aboutEl.hidden = true; });
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (!panel.hidden) closePanel(); else if (!indexEl.hidden) indexEl.hidden = true; else if (!aboutEl.hidden) aboutEl.hidden = true; }
  if (!panel.hidden && e.key === 'ArrowRight') $('pNext').click();
  if (!panel.hidden && e.key === 'ArrowLeft') $('pPrev').click();
});

// scroll <-> camera
const P_MOVE0 = 0.1, P_MOVE1 = 0.93;
const zFromP = (p) => { const t = clamp((p - P_MOVE0) / (P_MOVE1 - P_MOVE0)); const k = 0.08; const e = t < k ? t * t / (2 * k) : t > 1 - k ? 1 - (1 - t) * (1 - t) / (2 * k) - k : t - k / 2; return lerp(CAM_START, CAM_STOP, e / (1 - k)); };
function pFromZ(z) { let lo = P_MOVE0, hi = P_MOVE1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; zFromP(m) > z ? (lo = m) : (hi = m); } return (lo + hi) / 2; }
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
function jumpToZ(z, instant) { const top = pFromZ(z) * maxScroll(); scrollTo({ top, behavior: instant || reduced ? 'instant' : 'smooth' }); if (instant) sp = top / maxScroll(); }

const depth = $('depth');
GROUPS.forEach((g, i) => {
  const b = document.createElement('button'); b.innerHTML = `<span>${g.no} ${g.name}</span>`; b.setAttribute('aria-label', `${g.no} ${g.name}`);
  b.onclick = () => jumpToZ(groupStart(i) + 1.5); g.btn = b; depth.appendChild(b);
});
const endBtn = document.createElement('button'); endBtn.innerHTML = '<span>05 Contact</span>'; endBtn.setAttribute('aria-label', 'Contact'); endBtn.onclick = () => scrollTo({ top: maxScroll(), behavior: reduced ? 'instant' : 'smooth' }); depth.appendChild(endBtn);
function placeDepth() {
  GROUPS.forEach((g, i) => { g.btn.style.top = (pFromZ(groupStart(i) + 1.5) * 100) + '%'; });
  endBtn.style.top = '100%';
}
document.querySelector('[data-jump]').onclick = (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' }); };

/* ---------------- input ---------------- */
const mouse = { x: 0, y: 0 }; const look = { yaw: 0, pitch: 0, dYaw: 0, dPitch: 0 };
let drag = null; let hovered = null; const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: 0, type: e.pointerType }; if (e.pointerType === 'mouse') canvas.setPointerCapture(e.pointerId); });
addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1;
  ndc.set(mouse.x, -mouse.y);
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    look.dYaw = clamp(look.dYaw + dx * 0.004, -1.3, 1.3);
    if (drag.type === 'mouse') look.dPitch = clamp(look.dPitch + dy * 0.003, -0.55, 0.55);
    canvas.classList.toggle('dragging', drag.moved > 6);
  }
});
addEventListener('pointerup', () => {
  if (drag && drag.moved < 8) { pick(); if (hovered) openPanel(hovered.userData.card.idx); }
  drag = null; canvas.classList.remove('dragging');
});
function pick() {
  ray.setFromCamera(ndc, camera);
  const hit = U.uCardFade.value > 0.5 ? ray.intersectObjects(mainMeshes, false)[0] : null;
  hovered = hit && hit.distance < 14 ? hit.object : null;
  canvas.classList.toggle('hover', !!hovered);
}

/* ---------------- loop ---------------- */
let sp = 0; // smoothed scroll progress
const hero = $('hero'), hud = $('hud'), endEl = $('end'), hint = $('dragHint');
let curGroup = -2;
const rotM = new THREE.Matrix4(); const qTmp = new THREE.Quaternion(); const oTmp = new THREE.Object3D();
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05); const time = clock.elapsedTime;
  const target = clamp(scrollY / Math.max(1, maxScroll()));
  sp += (target - sp) * (reduced ? 1 : 1 - Math.pow(0.0008, dt));
  const p = sp;

  U.uTime.value = reduced ? 0 : time;
  U.uT.value = smooth(0.035, 0.2, p) * 1.45;
  U.uCardFade.value = smooth(0.13, 0.21, p);

  // avatar turns toward the mouse (both copies of me)
  const ay = -Math.atan2(AV_X, CAM_START) + mouse.x * 0.4 + (reduced ? 0 : Math.sin(time * 0.3) * 0.12), ax = mouse.y * 0.18;
  rotM.makeRotationFromEuler(new THREE.Euler(ax, ay, 0, 'YXZ')); U.uRot.value.setFromMatrix4(rotM);

  // camera
  const cz = zFromP(p);
  updateIntro(time, p, cz);
  camera.position.z = cz;
  if (!drag) { look.dYaw *= 1 - dt * 0.6; look.dPitch *= 1 - dt * 0.9; }
  const intro = 1 - smooth(0.08, 0.16, p);
  look.yaw += ((-mouse.x * 0.1 * (1 - intro)) + look.dYaw - look.yaw) * (1 - Math.pow(0.002, dt));
  look.pitch += ((-mouse.y * 0.06 * (1 - intro)) + look.dPitch - look.pitch) * (1 - Math.pow(0.002, dt));
  camera.rotation.set(look.pitch, look.yaw, 0);
  camera.position.x = Math.sin(time * 0.4) * 0.05 * (reduced ? 0 : 1);
  camera.position.y = Math.cos(time * 0.33) * 0.04 * (reduced ? 0 : 1);

  // main cards turn toward you as you come close
  const fade = U.uCardFade.value;
  for (const m of mainMeshes) {
    const card = m.userData.card; const dist = cz - card.z;
    const f = smooth(10, 3.5, dist) * smooth(-0.5, 2.2, dist) * (mobile ? 0.9 : 0.72);
    oTmp.position.copy(card.wallPos); oTmp.up.set(0, 1, 0); oTmp.lookAt(camera.position);
    qTmp.copy(card.wallQuat).slerp(oTmp.quaternion, f);
    m.quaternion.copy(qTmp);
    const inward = f * (mobile ? 2.1 : 0.9);
    m.position.set(card.wallPos.x * (1 - inward / R), card.wallPos.y * (1 - inward / R), card.wallPos.z);
    m.userData.hover += ((hovered === m ? 1 : 0) - m.userData.hover) * Math.min(1, dt * 10);
    const s = 1 + m.userData.hover * 0.06;
    m.scale.set(CARD_W * s, CARD_H * s, 1);
    m.material.opacity = fade;
    m.userData.glow.material.opacity = m.userData.hover * fade;
  }
  GROUPS.forEach((g) => { if (g.label) { g.label.material.opacity = fade * 0.9; g.ring.material.opacity = fade * 0.55; } });
  if (!drag && !coarse) pick();

  // overlays
  hero.style.opacity = 1 - smooth(0.0, 0.05, p);
  hero.style.transform = `translateY(${-smooth(0, 0.06, p) * 40}px)`;
  const inTunnel = p > 0.16 && p < 0.95;
  hud.classList.toggle('on', inTunnel); depth.classList.toggle('on', p > 0.12); hint.classList.toggle('on', inTunnel && p < 0.4);
  endEl.classList.toggle('on', p > 0.955);
  $('depthFill').style.height = (p * 100) + '%';
  let g = -1; GROUPS.forEach((_, i) => { if (cz < groupStart(i) + 3) g = i; });
  if (g !== curGroup) {
    curGroup = g;
    if (g >= 0) { $('hudNo').textContent = GROUPS[g].no + ' / 04'; $('hudName').textContent = GROUPS[g].name; $('hudLine').textContent = GROUPS[g].line; }
    else { $('hudNo').textContent = '00'; $('hudName').textContent = 'Entering'; $('hudLine').textContent = 'Every card on these walls used to be a dot of my name.'; }
    GROUPS.forEach((gr, i) => gr.btn.classList.toggle('active', i === g));
    endBtn.classList.toggle('active', false);
  }
  if (p > 0.955) { GROUPS.forEach((gr) => gr.btn.classList.remove('active')); endBtn.classList.add('active'); }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function noGL() {
  document.body.classList.add('nogl');
  const ix = $('index'); ix.hidden = false; ix.querySelector('[data-close-index]').hidden = true;
}

if (renderer) {
  resize();
  addEventListener('resize', () => { resize(); U.uHeight.value = innerHeight; placeDepth(); });
  build().then(() => { placeDepth(); clock.start(); frame(); }).catch((err) => { console.error(err); noGL(); });
}
