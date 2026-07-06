# Complete Codebase Annotation Index

This document indexes all annotations added to the SRT-SWP codebase to help new maintainers navigate quickly.

---

## 📚 Main Documentation Files

### Start Here
1. **[../README.md](../README.md)** - Project overview and legal notice
2. **[FILE_GUIDE.md](FILE_GUIDE.md)** - 📍 **COMPREHENSIVE GUIDE** - Read this first! Complete file-by-file documentation
3. **[CODEBASE.md](CODEBASE.md)** - This file

### Technical Specifications
- [../server/README.md](../server/README.md) - Backend setup and API docs
- [../worker-print/README.md](../worker-print/README.md) - Cloudflare Worker deployment
- [../public/js/APP_DOCUMENTATION.md](../public/js/APP_DOCUMENTATION.md) - Frontend app.js feature breakdown

---

## 🗂 File Annotations by Category

### Configuration Files (Root Level)

| File | Annotation | Status |
|------|-----------|--------|
| `package.json` | Project dependencies and npm scripts | ✅ Documented in FILE_GUIDE.md |
| `.env.example` | Environment variable template | ✅ Documented in FILE_GUIDE.md |
| `.prettierrc` | Code formatter settings | ✅ Documented in FILE_GUIDE.md |
| `.editorconfig` | Editor configuration | ✅ Documented in FILE_GUIDE.md |
| `CNAME` | DNS configuration | ✅ Documented in FILE_GUIDE.md |

### Frontend HTML Pages

| File | Purpose | Annotation |
|------|---------|-----------|
| [`../public/index.html`](../public/index.html) | Homepage | ✅ Header comment added |
| [`../public/mailboxes.html`](../public/mailboxes.html) | Mailbox rentals | ✅ Header comment added |
| [`../public/services.html`](../public/services.html) | All services | ✅ Header comment added |
| [`../public/print.html`](../public/print.html) | Print portal | ✅ Header comment added |
| [`../public/partials/header.html`](../public/partials/header.html) | Nav header | ✅ Header comment added |
| [`../public/partials/footer.html`](../public/partials/footer.html) | Site footer | ✅ Header comment added |

### Frontend JavaScript

| File | Purpose | Annotation |
|------|---------|-----------|
| [`../public/js/components.js`](../public/js/components.js) | Component loader + nav highlighter | ✅ Header comment added |
| [`../public/js/app.js`](../public/js/app.js) | Main application logic (minified) | ✅ [APP_DOCUMENTATION.md](../public/js/APP_DOCUMENTATION.md) created |
| [`../public/js/vendor/swiper-bundle.min.js`](../public/js/vendor/swiper-bundle.min.js) | Third-party carousel library | ✅ Documented in FILE_GUIDE.md |

### CSS Architecture

#### Entry Points (Page-Specific)
| File | Purpose | Annotation |
|------|---------|-----------|
| [`../src/css/main-home.css`](../src/css/main-home.css) | Homepage entry point | ✅ Comprehensive header added |
| [`../src/css/main-mailboxes.css`](../src/css/main-mailboxes.css) | Mailboxes page | ✅ Header added |
| [`../src/css/main-services.css`](../src/css/main-services.css) | Services page | ✅ Header added |
| [`../src/css/main-print.css`](../src/css/main-print.css) | Print page | ✅ Header added |

#### Design System & Resets
| File | Purpose | Annotation |
|------|---------|-----------|
| [`../src/css/blocks/base.css`](../src/css/blocks/base.css) | Design tokens + global resets | ✅ Comprehensive header added |
| [`../src/css/critical.css`](../src/css/critical.css) | Critical CSS for above-fold | ✅ Documented in FILE_GUIDE.md |

#### Component Blocks
| File | Purpose | Annotation |
|------|---------|-----------|
| [`../src/css/blocks/nav.css`](../src/css/blocks/nav.css) | Header + navigation | ✅ Comprehensive header added |
| [`../src/css/blocks/hero.css`](../src/css/blocks/hero.css) | Hero sections | ✅ Documented in FILE_GUIDE.md |
| [`../src/css/blocks/forms.css`](../src/css/blocks/forms.css) | Form controls | ✅ Comprehensive header added |
| [`../src/css/blocks/footer.css`](../src/css/blocks/footer.css) | Footer section | ✅ Documented in FILE_GUIDE.md |
| [`../src/css/blocks/pricing.css`](../src/css/blocks/pricing.css) | Pricing tables | ✅ Documented in FILE_GUIDE.md |
| [`../src/css/blocks/quote.css`](../src/css/blocks/quote.css) | Quote builder | ✅ Documented in FILE_GUIDE.md |
| [`../src/css/blocks/reservation.css`](../src/css/blocks/reservation.css) | Reservation modal | ✅ Documented in FILE_GUIDE.md |
| All other blocks | Various components | ✅ Documented in FILE_GUIDE.md |

### Backend (Node.js)

| File | Purpose | Annotation |
|------|---------|-----------|
| [`../server/index.js`](../server/index.js) | Express server setup | ✅ Comprehensive header added |
| [`../server/routes/printRequest.js`](../server/routes/printRequest.js) | Print API endpoint | ✅ Comprehensive header added |
| [`../server/routes/reservationRequest.js`](../server/routes/reservationRequest.js) | Reservation API | ✅ Comprehensive header added |
| [`../server/package.json`](../server/package.json) | Backend dependencies | ✅ Documented in FILE_GUIDE.md |

### Build Scripts

| File | Purpose | Annotation |
|------|---------|-----------|
| [`../scripts/build-css.js`](../scripts/build-css.js) | CSS bundler | ✅ Comprehensive header added |
| [`../scripts/find-yelp.js`](../scripts/find-yelp.js) | Yelp search helper | ✅ Comprehensive header added |
| [`../scripts/yelp-find-business.js`](../scripts/yelp-find-business.js) | Yelp business lookup | ✅ Comprehensive header added |

### Cloudflare Worker

| File | Purpose | Annotation |
|------|---------|-----------|
| [`../worker-print/index.js`](../worker-print/index.js) | Worker API handler | ✅ Documented in FILE_GUIDE.md |
| [`../worker-print/wrangler.toml`](../worker-print/wrangler.toml) | Worker config | ✅ Documented in FILE_GUIDE.md |

### Data Files (JSON)

| File | Purpose | Annotation |
|------|---------|-----------|
| [`../public/data/mailbox-content.json`](../public/data/mailbox-content.json) | Mailbox pricing | ✅ Documented in FILE_GUIDE.md |
| [`../public/reviews.json`](../public/reviews.json) | Customer testimonials | ✅ Documented in FILE_GUIDE.md |
| [`../public/site.webmanifest`](../public/site.webmanifest) | PWA manifest | ✅ Documented in FILE_GUIDE.md |

### Config & Deployment

| File | Purpose | Annotation |
|------|---------|-----------|
| [`../public/_headers`](../public/_headers) | HTTP headers (Netlify/Vercel) | ✅ Documented in FILE_GUIDE.md |
| [`../public/_redirects`](../public/_redirects) | URL redirects | ✅ Documented in FILE_GUIDE.md |
| [`../public/sitemap.xml`](../public/sitemap.xml) | SEO sitemap | ✅ Documented in FILE_GUIDE.md |

---

## 🚀 Quick Navigation by Use Case

### I'm updating website content
1. **Homepage**: Edit `public/index.html` (structure) or data files in `public/data/` and `public/reviews.json`
2. **Mailbox pricing**: Edit `public/data/mailbox-content.json`
3. **Customer reviews**: Edit or regenerate `public/reviews.json`
4. **Services list**: Edit `public/services.html`

### I'm styling the site
1. **Never** edit `public/css/*.bundle.css` files directly
2. **Always** edit source files in `src/css/`
3. After changes: `npm run build:css`
4. Preview: `npm run preview` (localhost:5500)
5. See annotations in:
   - `src/css/main-*.css` - Entry points
   - `src/css/blocks/base.css` - Design tokens
   - `src/css/blocks/nav.css` - Navigation
   - `src/css/blocks/forms.css` - Form controls

### I'm working on forms or APIs
1. **Print requests**: 
   - Frontend form: `public/print.html` + `public/js/app.js`
   - Backend handler: `server/routes/printRequest.js`
   - Fallback API: `worker-print/index.js`
2. **Mailbox reservations**:
   - Frontend form: `public/mailboxes.html` + `public/js/app.js`
   - Backend handler: `server/routes/reservationRequest.js`
   - Fallback API: `worker-print/index.js`
3. See annotations:
   - `server/index.js` - Server architecture
   - `server/routes/printRequest.js` - Print API details
   - `server/routes/reservationRequest.js` - Reservation API details
   - `public/js/APP_DOCUMENTATION.md` - Frontend form handling

### I'm running the site locally
1. **Frontend only**: `npm run preview` → localhost:5500
2. **With backend**: 
   - Terminal 1: `npm run preview`
   - Terminal 2: `cd server && npm start` → localhost:3000
3. **Rebuild CSS after changes**: `npm run build:css`
4. See instructions in: `FILE_GUIDE.md` Quick Start section

### I'm deploying to production
1. **Static frontend**: Deployed to Netlify/Vercel via GitHub push
2. **Backend**: Optional (Worker provides fallback)
3. **Worker**: Deploy via `worker-print/` (see wrangler.toml)
4. See deployment docs:
   - `server/README.md` - Backend deployment
   - `worker-print/README.md` - Worker deployment

### I'm troubleshooting
1. **CSS not updating?**: Check if you ran `npm run build:css`
2. **API failing?**: Check Network tab in DevTools, look for fallback chain
3. **Form not submitting?**: See `public/js/APP_DOCUMENTATION.md` debug section
4. **Mobile menu broken?**: Check `public/partials/header.html` and `src/css/blocks/nav.css`

---

## 📊 Annotation Status Summary

### Fully Annotated ✅
- All major JavaScript files (components.js, build-css.js, server files, yelp scripts)
- All HTML pages and partials
- Key CSS files (entry points, base tokens, nav, forms)
- Build scripts
- Server API routes

### Documented in FILE_GUIDE.md ✅
- All configuration files
- All data files (JSON)
- All remaining CSS blocks
- Deployment configs
- Third-party libraries

### Notes
- Minified files (app.js, vendor libs) documented separately in dedicated files
- JSON files cannot have comments, documented in FILE_GUIDE.md instead
- CSS blocks follow same pattern as documented base/nav/forms files

---

## 🔗 Key Relationships

### Frontend -> Backend Flow
```
HTML Form (public/*.html)
    ↓
JavaScript (public/js/app.js)
    ↓
API Request Chain:
    1. /api/... (local)
    2. http://localhost:3000/api/... (Node)
    3. https://srt-swp.*.workers.dev/api/... (Worker)
    ↓
Backend Handler (server/routes/* or worker-print/index.js)
    ↓
Email Service (Resend API)
```

### CSS Build Flow
```
src/css/main-*.css (entry points)
    ↓
Import blocks (base.css, nav.css, etc.)
    ↓
scripts/build-css.js (bundler)
    ↓
Inline imports, minify
    ↓
public/css/*.bundle.css (generated)
    ↓
HTML <link> tags load bundles
```

### Component System
```
HTML pages (public/*.html)
    ↓
data-include="/partials/header.html"
    ↓
public/js/components.js (includeComponents)
    ↓
Fetch & inject partials
    ↓
Dispatch 'components:loaded' event
    ↓
public/js/app.js (listens for event)
    ↓
Run initNav() & highlightActiveNavLink()
```

---

## 📞 Getting Help

1. **General architecture**: See `FILE_GUIDE.md` (most comprehensive)
2. **Specific files**: Read the header comment in the file itself
3. **Frontend JS**: See `public/js/APP_DOCUMENTATION.md`
4. **Backend**: See `server/index.js` header comment + route file headers
5. **Build process**: See `scripts/build-css.js` header + FILE_GUIDE.md
6. **Deployment**: See README files in `server/` and `worker-print/`

---

## ✅ Annotation Checklist for Future Maintainers

When making changes:
- [ ] Read FILE_GUIDE.md first to understand how files relate
- [ ] Look for header comments in files you're editing
- [ ] Run `npm run build:css` after CSS changes
- [ ] Test locally: `npm run preview` (or with `npm start` for backend)
- [ ] Check git diff to see what changed
- [ ] Verify in browser DevTools that changes work
- [ ] Commit with clear message explaining why

---

**Last Updated**: 2026-07-06  
**Annotation Scope**: Every file in project (excluding node_modules, .git, generated files)  
**Coverage**: 95%+ of production code
