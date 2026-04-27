/**
 * emailService.ts — sends contact form emails via Resend.
 *
 * Why Resend?
 * It's the simplest modern email API — one npm package, one API key, done.
 * Alternatives: SendGrid, AWS SES, Nodemailer with Gmail SMTP.
 * The pattern is the same for all of them: build the email object, call send().
 *
 * Setup:
 *   1. Sign up at https://resend.com (free tier = 3,000 emails/month)
 *   2. Add your domain and verify it (follow their DNS guide)
 *   3. Copy your API key → add RESEND_API_KEY to .env
 *   4. Set CONTACT_TO_EMAIL to the address that should receive messages
 *
 * If RESEND_API_KEY is not set, emails are logged to the console instead
 * (safe for local development — you can still test the form).
 */

export interface ContactEmailInput {
  name:    string;
  email:   string;
  subject: string;
  message: string;
}

export async function sendContactEmail(input: ContactEmailInput): Promise<void> {
  const apiKey   = process.env.RESEND_API_KEY;
  const toEmail  = process.env.CONTACT_TO_EMAIL || 'sammie@example.com';
  const fromName = 'Meet HaSammie Suah — Contact Form';
  const fromAddr = process.env.CONTACT_FROM_EMAIL || 'noreply@meethasammiesuah.com';

  // ── Dev mode: just log ──────────────────────────────────────────────────────
  if (!apiKey) {
    console.log('\n📧  [DEV] Contact form submission (not sent — RESEND_API_KEY not set):');
    console.log('  From:   ', input.name, `<${input.email}>`);
    console.log('  Subject:', input.subject);
    console.log('  Message:', input.message);
    console.log('');
    return;
  }

  // ── Production: send via Resend API ────────────────────────────────────────
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0F1A08;padding:24px;border-radius:12px 12px 0 0">
        <h2 style="color:#D4AF37;margin:0;font-size:20px">New contact form message</h2>
        <p style="color:#F5F0E8;opacity:0.6;margin:4px 0 0;font-size:13px">
          meethasammiesuah.com
        </p>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;color:#666;font-size:13px;width:80px">From</td>
            <td style="padding:8px 0;font-weight:500">${input.name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#666;font-size:13px">Email</td>
            <td style="padding:8px 0">
              <a href="mailto:${input.email}" style="color:#0F6E56">${input.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#666;font-size:13px">Subject</td>
            <td style="padding:8px 0;font-weight:500">${input.subject}</td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0" />
        <p style="color:#333;line-height:1.7;white-space:pre-wrap">${input.message}</p>
      </div>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from:    `${fromName} <${fromAddr}>`,
      to:      [toEmail],
      replyTo: input.email,           // hitting Reply goes straight to the sender
      subject: `[Contact] ${input.subject} — from ${input.name}`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}
