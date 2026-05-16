const dotenv = require("dotenv");

dotenv.config();

const YELP_API_BASE = "https://api.yelp.com/v3";

async function main() {
  const apiKey = process.env.YELP_API_KEY;
  const term = process.argv[2] || process.env.YELP_SEARCH_TERM;
  const location = process.argv[3] || process.env.YELP_SEARCH_LOCATION;

  if (!apiKey) {
    throw new Error("Missing YELP_API_KEY in .env");
  }

  if (!term || !location) {
    throw new Error(
      "Usage: npm run yelp:find -- \"Business Name\" \"City, ST\"\nOr set YELP_SEARCH_TERM and YELP_SEARCH_LOCATION in .env"
    );
  }

  const url = new URL(`${YELP_API_BASE}/businesses/search`);
  url.searchParams.set("term", term);
  url.searchParams.set("location", location);
  url.searchParams.set("limit", "5");
  url.searchParams.set("sort_by", "best_match");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const payload = await safeReadJson(response);
    const detail = payload?.error?.description || payload?.error?.code || response.statusText;
    throw new Error(`Yelp search failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const businesses = Array.isArray(data?.businesses) ? data.businesses : [];

  if (!businesses.length) {
    console.log("No businesses found. Try a different term/location.");
    return;
  }

  console.log("Top Yelp business matches:\n");
  businesses.forEach((business, index) => {
    const line1 = `${index + 1}. ${business.name}`;
    const line2 = `   ID: ${business.id}`;
    const line3 = `   Rating: ${business.rating} | Reviews: ${business.review_count}`;
    const line4 = `   Address: ${(business.location?.display_address || []).join(", ")}`;

    console.log(line1);
    console.log(line2);
    console.log(line3);
    console.log(line4);
    console.log("");
  });

  console.log("Copy the correct ID into YELP_BUSINESS_ID in your .env file.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function safeReadJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
