export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    let data;
    try {
      data = await request.json();
    } catch (e) {
      return new Response("Invalid JSON", { status: 400 });
    }
    // Only extract allowed fields (no email)
    const name = typeof data.name === 'string' ? data.name.substring(0, 100) : '';
    const details = typeof data.details === 'string' ? data.details.substring(0, 2000) : '';
    if (!name || !details) {
      return new Response("Missing field: name or details", { status: 400 });
    }
    // Compose email with only allowed fields
    const subject = `Print Request from ${name}`;
    let body = `Name: ${name}\nDetails: ${details}\n`;
    const resendPayload = {
      from: env.RESEND_FROM_EMAIL,
      to: env.RESEND_TO_EMAIL,
      subject,
      text: body,
    };
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });
    if (!resp.ok) {
      const err = await resp.text();
      return new Response(`Email failed: ${err}`, { status: 500 });
    }
    return new Response("OK", { status: 200 });
  },
};
