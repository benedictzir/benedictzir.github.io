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
- `script.js`, `projects.js`, `theme.js`: navigation/folders, image and resume dialogs, theme preference.
- `assets/`: active media plus required licenses and provenance. The Phare gameplay PNG is the owner's unchanged supplied image.
- `resume.html`: the resume shown in the website's preview dialog. Both PDF downloads are in `assets/`.

## Deploy

`.github/workflows/pages.yml` publishes the static pages and assets to GitHub Pages. No build is required.

After choosing a repository, enable Settings > Pages > Source: GitHub Actions, then run **Publish portfolio to GitHub Pages** from Actions. Nothing has been deployed yet. A `benedictzir.github.io` repository would use the account-level Pages URL; other repository names use a project subpath. Current relative links support either form.

The contact form opens a `mailto:` draft in the visitor's email app; it has no email backend. TemuCoach/JSON/Bolapedia/Football News link to source rather than unavailable old deployments. Hidden Panda and Nyaris Menang have no secret/demo links.

Asset licenses and source credits are retained alongside their assets and in `credits.html`. Local development configuration is excluded by `.gitignore`.
