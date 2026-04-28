const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP config on startup (non-blocking)
transporter.verify((err) => {
  if (err) {
    console.warn(
      "[Email] ⚠ SMTP connection failed:",
      err.message,
      "\n  → Gmail requires an App Password (not your regular password).",
      "\n  → Enable 2-Step Verification at https://myaccount.google.com/security",
      "\n  → Then create an App Password at https://myaccount.google.com/apppasswords",
      "\n  → Update SMTP_PASS in backend/.env with the 16-character App Password",
    );
  } else {
    console.log("[Email] ✅ SMTP connection verified — ready to send");
  }
});

const FROM = `"${process.env.FROM_NAME || "KMK Hall & Banquets"}" <${process.env.SMTP_USER}>`;
// Support comma-separated list of internal recipients
const INTERNAL = process.env.INTERNAL_EMAIL
  ? process.env.INTERNAL_EMAIL.split(",")
      .map((e) => e.trim())
      .filter(Boolean)
  : [];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function baseLayout(title, bodyHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#a78bfa);padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">KMK Hall &amp; Banquets</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">${title}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:36px 40px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1e1b4b;padding:20px 40px;border-radius:0 0 12px 12px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">
              KMK Hall &amp; Banquets &bull; This is an automated notification
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function statusBadge(status) {
  const map = {
    confirmed: { bg: "#dbeafe", color: "#1e40af", label: "CONFIRMED" },
    completed: { bg: "#d1fae5", color: "#065f46", label: "COMPLETED" },
    cancelled: { bg: "#fee2e2", color: "#991b1b", label: "CANCELLED" },
    draft: { bg: "#fef3c7", color: "#92400e", label: "DRAFT" },
  };
  const s = map[status] || {
    bg: "#f3f4f6",
    color: "#374151",
    label: status.toUpperCase(),
  };
  return `<span style="display:inline-block;padding:4px 14px;border-radius:20px;background:${s.bg};color:${s.color};font-weight:700;font-size:13px;">${s.label}</span>`;
}

function infoRow(label, value) {
  if (value === undefined || value === null || value === "") return "";
  return `
    <tr>
      <td style="padding:9px 14px;font-size:14px;color:#6b7280;font-weight:500;width:38%;border-bottom:1px solid #f3f4f6;vertical-align:top;">${label}</td>
      <td style="padding:9px 14px;font-size:14px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">${value}</td>
    </tr>`;
}

function sectionHeader(title) {
  return `
    <tr style="background:#f9fafb;">
      <td colspan="2" style="padding:11px 14px;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.07em;">${title}</td>
    </tr>`;
}

// Full booking details table for internal email
function fullBookingHtml(booking) {
  const p = booking.pricing || {};
  const e = booking.eventDetails || {};
  const c = booking.customer || {};

  // Packages & items section
  const packagesHtml = (booking.packages || [])
    .map((pkg) => {
      const itemRows = (pkg.items || [])
        .map(
          (item) => `
      <tr>
        <td style="padding:7px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f9fafb;">${item.itemName || "—"}</td>
        <td style="padding:7px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f9fafb;">${item.category || "—"}</td>
        <td style="padding:7px 12px;font-size:13px;color:#374151;text-align:center;border-bottom:1px solid #f9fafb;">${item.quantity || 1}</td>
        <td style="padding:7px 12px;font-size:13px;color:#374151;text-align:right;border-bottom:1px solid #f9fafb;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding:7px 12px;font-size:13px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #f9fafb;">${formatCurrency(item.totalPrice)}</td>
      </tr>`,
        )
        .join("");

      return `
      <tr><td colspan="2" style="padding:0 0 8px;">
        <p style="margin:16px 0 6px;font-size:14px;font-weight:700;color:#7c3aed;">${pkg.packageName || "Package"}${pkg.packageCategory ? ` <span style="font-weight:400;color:#6b7280;">(${pkg.packageCategory})</span>` : ""}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:left;font-weight:600;">Item</th>
              <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:left;font-weight:600;">Category</th>
              <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:center;font-weight:600;">Qty</th>
              <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:right;font-weight:600;">Unit Price</th>
              <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:right;font-weight:600;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows || '<tr><td colspan="5" style="padding:10px 12px;color:#9ca3af;font-size:13px;">No items</td></tr>'}</tbody>
        </table>
      </td></tr>`;
    })
    .join("");

  // Payment history section
  const payHistoryRows = (booking.paymentHistory || [])
    .slice()
    .reverse()
    .map(
      (ph) => `
    <tr>
      <td style="padding:7px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f9fafb;">${formatDate(ph.paymentDate)}</td>
      <td style="padding:7px 12px;font-size:13px;font-weight:700;color:#059669;border-bottom:1px solid #f9fafb;">${formatCurrency(ph.amount)}</td>
      <td style="padding:7px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f9fafb;">${(ph.paymentMethod || "").replace("_", " ").toUpperCase()}</td>
      <td style="padding:7px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f9fafb;">${ph.transactionId || "—"}</td>
      <td style="padding:7px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f9fafb;">${ph.notes || "—"}</td>
    </tr>`,
    )
    .join("");

  const payHistoryHtml =
    booking.paymentHistory && booking.paymentHistory.length > 0
      ? `
    <tr><td colspan="2" style="padding:0 0 8px;">
      <p style="margin:16px 0 6px;font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">Payment History</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:left;font-weight:600;">Date</th>
            <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:left;font-weight:600;">Amount</th>
            <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:left;font-weight:600;">Method</th>
            <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:left;font-weight:600;">Transaction ID</th>
            <th style="padding:8px 12px;font-size:12px;color:#374151;text-align:left;font-weight:600;">Notes</th>
          </tr>
        </thead>
        <tbody>${payHistoryRows}</tbody>
      </table>
    </td></tr>`
      : "";

  const mainRows = [
    sectionHeader("Customer"),
    infoRow("Name", c.name),
    infoRow("Phone", c.phone),
    infoRow("Email", c.email || "—"),
    sectionHeader("Event"),
    infoRow("Event Date", formatDate(e.eventDate)),
    infoRow("Event Type", e.eventType),
    infoRow("Venue", e.venue),
    infoRow("Guest Count", e.guestCount),
    e.additionalInfo ? infoRow("Additional Info", e.additionalInfo) : "",
    sectionHeader("Pricing"),
    infoRow("Subtotal", formatCurrency(p.subtotal)),
    p.discountAmount > 0
      ? infoRow("Discount", `−${formatCurrency(p.discountAmount)}`)
      : "",
    infoRow(
      "Tax (GST)",
      `${formatCurrency(p.tax)} (${p.taxPercentage || 18}%)`,
    ),
    infoRow("Package Total", formatCurrency(p.totalAmount)),
    infoRow(
      "Final Agreed Price",
      p.finalPrice != null
        ? formatCurrency(p.finalPrice)
        : "<span style='color:#f59e0b;font-weight:600;'>Not set</span>",
    ),
    infoRow(
      "Amount Paid",
      `<span style="color:#059669;">${formatCurrency(p.initialPayment)}</span>`,
    ),
    infoRow(
      "Pending Amount",
      `<span style="color:#dc2626;font-weight:700;">${formatCurrency(p.pendingPayment ?? (p.finalPrice ?? p.totalAmount ?? 0) - (p.initialPayment ?? 0))}</span>`,
    ),
    booking.notes
      ? sectionHeader("Notes") + infoRow("Notes", booking.notes)
      : "",
  ].join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-top:16px;">
      <tbody>
        ${mainRows}
        ${booking.packages && booking.packages.length > 0 ? sectionHeader("Packages & Items") : ""}
        ${packagesHtml}
        ${payHistoryHtml}
      </tbody>
    </table>`;
}

// Compact table for customer email (no internal pricing details)
function customerBookingTable(booking) {
  const rows = [
    ["Booking #", booking.bookingNumber],
    ["Event Date", formatDate(booking.eventDetails?.eventDate)],
    ["Event Type", booking.eventDetails?.eventType],
    ["Venue", booking.eventDetails?.venue],
    ["Guest Count", booking.eventDetails?.guestCount],
    [
      "Final Price",
      booking.pricing?.finalPrice != null
        ? formatCurrency(booking.pricing.finalPrice)
        : formatCurrency(booking.pricing?.totalAmount),
    ],
    ["Amount Paid", formatCurrency(booking.pricing?.initialPayment)],
    [
      "Pending Amount",
      formatCurrency(
        (booking.pricing?.finalPrice ?? booking.pricing?.totalAmount ?? 0) -
          (booking.pricing?.initialPayment ?? 0),
      ),
    ],
  ];

  const rowsHtml = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 14px;font-size:14px;color:#6b7280;font-weight:500;width:40%;border-bottom:1px solid #f3f4f6;">${label}</td>
        <td style="padding:10px 14px;font-size:14px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">${value}</td>
      </tr>`,
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-top:20px;">
      <thead>
        <tr style="background:#f9fafb;">
          <td colspan="2" style="padding:12px 14px;font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">Booking Summary</td>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`;
}

// ─── Internal Notification ────────────────────────────────────────────────────

function buildInternalEmail(booking, newStatus, previousStatus) {
  const subject = `[KMK] Booking ${booking.bookingNumber} → ${newStatus.toUpperCase()}`;
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827;">
      Booking Status Changed
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
      Status updated from ${statusBadge(previousStatus)} &nbsp;→&nbsp; ${statusBadge(newStatus)}
    </p>
    ${fullBookingHtml(booking)}
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
      Updated at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
    </p>`;

  return { subject, html: baseLayout(subject, body) };
}

// ─── Customer Confirmation ────────────────────────────────────────────────────

function buildCustomerEmail(booking, newStatus) {
  const messages = {
    confirmed: {
      title: "Your Booking is Confirmed! 🎉",
      intro: `Dear <strong>${booking.customer?.name}</strong>,<br/><br/>
        We are delighted to confirm your booking with <strong>KMK Hall &amp; Banquets</strong>.
        We look forward to making your event truly special.`,
      note: "If you have any questions, please don't hesitate to contact us.",
    },
    completed: {
      title: "Thank You for Choosing KMK Hall & Banquets",
      intro: `Dear <strong>${booking.customer?.name}</strong>,<br/><br/>
        Thank you for celebrating with us. We hope your event was a wonderful experience
        and we'd love to serve you again!`,
      note: "We would appreciate your feedback to help us serve you better.",
    },
    cancelled: {
      title: "Booking Cancellation Notice",
      intro: `Dear <strong>${booking.customer?.name}</strong>,<br/><br/>
        We regret to inform you that your booking with KMK Hall &amp; Banquets
        has been cancelled. We apologize for any inconvenience caused.`,
      note: "Please contact us if you have any questions or wish to rebook.",
    },
  };

  const msg = messages[newStatus] || messages["confirmed"];
  const subject = `${msg.title} — Booking ${booking.bookingNumber}`;

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
      ${msg.intro}
    </p>
    ${customerBookingTable(booking)}
    <p style="margin:24px 0 0;font-size:14px;color:#374151;line-height:1.6;">
      ${msg.note}
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;">
      KMK Hall &amp; Banquets Team
    </p>`;

  return { subject, html: baseLayout(msg.title, body) };
}

// ─── Send Functions ───────────────────────────────────────────────────────────

/**
 * Send internal team notification on any status change.
 */
async function sendInternalNotification(booking, newStatus, previousStatus) {
  if (!INTERNAL.length) return;
  const { subject, html } = buildInternalEmail(
    booking,
    newStatus,
    previousStatus,
  );
  try {
    await transporter.sendMail({
      from: FROM,
      to: INTERNAL.join(", "),
      subject,
      html,
    });
    console.log(
      `[Email] Internal notification sent → ${INTERNAL.join(", ")} (${newStatus})`,
    );
  } catch (err) {
    console.error("[Email] Failed to send internal notification:", err.message);
  }
}

/**
 * Send customer notification. Only sent if customer has an email address.
 */
async function sendCustomerNotification(booking, newStatus) {
  const customerEmail = booking.customer?.email;
  if (!customerEmail) {
    console.log("[Email] No customer email — skipping customer notification");
    return;
  }
  const { subject, html } = buildCustomerEmail(booking, newStatus);
  try {
    await transporter.sendMail({
      from: FROM,
      to: customerEmail,
      subject,
      html,
    });
    // Also BCC internal so team has record
    console.log(
      `[Email] Customer notification sent → ${customerEmail} (${newStatus})`,
    );
  } catch (err) {
    console.error("[Email] Failed to send customer notification:", err.message);
  }
}

module.exports = { sendInternalNotification, sendCustomerNotification };
