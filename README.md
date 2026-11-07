# Qisong Zhang · 张启淞 — Academic Homepage

Bilingual (English / 中文) academic homepage for **Qisong Zhang (张启淞)**, CV/AIGC researcher at BUPT & China Telecom TeleAI.

- Live: <https://proseseren.github.io>
- Built with [WowPage](https://github.com/WD7ang/WowPage), a Jekyll template adapted from [Academic Pages](https://academicpages.github.io/) (origin: [selen-suyue.github.io](https://selen-suyue.github.io/))
- License: MIT (see [LICENSE](LICENSE))

## Sections

Personal information · Education · Internship · Projects · Publications · News

Education and internship details appear before three project cards and four research entries. DataEvolver and DataRSI share one project and one research entry; the Workbench belongs to the DataEvolver project. Publications include an interactive split-screen showcase and complete article cards. Without JavaScript, every article remains readable. Printing includes every article, including filtered cards.

## Preview

```sh
python3 scripts/preview.py
```

Open `preview.html` directly, or serve the repository with `python3 -m http.server 8000` and visit <http://localhost:8000/preview.html>.

The preview is generated from `_pages/about.md`, `_layouts/academic-home.html`, and the shared preference script. Edit those sources and regenerate it. The generator checks local links, assets, and duplicate IDs; it does not replace a Jekyll build.

## Bilingual support

The site ships with a custom EN/中文 language toggle:

- `assets/js/lang-switch.js` — language manager (localStorage persistence, browser-language default, `data-i18n-en`/`data-i18n-zh` attribute swap)
- Paired `.lang-en` / `.lang-zh` blocks in `_pages/about.md` for rich content
- Pre-paint preferences in `_includes/head/academic-preferences.html`

Light and dark appearance follow the system until the visitor chooses an appearance. Language and appearance choices use the existing localStorage keys.

## Local preview (Docker, no local Ruby required)

```powershell
docker run --rm -p 4000:4000 -v "$($PWD.Path):/srv/jekyll" jekyll/jekyll:pages jekyll serve --force_polling
```

Then open <http://localhost:4000/>.

Build-only check:

```powershell
docker run --rm -v "$($PWD.Path):/srv/jekyll" jekyll/jekyll:pages jekyll build
```

If you have Ruby installed locally, `bundle exec jekyll serve` works as well.

## Content files

| What | Where |
| --- | --- |
| Homepage content (both languages) | `_pages/about.md` |
| Identity, author profile, social links | `_config.yml` |
| Navigation menu | `_data/navigation.yml` |
| Homepage styling | `assets/css/home.css` |
| Homepage document layout | `_layouts/academic-home.html` |
| Showcase, filters, motion, and appearance | `assets/js/academic-ui.js` |
| Language toggle logic | `assets/js/lang-switch.js` |
| Standalone preview generator | `scripts/preview.py` |
| Images / logos / PDFs / CV | `images/`, `files/` |

## Deployment

GitHub Pages builds the `main` branch automatically (Jekyll + `github-pages` gem). No CI workflow required.

The homepage adds no runtime dependencies. It restores the original [Astryx](https://github.com/meta/astryx) Stone/Obsidian palette, floating navigation, [Canvas UI](https://github.com/DavidHDev/canvas-ui) shader background, and [UIverse Galaxy](https://github.com/uiverse-io/galaxy) card treatments. Typewriter, spring, stagger, skeleton, and marquee effects use the existing native JavaScript and CSS. Reduced-motion preferences are respected. Existing generated illustrations and paper assets are reused; generated illustrations retain their provenance captions.
