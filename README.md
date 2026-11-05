# Benedictus Ziraluo portfolio

Static HTML/CSS/JavaScript portfolio. No framework, package installation or build is needed to view it. Runtime images, icons and fonts are local.

## Run locally

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/. Use Ctrl+F5 after an update.

## Edit

- `index.html`: main content and navigation.
- `styles.css`, `work.css`, `theme.css`: layout, interactions and light/dark tokens.
- `script.js`, `projects.js`, `theme.js`: navigation/folders, image viewer, theme preference.
- `assets/`: active media plus required licenses and provenance. The Phare gameplay PNG is the owner's unchanged supplied image.
- The navbar and footer download `assets/Benedictus-Ziraluo-CV.pdf` directly.

## Deploy

`.github/workflows/pages.yml` publishes the static pages and assets to GitHub Pages. No build is required.

Live site: https://benedictzir.github.io/. After pushing updates to `master`, run **Publish portfolio to GitHub Pages** from Actions. Pages uses **Settings > Pages > Source: GitHub Actions**.

The contact form opens a `mailto:` draft in the visitor's email app; it has no email backend. TemuCoach/JSON/Bolapedia/Football News link to source rather than unavailable old deployments. Hidden Panda and Nyaris Menang have no secret/demo links.

Asset licenses and source credits are retained alongside their assets and in `credits.html`. Local development configuration is excluded by `.gitignore`.

Cloudflare Web Analytics is configured for `benedictzir.github.io`. Its beacon is loaded only on that hostname; local previews do not send analytics. View visits and page views in the Cloudflare account under Observability > Analytics > Web analytics.
