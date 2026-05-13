# Shipping with Purpose (SRT-SWP)

Professional static-site structure with an Express server and page-specific CSS entrypoints.

## Project Structure

```text
srt-swp/
├─ index.html
├─ public/
│  ├─ services.html
│  ├─ mailboxes.html
│  ├─ print.html
│  ├─ assets/
│  │  ├─ fonts/
│  │  ├─ icons/
│  │  └─ images/
│  ├─ css/
│  │  ├─ main-home.css
│  │  ├─ main-services.css
│  │  ├─ main-mailboxes.css
│  │  ├─ main-print.css
│  │  └─ blocks/
│  └─ js/
│     ├─ app.js
│     └─ modules/
├─ server/
│  └─ index.js
├─ package.json
└─ README.md
```

## CSS Loading Strategy

Each HTML page loads only its own main CSS file:

- / (root index.html) -> public/css/main-home.css
- public/services.html -> css/main-services.css
- public/mailboxes.html -> css/main-mailboxes.css
- public/print.html -> css/main-print.css

Each page entry imports only the required block styles from css/blocks.

## Conventions

- Single web root: all client-facing files live under public.
- Relative links inside public pages use same-root paths (for example: index.html, services.html, css/..., js/...).
- BEM naming is used for class architecture in block CSS.

## Architecture Notes

Shared block CSS (imported across multiple pages):

- blocks/base.css
- blocks/nav.css
- blocks/info-bar.css
- blocks/footer.css
- blocks/forms.css
- blocks/page-hero.css

Homepage-focused blocks (main-home.css):

- blocks/hero.css
- blocks/services-preview.css
- blocks/mailbox-cta.css
- blocks/print-portal.css
- blocks/dropoff-grid.css
- blocks/testimonials.css
- blocks/pricing-modal.css
- blocks/pricing-table.css
- blocks/reservation-modal.css

Mailbox-focused blocks (main-mailboxes.css):

- blocks/mailbox-hero.css
- blocks/mailbox-features.css
- blocks/quote.css
- blocks/reservation-modal.css

Services-focused blocks (main-services.css):

- blocks/service.css

Maintenance rule:

- If a block is used by only one page, import it only in that page entry file.
- If a block becomes shared by 2+ pages, move its import to each consuming page entry (do not reintroduce a global main.css).

## Run

```bash
npm install
npm start
```

Then open http://localhost:3000.
