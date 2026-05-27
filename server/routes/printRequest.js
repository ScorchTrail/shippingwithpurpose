// Express route for print portal requests with Resend integration
const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/print-request
router.post('/api/print-request', async (req, res) => {
  try {
    const { name, email, phone, printType, copies, files = [] } = req.body;
    if (!name || !files.length) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }
    // Validate file sizes (max 25MB each, total)
    const MAX_SIZE = 25 * 1024 * 1024;
    let totalSize = 0;
    for (const f of files) {
      const size = Buffer.from(f.base64, 'base64').length;
      if (size > MAX_SIZE) return res.status(400).json({ success: false, error: `File ${f.filename} too large.` });
      totalSize += size;
    }
    if (totalSize > MAX_SIZE) return res.status(400).json({ success: false, error: 'Total upload size exceeds 25MB.' });


    // Prepare Resend email
    const attachments = files.map(f => ({
      filename: f.filename,
      content: f.base64,
      type: f.mimeType
    }));
    const emailBody = `New print request:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nPrint Type: ${printType}\nCopies: ${copies}\nFiles: ${files.map(f => f.filename).join(', ')}`;
    await resend.emails.send({
      from: 'no-reply@shippingwithpurpose.com',
      to: 'print@shippingwithpurpose.com',
      subject: 'New Print Portal Request',
      text: emailBody,
      attachments
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Print portal error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;
