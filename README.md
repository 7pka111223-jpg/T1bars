# Triple One Bars — Overlay Tools

Offline, browser-based Instagram overlay generators for the TripleOneBars gym.

**Live site:** https://7pka111223-jpg.github.io/T1bars/

- **Workout HUD** — https://7pka111223-jpg.github.io/T1bars/t1b-hud-pwa/
- **Athlete Studio** — https://7pka111223-jpg.github.io/T1bars/t1b-athlete-pwa/

## Add to iPhone Home Screen
Open a tool in **Safari** → **Share** → **Add to Home Screen**. After the first
load it works fully offline (a service worker caches the app on the phone).
Tap **Save / Share PNG** to save an overlay straight to Photos.

## What's here
- `index.html` — landing page linking to both tools
- `t1b-hud-pwa/` — installable Workout HUD app (`index.html` + `sw.js`)
- `t1b-athlete-pwa/` — installable Athlete Studio app (`index.html` + `sw.js`)
- `t1b-hud-overlay-generator.html`, `t1b-athlete-overlay-studio.html` — the same
  apps as single self-contained files (no install / no hosting needed)
- `INSTALL-ON-IPHONE.md` — detailed install notes

Everything runs client-side; fonts and the app icon are embedded, so no network
is needed after the app loads.
