const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

function sanitize(value, maxLen) {
  return typeof value === "string" ? value.trim().substring(0, maxLen) : "";
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function sendViaResend(env, payload) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return { ok: false, status: 500, error: "Email service is not configured." };
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error("Resend API error:", err);
    return { ok: false, status: 500, error: "Email delivery failed." };
  }

  return { ok: true };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Health probe
    if (request.method === "GET" && url.pathname === "/api/health") {
      return jsonResponse({
        success: true,
        service: "srt-swp-worker",
        resendConfigured: Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL),
        timestamp: new Date().toISOString(),
      });
    }

    // Reservation endpoint (JSON payload)
    if (request.method === "POST" && url.pathname === "/api/reservation-request") {
      let data;
      try {
        data = await request.json();
      } catch (e) {
        return jsonResponse({ success: false, error: "Invalid JSON" }, 400);
      }

      const name = sanitize(data.name, 100);
      const company = sanitize(data.company, 100);
      const phone = sanitize(data.phone, 30);
      const email = sanitize(data.email, 200);
      const mailboxType = sanitize(data.mailboxType, 50);
      const term = sanitize(data.term, 20);
      const mailNotification = data.mailNotification === true;

      if (!name || !phone || !email) {
        return jsonResponse({ success: false, error: "Missing required fields." }, 400);
      }

      const body = [
        "New mailbox reservation request:",
        "",
        `Name:             ${name}`,
        company ? `Business/LLC:     ${company}` : null,
        `Phone:            ${phone}`,
        `Email:            ${email}`,
        "",
        `Mailbox Type:     ${mailboxType}`,
        `Rental Term:      ${term}`,
        `Mail Notification: ${mailNotification ? "Yes (+$1/month)" : "No"}`,
      ]
        .filter(Boolean)
        .join("\n");

      const sendResult = await sendViaResend(env, {
        from: env.RESEND_FROM_EMAIL,
        to: env.RESERVATION_TO_EMAIL || "mail@shippingwithpurpose.com",
        subject: `New Mailbox Reservation - ${name}`,
        text: body,
      });

      if (!sendResult.ok) {
        return jsonResponse({ success: false, error: sendResult.error }, sendResult.status);
      }

      return jsonResponse({ success: true });
    }

    // Print endpoint (multipart/form-data with attachments)
    if (request.method === "POST" && url.pathname === "/api/print-request") {
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("multipart/form-data")) {
        return jsonResponse({ success: false, error: "Content-Type must be multipart/form-data." }, 400);
      }

      let form;
      try {
        form = await request.formData();
      } catch (e) {
        return jsonResponse({ success: false, error: "Invalid form data." }, 400);
      }

      const name = sanitize(form.get("name"), 100);
      const printType = sanitize(form.get("printType"), 50);
      const instructions = sanitize(form.get("instructions"), 2000);
      const copies = sanitize(form.get("copies"), 20);

      const fileEntries = form.getAll("files").filter((v) => v instanceof File);
      if (!name || !fileEntries.length) {
        return jsonResponse({ success: false, error: "Missing required fields." }, 400);
      }

      let totalBytes = 0;
      const attachments = [];

      for (const file of fileEntries) {
        totalBytes += file.size;
        if (totalBytes > MAX_UPLOAD_BYTES) {
          return jsonResponse({ success: false, error: "Total upload size exceeds 25MB." }, 400);
        }

        const buf = await file.arrayBuffer();
        attachments.push({
          filename: sanitize(file.name, 255) || "attachment",
          content: arrayBufferToBase64(buf),
        });
      }

      const body = [
        "New print portal request:",
        "",
        `Name: ${name}`,
        `Print Type: ${printType || "N/A"}`,
        `Copies: ${copies || "N/A"}`,
        instructions ? `Instructions: ${instructions}` : null,
        `Files: ${attachments.map((f) => f.filename).join(", ")}`,
        `Total Upload Size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`,
      ]
        .filter(Boolean)
        .join("\n");

      const sendResult = await sendViaResend(env, {
        from: env.RESEND_FROM_EMAIL,
        to: env.PRINT_PORTAL_TO_EMAIL || "print@shippingwithpurpose.com",
        subject: `New Print Portal Request - ${name}`,
        text: body,
        attachments,
      });

      if (!sendResult.ok) {
        return jsonResponse({ success: false, error: sendResult.error }, sendResult.status);
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, error: "Not Found or Method Not Allowed" }, 404);
  },
};
