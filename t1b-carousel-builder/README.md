# T1 Carousel Builder

A single-page web app for building TripleOneBars "paper & doodle" Instagram
carousels (1080×1350). Installable as a home-screen web app on iPhone/iPad and
Android. No build step, no server, no dependencies — pure HTML/CSS/JS.

## Features

- **Image backgrounds** — import a photo per slide; optional **duotone** (B&W + red)
  and dim controls to keep text legible.
- **Stock photos** — 24 bundled athlete photos (pull-ups, muscle-ups, dips, handstands,
  human flag, rings, planks, push-ups, squats…) from Pexels (free license, no
  attribution required), added as foreground layers from a dropdown.
- **Schematics** — 37 line-art scenes (calisthenics: pull-up, dip, push-up, plank,
  squat, muscle-up, hang, rings, handstand, front/back lever, planche, human flag,
  L-sit, pistol squat, toes-to-bar; training: timer, stopwatch, adaptive arrows,
  progress charts, phone app, dumbbell, streak, heart-rate; doodles: underline,
  circle, arrow, squiggle; explainers: two-athletes, adaptive-system, program-fan,
  program-doc, quote bubble) added from a dropdown.
- **Templates** — 4 starter carousels loadable from a dropdown: GETSTENIX story,
  Tutorial (first muscle-up), Workout of the day, Myth vs truth.
- **Edit any layer** — X, Y, scale, rotation, color (schematics also have an accent
  color). Drag on the canvas or use the sliders.
- **Multiple layers** — stack as many schematics and text layers as you want; reorder,
  duplicate, bring-to-front, delete.
- **Text** — same X/Y/scale/rotation/color controls plus font, **bold / italic /
  underline**, and left/center/right alignment.
- **Multi-slide carousels** — add / duplicate / delete slides; filmstrip preview.
- **Export** — one PNG per slide or all slides at once, exactly 1080×1350, rendered
  WYSIWYG from the same model as the on-screen canvas.
- **Offline + installable** — service worker caches the app shell; works with no
  network after first load. Your work autosaves to the browser.

## Run locally

Any static server works, e.g.:

```
python -m http.server 8080
# open http://localhost:8080/
```

## Deploy to GitHub Pages (repo: T1bars)

The app uses only relative paths, so it works from a project page
(`https://<user>.github.io/T1bars/`).

1. Copy the contents of this `webapp/` folder into the **root** of the
   `7pka111223-jpg/T1bars` repository (so `index.html` is at the repo root).
2. Commit and push to the default branch:
   ```
   git add .
   git commit -m "T1 Carousel Builder web app"
   git push
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, pick your default branch and **/ (root)**, save.
4. Wait ~1 minute, then open `https://7pka111223-jpg.github.io/T1bars/`.

## Install on iPhone

1. Open the Pages URL above in **Safari** (must be Safari for install on iOS).
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. Launch it from the home screen — it opens full-screen like a native app and
   works offline.

(On Android/desktop Chrome, an **Install app** button appears in the top bar.)

## Regenerating the schematics

The schematic catalog (`schematics.js`) is generated from the skill's Python
library so the app and the `carousel-copy` skill draw identical art:

```
python ../.claude/skills/carousel-copy/scripts/build_webapp_assets.py --out schematics.js
```

Add or edit scenes in `scripts/schematics.py`, rerun the command, and the new
schematics appear in the dropdown.

## Files

| File | Purpose |
|------|---------|
| `index.html` | markup / UI |
| `styles.css` | styles (design-system flavored) |
| `app.js` | editor: model, DOM preview, drag, PNG export, PWA |
| `schematics.js` | generated schematic catalog (24 scenes) |
| `sw.js` | service worker (offline shell + font cache) |
| `manifest.webmanifest` | PWA manifest |
| `icons/` | app icons (192/512/maskable/apple-touch) |
