/**
 * server/index.js
 * ================
 * Express server for Shipping with Purpose API.
 *
 * PURPOSE:
 * - Serves static frontend from ../public/
 * - Provides API endpoints for form submissions (print requests, reservations)
 * - Handles email sending via Resend API
 * - Implements security headers (CSP, HSTS, etc.)
 * - Optional: Frontend can fallback to this if Cloudflare Worker is down
 *
 * ENDPOINTS:
 * - POST /api/print-request       → routes/printRequest.js
 * - POST /api/reservation-request → routes/reservationRequest.js
 * - GET  /api/health              → Health check (JSON response)
 * - GET  *                         → SPA fallback (serves index.html)
 *
 * REQUIREMENTS:
 * - dotenv (load .env variables)
 * - express (server framework)
 * - cors (cross-origin requests)
 * - Other: multer, express-rate-limit, validator, resend (see routes/)
 *
 * ENV VARIABLES REQUIRED:
 * - RESEND_API_KEY:           Email service API key
 * - RESEND_FROM_EMAIL:        Email sender address
 * - PORT (optional):          Server port (default: 3000)
 *
 * ENV VARIABLES OPTIONAL:
 * - RESERVATION_TO_EMAIL:     Recipient for reservation forms (default: mail@shippingwithpurpose.com)
 * - PRINT_PORTAL_TO_EMAIL:    Recipient for print forms (default: mail@shippingwithpurpose.com)
 *
 * RUNNING:
 * - cd server && npm install
 * - Copy .env.example → .env and fill in values
 * - npm start (or node index.js)
 * - Server runs on http://localhost:3000
 *
 * SECURITY:
 * - All responses include CSP, X-Frame-Options, HSTS headers
 * - JSON/URL body parsing limited to 25MB
 * - CORS enabled for cross-origin requests
 *
 * RATE LIMITING:
 * - Print requests: 30 per 10 minutes
 * - Reservations: 60 per 10 minutes
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "img-src 'self' data: https://images.unsplash.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com",
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
    "require-trusted-types-for 'script'",
  ].join('; '),
};

function logConfigWarnings() {
  const requiredVars = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'];
  const optionalVars = ['RESERVATION_TO_EMAIL', 'PRINT_PORTAL_TO_EMAIL'];

  const missingRequired = requiredVars.filter((key) => !process.env[key]);
  const missingOptional = optionalVars.filter((key) => !process.env[key]);

  if (missingRequired.length) {
    console.warn('[config] Missing required env vars:', missingRequired.join(', '));
    console.warn('[config] Email routes will return "Email service is not configured." until set.');
  } else {
    console.log('[config] Required email env vars are configured.');
  }

  if (missingOptional.length) {
    console.warn('[config] Optional env vars not set:', missingOptional.join(', '));
    console.warn('[config] Falling back to default recipient addresses in route handlers.');
  }
}

// Middleware to parse JSON and urlencoded bodies
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
  })
);

app.use((req, res, next) => {
  for (const [key, value] of Object.entries(securityHeaders)) {
    res.setHeader(key, value);
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  if (req.secure || forwardedProto === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
});

// Serve static files (your frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Mount API routes
app.use('/', require('./routes/printRequest'));
app.use('/', require('./routes/reservationRequest'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'srt-swp-backend',
    resendConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found.' });
});

// Fallback for SPA routing (optional)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  logConfigWarnings();
});
