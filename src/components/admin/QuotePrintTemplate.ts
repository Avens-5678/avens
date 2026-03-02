/**
 * Generates a professional quotation HTML and triggers download via print-to-PDF.
 */

interface QuotePrintData {
  quoteNumber?: string;
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
  gstPercent: number;
  gstAmount: number;
  total: number;
  notes: string;
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

export function downloadQuoteAsPDF(data: QuotePrintData) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" }).toUpperCase();
  const qNum = data.quoteNumber || `QT-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const totalInWords = numberToWords(Math.round(data.total));

  const discountLabel = data.discountType === "percent"
    ? `Discount (${data.discountValue}%)`
    : "Discount";

  const itemsHTML = data.lineItems.map((li, i) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;">${i + 1}. ${li.item_description}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;">${li.quantity} ${li.unit}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;">₹ ${li.unit_price.toLocaleString("en-IN")}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;">₹ ${li.total_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quotation - ${qNum}</title>
  <style>
    @media print {
      body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; background: #fff; padding: 32px; max-width: 850px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .logo-area h1 { font-size: 28px; font-weight: 800; color: #1a1a1a; }
    .logo-area p { font-size: 12px; color: #888; margin-top: 2px; }
    .quote-title { text-align: center; font-size: 26px; font-weight: 700; color: #e67e22; margin-bottom: 20px; }
    .meta-table { text-align: right; }
    .meta-table td { padding: 3px 0; font-size: 13px; }
    .meta-table td:first-child { color: #888; padding-right: 12px; }
    .meta-table td:last-child { font-weight: 600; }
    .parties { display: flex; gap: 24px; margin-bottom: 20px; }
    .party-box { flex: 1; background: #fef7f0; border-radius: 8px; padding: 16px; border-left: 4px solid #e67e22; }
    .party-box h3 { color: #e67e22; font-size: 14px; margin-bottom: 8px; font-weight: 700; }
    .party-box p { font-size: 12px; line-height: 1.6; }
    .party-box .label { font-weight: 700; display: inline-block; width: 50px; }
    .supply-row { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 8px; background: #f9f9f9; border-radius: 6px; font-size: 13px; }
    .supply-row span { color: #888; }
    .supply-row strong { margin-left: 8px; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    table.items thead { background: #e67e22; color: #fff; }
    table.items thead th { padding: 10px 14px; text-align: left; font-size: 13px; font-weight: 600; }
    table.items thead th:nth-child(2),
    table.items thead th:nth-child(3),
    table.items thead th:nth-child(4) { text-align: center; }
    table.items thead th:last-child { text-align: right; }
    table.items tbody td { font-size: 13px; }
    .bottom-section { display: flex; gap: 32px; margin-top: 8px; }
    .terms { flex: 1; }
    .terms h4 { color: #e67e22; font-size: 14px; margin-bottom: 8px; }
    .terms ol, .terms p { font-size: 11px; line-height: 1.7; color: #555; }
    .terms ol { padding-left: 18px; }
    .totals { width: 300px; }
    .totals table { width: 100%; }
    .totals td { padding: 6px 0; font-size: 13px; }
    .totals td:last-child { text-align: right; font-weight: 600; }
    .totals .discount td { color: #e67e22; }
    .totals .grand-total td { font-size: 20px; font-weight: 800; border-top: 2px solid #333; padding-top: 10px; }
    .words { font-size: 12px; margin-top: 12px; color: #555; }
    .words strong { font-size: 11px; color: #888; display: block; margin-bottom: 2px; }
    .footer { margin-top: 32px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #eee; padding-top: 20px; }
    .footer-contact { font-size: 11px; color: #555; }
    .footer-contact strong { color: #333; }
    .signature { text-align: center; font-size: 12px; color: #888; }
    .signature-line { width: 150px; border-top: 1px solid #999; margin: 40px auto 6px; }
  </style>
</head>
<body>
  <div class="quote-title">Quotation</div>

  <div class="header">
    <div class="logo-area">
      <h1>EVNTING</h1>
      <p>Premium Event Management & Rentals</p>
    </div>
    <table class="meta-table">
      <tr><td>Quotation #</td><td>${qNum}</td></tr>
      <tr><td>Date</td><td>${dateStr}</td></tr>
    </table>
  </div>

  <div class="parties">
    <div class="party-box">
      <h3>Quotation By</h3>
      <p><strong>Evnting (Avens Events Pvt. Ltd.)</strong></p>
      <p>Plot No. 123, Jubilee Hills<br>Hyderabad, Telangana - 500033</p>
      <p style="margin-top:6px;"><span class="label">GSTIN</span> 36AABCA1234B1Z5</p>
      <p><span class="label">PAN</span> AABCA1234B</p>
    </div>
    <div class="party-box">
      <h3>Quotation To</h3>
      <p><strong>${data.clientName}</strong></p>
      ${data.clientEmail ? `<p>Email: ${data.clientEmail}</p>` : ""}
      ${data.clientPhone ? `<p>Phone: ${data.clientPhone}</p>` : ""}
    </div>
  </div>

  <div class="supply-row">
    <div><span>Place of Supply</span><strong>Telangana</strong></div>
    <div><span>Country of Supply</span><strong>India</strong></div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Item # / Item Description</th>
        <th>Qty.</th>
        <th>Rate</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <div class="bottom-section">
    <div class="terms">
      <h4>Terms and Conditions</h4>
      <ol>
        <li>Please pay within 15 days from the date of quotation; overdue interest @ 14% will be charged on delayed payments.</li>
        <li>Please quote the quotation number when remitting funds.</li>
        <li>This quotation is valid for 30 days from the date of issue.</li>
        <li>50% advance payment required to confirm the booking.</li>
      </ol>
      ${data.notes ? `<div style="margin-top:14px;"><h4>Additional Notes</h4><p>${data.notes}</p></div>` : ""}
    </div>
    <div class="totals">
      <table>
        <tr><td>Sub Total</td><td>₹${data.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
        ${data.discountAmount > 0 ? `<tr class="discount"><td>${discountLabel}</td><td>- ₹${data.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>` : ""}
        ${data.gstAmount > 0 ? `<tr><td>GST (${data.gstPercent}%)</td><td>₹${data.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>` : ""}
        <tr class="grand-total"><td>Total</td><td>₹${data.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td></tr>
      </table>
      <div class="words">
        <strong>Invoice Total (in words)</strong>
        ${totalInWords}
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-contact">
      For any enquiries, email us at <strong>leads@avens.in</strong> or<br>
      call us on <strong>+91 90000 00000</strong>
    </div>
    <div class="signature">
      <div class="signature-line"></div>
      Authorized Signature
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
