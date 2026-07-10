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

/* ---------- Starter templates ---------- */
const T = (text, o = {}) => ({
  id: uid(), type: 'text', text, font: 'Poppins', size: 60, bold: true,
  italic: false, underline: false, align: 'left', x: 540, y: 300,
  scale: 1, rot: 0, color: '#ffffff', accent: RED, ...o
});
const S = (name, o = {}) => ({
  id: uid(), type: 'schematic', name, size: window.SCHEMATICS[name].size,
  x: 540, y: 900, scale: 1, rot: 0, color: '#141414', accent: RED, ...o
});
/* Stock-photo layer from the bundled manifest (photos.js). */
const PH = (file, o = {}) => {
  const m = (window.STOCK_PHOTOS || []).find(p => p.file === file) || { w: 900, h: 600 };
  return { id: uid(), type: 'image', src: 'photos/' + file, natW: m.w, natH: m.h,
    widthPct: 60, x: 540, y: 900, scale: 1, rot: 0, opacity: 1, duotone: true, color: '#000000', ...o };
};
const brandLayers = (tone, name = 'TRIPLEONEBARS') => [
  T(name, { size: 26, x: 60 + name.length * 9.5, y: 92, color: tone === 'bone' ? '#86847F' : '#dddbd7' }),
  T('✕', { size: 36, x: 1000, y: 92, color: RED, align: 'center' })
];

function makeTemplate() {
  const brand = tone => brandLayers(tone, 'GETSTENIX');
  const s1 = { ...newSlide('concrete'), layers: [
    ...brand('concrete'),
    T('for years,\nthe fitness industry\nfollowed the *same approach.*', { y: 330, x: 545 }),
    T('build one program.\ngive it to everyone.', { y: 585, x: 390 }),
    T('hoping it works.', { y: 700, x: 345, color: '#6f6d69' }),
    T('BUT....', { size: 96, y: 850, x: 241 }),
    S('program-doc', { x: 845, y: 1090 })
  ]};
  const s2 = { ...newSlide('concrete'), layers: [
    ...brand('concrete'),
    S('two-athletes-diverge', { x: 540, y: 430 }),
    T('we kept asking ourselves:\nwhy do *two athletes*', { y: 810, x: 490 }),
    S('doodle-underline', { x: 420, y: 895, size: 26 }),
    T('following the same program\nget completely different results?', { y: 1010, x: 555, color: '#4d4b48' })
  ]};
  const s3 = { ...newSlide('concrete'), layers: [
    ...brand('concrete'),
    T('that question changed everything.\ninstead of asking the athlete to *adapt*\n*to the program...*', { size: 52, y: 300, x: 540 }),
    T('we built a system that *adapts*\n*to the athlete.*', { size: 52, y: 540, x: 455 }),
    T('and that idea\neventually became *getstenix.*', { size: 52, y: 720, x: 445 }),
    S('adaptive-system', { size: 56, x: 540, y: 1070 })
  ]};
  const s4 = { ...newSlide('bone'), layers: [
    ...brand('bone'),
    T('maybe the *best* program\nisn\'t the one that\nworks for *everyone.*', { size: 56, y: 330, x: 420, color: '#141414' }),
    T('maybe it\'s the one that\nworks for *you.*', { size: 56, y: 585, x: 410, color: '#141414' }),
    S('doodle-squiggle', { x: 330, y: 672, size: 18 }),
    S('program-fan', { size: 60, x: 540, y: 1030 })
  ]};
  const s5 = { ...newSlide('bone'), layers: [
    ...brand('bone'),
    T("today's workout:", { size: 88, y: 250, x: 450, color: '#141414' }),
    T('AMRAP', { size: 66, y: 375, x: 205, color: RED }),
    S('doodle-underline', { x: 205, y: 425, size: 22 }),
    T('as many rounds as possible', { font: 'Caveat', size: 46, y: 372, x: 620, rot: -5, color: RED, bold: false }),
    T("start a *15 minute* timer.\ncomplete the exercises in order.\nkeep going until the timer runs out.\ndon't sacrifice *form* to move faster.", { size: 40, bold: false, y: 590, x: 425, color: '#141414' }),
    S('timer-watch', { size: 24, x: 855, y: 1150 })
  ]};
  return { slides: [s1, s2, s3, s4, s5], current: 0 };
}

function makeTutorial() {
  const b = tone => brandLayers(tone);
  const s1 = { ...newSlide('black'), layers: [
    ...b('black'),
    S('muscleup', { x: 540, y: 480, size: 40, color: '#ffffff' }),
    T('your first *muscle-up*\nin 6 weeks', { size: 84, y: 800, x: 495 }),
    S('doodle-underline', { x: 420, y: 905, size: 30 })
  ]};
  const s2 = { ...newSlide('bone'), layers: [
    ...b('bone'),
    T('in 6 weeks you pull yourself\n*over the bar* in one clean rep.', { y: 300, x: 505, color: '#141414' }),
    PH('bar-support-2.jpg', { y: 920, widthPct: 48 })
  ]};
  const step = (tone, num, title, body, schem) => ({ ...newSlide(tone), layers: [
    ...b(tone),
    T('*' + num + '*', { size: 120, y: 330, x: 155 }),
    T(title, { size: 64, y: 470, x: 80 + title.length * 16, color: tone === 'bone' ? '#141414' : '#ffffff' }),
    T(body, { size: 40, bold: false, y: 620, x: 470, color: tone === 'bone' ? '#141414' : '#ffffff' }),
    S(schem, { x: 540, y: 1000, size: 40 })
  ]});
  const s3 = step('bone', '01', 'hang every day', 'hang for *30 seconds* a day so your\ngrip never quits before your back.', 'hang');
  const s4 = step('concrete', '02', 'pull to your chest', 'row the bar to your *chest*, not your chin.\nthe muscle-up starts high.', 'pullup');
  const s5 = step('bone', '03', 'own the dip', 'finish every rep with *3 slow dips*\nover the bar.', 'dips');
  const s6 = { ...newSlide('black'), layers: [
    ...b('black'),
    T('want the full\n*6-week plan?*', { size: 84, y: 560, x: 400 }),
    T('comment *BAR*', { size: 64, y: 780, x: 330 }),
    S('doodle-arrow', { x: 760, y: 780, size: 13 })
  ]};
  return { slides: [s1, s2, s3, s4, s5, s6], current: 0 };
}

function makeWod() {
  const b = tone => brandLayers(tone);
  const s1 = { ...newSlide('bone'), layers: [
    ...b('bone'),
    T("today's workout:", { size: 88, y: 240, x: 450, color: '#141414' }),
    T('AMRAP *15*', { size: 66, y: 360, x: 275, color: '#141414' }),
    T('as many rounds as possible', { font: 'Caveat', size: 46, y: 358, x: 700, rot: -5, color: RED, bold: false }),
    T('*6*  muscle-ups\n*9*  straight-bar dips\n*20*  push-ups', { size: 64, y: 640, x: 420, color: '#141414' }),
    T("rest only when the form breaks.\ndon't chase the clock.", { size: 38, bold: false, y: 880, x: 380, color: '#141414' }),
    S('timer-watch', { size: 24, x: 855, y: 1140 })
  ]};
  const s2 = { ...newSlide('black'), layers: [
    ...b('black'),
    PH('human-flag.jpg', { y: 560, widthPct: 80 }),
    T('save this for your\n*next session.*', { size: 76, y: 1000, x: 400 }),
    T('and send it to a training partner.', { size: 38, bold: false, y: 1140, x: 350, color: '#9a9894' }),
    S('doodle-arrow', { x: 880, y: 1080, size: 13 })
  ]};
  return { slides: [s1, s2], current: 0 };
}

function makeMyth() {
  const b = tone => brandLayers(tone);
  const s1 = { ...newSlide('concrete'), layers: [
    ...b('concrete'),
    T('we often hear people say:', { size: 48, y: 300, x: 375 }),
    S('quote-bubble', { size: 62, x: 540, y: 560 }),
    T('"i don\'t have time\nto train."', { size: 56, y: 540, x: 540, color: '#141414', align: 'center' }),
    T("and honestly,\nthey're not *wrong...*", { size: 48, y: 850, x: 330 })
  ]};
  const s2 = { ...newSlide('bone'), layers: [
    ...b('bone'),
    T('*15 minutes* a day beats\n2 hours once a week.', { size: 64, y: 340, x: 480, color: '#141414' }),
    S('calendar-streak', { x: 400, y: 560, size: 40 }),
    S('progress-up', { x: 810, y: 545, size: 20 }),
    PH('plank-outdoor.jpg', { y: 900, widthPct: 74 }),
    T('start with today. *link in bio.*', { size: 46, y: 1180, x: 385, color: '#141414' })
  ]};
  return { slides: [s1, s2], current: 0 };
}

const TEMPLATES = {
  getstenix: { label: 'GETSTENIX story (5 slides)', make: makeTemplate },
  tutorial: { label: 'Tutorial: first muscle-up (6 slides)', make: makeTutorial },
  wod: { label: 'Workout of the day (2 slides)', make: makeWod },
  myth: { label: 'Myth vs truth (2 slides)', make: makeMyth },
};

let project = load() || makeTemplate();
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
  const order = ['calisthenics', 'training', 'doodle', 'explainer'];
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
  if (l.type === 'image') {
    const w = (l.widthPct / 100) * CANVAS_W;
    return { w, h: w * (l.natH / l.natW) };
  }
  return null; // text auto-sizes
}
/* Inline accent markup: words wrapped in *asterisks* render in the layer's accent color. */
function textHTML(l) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc(l.text || ' ').split('*')
    .map((seg, i) => i % 2 ? `<span style="color:${l.accent || RED}">${seg}</span>` : seg)
    .join('');
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
  } else if (l.type === 'image') {
    const b = layerBox(l);
    n.style.width = b.w + 'px'; n.style.height = b.h + 'px';
    n.style.opacity = l.opacity ?? 1;
    const img = document.createElement('img');
    img.src = l.src; img.draggable = false;
    img.style.cssText = `display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;${l.duotone ? 'filter:grayscale(1) contrast(1.05);' : ''}`;
    n.appendChild(img);
    if (l.duotone) {
      const tint = document.createElement('div');
      tint.style.cssText = `position:absolute;inset:0;background:${RED};mix-blend-mode:multiply;opacity:.32;pointer-events:none;`;
      n.appendChild(tint);
    }
  } else {
    n.style.color = l.color;
    n.style.fontFamily = `'${l.font}',sans-serif`;
    n.style.fontSize = l.size + 'px';
    n.style.fontWeight = l.bold ? '700' : '400';
    n.style.fontStyle = l.italic ? 'italic' : 'normal';
    n.style.textDecoration = l.underline ? 'underline' : 'none';
    n.style.textAlign = l.align;
    n.innerHTML = textHTML(l);
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
    const label = l.type === 'text' ? ('“' + (l.text || '').replace(/\*/g, '').slice(0, 18) + '”')
      : l.type === 'image' ? 'Image' : window.SCHEMATICS[l.name].label;
    const glyph = l.type === 'text' ? '🅣' : l.type === 'image' ? '🖼' : '◈';
    li.innerHTML = `<span class="name">${glyph} ${label}</span>
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
  $('#schemProps').classList.toggle('hidden', l.type === 'image'); // accent applies to schematics AND text
  $('#imgProps').classList.toggle('hidden', l.type !== 'image');
  $('#colorRow').classList.toggle('hidden', l.type === 'image');
  $('#pX').value = l.x; $('#pXv').textContent = Math.round(l.x);
  $('#pY').value = l.y; $('#pYv').textContent = Math.round(l.y);
  $('#pScale').value = l.scale; $('#pScaleV').textContent = l.scale.toFixed(2);
  $('#pRot').value = l.rot; $('#pRotV').textContent = l.rot + '°';
  $('#pColor').value = toHex(l.color);
  if (l.type !== 'image') $('#pAccent').value = toHex(l.accent || RED);
  if (l.type === 'image') {
    $('#pOpacity').value = l.opacity ?? 1;
    $('#pOpacityV').textContent = Math.round((l.opacity ?? 1) * 100) + '%';
    $('#pImgDuotone').checked = !!l.duotone;
  }
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
    id: uid(), type: 'text', text: 'your text with a\n*red keyword*', font: 'Poppins',
    size: 72, bold: true, italic: false, underline: false, align: 'center',
    x: CANVAS_W / 2, y: 360, scale: 1, rot: 0, color: inkFor(tone), accent: RED
  });
  selId = slide().layers.at(-1).id; showTab('props'); render();
}
function addImage(src, natW, natH) {
  slide().layers.push({
    id: uid(), type: 'image', src, natW, natH, widthPct: 50,
    x: CANVAS_W / 2, y: CANVAS_H / 2, scale: 1, rot: 0,
    opacity: 1, duotone: false, color: '#000000'
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
  const mobile = window.matchMedia('(max-width:820px)').matches;
  const availW = area.clientWidth - 32;
  // On phones the page scrolls; size the canvas to ~55% of the viewport height so
  // the panel below stays reachable.
  const availH = mobile ? window.innerHeight * 0.55
                        : area.clientHeight - $('#filmstrip').offsetHeight - 40;
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
$('#addImageBtn').onclick = () => $('#fgImageInput').click();
$('#fgImageInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const probe = new Image();
    probe.onload = () => addImage(r.result, probe.naturalWidth, probe.naturalHeight);
    probe.src = r.result;
  };
  r.readAsDataURL(f);
  e.target.value = '';
};
(function fillTemplates() {
  const sel = $('#templateSelect');
  for (const [key, t] of Object.entries(TEMPLATES)) {
    const o = document.createElement('option');
    o.value = key; o.textContent = t.label; sel.appendChild(o);
  }
})();
$('#loadExample').onclick = () => {
  const t = TEMPLATES[$('#templateSelect').value];
  if (!t) return;
  if (!confirm(`Replace the current project with "${t.label}"?`)) return;
  project = t.make(); selId = null; render(); toast(t.label + ' loaded');
};
(function fillPhotos() {
  const sel = $('#photoSelect');
  for (const p of (window.STOCK_PHOTOS || [])) {
    const o = document.createElement('option');
    o.value = p.file; o.textContent = p.label; sel.appendChild(o);
  }
})();
$('#addPhoto').onclick = () => {
  const file = $('#photoSelect').value; if (!file) return;
  slide().layers.push(PH(file, { x: CANVAS_W / 2, y: CANVAS_H / 2, duotone: false }));
  selId = slide().layers.at(-1).id; showTab('props'); render();
};
$('#pOpacity').oninput = e => { selected().opacity = +e.target.value; $('#pOpacityV').textContent = Math.round(e.target.value * 100) + '%'; renderStage(); save(); };
$('#pImgDuotone').onchange = e => { selected().duotone = e.target.checked; renderStage(); save(); };

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
  // pre-rasterize schematics and image layers
  const imgs = {};
  await Promise.all(s.layers.map(async l => {
    if (l.type === 'schematic') {
      const svg = schematicSVG(l.name, l.color, l.accent);
      imgs[l.id] = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    } else if (l.type === 'image') {
      let img = await loadImg(l.src);
      if (l.duotone) img = duotoneImage(img);
      imgs[l.id] = img;
    }
  }));
  for (const l of s.layers) {
    ctx.save();
    ctx.translate(l.x, l.y); ctx.rotate(l.rot * Math.PI / 180); ctx.scale(l.scale, l.scale);
    if (l.type === 'schematic') {
      const meta = window.SCHEMATICS[l.name];
      const w = (l.size / 100) * CANVAS_W, h = w * (meta.h / meta.w);
      ctx.drawImage(imgs[l.id], -w / 2, -h / 2, w, h);
    } else if (l.type === 'image') {
      const b = layerBox(l);
      ctx.globalAlpha = l.opacity ?? 1;
      ctx.drawImage(imgs[l.id], -b.w / 2, -b.h / 2, b.w, b.h);
      ctx.globalAlpha = 1;
    } else {
      drawText(ctx, l);
    }
    ctx.restore();
  }
  return cv;
}
function duotone(ctx) { duotoneCtx(ctx, CANVAS_W, CANVAS_H); }
function duotoneCtx(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    const lum = a[i] * .299 + a[i + 1] * .587 + a[i + 2] * .114;
    a[i] = lum * .7 + 225 * .3; a[i + 1] = lum * .7; a[i + 2] = lum * .7 + 6 * .3;
  }
  ctx.putImageData(d, 0, 0);
}
function duotoneImage(img) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  duotoneCtx(x, c.width, c.height);
  return c;
}
/* Text draws per segment so *accent markup* exports exactly like the preview. */
function parseSegs(line, base, accent) {
  return line.split('*').map((t, i) => ({ t, c: i % 2 ? accent : base })).filter(s => s.t.length);
}
function drawText(ctx, l) {
  ctx.font = `${l.italic ? 'italic ' : ''}${l.bold ? '700' : '400'} ${l.size}px '${l.font}'`;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const accent = l.accent || RED;
  const lineH = l.size * 1.15;
  const segLines = (l.text || '').split('\n').map(t => parseSegs(t, l.color, accent));
  const widths = segLines.map(segs => segs.reduce((w, s) => w + ctx.measureText(s.t).width, 0));
  const maxW = Math.max(...widths, 1);
  const startY = -(segLines.length * lineH) / 2 + lineH / 2;
  segLines.forEach((segs, i) => {
    const y = startY + i * lineH, lw = widths[i];
    let x = l.align === 'left' ? -maxW / 2 : l.align === 'right' ? maxW / 2 - lw : -lw / 2;
    for (const s of segs) {
      const w = ctx.measureText(s.t).width;
      ctx.fillStyle = s.c;
      ctx.fillText(s.t, x, y);
      if (l.underline) {
        ctx.save(); ctx.strokeStyle = s.c; ctx.lineWidth = Math.max(2, l.size * .06);
        ctx.beginPath(); ctx.moveTo(x, y + l.size * .42); ctx.lineTo(x + w, y + l.size * .42); ctx.stroke(); ctx.restore();
      }
      x += w;
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

/* Deep link: #slide=N jumps to a slide; adding &export shows that slide's true
   export render full-page (also used for automated QA). */
(async function init() {
  const tm = location.hash.match(/template=([a-z]+)/);
  if (tm && TEMPLATES[tm[1]]) project = TEMPLATES[tm[1]].make();
  const m = location.hash.match(/slide=(\d+)/);
  if (m) project.current = Math.min(project.slides.length - 1, Math.max(0, +m[1] - 1));
  render();
  if (/export/.test(location.hash)) {
    await ensureFonts();
    const cv = await slideToCanvas(slide());
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:auto;z-index:999;background:#222';
    document.body.appendChild(cv);
  }
})();
