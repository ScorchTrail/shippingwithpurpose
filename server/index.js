require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// Middleware to parse JSON and urlencoded bodies
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static files (your frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Mount print portal API route
app.use('/', require('./routes/printRequest'));

// Fallback for SPA routing (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
