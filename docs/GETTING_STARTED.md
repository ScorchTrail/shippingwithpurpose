# Getting Started - SRT-SWP

**Quick navigation**: Where to find what you need.

---

## 📚 Documentation

| Document | Purpose | Read When |
|----------|---------|-----------|
| **[../README.md](../README.md)** | Project overview & legal notice | First time setup |
| **[FILE_GUIDE.md](FILE_GUIDE.md)** | Complete file-by-file reference (recommended) | Learning the codebase |
| **[CODEBASE.md](CODEBASE.md)** | Annotation index & quick navigation | Looking for specific files |
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | **You are here** - Setup & workflows | Setting up locally |

---

## ⚙️ Environment Variables (.env)

### Do I Need `.env`?

| Scenario | Need .env? | What to Do |
|----------|-----------|-----------|
| **Frontend only** (viewing site locally) | ❌ No | Just run `npm run preview` |
| **Running backend locally** | ✅ Yes | Copy `.env.example` → `.env` and fill values |
| **Deploying to production** | ✅ Yes | Set env vars in Netlify/Vercel dashboard |

### Setup (if running backend)

```bash
# Copy template to actual env file
cp .env.example .env

# Edit .env with your secrets
# - RESEND_API_KEY (from resend.com)
# - RESEND_FROM_EMAIL (your sending address)
# - RESERVATION_TO_EMAIL (optional)
# - PRINT_PORTAL_TO_EMAIL (optional)
```

**Important**: `.env` is in `.gitignore` - never commit it with real secrets!

---

## 🚀 Running Locally

### Frontend Only (Static)
```bash
# Install dependencies
npm install

# Build CSS
npm run build:css

# Start dev server on :5500
npm run preview

# Open browser: http://localhost:5500
```

### With Backend (Node.js)

**Terminal 1 - Frontend:**
```bash
npm run preview
# Serves on http://localhost:5500
```

**Terminal 2 - Backend:**
```bash
cd server
npm install
cp .env.example .env          # Fill in Resend API key
npm start
# Serves on http://localhost:3000
```

Frontend will detect local backend and use it for form submissions.

---

## 🎨 Editing Styles

**Important**: Never edit generated CSS files!

```bash
# WRONG ❌
# Don't edit: public/css/*.bundle.css

# RIGHT ✅
# Edit source: src/css/*.css

# After changes, rebuild:
npm run build:css

# Preview:
npm run preview
```

---

## 📝 Editing Content

| Content | Where | How |
|---------|-------|-----|
| **Mailbox pricing** | `public/data/mailbox-content.json` | Edit JSON directly, page auto-updates |
| **Customer reviews** | `public/reviews.json` | Edit JSON or regenerate with Yelp script |
| **Services/Pages** | `public/*.html` | Edit HTML directly |
| **Header/Footer** | `public/partials/*.html` | Edit HTML - injected on all pages |

---

## 🔧 Build & Deploy Scripts

### npm run build:css
Bundles modular CSS into production files:
- Input: `src/css/main-*.css` (with @import blocks)
- Output: `public/css/*.bundle.css`
- Usage: Run after any CSS changes

### npm run dev:live
Live preview server:
- Runs on: http://localhost:5500
- Auto-reload on file changes
- No production build needed

### npm run preview
Build CSS then start live server:
- Combines build:css + dev:live
- One command to see everything

---

## 🌐 Deployment

### Frontend (Netlify/Vercel)
1. Push to GitHub
2. Auto-deploys to `shippingwithpurpose.com`
3. No environment secrets needed (frontend is public)

### Backend (Optional)
1. **Node.js**: Deploy `server/` to your host (Heroku, Railway, etc.)
2. **Cloudflare Worker**: Deploy via `wrangler deploy` in `worker-print/`

### Environment Variables (Production)
Set these in your hosting dashboard:
- `RESEND_API_KEY` - Email service API key
- `RESEND_FROM_EMAIL` - Sender email address
- `RESERVATION_TO_EMAIL` - Where reservation emails go
- `PRINT_PORTAL_TO_EMAIL` - Where print emails go

---

## 📂 Project Structure

```
srt-swp/
├── README.md              ← Project overview
├── docs/                  ← Documentation (you are here)
│   ├── GETTING_STARTED.md
│   ├── FILE_GUIDE.md
│   └── CODEBASE.md
├── package.json           ← Root npm config
├── .env.example           ← COMMIT this (template)
├── .env                   ← DON'T COMMIT (secrets)
│
├── public/                ← Deployed frontend
│   ├── index.html         ← Homepage
│   ├── mailboxes.html     ← Mailbox rentals
│   ├── services.html      ← All services
│   ├── print.html         ← Print portal
│   ├── partials/          ← Reusable HTML
│   ├── css/               ← Generated bundles
│   ├── js/                ← Frontend logic
│   └── data/              ← Pricing/content JSON
│
├── src/                   ← Source code (not deployed)
│   └── css/               ← Modular styles
│       ├── main-*.css     ← Page entry points
│       └── blocks/        ← Component styles
│
├── server/                ← Optional Node backend
│   ├── index.js           ← Express server
│   ├── routes/            ← API handlers
│   └── package.json       ← Backend dependencies
│
├── worker-print/          ← Cloudflare Worker fallback
│   ├── index.js           ← Worker handler
│   └── wrangler.toml      ← Config
│
└── scripts/               ← Build & utility scripts
    ├── build-css.js       ← CSS bundler
    └── yelp-*.js          ← Yelp API helpers
```

---

## 🐛 Common Tasks

### Update mailbox pricing
1. Edit `public/data/mailbox-content.json`
2. Refresh browser - page auto-updates with new prices

### Update customer reviews
1. Option A: Edit `public/reviews.json` directly
2. Option B: Run yelp script:
   ```bash
   cd scripts
   node find-yelp.js "Shipping with Purpose" "Scottsdale, AZ"
   ```

### Change navigation links
1. Edit `public/partials/header.html`
2. All pages auto-update (injected via components.js)

### Fix styling issues
1. Find the CSS block in `src/css/blocks/`
2. Make changes
3. Run `npm run build:css`
4. Refresh browser (might need hard refresh: Ctrl+Shift+R)

### Test form submissions
1. Start backend: `cd server && npm start`
2. Check `.env` has valid `RESEND_API_KEY`
3. Fill out form on site
4. Should receive email at configured address

---

## ✅ Pre-Launch Checklist

- [ ] `.env.example` committed with template values
- [ ] `.env` in `.gitignore` (don't commit real secrets)
- [ ] `npm run build:css` runs without errors
- [ ] `npm run preview` works locally
- [ ] Forms submit successfully
- [ ] Mobile menu works (hamburger on small screens)
- [ ] Images load correctly
- [ ] No console errors (DevTools F12)
- [ ] Page is responsive on mobile/tablet
- [ ] SEO meta tags present (check HTML head)
- [ ] Analytics tracking added (if needed)

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| CSS not updating | Run `npm run build:css` then hard refresh (Ctrl+Shift+R) |
| Forms not submitting | Check backend running, verify `.env` has API key |
| Mobile menu not working | Check hamburger ID in HTML matches JavaScript |
| API failures | Check Network tab in DevTools - see which endpoint responds |
| Slow page load | Check images are optimized, CSS is bundled (not sequential imports) |
| Build fails | Ensure @import paths in CSS are correct |

---

## 📞 Key Files to Know

**Just starting?**
- Read: `FILE_GUIDE.md`
- Quick ref: `CODEBASE.md`

**Need to edit HTML?**
- Pages: `public/*.html`
- Reusable: `public/partials/*.html`
- See: FILE_GUIDE.md → Public HTML Pages section

**Need to edit styles?**
- Never: `public/css/*.bundle.css`
- Always: `src/css/*.css`
- See: FILE_GUIDE.md → CSS Architecture section

**Need to change forms/API?**
- Frontend: `public/js/app.js` (see APP_DOCUMENTATION.md)
- Backend: `server/routes/*.js`
- See: FILE_GUIDE.md → Backend section

**Need to update content?**
- Pricing: `public/data/mailbox-content.json`
- Reviews: `public/reviews.json`
- Pages: `public/*.html`

---

## 🎯 Next Steps

1. **Install**: `npm install` && `cd server && npm install`
2. **Configure**: Copy `.env.example` to `.env` (only if running backend)
3. **Test locally**: `npm run preview`
4. **Read**: Open `FILE_GUIDE.md` for deep dive
5. **Deploy**: Push to GitHub → auto-deploys to Netlify/Vercel

---

**Questions?** Check the relevant section in `FILE_GUIDE.md` or `CODEBASE.md` - everything is documented!
