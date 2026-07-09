/* T1 Carousel Builder — paper-and-doodle carousel editor.
   Model -> DOM preview (interactive) and -> canvas (PNG export), both from one model
   so the export is WYSIWYG. Schematics come from schematics.js (generated from the
   skill's Python library). No external libraries. */
'use strict';

const CANVAS_W = 1080, CANVAS_H = 1350;
const TONES = { black: '#000000', bone: '#F3F1ED', concrete: '#A8A7A4' };
const RED = '#E10600';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- model ---------- */
function newSlide(tone = 'bone') {
  return { bg: tone, image: null, duotone: false, dim: 0, layers: [] };
}
let project = load() || { slides: [newSlide()], current: 0 };
let selId = null;
let grainURL = makeGrainTileURL();

function slide() { return project.slides[project.current]; }
function inkFor(tone) { return tone === 'bone' ? '#141414' : '#ffffff'; }

/* ---------- schematic dropdown ---------- */
(function fillSchematics() {
  const sel = $('#schematicSelect');
  const cats = {};
  for (const [name, s] of Object.entries(window.SCHEMATICS)) {
    (cats[s.category] ||= []).push([name, s.label]);
  }
  const order = ['calisthenics', 'training', 'explainer'];
  for (const cat of order) {
    if (!cats[cat]) continue;
    const g = document.createElement('optgroup');
    g.label = cat[0].toUpperCase() + cat.slice(1);
    cats[cat].sort((a, b) => a[1].localeCompare(b[1]));
    for (const [name, label] of cats[cat]) {
      const o = document.createElement('option');
      o.value = name; o.textContent = label; g.appendChild(o);
    }
    sel.appendChild(g);
  }
})();

/* ---------- background render ---------- */
function styleBg(el, s) {
  el.innerHTML = '';
  el.style.background = TONES[s.bg];
  // paper grain overlay
  const grain = document.createElement('div');
  grain.style.cssText = `position:absolute;inset:0;background-image:url(${grainURL});
    mix-blend-mode:${s.bg === 'black' ? 'screen' : 'multiply'};opacity:${s.bg === 'black' ? .14 : .10};`;
  el.appendChild(grain);
  if (s.image) {
    const img = document.createElement('img');
    img.src = s.image;
    img.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
      ${s.duotone ? 'filter:grayscale(1) contrast(1.05);' : ''}`;
    el.appendChild(img);
    if (s.duotone) {
      const tint = document.createElement('div');
      tint.style.cssText = `position:absolute;inset:0;background:${RED};mix-blend-mode:multiply;opacity:.32;`;
      el.appendChild(tint);
    }
    if (s.dim > 0) {
      const d = document.createElement('div');
      d.style.cssText = `position:absolute;inset:0;background:#000;opacity:${s.dim};`;
      el.appendChild(d);
    }
  }
}

/* ---------- layer nodes ---------- */
function schematicSVG(name, color, accent) {
  let svg = window.SCHEMATICS[name].svg;
  return svg.replace(/currentColor/g, color).replace(/var\(--red\)/g, accent);
}
function layerBox(l) {
  if (l.type === 'schematic') {
    const s = window.SCHEMATICS[l.name];
    const w = (l.size / 100) * CANVAS_W;
    return { w, h: w * (s.h / s.w) };
  }
  return null; // text auto-sizes
}
function makeNode(l) {
  const n = document.createElement('div');
  n.className = 'node ' + l.type + (l.id === selId ? ' selected' : '');
  n.dataset.id = l.id;
  n.style.left = l.x + 'px';
  n.style.top = l.y + 'px';
  n.style.transform = `translate(-50%,-50%) rotate(${l.rot}deg) scale(${l.scale})`;
  if (l.type === 'schematic') {
    const b = layerBox(l);
    n.style.width = b.w + 'px'; n.style.height = b.h + 'px';
    n.style.color = l.color;
    n.style.setProperty('--red', l.accent);
    n.innerHTML = schematicSVG(l.name, l.color, l.accent);
  } else {
    n.style.color = l.color;
    n.style.fontFamily = `'${l.font}',sans-serif`;
    n.style.fontSize = l.size + 'px';
    n.style.fontWeight = l.bold ? '700' : '400';
    n.style.fontStyle = l.italic ? 'italic' : 'normal';
    n.style.textDecoration = l.underline ? 'underline' : 'none';
    n.style.textAlign = l.align;
    n.textContent = l.text || ' ';
  }
  return n;
}
function renderStage() {
  styleBg($('#bgLayer'), slide());
  const host = $('#layersHost');
  host.innerHTML = '';
  for (const l of slide().layers) host.appendChild(makeNode(l));
}

/* ---------- full render ---------- */
function render() {
  renderStage();
  $('#slideLabel').textContent = `${project.current + 1} / ${project.slides.length}`;
  $$('#toneSeg button').forEach(b => b.classList.toggle('active', b.dataset.tone === slide().bg));
  $('#duotoneChk').checked = slide().duotone;
  $('#bgDim').value = slide().dim;
  renderLayerList();
  renderProps();
  renderFilmstrip();
  fitStage();
  save();
}

function renderLayerList() {
  const ul = $('#layerList'); ul.innerHTML = '';
  [...slide().layers].reverse().forEach(l => {
    const li = document.createElement('li');
    li.className = l.id === selId ? 'sel' : '';
    const label = l.type === 'text' ? ('“' + (l.text || '').slice(0, 18) + '”') : window.SCHEMATICS[l.name].label;
    li.innerHTML = `<span class="name">${l.type === 'text' ? '🅣' : '◈'} ${label}</span>
      <button data-act="up">↑</button><button data-act="down">↓</button><button data-act="del">✕</button>`;
    li.onclick = e => {
      const act = e.target.dataset.act;
      if (act === 'up') reorder(l.id, 1);
      else if (act === 'down') reorder(l.id, -1);
      else if (act === 'del') removeLayer(l.id);
      else { selId = l.id; render(); }
    };
    ul.appendChild(li);
  });
}

function renderFilmstrip() {
  const fs = $('#filmstrip'); fs.innerHTML = '';
  project.slides.forEach((s, i) => {
    const t = document.createElement('div');
    t.className = 'thumb' + (i === project.current ? ' active' : '');
    const mini = document.createElement('div');
    mini.className = 'mini';
    mini.style.width = CANVAS_W + 'px'; mini.style.height = CANVAS_H + 'px';
    mini.style.transform = `scale(${64 / CANVAS_W})`;
    const bg = document.createElement('div'); bg.style.cssText = 'position:absolute;inset:0;';
    styleBg(bg, s); mini.appendChild(bg);
    s.layers.forEach(l => mini.appendChild(makeNode(l)));
    t.appendChild(mini);
    t.insertAdjacentHTML('beforeend', `<span class="n">${i + 1}</span>`);
    t.onclick = () => { project.current = i; selId = null; render(); };
    fs.appendChild(t);
  });
}

/* ---------- properties ---------- */
function selected() { return slide().layers.find(l => l.id === selId); }
function renderProps() {
  const l = selected();
  $('#propsEmpty').classList.toggle('hidden', !!l);
  $('#propsBody').classList.toggle('hidden', !l);
  if (!l) return;
  $('#textProps').classList.toggle('hidden', l.type !== 'text');
  $('#schemProps').classList.toggle('hidden', l.type !== 'schematic');
  $('#pX').value = l.x; $('#pXv').textContent = Math.round(l.x);
  $('#pY').value = l.y; $('#pYv').textContent = Math.round(l.y);
  $('#pScale').value = l.scale; $('#pScaleV').textContent = l.scale.toFixed(2);
  $('#pRot').value = l.rot; $('#pRotV').textContent = l.rot + '°';
  $('#pColor').value = toHex(l.color);
  if (l.type === 'schematic') $('#pAccent').value = toHex(l.accent);
  if (l.type === 'text') {
    $('#pText').value = l.text; $('#pFont').value = l.font;
    $('#pBold').classList.toggle('active', l.bold);
    $('#pItalic').classList.toggle('active', l.italic);
    $('#pUnderline').classList.toggle('active', l.underline);
    $$('#pAlign button').forEach(b => b.classList.toggle('active', b.dataset.align === l.align));
  }
}
function toHex(c) { // normalize named/hex to #rrggbb for <input type=color>
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  const m = { '#fff': '#ffffff', '#000': '#000000', white: '#ffffff', black: '#000000' };
  return m[c] || (c[0] === '#' ? c : '#000000');
}

/* ---------- layer ops ---------- */
function addSchematic(name) {
  const meta = window.SCHEMATICS[name];
  const tone = slide().bg;
  slide().layers.push({
    id: uid(), type: 'schematic', name, size: meta.size,
    x: CANVAS_W / 2, y: CANVAS_H / 2, scale: 1, rot: 0,
    color: inkFor(tone), accent: RED
  });
  selId = slide().layers.at(-1).id; showTab('props'); render();
}
function addText() {
  const tone = slide().bg;
  slide().layers.push({
    id: uid(), type: 'text', text: 'your text\nin red', font: 'Poppins',
    size: 72, bold: true, italic: false, underline: false, align: 'center',
    x: CANVAS_W / 2, y: 360, scale: 1, rot: 0, color: inkFor(tone)
  });
  selId = slide().layers.at(-1).id; showTab('props'); render();
}
function removeLayer(id) { slide().layers = slide().layers.filter(l => l.id !== id); if (selId === id) selId = null; render(); }
function reorder(id, dir) {
  const a = slide().layers, i = a.findIndex(l => l.id === id);
  const j = i + dir; if (j < 0 || j >= a.length) return;
  [a[i], a[j]] = [a[j], a[i]]; render();
}
function bringFront(id) {
  const a = slide().layers, i = a.findIndex(l => l.id === id);
  if (i >= 0) { a.push(a.splice(i, 1)[0]); render(); }
}
function dupeLayer(id) {
  const l = slide().layers.find(x => x.id === id); if (!l) return;
  const c = { ...l, id: uid(), x: l.x + 40, y: l.y + 40 };
  slide().layers.push(c); selId = c.id; render();
}

/* ---------- drag on stage ---------- */
(function dragging() {
  const stage = $('#stage');
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    const node = e.target.closest('.node');
    if (!node) { selId = null; render(); return; }
    selId = node.dataset.id;
    const l = selected();
    const sc = currentScale();
    drag = { id: l.id, sx: e.clientX, sy: e.clientY, ox: l.x, oy: l.y, sc };
    node.setPointerCapture(e.pointerId);
    render();
  });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    const l = selected(); if (!l) return;
    l.x = clamp(drag.ox + (e.clientX - drag.sx) / drag.sc, 0, CANVAS_W);
    l.y = clamp(drag.oy + (e.clientY - drag.sy) / drag.sc, 0, CANVAS_H);
    renderStage(); syncTransformInputs(l);
  });
  stage.addEventListener('pointerup', () => { if (drag) { drag = null; render(); } });
})();
function syncTransformInputs(l) {
  $('#pX').value = l.x; $('#pXv').textContent = Math.round(l.x);
  $('#pY').value = l.y; $('#pYv').textContent = Math.round(l.y);
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- stage fit ---------- */
function currentScale() {
  const r = $('#stage').getBoundingClientRect();
  return r.width / CANVAS_W;
}
function fitStage() {
  const area = $('.stage-area'), scaler = $('#stageScaler'), stage = $('#stage');
  const availW = area.clientWidth - 32;
  const availH = area.clientHeight - $('#filmstrip').offsetHeight - 40;
  const sc = Math.min(availW / CANVAS_W, availH / CANVAS_H, 1);
  stage.style.transformOrigin = 'top left';
  stage.style.transform = `scale(${sc})`;
  scaler.style.transform = 'none';
  scaler.style.width = CANVAS_W * sc + 'px';
  scaler.style.height = CANVAS_H * sc + 'px';
}
window.addEventListener('resize', fitStage);

/* ---------- events ---------- */
$('#toneSeg').onclick = e => { const t = e.target.dataset.tone; if (t) { slide().bg = t; render(); } };
$('#duotoneChk').onchange = e => { slide().duotone = e.target.checked; render(); };
$('#bgDim').oninput = e => { slide().dim = +e.target.value; renderStage(); save(); };
$('#bgClear').onclick = () => { slide().image = null; render(); };
$('#bgImageInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { slide().image = r.result; render(); };
  r.readAsDataURL(f);
};
$('#addSchematic').onclick = () => addSchematic($('#schematicSelect').value);
$('#addText').onclick = addText;

$('#pX').oninput = e => { selected().x = +e.target.value; $('#pXv').textContent = e.target.value; renderStage(); save(); };
$('#pY').oninput = e => { selected().y = +e.target.value; $('#pYv').textContent = e.target.value; renderStage(); save(); };
$('#pScale').oninput = e => { selected().scale = +e.target.value; $('#pScaleV').textContent = (+e.target.value).toFixed(2); renderStage(); save(); };
$('#pRot').oninput = e => { selected().rot = +e.target.value; $('#pRotV').textContent = e.target.value + '°'; renderStage(); save(); };
$('#pColor').oninput = e => { selected().color = e.target.value; renderStage(); save(); };
$('#pAccent').oninput = e => { selected().accent = e.target.value; renderStage(); save(); };
$('#pText').oninput = e => { selected().text = e.target.value; renderStage(); renderLayerList(); save(); };
$('#pFont').onchange = e => { selected().font = e.target.value; renderStage(); save(); };
$('#pBold').onclick = () => { const l = selected(); l.bold = !l.bold; renderProps(); renderStage(); save(); };
$('#pItalic').onclick = () => { const l = selected(); l.italic = !l.italic; renderProps(); renderStage(); save(); };
$('#pUnderline').onclick = () => { const l = selected(); l.underline = !l.underline; renderProps(); renderStage(); save(); };
$('#pAlign').onclick = e => { const a = e.target.dataset.align; if (a) { selected().align = a; renderProps(); renderStage(); save(); } };
$('#pDelete').onclick = () => removeLayer(selId);
$('#pDupe').onclick = () => dupeLayer(selId);
$('#pFront').onclick = () => bringFront(selId);

$('#slidePrev').onclick = () => { if (project.current > 0) { project.current--; selId = null; render(); } };
$('#slideNext').onclick = () => { if (project.current < project.slides.length - 1) { project.current++; selId = null; render(); } };
$('#slideAdd').onclick = () => { project.slides.splice(project.current + 1, 0, newSlide(slide().bg)); project.current++; selId = null; render(); };
$('#slideDup').onclick = () => { project.slides.splice(project.current + 1, 0, JSON.parse(JSON.stringify(slide()))); project.current++; selId = null; render(); };
$('#slideDel').onclick = () => {
  if (project.slides.length === 1) { project.slides[0] = newSlide(); }
  else { project.slides.splice(project.current, 1); project.current = Math.max(0, project.current - 1); }
  selId = null; render();
};

$$('.panel-tabs button').forEach(b => b.onclick = () => showTab(b.dataset.tab));
function showTab(name) {
  $$('.panel-tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  $$('.tab').forEach(t => t.classList.toggle('hidden', t.dataset.tab !== name));
}

$('#exportBtn').onclick = () => exportSlide(project.current);
$('#exportAllBtn').onclick = exportAll;

/* ---------- persistence ---------- */
let saveTimer;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem('t1carousel', JSON.stringify(project)); } catch (e) {} }, 300); }
function load() { try { return JSON.parse(localStorage.getItem('t1carousel')); } catch (e) { return null; } }

/* ---------- grain tile ---------- */
function makeGrainTileURL() {
  const c = document.createElement('canvas'); c.width = c.height = 120;
  const x = c.getContext('2d'); const d = x.createImageData(120, 120);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 128 + (Math.random() * 90 - 45);
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  return c.toDataURL('image/png');
}

/* ---------- PNG export (canvas 2D, WYSIWYG) ---------- */
async function ensureFonts() {
  try {
    await document.fonts.ready;
    await Promise.all(['700 72px Poppins', 'italic 700 72px Poppins', '400 72px Poppins', '600 72px Caveat'].map(f => document.fonts.load(f)));
  } catch (e) {}
}
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

async function slideToCanvas(s) {
  const cv = document.createElement('canvas'); cv.width = CANVAS_W; cv.height = CANVAS_H;
  const ctx = cv.getContext('2d');
  // background tone
  ctx.fillStyle = TONES[s.bg]; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // grain
  const grain = await loadImg(grainURL);
  const pat = ctx.createPattern(grain, 'repeat');
  ctx.save(); ctx.globalAlpha = s.bg === 'black' ? .14 : .10;
  ctx.globalCompositeOperation = s.bg === 'black' ? 'screen' : 'multiply';
  ctx.fillStyle = pat; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); ctx.restore();
  // image
  if (s.image) {
    const img = await loadImg(s.image);
    const r = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
    const w = img.width * r, h = img.height * r;
    ctx.drawImage(img, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h);
    if (s.duotone) duotone(ctx);
    if (s.dim > 0) { ctx.save(); ctx.globalAlpha = s.dim; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); ctx.restore(); }
  }
  // pre-rasterize schematics
  const imgs = {};
  await Promise.all(s.layers.filter(l => l.type === 'schematic').map(async l => {
    const svg = schematicSVG(l.name, l.color, l.accent);
    imgs[l.id] = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  }));
  for (const l of s.layers) {
    ctx.save();
    ctx.translate(l.x, l.y); ctx.rotate(l.rot * Math.PI / 180); ctx.scale(l.scale, l.scale);
    if (l.type === 'schematic') {
      const meta = window.SCHEMATICS[l.name];
      const w = (l.size / 100) * CANVAS_W, h = w * (meta.h / meta.w);
      ctx.drawImage(imgs[l.id], -w / 2, -h / 2, w, h);
    } else {
      drawText(ctx, l);
    }
    ctx.restore();
  }
  return cv;
}
function duotone(ctx) {
  const d = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    const lum = a[i] * .299 + a[i + 1] * .587 + a[i + 2] * .114;
    a[i] = lum * .7 + 225 * .3; a[i + 1] = lum * .7; a[i + 2] = lum * .7 + 6 * .3;
  }
  ctx.putImageData(d, 0, 0);
}
function drawText(ctx, l) {
  ctx.font = `${l.italic ? 'italic ' : ''}${l.bold ? '700' : '400'} ${l.size}px '${l.font}'`;
  ctx.fillStyle = l.color; ctx.textBaseline = 'middle'; ctx.textAlign = l.align;
  const lines = (l.text || '').split('\n');
  const lineH = l.size * 1.15;
  const maxW = Math.max(...lines.map(t => ctx.measureText(t).width), 1);
  const startY = -(lines.length * lineH) / 2 + lineH / 2;
  const anchorX = l.align === 'left' ? -maxW / 2 : l.align === 'right' ? maxW / 2 : 0;
  lines.forEach((t, i) => {
    const y = startY + i * lineH;
    ctx.fillText(t, anchorX, y);
    if (l.underline) {
      const w = ctx.measureText(t).width;
      const x0 = l.align === 'center' ? -w / 2 : l.align === 'left' ? -maxW / 2 : maxW / 2 - w;
      ctx.save(); ctx.strokeStyle = l.color; ctx.lineWidth = Math.max(2, l.size * .06);
      ctx.beginPath(); ctx.moveTo(x0, y + l.size * .42); ctx.lineTo(x0 + w, y + l.size * .42); ctx.stroke(); ctx.restore();
    }
  });
}
async function exportSlide(i) {
  toast('Rendering…');
  await ensureFonts();
  const cv = await slideToCanvas(project.slides[i]);
  cv.toBlob(b => { downloadBlob(b, `carousel-${String(i + 1).padStart(2, '0')}.png`); toast('Exported slide ' + (i + 1)); }, 'image/png');
}
async function exportAll() {
  await ensureFonts();
  for (let i = 0; i < project.slides.length; i++) {
    const cv = await slideToCanvas(project.slides[i]);
    await new Promise(res => cv.toBlob(b => { downloadBlob(b, `carousel-${String(i + 1).padStart(2, '0')}.png`); setTimeout(res, 400); }, 'image/png'));
  }
  toast('Exported ' + project.slides.length + ' slides');
}
function downloadBlob(b, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.remove('hidden'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 1800); }

/* ---------- PWA ---------- */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; $('#installBtn').classList.remove('hidden'); });
$('#installBtn').onclick = async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $('#installBtn').classList.add('hidden'); };
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

render();
