# DISCLAIMER

All code in this repository is not for personal or unauthorized use. If you are caught using any part of this source code without explicit permission, legal action will be taken to protect the owner. This is a public repository, but usage is restricted.

# Shipping with Purpose (SRT-SWP)

Static site for a local shipping, printing, and mailbox center in Scottsdale, AZ.

---

## TODO
- Comment out all print-related links and sections in every HTML file
- Maintain this README with up-to-date directory and usage info

---

## Directory Structure & Purpose

**Root**
- `README.md` — Project documentation (this file)
- `CNAME` — Custom domain config for deployment
- `package.json` — Root scripts (e.g. `npm run build:css`)

**src/** — CSS source-of-truth (NOT deployed — kept out of the published artifact)
- `css/main-home.css`, `main-mailboxes.css`, `main-services.css`, `main-print.css` — Page-specific entrypoints
- `css/blocks/` — Modular BEM CSS for each UI block (e.g. `nav.css`, `footer.css`, `hero.css`, etc.), inlined into bundles at build time
- `css/critical.css` — Canonical source for the inlined critical CSS

**public/** — Deploy output / all client-facing files (this folder is what ships to the CDN)
- `index.html` — Main landing page (home)
- `mailboxes.html` — Mailbox rental info, pricing, and reservation modal
- `services.html` — All business services, FAQ, and contact info
- `print.html` — Print portal page
- `partials/` — Shared HTML fragments injected via `data-include` (`header.html`, `footer.html`)
- `css/` — Built, committed, served stylesheets
  - `*.bundle.css` — Generated from `src/css/main-*.css` by `npm run build:css` (do not edit by hand)
  - `reservation-drawer.css` — Standalone served stylesheet (linked directly, not bundled)
  - `vendor/` — Third-party CSS (e.g. `swiper-bundle.min.css`)
- `js/` — `app.js`, `components.js`, and `vendor/` for third-party scripts
- `assets/` — Images, icons, fonts, files
- `data/` — Static JSON data (mailbox content)
- `_headers`, `_redirects`, `sitemap.xml`, `site.webmanifest` — CDN/routing config

**server/** — Node.js backend (API, Yelp proxy, not for client)
  - `index.js` — Main server entry (serves `public/` locally on :3000)

**scripts/** — Utility scripts
  - `build-css.js` — Bundles `src/css/main-*.css` into `public/css/*.bundle.css`
  - `yelp-find-business.js`

> **CSS workflow:** edit files under `src/css/`, then run `npm run build:css` to regenerate the bundles in `public/css/`. Only `public/` is deployed, so `src/` is never shipped.

---

## Quick Start
```bash
npm install
npm start
# Then open http://localhost:3000
```

---

## Copy-Paste Text for Client Updates
Use the following text blocks to send to the client for review or updates:

**Homepage (index.html):**
- “Your neighborhood shipping home.”
- “A place where regulars come to chat, packages get handled with care, and everyone is treated like family. Full-service shipping, printing, and private mailboxes — all in one cozy spot.”
- “Get a Mailbox Quote”
- “Call Us Now”
- “Secure & Private”
- “Community First”
- “Locally Owned”
- “All the services you need, in one friendly stop.”
- “From packages to paperwork — we've got you covered, with a smile.”

**Mailbox Rentals (mailboxes.html):**
- “Mailbox Rentals”
- “Your personal or business address - secure, private, and professional.”
- “Box Size: Mini, Personal, Business, Corporate”
- “Rental Term: 3-Month, 6-Month, 12-Month”
- “Mail Notifications: Get notified when mail or packages arrive — via email or phone. $1/month added to your rental.”
- “Full Pricing Breakdown”
- “Everything included with your mailbox.”
- “Business Address, Not Your Home: Use our street address for business registration, banking, and professional mail while keeping your home address private.”
- “All Carriers Welcome: Accept packages from USPS, UPS, FedEx, DHL, Amazon, and any other courier service.”
- “Mail Notifications: Get notified by text or email when mail or packages arrive — optional add-on for $1/month.”
- “Secure & Private: Keep your home address off public records. Your mail is locked and only accessible to you.”
- “No Hidden or Sign-Up Fees: Straightforward pricing with clear terms. Choose 3, 6, or 12-month plans with no surprise onboarding charges.”
- “Business Ready: Perfect for LLC registration, business banking, and keeping your home address private.”
- “Reserve Your Mailbox”
- “Complete your info and we'll get you set up.”
- “USPS Form 1583: Required for all private mailbox rentals. You can fill it online or bring a printed copy.”
- “What to Bring In: Complete your online form above, then visit us to finish your mailbox rental. You'll need:”
- “Private mailbox rentals require identity verification per USPS regulations. Accepted payment methods: Cash, Check, Credit Card, Debit Card.”
- “Complete Reservation”

**Services (services.html):**
- “Our Services”
- “Reliable, in-store support for shipping, printing, business paperwork, and private mailbox service.”
- “Shipping: Compare rates across top carriers and get your packages delivered safely and on time. Domestic & International, Certified Mail, Custom Packaging. Drop-offs: Free.”
- “Printing: Fast everyday printing for forms, photos, and documents with clear pickup timelines. Black & White, Full-Color, Lamination. Starting at $0.50.”
- “Business: Essential paperwork services in one stop for small business and everyday admin needs. Fax, Notary Public, Shred. Notary from $10.”
- “Mailbox Services: Get a real street address with secure mail handling and optional forwarding. Package Storage, Mail Forwarding, Magazine/Newspaper Storage. Plans from $57.”
- “Need supplies? We carry boxes, stamps, tape, envelopes, bubble wrap, and more — available in store.”
- “FAQ”
- “Common questions”
- “What do I need to rent a mailbox? You'll need two forms of ID and a completed USPS Form 1583. You can download and fill out Form 1583 ahead of time to make your visit faster. We'll handle the rest when you come in.”
- “Can I receive packages from any carrier with a mailbox rental? Yes! Unlike a P.O. Box, our private mailboxes accept packages from all carriers — USPS, UPS, FedEx, DHL, and any other courier or delivery service.”
- “How will I know when I have mail or a package? All plans include mail notification. We'll let you know by text or email when something arrives for you — so you only make the trip when you need to.”
- “What shipping carriers do you work with? We're authorized to ship with USPS, UPS, FedEx, and DHL. We can help you compare rates and packaging options to get the best deal for your shipment.”
- “Do you offer same-day printing? Yes! For most standard print jobs, we can have it ready the same day. Larger or specialty orders may take longer — give us a call or submit a printing request and we'll give you a realistic timeline.”
- “Is a Notary Public available without an appointment? Walk-ins are welcome! Our notary is generally available during business hours. For time-sensitive documents, you can call ahead to confirm availability.”
- “Can I use my mailbox address for my business? Absolutely. Our mailboxes come with a real street address — perfect for business registration, receiving packages, and keeping your home address private.”
- “Local shipping, printing, and mailbox services with friendly, accurate, and fast support.”
- “Locally owned & operated in Scottsdale, AZ.”

---

## Legal Disclaimer
All code in this repository is not for personal or unauthorized use. If you are caught using any part of this source code without explicit permission, legal action will be taken to protect the owner. This is a public repository, but usage is restricted.
