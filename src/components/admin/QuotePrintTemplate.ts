/**
 * Generates professional quotation HTML in 3 template styles and triggers print-to-PDF.
 */

export type QuoteTemplate = "modern" | "classic" | "creative";

export interface QuotePrintData {
  quoteNumber?: string;
  sourceOrderId?: string | null;
  sourceType?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  lineItems: Array<{
    item_description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total_price: number;
  }>;
  subtotal: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  taxType: string;
  taxPercent: number;
  taxAmount: number;
  total: number;
  notes: string;
  template?: QuoteTemplate;
}

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertChunk(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertChunk(n % 100) : "");
  }

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = Math.floor(num % 1000);

  let result = "";
  if (crore) result += convertChunk(crore) + " Crore ";
  if (lakh) result += convertChunk(lakh) + " Lakh ";
  if (thousand) result += convertChunk(thousand) + " Thousand ";
  if (remainder) result += convertChunk(remainder);

  return result.trim() + " Rupees Only";
}

function getSharedData(data: QuotePrintData) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" }).toUpperCase();
  const qNum = data.quoteNumber || `QT-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const totalInWords = numberToWords(Math.round(data.total));
  const discountLabel = data.discountType === "percent" ? `Discount (${data.discountValue}%)` : "Discount";
  const taxLabel = data.taxType === "vat" ? `VAT (${data.taxPercent}%)` : data.taxType === "gst" ? `GST (${data.taxPercent}%)` : `Tax (${data.taxPercent}%)`;

  const itemsHTML = data.lineItems.map((li, i) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;">${i + 1}. ${li.item_description}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;">${li.quantity} ${li.unit}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;">₹ ${li.unit_price.toLocaleString("en-IN")}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;">₹ ${li.total_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join("");

  const orderRef = data.sourceOrderId ? `Order Ref: #${data.sourceOrderId.substring(0, 8).toUpperCase()}` : "";

  return { dateStr, qNum, totalInWords, discountLabel, taxLabel, itemsHTML, orderRef };
}

function buildTerms(notes: string) {
  return `
    <h4>Terms and Conditions</h4>
    <ol>
      <li>Please pay within 15 days from the date of quotation; overdue interest @ 14% will be charged on delayed payments.</li>
      <li>Please quote the quotation number when remitting funds.</li>
      <li>This quotation is valid for 30 days from the date of issue.</li>
      <li>50% advance payment required to confirm the booking.</li>
    </ol>
    ${notes ? `<div style="margin-top:14px;"><h4>Additional Notes</h4><p>${notes}</p></div>` : ""}
  `;
}

function buildTotals(data: QuotePrintData, s: ReturnType<typeof getSharedData>) {
  return `
    <table style="width:100%;">
      <tr><td>Sub Total</td><td style="text-align:right;font-weight:600;">₹${data.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
      ${data.discountAmount > 0 ? `<tr class="discount"><td>${s.discountLabel}</td><td style="text-align:right;font-weight:600;">- ₹${data.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>` : ""}
      ${data.taxAmount > 0 ? `<tr><td>${s.taxLabel}</td><td style="text-align:right;font-weight:600;">₹${data.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>` : ""}
      <tr class="grand-total"><td>Total</td><td style="text-align:right;font-weight:800;">₹${data.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
    </table>
    <div class="words"><strong>Total (in words)</strong>${s.totalInWords}</div>
  `;
}

// ─── MODERN TEMPLATE (Orange accent, original design) ───
function modernTemplate(data: QuotePrintData): string {
  const s = getSharedData(data);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Quotation - ${s.qNum}</title>
<style>
@media print { body { margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; } .no-print { display:none !important; } }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Segoe UI',Arial,sans-serif; color:#333; background:#fff; padding:32px; max-width:850px; margin:0 auto; }
.header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
.logo-area h1 { font-size:28px; font-weight:800; color:#1a1a1a; }
.logo-area p { font-size:12px; color:#888; margin-top:2px; }
.quote-title { text-align:center; font-size:26px; font-weight:700; color:#e67e22; margin-bottom:20px; }
.meta-table { text-align:right; } .meta-table td { padding:3px 0; font-size:13px; }
.meta-table td:first-child { color:#888; padding-right:12px; } .meta-table td:last-child { font-weight:600; }
.parties { display:flex; gap:24px; margin-bottom:20px; }
.party-box { flex:1; background:#fef7f0; border-radius:8px; padding:16px; border-left:4px solid #e67e22; }
.party-box h3 { color:#e67e22; font-size:14px; margin-bottom:8px; font-weight:700; }
.party-box p { font-size:12px; line-height:1.6; } .party-box .label { font-weight:700; display:inline-block; width:50px; }
table.items { width:100%; border-collapse:collapse; margin-bottom:20px; }
table.items thead { background:#e67e22; color:#fff; }
table.items thead th { padding:10px 14px; text-align:left; font-size:13px; font-weight:600; }
table.items thead th:nth-child(2),table.items thead th:nth-child(3),table.items thead th:nth-child(4) { text-align:center; }
table.items thead th:last-child { text-align:right; }
table.items tbody td { font-size:13px; }
.bottom-section { display:flex; gap:32px; margin-top:8px; }
.terms { flex:1; } .terms h4 { color:#e67e22; font-size:14px; margin-bottom:8px; }
.terms ol,.terms p { font-size:11px; line-height:1.7; color:#555; } .terms ol { padding-left:18px; }
.totals { width:300px; } .totals td { padding:6px 0; font-size:13px; }
.discount td { color:#e67e22; }
.grand-total td { font-size:20px; font-weight:800; border-top:2px solid #333; padding-top:10px; }
.words { font-size:12px; margin-top:12px; color:#555; } .words strong { font-size:11px; color:#888; display:block; margin-bottom:2px; }
.footer { margin-top:32px; display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid #eee; padding-top:20px; }
.footer-contact { font-size:11px; color:#555; } .footer-contact strong { color:#333; }
.signature { text-align:center; font-size:12px; color:#888; }
.signature-line { width:150px; border-top:1px solid #999; margin:40px auto 6px; }
</style></head><body>
<div class="quote-title">Quotation</div>
<div class="header">
  <div class="logo-area"><h1>EVNTING</h1><p>Premium Event Management & Rentals</p></div>
  <table class="meta-table"><tr><td>Quotation #</td><td>${s.qNum}</td></tr><tr><td>Date</td><td>${s.dateStr}</td></tr>${s.orderRef ? `<tr><td>Order Ref</td><td>${s.orderRef}</td></tr>` : ""}</table>
</div>
<div class="parties">
  <div class="party-box"><h3>Quotation By</h3><p><strong>Evnting (Avens Events Pvt. Ltd.)</strong></p><p>Plot No. 123, Jubilee Hills<br>Hyderabad, Telangana - 500033</p><p style="margin-top:6px;"><span class="label">GSTIN</span> 36AABCA1234B1Z5</p><p><span class="label">PAN</span> AABCA1234B</p></div>
  <div class="party-box"><h3>Quotation To</h3><p><strong>${data.clientName}</strong></p>${data.clientEmail ? `<p>Email: ${data.clientEmail}</p>` : ""}${data.clientPhone ? `<p>Phone: ${data.clientPhone}</p>` : ""}</div>
</div>
<table class="items"><thead><tr><th>Item # / Description</th><th>Qty.</th><th>Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${s.itemsHTML}</tbody></table>
<div class="bottom-section">
  <div class="terms">${buildTerms(data.notes)}</div>
  <div class="totals">${buildTotals(data, s)}</div>
</div>
<div class="footer">
  <div class="footer-contact">For enquiries, email <strong>leads@avens.in</strong> or call <strong>+91 90000 00000</strong></div>
  <div class="signature"><div class="signature-line"></div>Authorized Signature</div>
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
}

// ─── CLASSIC TEMPLATE (Navy/Gold, serif, formal) ───
function classicTemplate(data: QuotePrintData): string {
  const s = getSharedData(data);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Quotation - ${s.qNum}</title>
<style>
@media print { body { margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Georgia,'Times New Roman',serif; color:#1a1a2e; background:#fff; padding:40px; max-width:850px; margin:0 auto; }
.header { border-bottom:3px double #c9a84c; padding-bottom:20px; margin-bottom:24px; display:flex; justify-content:space-between; }
.logo h1 { font-size:32px; color:#1a1a2e; letter-spacing:3px; } .logo p { font-size:11px; color:#777; letter-spacing:1px; }
.meta { text-align:right; font-size:13px; } .meta .label { color:#888; } .meta .value { font-weight:700; margin-left:8px; }
.quote-badge { text-align:center; margin-bottom:24px; } .quote-badge span { background:#1a1a2e; color:#c9a84c; padding:8px 32px; font-size:18px; letter-spacing:4px; font-weight:700; }
.parties { display:flex; gap:24px; margin-bottom:24px; }
.party { flex:1; border:1px solid #ddd; padding:16px; } .party h3 { font-size:12px; text-transform:uppercase; letter-spacing:2px; color:#c9a84c; border-bottom:1px solid #eee; padding-bottom:6px; margin-bottom:8px; } .party p { font-size:12px; line-height:1.7; }
table.items { width:100%; border-collapse:collapse; margin-bottom:24px; }
table.items thead th { background:#1a1a2e; color:#c9a84c; padding:10px 14px; font-size:12px; text-transform:uppercase; letter-spacing:1px; text-align:left; }
table.items thead th:nth-child(2),table.items thead th:nth-child(3),table.items thead th:nth-child(4) { text-align:center; }
table.items thead th:last-child { text-align:right; }
table.items tbody td { padding:10px 14px; border-bottom:1px solid #eee; font-size:13px; }
.bottom { display:flex; gap:32px; margin-top:8px; }
.terms { flex:1; } .terms h4 { font-size:13px; color:#1a1a2e; border-bottom:1px solid #c9a84c; padding-bottom:4px; margin-bottom:8px; }
.terms ol,.terms p { font-size:11px; line-height:1.7; color:#555; } .terms ol { padding-left:18px; }
.totals { width:300px; } .totals td { padding:6px 0; font-size:13px; }
.discount td { color:#c9a84c; }
.grand-total td { font-size:20px; font-weight:800; border-top:2px solid #1a1a2e; padding-top:10px; }
.words { font-size:12px; margin-top:12px; color:#555; } .words strong { font-size:11px; color:#888; display:block; margin-bottom:2px; }
.footer { margin-top:32px; border-top:3px double #c9a84c; padding-top:16px; display:flex; justify-content:space-between; }
.footer-contact { font-size:11px; color:#555; } .footer-contact strong { color:#1a1a2e; }
.sig { text-align:center; font-size:12px; color:#888; } .sig-line { width:150px; border-top:1px solid #1a1a2e; margin:40px auto 6px; }
</style></head><body>
<div class="header">
  <div class="logo"><h1>EVNTING</h1><p>Premium Event Management & Rentals</p></div>
  <div class="meta"><div><span class="label">Quotation:</span><span class="value">${s.qNum}</span></div><div><span class="label">Date:</span><span class="value">${s.dateStr}</span></div>${s.orderRef ? `<div><span class="label">${s.orderRef}</span></div>` : ""}</div>
</div>
<div class="quote-badge"><span>QUOTATION</span></div>
<div class="parties">
  <div class="party"><h3>From</h3><p><strong>Evnting (Avens Events Pvt. Ltd.)</strong><br>Plot No. 123, Jubilee Hills<br>Hyderabad, Telangana - 500033<br>GSTIN: 36AABCA1234B1Z5 | PAN: AABCA1234B</p></div>
  <div class="party"><h3>To</h3><p><strong>${data.clientName}</strong>${data.clientEmail ? `<br>Email: ${data.clientEmail}` : ""}${data.clientPhone ? `<br>Phone: ${data.clientPhone}` : ""}</p></div>
</div>
<table class="items"><thead><tr><th>Description</th><th>Qty.</th><th>Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${s.itemsHTML}</tbody></table>
<div class="bottom">
  <div class="terms">${buildTerms(data.notes)}</div>
  <div class="totals">${buildTotals(data, s)}</div>
</div>
<div class="footer">
  <div class="footer-contact">Email: <strong>leads@avens.in</strong> | Phone: <strong>+91 90000 00000</strong></div>
  <div class="sig"><div class="sig-line"></div>Authorized Signature</div>
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
}

// ─── CREATIVE TEMPLATE (Gradient, modern sans-serif, bold) ───
function creativeTemplate(data: QuotePrintData): string {
  const s = getSharedData(data);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Quotation - ${s.qNum}</title>
<style>
@media print { body { margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Helvetica Neue',Arial,sans-serif; color:#333; background:#fff; padding:0; max-width:850px; margin:0 auto; }
.hero { background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#fff; padding:32px 40px; display:flex; justify-content:space-between; align-items:center; }
.hero h1 { font-size:28px; font-weight:900; letter-spacing:2px; } .hero p { font-size:11px; opacity:.8; margin-top:2px; }
.hero-meta { text-align:right; font-size:13px; } .hero-meta div { margin-bottom:4px; } .hero-meta strong { font-size:15px; }
.content { padding:32px 40px; }
.parties { display:flex; gap:24px; margin-bottom:24px; }
.party-card { flex:1; background:#f8f9ff; border-radius:12px; padding:20px; border:1px solid #e8e8f8; }
.party-card h3 { color:#764ba2; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin-bottom:10px; font-weight:700; }
.party-card p { font-size:12px; line-height:1.7; }
table.items { width:100%; border-collapse:collapse; margin-bottom:24px; border-radius:8px; overflow:hidden; }
table.items thead th { background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; padding:12px 14px; font-size:12px; text-transform:uppercase; letter-spacing:1px; text-align:left; }
table.items thead th:nth-child(2),table.items thead th:nth-child(3),table.items thead th:nth-child(4) { text-align:center; }
table.items thead th:last-child { text-align:right; }
table.items tbody td { padding:10px 14px; border-bottom:1px solid #f0f0f0; font-size:13px; }
table.items tbody tr:nth-child(even) { background:#fafafe; }
.bottom { display:flex; gap:32px; margin-top:8px; }
.terms { flex:1; } .terms h4 { font-size:13px; color:#764ba2; margin-bottom:8px; }
.terms ol,.terms p { font-size:11px; line-height:1.7; color:#555; } .terms ol { padding-left:18px; }
.totals { width:300px; } .totals td { padding:6px 0; font-size:13px; }
.discount td { color:#764ba2; }
.grand-total td { font-size:20px; font-weight:800; border-top:2px solid #764ba2; padding-top:10px; color:#764ba2; }
.words { font-size:12px; margin-top:12px; color:#555; } .words strong { font-size:11px; color:#888; display:block; margin-bottom:2px; }
.footer { margin-top:32px; background:#f8f9ff; padding:20px 40px; display:flex; justify-content:space-between; align-items:flex-end; }
.footer-contact { font-size:11px; color:#555; } .footer-contact strong { color:#333; }
.sig { text-align:center; font-size:12px; color:#888; } .sig-line { width:150px; border-top:1px solid #764ba2; margin:40px auto 6px; }
</style></head><body>
<div class="hero">
  <div><h1>EVNTING</h1><p>Premium Event Management & Rentals</p></div>
  <div class="hero-meta"><div>Quotation <strong>#${s.qNum}</strong></div><div>${s.dateStr}</div>${s.orderRef ? `<div style="font-size:12px;opacity:.9;">${s.orderRef}</div>` : ""}</div>
</div>
<div class="content">
  <div class="parties">
    <div class="party-card"><h3>From</h3><p><strong>Evnting (Avens Events Pvt. Ltd.)</strong><br>Plot No. 123, Jubilee Hills<br>Hyderabad, Telangana - 500033<br>GSTIN: 36AABCA1234B1Z5</p></div>
    <div class="party-card"><h3>To</h3><p><strong>${data.clientName}</strong>${data.clientEmail ? `<br>${data.clientEmail}` : ""}${data.clientPhone ? `<br>${data.clientPhone}` : ""}</p></div>
  </div>
  <table class="items"><thead><tr><th>Description</th><th>Qty.</th><th>Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${s.itemsHTML}</tbody></table>
  <div class="bottom">
    <div class="terms">${buildTerms(data.notes)}</div>
    <div class="totals">${buildTotals(data, s)}</div>
  </div>
</div>
<div class="footer">
  <div class="footer-contact">Email: <strong>leads@avens.in</strong> | Phone: <strong>+91 90000 00000</strong></div>
  <div class="sig"><div class="sig-line"></div>Authorized Signature</div>
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
}

export function downloadQuoteAsPDF(data: QuotePrintData) {
  // Backwards compatibility: map old gstPercent/gstAmount fields
  const normalizedData: QuotePrintData = {
    ...data,
    taxType: data.taxType || "gst",
    taxPercent: data.taxPercent ?? (data as any).gstPercent ?? 18,
    taxAmount: data.taxAmount ?? (data as any).gstAmount ?? 0,
  };

  const template = normalizedData.template || "modern";
  let html: string;
  switch (template) {
    case "classic": html = classicTemplate(normalizedData); break;
    case "creative": html = creativeTemplate(normalizedData); break;
    default: html = modernTemplate(normalizedData);
  }

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
