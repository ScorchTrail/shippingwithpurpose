const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const CACHE_TTL_MS = 10 * 60 * 1000;
const ROOT_DIR = path.join(__dirname, '..');
const WEB_ROOT = path.join(__dirname, '..', 'public');
const ROOT_INDEX = path.join(ROOT_DIR, 'index.html');

let cache = {
  timestamp: 0,
  payload: null,
};

app.use(express.static(WEB_ROOT));

app.get(['/', '/index.html'], (_req, res) => {
  res.sendFile(ROOT_INDEX);
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'reviews-api' });
});

app.get('/api/reviews', async (_req, res) => {
  try {
    const now = Date.now();
    if (cache.payload && now - cache.timestamp < CACHE_TTL_MS) {
      return res.json({ ...cache.payload, cached: true });
    }

    const [googleReviews, yelpReviews] = await Promise.all([
      fetchGoogleReviews(),
      fetchYelpReviews(),
    ]);

    const reviews = [...googleReviews, ...yelpReviews]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 20);

    const payload = {
      cached: false,
      total: reviews.length,
      sources: {
        google: googleReviews.length,
        yelp: yelpReviews.length,
      },
      reviews,
    };

    cache = {
      timestamp: now,
      payload,
    };

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch live reviews',
      details: error.message,
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(ROOT_INDEX);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

async function fetchGoogleReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) return [];

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,reviews,rating,user_ratings_total,url');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google API request failed (${response.status})`);
  }

  const data = await response.json();
  const reviews = Array.isArray(data?.result?.reviews) ? data.result.reviews : [];

  return reviews.map((review) => {
    const timestamp = Number(review.time || 0) * 1000;
    return {
      source: 'google',
      authorName: review.author_name || 'Google User',
      rating: Number(review.rating || 5),
      text: review.text || '',
      relativeTime: review.relative_time_description || 'Recent review',
      publishedAt: formatDate(timestamp),
      timestamp,
      profileUrl: review.author_url || data?.result?.url || '',
    };
  });
}

async function fetchYelpReviews() {
  const apiKey = process.env.YELP_API_KEY;
  const businessId = process.env.YELP_BUSINESS_ID;

  if (!apiKey || !businessId) return [];

  const url = `https://api.yelp.com/v3/businesses/${businessId}/reviews`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Yelp API request failed (${response.status})`);
  }

  const data = await response.json();
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];

  return reviews.map((review) => {
    const timestamp = Date.parse(review.time_created || '');
    return {
      source: 'yelp',
      authorName: review?.user?.name || 'Yelp User',
      rating: Number(review.rating || 5),
      text: review.text || '',
      relativeTime: 'Yelp review',
      publishedAt: formatDate(timestamp),
      timestamp: Number.isFinite(timestamp) ? timestamp : 0,
      profileUrl: review.url || '',
    };
  });
}

function formatDate(timestamp) {
  if (!timestamp || Number.isNaN(timestamp)) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
