const express = require('express');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const { Resend } = require('resend');

const router = express.Router();

const reservationRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/api/reservation-request', reservationRateLimiter, async (req, res) => {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return res.status(500).json({ success: false, error: 'Email service is not configured.' });
    }

    const name = (req.body.name || '').trim();
    const company = (req.body.company || '').trim();
    const phone = (req.body.phone || '').trim();
    const email = (req.body.email || '').trim();
    const mailboxType = (req.body.mailboxType || '').trim();
    const term = (req.body.term || '').trim();
    const mailNotification = req.body.mailNotification === true;

    if (!name || !email || !phone || !mailboxType || !term) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }

    const safeName = validator.escape(name).slice(0, 100);
    const safeCompany = validator.escape(company).slice(0, 120);
    const safePhone = validator.escape(phone).slice(0, 40);
    const safeEmail = validator.normalizeEmail(email) || email;
    const safeMailboxType = validator.escape(mailboxType).slice(0, 50);
    const safeTerm = validator.escape(term).slice(0, 30);

    const text = [
      'New mailbox reservation request:',
      '',
      `Name: ${safeName}`,
      safeCompany ? `Business / LLC: ${safeCompany}` : null,
      `Phone: ${safePhone}`,
      `Email: ${safeEmail}`,
      '',
      `Mailbox Type: ${safeMailboxType}`,
      `Term: ${safeTerm}`,
      `Mail Notifications: ${mailNotification ? 'Yes' : 'No'}`,
    ]
      .filter(Boolean)
      .join('\n');

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.RESERVATION_TO_EMAIL || 'mail@shippingwithpurpose.com',
      subject: `New Mailbox Reservation - ${safeName}`,
      text,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Reservation request error:', error);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;
