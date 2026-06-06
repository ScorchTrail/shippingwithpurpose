const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

const MAX_TOTAL_UPLOAD_BYTES = 25 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_TOTAL_UPLOAD_BYTES,
    files: 10,
  },
});

const printRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
]);

// POST /api/print-request
router.post('/api/print-request', printRateLimiter, upload.array('files', 10), async (req, res) => {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return res.status(500).json({ success: false, error: 'Email service is not configured.' });
    }

    const name = (req.body.name || '').trim();
    const printType = (req.body.printType || 'Black & White').trim();
    const instructions = (req.body.instructions || '').trim();
    const copies = Number(req.body.copies || 0);
    const files = Array.isArray(req.files) ? req.files : [];

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }
    if (!Number.isFinite(copies) || copies < 1 || copies > 10000) {
      return res.status(400).json({ success: false, error: 'Copies must be a valid number.' });
    }
    if (!files.length) {
      return res.status(400).json({ success: false, error: 'Please upload at least one file.' });
    }

    let totalUploadBytes = 0;
    for (const file of files) {
      totalUploadBytes += file.size;
      if (!allowedMimeTypes.has(file.mimetype)) {
        return res.status(400).json({ success: false, error: `Unsupported file type: ${file.originalname}` });
      }
    }

    if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
      return res.status(400).json({ success: false, error: 'Total upload size exceeds 25MB.' });
    }

    const safeName = validator.escape(name).slice(0, 100);
    const safePrintType = validator.escape(printType).slice(0, 50);
    const safeInstructions = validator.escape(instructions).slice(0, 2000);

    const attachments = files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    }));

    const emailBody = [
      'New print request:',
      '',
      `Name: ${safeName}`,
      `Print Type: ${safePrintType}`,
      `Copies: ${copies}`,
      safeInstructions ? `Instructions: ${safeInstructions}` : null,
      `Files: ${files.map((file) => file.originalname).join(', ')}`,
      `Total Upload Size: ${(totalUploadBytes / (1024 * 1024)).toFixed(2)} MB`,
    ].filter(Boolean).join('\n');

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.PRINT_PORTAL_TO_EMAIL || 'print@shippingwithpurpose.com',
      subject: 'New Print Portal Request',
      text: emailBody,
      attachments,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Print portal error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'A file exceeds the 25MB maximum size.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, error: 'Too many files uploaded.' });
    }
    return res.status(400).json({ success: false, error: 'Invalid file upload.' });
  }

  return next(err);
});

module.exports = router;
