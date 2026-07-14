# Triple One Bars — Overlay Tools

Offline, client-side Instagram overlay generators for the TripleOneBars gym.
Deployed to GitHub Pages: https://7pka111223-jpg.github.io/T1bars/

## Layout
- `index.html` — landing page linking to the tools
- `t1b-hud-pwa/` — installable Workout HUD PWA (`index.html` + `sw.js`)
- `t1b-athlete-pwa/` — installable Athlete Studio PWA (`index.html` + `sw.js`)
- `t1b-hud-overlay-generator.html`, `t1b-athlete-overlay-studio.html` — the same
  apps as single self-contained HTML files
- `t1b-carousel-pwa/`, `t1b-carousel-builder/`, `t1b-carousel-editor.html` — carousel tools
- `.github/workflows/deploy.yml` — GitHub Pages deploy on push to `main`

## Rules
- Everything is client-side and must work fully offline after first load:
  fonts, icons, and libraries are embedded — no CDN or network requests.
- Each PWA variant and its single-file twin implement the same app; when
  changing one, apply the same change to the other.
- When changing a PWA's cached assets, bump the service-worker cache version in
  its `sw.js`, or iPhones keep serving the old version.
- Test target is mobile Safari (tools are installed via Add to Home Screen);
  keep touch targets and safe-area insets working.
- Pushing to `main` deploys the live site — verify pages open locally first.
