# Shipping with Purpose (SRT-SWP)

Professional static-site structure with an Express server and page-specific CSS entrypoints.

## Project Structure

```text
srt-swp/
├─ public/
│  ├─ index.html
│  ├─ services.html
│  ├─ mailboxes.html
│  ├─ contact.html
│  ├─ assets/
│  │  ├─ fonts/
│  │  ├─ icons/
│  │  └─ images/
│  ├─ css/
│  │  ├─ main-home.css
│  │  ├─ main-services.css
│  │  ├─ main-mailboxes.css
│  │  ├─ main-contact.css
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

- index.html -> css/main-home.css
- services.html -> css/main-services.css
- mailboxes.html -> css/main-mailboxes.css
- contact.html -> css/main-contact.css

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

Contact-focused blocks (main-contact.css):

- blocks/about-owner.css
- blocks/contact.css
- blocks/forms.css

Maintenance rule:

- If a block is used by only one page, import it only in that page entry file.
- If a block becomes shared by 2+ pages, move its import to each consuming page entry (do not reintroduce a global main.css).

## Run

```bash
npm install
npm start
```

Then open http://localhost:3000.
