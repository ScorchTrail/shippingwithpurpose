# Print Portal Worker

This Cloudflare Worker handles POST requests from the print portal and sends them via Resend email API.

## Local Development

1. Install [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/):
   npm install -g wrangler

2. Set your secrets and environment variables:
   wrangler secret put RESEND_API_KEY
   wrangler secret put RESEND_TO_EMAIL
   wrangler secret put RESEND_FROM_EMAIL

3. Start the local dev server:
   wrangler dev

4. Point your print portal form POST to http://localhost:8787

## Deployment

Deploy to Cloudflare:
   wrangler publish

---

- The Worker expects JSON with fields: `name`, `email`, `details`.
- On success, returns 200 OK. On error, returns 400/500 with message.
