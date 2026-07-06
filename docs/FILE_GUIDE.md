# SRT-SWP File Guide

This document explains the purpose and structure of every file in the Shipping with Purpose website project.

---

## 🎯 Project Overview

**Shipping with Purpose (SRT-SWP)** is a local shipping center marketing and lead-capture site with three runtime components:

1. **Static Frontend** (`public/`) - HTML/CSS/JS marketing site
2. **Node.js Backend** (`server/`) - Optional local API for form submissions
3. **Cloudflare Worker** (`worker-print/`) - Fallback API with global deployment

The frontend attempts API calls in order: `/api` → `localhost:3000/api` → Cloudflare Worker. This ensures the site works even if one backend target is down.

---

## 📁 Directory Structure

### Root-Level Files

| File | Purpose |
|------|---------|
| `package.json` | Root npm config. Scripts: `build:css` (bundles CSS), `dev:live` (dev server on :5500), `preview` (build+serve). Dependencies: dotenv, live-server (dev only). |
| `package-lock.json` | Locked dependency versions. Commit this file. |
| `.env.example` | Template for environment variables. Copy to `.env` and fill in values. Used by server backend for Resend API keys and Yelp script credentials. |
| `.env` | **DO NOT COMMIT** - local environment variables. Required for server routes and yelp scripts. |
| `CNAME` | DNS CNAME record: `shippingwithpurpose.com`. Netlify/Vercel reads this for domain config. |
| `.prettierrc` | Code formatting config (120 char line width, 2-space tabs, trailing commas). |
| `.editorconfig` | Editor config (indent size, charset, line endings). |
| `README.md` | Project overview and legal notice. Start here for new maintainers. |

---

### 📄 Public HTML Pages

All pages use a component system via `data-include` attributes in components.js. Pages load header/footer partials automatically.

| File | Purpose | Key Sections |
|------|---------|--------------|
| `public/index.html` | **Homepage**. Hero section, services preview, testimonials, mailbox overview. Primary lead-capture page. Schema.org JSON-LD for SEO. | Hero, Features, Testimonials, CTA |
| `public/mailboxes.html` | **Mailbox Rentals Page**. Real street address mailboxes with pricing calculator. Fetches data from `mailbox-content.json`. Interactive quote builder with add-ons. | Hero, Pricing Tiers, Quote Builder, Reserve Form |
| `public/services.html` | **Services Page**. Shows all service offerings: shipping, printing, notary, etc. Card-based layout with icons. | Hero, Service Cards, Comparison |
| `public/print.html` | **Print Portal**. Form for uploading print jobs. Allows file uploads, color/BW selection, copy count. Submits to `/api/print-request`. | Upload Form, File List, Options, Submit |
| `public/404/index.html` | **404 Error Page**. Shown for invalid routes. Suggests returning to homepage. |  |
| `public/partials/header.html` | **Navigation Header**. Sticky header with logo, nav links, hamburger menu for mobile. Included via `data-include` on all pages. Active link highlighting via components.js. | Logo, Nav Links, Hamburger, CTA Button |
| `public/partials/footer.html` | **Footer**. Contact info, hours, social links, copyright. Included via `data-include`. | Contact, Hours, Social, Copyright |

---

### 🎨 CSS Architecture

**Build Process**: Source CSS in `src/css/` → `scripts/build-css.js` → bundled output in `public/css/`

**Never edit `*.bundle.css` files directly.** Always edit source files and run `npm run build:css`.

| File | Purpose |
|------|---------|
| `src/css/critical.css` | Core tokens and resets. Contains CSS custom properties (--navy, --kraft, --space-*, --fs-*). Must be inlined in HTML head for optimal rendering. |
| `src/css/main-home.css` | Homepage-specific styles. Uses `@import url("blocks/*.css")` to load shared components. |
| `src/css/main-services.css` | Services page styles. |
| `src/css/main-mailboxes.css` | Mailbox page styles with quote builder styling. |
| `src/css/main-print.css` | Print portal page styles with file upload UI. |
| `src/css/blocks/base.css` | Design tokens (colors, spacing, typography) and global resets. Foundation for all components. |
| `src/css/blocks/nav.css` | Navigation/header styles. Mobile-first with hamburger toggle. BEM class naming. |
| `src/css/blocks/hero.css` | Hero section styles. Title, badge, CTA buttons. Fluid typography. |
| `src/css/blocks/page-hero.css` | Smaller hero for interior pages (mailboxes, services, print). |
| `src/css/blocks/forms.css` | Form inputs, buttons, labels, validation states. |
| `src/css/blocks/pricing.css` | Pricing tables and comparison cards. |
| `src/css/blocks/quote.css` | Quote builder component for mailbox customization. |
| `src/css/blocks/reservation.css` | Reservation modal/drawer styles. |
| `src/css/blocks/mailbox.css` | Individual mailbox card styling. |
| `src/css/blocks/mailbox-preview.css` | Mailbox preview carousel on homepage. |
| `src/css/blocks/service.css` | Individual service card styling. |
| `src/css/blocks/services-preview.css` | Services preview section on homepage. |
| `src/css/blocks/dropoff.css` | Drop-off instructions and details. |
| `src/css/blocks/perks.css` | Perks/features list styling. |
| `src/css/blocks/testimonials.css` | Customer review carousel styling. |
| `src/css/blocks/info-bar.css` | Promotional/info banner component. |
| `src/css/blocks/faq.css` | FAQ accordion styles. |
| `src/css/blocks/footer.css` | Footer section styles. |
| `src/css/blocks/print.css` | Print portal specific styles (file list, upload zone). |
| `public/css/*.bundle.css` | **GENERATED FILES** - Do not edit. Output from build-css.js script. |
| `public/css/vendor/swiper-bundle.min.css` | Third-party carousel library. Minified, do not edit. |

**CSS Design System**:
- **Colors**: `--navy` (primary), `--kraft` (accent), `--white`, `--charcoal` (text)
- **Spacing**: Multiples of 8px (`--space-4` through `--space-64`)
- **Typography**: `--fs-*` variables with fluid scaling for responsive design
- **Methodology**: BEM naming convention (e.g., `.nav__menu--open`, `.hero__title`)

---

### 📊 JavaScript Frontend

| File | Purpose | Key Functions |
|------|---------|--------|
| `public/js/app.js` | **Main application logic**. Minified. Contains: (1) API request handler with fallback chain, (2) Navigation init, (3) Intersection observer for fade-in animations, (4) Print form handler, (5) Mailbox quote builder, (6) Reservation drawer. | `apiRequest()`, `initNav()`, `fadeSection()`, `handlePrintForm()`, etc. |
| `public/js/components.js` | **Component loader system**. Fetches HTML partials via `data-include` attributes and injects them into page. Highlights active nav link based on current route. Called on page load and after component injection. | `includeComponents()`, `highlightActiveNavLink()` |
| `public/js/vendor/swiper-bundle.min.js` | **Third-party carousel library**. Used for testimonials and mailbox previews. Minified, do not edit. |  |

**Frontend Architecture**:
- Single-Page Application (SPA) behavior: routes handled client-side
- Form submissions use `apiRequest()` with fallback API chain
- Component system uses fetch to inject partials (header, footer)
- No framework dependencies (vanilla JS)

---

### 📋 JSON Data Files

| File | Purpose | Format |
|------|---------|--------|
| `public/data/mailbox-content.json` | **Mailbox pricing and details**. Defines box sizes, rental terms, pricing, add-ons. Used by mailbox.html page to render pricing tiers and quote builder. Structure: `{ hero, cta, quote: { labels, addon, sizes: [...], terms: [...] } }` | Nested object with pricing tiers and term options |
| `public/reviews.json` | **Customer testimonials**. Array of review objects from Google/Yelp. Used by testimonials carousel on homepage. Fields: author, source, rating, daysAgo, relativeTime, text. | Array of review objects |
| `public/site.webmanifest` | **PWA manifest**. Defines app name, icons, theme color. Allows site to be installable as app on mobile/desktop. |  |
| `public/sitemap.xml` | **SEO sitemap**. Lists all pages for search engines. Helps with crawling and indexing. |  |
| `public/_headers` | **Netlify/Vercel HTTP headers config**. Sets security headers, cache control, CSP, etc. |  |
| `public/_redirects` | **Netlify/Vercel redirect rules**. Configures URL rewrites and redirects. |  |

---

### 🔧 Build Scripts

| File | Purpose | Run Command |
|------|---------|------------|
| `scripts/build-css.js` | **CSS bundler**. Concatenates source CSS files from `src/css/main-*.css`, inlines their `@import url(blocks/*)` references, minifies output, and writes to `public/css/*.bundle.css`. Idempotent - safe to run multiple times. | `npm run build:css` |
| `scripts/find-yelp.js` | **Yelp review scraper (optional)**. Helper script to fetch reviews from Yelp API. Reads `YELP_API_KEY`, `YELP_SEARCH_TERM`, `YELP_SEARCH_LOCATION` from `.env`. Outputs JSON for reviews.json. | `node scripts/find-yelp.js` |
| `scripts/yelp-find-business.js` | **Yelp business lookup (optional)**. Helper script to find business ID by name. Requires `YELP_API_KEY` and `YELP_BUSINESS_ID` in `.env`. | `node scripts/yelp-find-business.js` |

---

### 🚀 Backend (Node.js)

Located in `server/` folder. Optional - site works without it if Cloudflare Worker is deployed.

| File | Purpose |
|------|---------|
| `server/package.json` | Backend dependencies: express, multer (file uploads), express-rate-limit, validator, resend (email), dotenv. |
| `server/package-lock.json` | Locked backend dependency versions. |
| `server/.env.example` | Template for backend env vars (Resend API key, email addresses, port). |
| `server/index.js` | **Express server setup**. Middleware: JSON/URL parsing (25MB upload limit), CORS, security headers (CSP, HSTS, etc.). Routes: `/api/print-request`, `/api/reservation-request`, `/api/health`. Static file serving from `../public/`. SPA fallback for client-side routing. Starts on `process.env.PORT || 3000`. |
| `server/routes/printRequest.js` | **Print API endpoint** (`POST /api/print-request`). Accepts form data with files. Validates name, copy count, MIME types. Rate-limited (30 requests/10min). Sends email via Resend with attachments. Returns JSON response. |
| `server/routes/reservationRequest.js` | **Reservation API endpoint** (`POST /api/reservation-request`). Accepts mailbox reservation form data. Validates inputs. Rate-limited. Sends confirmation email. Returns JSON response. |

**To Run Backend**:
1. `cd server`
2. `npm install` (if needed)
3. Copy `.env.example` to `.env` and fill in Resend API key + email addresses
4. `npm start` or `node index.js`
5. Server runs on `http://localhost:3000`

---

### ☁️ Cloudflare Worker

Located in `worker-print/` folder. Deployed globally for redundancy.

| File | Purpose |
|------|---------|
| `worker-print/index.js` | **Cloudflare Worker function**. Handles `/api/print-request` and `/api/reservation-request` endpoints. Accepts multipart form data with file uploads (25MB limit). Validates inputs. Sends emails via Resend API. Returns JSON. CORS headers for cross-origin requests. Deployed to `https://srt-swp.p-vedant7878.workers.dev/api`. |
| `worker-print/wrangler.toml` | **Worker configuration**. Project name, account ID, zone ID, environment secrets (Resend API key, email). |
| `worker-print/README.md` | Worker deployment and testing instructions. |

**Why Two Backends?**
- Node backend: Local development, full control
- Cloudflare Worker: Global deployment, auto-scaling, no server maintenance
- Frontend tries both: resilience if one is down

---

### 📋 Config & Meta Files

| File | Purpose |
|------|---------|
| `.vscode/settings.json` | VS Code editor settings for this workspace. Formatter, linting, file associations. |
| `.gitignore` | Git ignore rules. Excludes `node_modules/`, `.env`, build artifacts. |
| `.github/` | GitHub-specific files (workflows, issue templates, etc.). |

---

## 🚀 Quick Start for New Maintainers

1. **Understand Architecture**: Read `README.md` for high-level overview
2. **Install Dependencies**: `npm install` (frontend) and `cd server && npm install` (backend)
3. **Dev Setup**: `npm run preview` starts live-server on :5500
4. **Build CSS**: `npm run build:css` after editing CSS in `src/css/`
5. **Backend**: `cd server && npm start` to run local API on :3000
6. **Env Variables**: Copy `.env.example` to `.env` and fill in Resend API key
7. **Deploy**: Push to GitHub → Netlify auto-builds and deploys
8. **Worker Updates**: Deploy Cloudflare Worker via `worker-print/`

---

## 🔑 Key Concepts

### API Fallback Chain
Frontend tries these in order:
1. `/api/...` (same origin - works if backend on same host)
2. `http://localhost:3000/api/...` (local Node backend)
3. `https://srt-swp.p-vedant7878.workers.dev/api/...` (Cloudflare Worker)

### Component System
Pages use `data-include="/partials/header.html"` to load shared HTML. `components.js` fetches and injects them.

### Data-Driven Content
Mailbox page reads from `mailbox-content.json` - update pricing there, not in HTML.

### CSS Architecture
- Source files in `src/css/` (never deployed)
- Bundles in `public/css/` (generated, deployed)
- Always edit source and rebuild

### No Framework Bloat
- Vanilla JS (no React, Vue, etc.)
- Pure CSS (no Tailwind, Bootstrap)
- Lightweight: fast load time, high Lighthouse scores

---

## 🎨 Design System Reference

### Colors
```
--navy: #1a365d (primary brand)
--kraft: #b98e5a (accent)
--white: #ffffff
--charcoal: #2d3748 (text)
--body-text: #4a5568 (body copy)
```

### Spacing (8px scale)
```
--space-4: 4px
--space-8: 8px
--space-16: 16px
--space-24: 24px
--space-32: 32px
--space-48: 48px
```

### Typography
```
--fs-0: 1rem (body)
--fs-1: 1.25rem (lg)
--fs-3: 1.953rem (xl)
--fs-h1-fluid: clamp(2.441rem, 1.8rem + 2.5vw, 4rem) (responsive)
```

---

## 🐛 Debugging Tips

- **CSS not updating?** Run `npm run build:css` - bundles are generated
- **API failing?** Check `.env` has valid Resend API key, or ensure backend running
- **Minified code confusing?** Source maps not available - refer to components.js for patterns
- **Form not submitting?** Check browser console for API errors, verify backend is running
- **Mobile nav broken?** Check hamburger ID in HTML matches `initNav()` selectors

---

## 📞 Contact & Maintenance

For issues or questions, refer to GitHub issues or contact the original developer.

**Repository**: https://github.com/ScorchTrail/srt-swp  
**Domain**: https://shippingwithpurpose.com

---

**Last Updated**: 2026-07-06  
**Maintainer Notes**: Every file should be self-documenting. See individual file headers for specific implementation details.
