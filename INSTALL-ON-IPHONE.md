# Putting the T1B overlay apps on your iPhone Home Screen

**Why the local file didn't work:** iOS only lets you "Add to Home Screen" a page
that's open in **Safari from a web address** (`https://…`). An `.html` opened from
the Files app loads as a local `file://` page, and iOS won't install that as an app.

So the app has to live at a web URL. These PWA folders do that and still run
**fully offline after the first load** (a service worker caches everything on the
phone, so there's no internet needed after install).

## The two apps (each is a self-contained folder)

- `t1b-hud-pwa/`     — the workout HUD overlay generator
- `t1b-athlete-pwa/` — athlete spotlight / leaderboard / CTA / PR-alert studio

Each folder holds `index.html` + `sw.js`. Host the **folder** (both files together).

---

## Easiest: Netlify Drop (no account, ~1 minute)

1. On a computer, go to **https://app.netlify.com/drop**
2. Drag the **`t1b-hud-pwa` folder** (the folder itself, not just the file) onto the page.
3. Netlify gives you a URL like `https://random-name.netlify.app`.
4. On your iPhone, open that URL in **Safari**.
5. Tap the **Share** button → **Add to Home Screen** → **Add**.
6. Launch it from the icon. After this first load it works with no internet.
7. Repeat with the `t1b-athlete-pwa` folder for the second app.

To save an overlay: tap **SAVE / SHARE PNG** → **Save Image** (goes to Photos).

---

## Permanent & free: GitHub Pages

1. Create a GitHub repo (e.g. `t1b-overlays`) and upload both folders.
2. Repo **Settings → Pages** → Source: `main` branch, root → **Save**.
3. Your apps will be at:
   - `https://<you>.github.io/t1b-overlays/t1b-hud-pwa/`
   - `https://<you>.github.io/t1b-overlays/t1b-athlete-pwa/`
4. Open each in Safari → **Share → Add to Home Screen**.

---

## No hosting? Use it without an icon

You don't have to install anything. Open either single file
(`t1b-hud-overlay-generator.html` or `t1b-athlete-overlay-studio.html`) directly
from the **Files app / Safari** — it works offline and saves PNGs via the share
sheet. You just won't get a Home Screen app icon. Add a Safari **bookmark** for
quick access.

---

## Notes

- Needs internet **once** (the install load). After that, offline forever.
- To push an update later: re-host the folder and bump the version string near the
  top of `sw.js` (e.g. `t1b-hud-v1` → `t1b-hud-v2`) so phones fetch the new version.
- The original single-file versions still exist and are unchanged — use whichever
  fits: single file for quick offline use, PWA folder for the Home Screen icon.
