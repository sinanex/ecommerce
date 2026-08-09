/**
 * Utility functions for printing order documents.
 */

function openPrintFrame(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
  }
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 15000);
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  let numStr = num.toString();
  if (numStr.length > 9) return 'Overflow';
  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += (n[1] != '00') ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += (n[2] != '00') ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += (n[3] != '00') ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += (n[4] != '0') ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';

  return str.trim();
}

export function printInvoice(order: any, orderNumber: string): void {
  const orderIdStr = orderNumber.toUpperCase();
  const paymentType = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid';
  const totalAmount = order.totalAmount.toFixed(2);
  const amountInWords = numberToWords(Math.round(order.totalAmount)) + ' Rupees Only';
  const trackingId = order.trackingId || '';
  const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Shipping Label - ${orderIdStr}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    font-family: "Helvetica Neue", Arial, sans-serif;
    color: #1a1a1a;
  }
  @media print {
    body { padding: 0; margin: 0; background: #fff; }
    .page-container { 
      border: 2px solid #000 !important; 
      margin: 0 auto !important; 
      width: 100% !important; 
      min-height: 98vh !important;
      max-width: 100% !important; 
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
    }
    @page { size: 3.875in 7.5in; margin: 2mm; }
  }
</style>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
</head>
<body>
  <div class="page-container" style="width: 100%; max-width: 560px; background: #fff; border: 1.5px solid #1a1a1a; border-radius: 2px; margin: 20px auto; display: flex; flex-direction: column;">
    <div style="padding: 22px 26px 18px 26px; display: flex; flex-direction: column; flex-grow: 1;">
      <!-- Header -->
      <div style="display: flex; align-items: center; min-height: 34px;">
        <img src="${window.location.origin}/logo.png" alt="KITBAY Logo" style="max-height: 28px; width: auto;" onerror="this.style.display='none'" />
      </div>
      <hr style="border: none; border-top: 1px solid #d8d8d8; margin: 14px 0;" />

      <!-- Ship to + payment info -->
      <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px;">
        <div>
          <p style="margin: 2px 0; font-size: 15px; line-height: 1.35;">
            Ship to - <strong style="text-transform: uppercase;">${order.shippingAddress?.name || ''}</strong>
          </p>
          <p style="margin: 2px 0; font-size: 12.5px; color: #333;">
            ${order.shippingAddress?.address || ''}
          </p>
          <p style="margin: 2px 0; font-weight: 700; font-size: 14px;">
            ${order.shippingAddress?.locality || ''}
          </p>
          <p style="margin: 2px 0; font-weight: 700; font-size: 14px;">
            ${order.shippingAddress?.city || ''}_${order.shippingAddress?.state || ''}
          </p>
          <p style="margin: 2px 0; font-weight: 700; font-size: 14px;">
            PIN - ${order.shippingAddress?.pincode || ''}
          </p>
        </div>

        <div style="border-left: 1px solid #d8d8d8; padding-left: 16px;">
          <p style="margin: 2px 0; font-size: 12.5px; color: #333;">${paymentType} - Surface</p>
          <p style="margin: 2px 0; font-weight: 700; font-size: 15px;">INR ${totalAmount}</p>
          <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 600; color: #333; line-height: 1.2;">(${amountInWords})</p>
          <p style="margin: 12px 0 2px 0; font-size: 12.5px; color: #333;">Date</p>
          <p style="margin: 2px 0; font-size: 12.5px;">${orderDate}</p>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #d8d8d8; margin: 14px 0;" />

      <!-- Seller + package barcode -->
      <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px;">
        <div style="display: flex; flex-direction: column; justify-content: center;">
          <p style="margin: 2px 0; font-size: 12.5px; color: #333;">
            Seller:<strong style="margin-left: 4px; color: #1a1a1a;">KITBAY</strong>
          </p>
          <p style="margin: 2px 0; font-size: 11.5px; color: #444;">
            Manjerithodi House, Mongam, kerala, 673642 , Mongam, Kerala, India, 673642
          </p>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center; padding-left: 16px; border-left: 1px solid #d8d8d8;">
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <div style="display: flex; align-items: flex-end; height: 46px;">
              <svg id="barcode" style="max-width:100%; height:46px;"></svg>
            </div>
            <div style="margin-top: 4px; font-size: 13px; font-weight: 600; letter-spacing: 1px;">
              ${orderIdStr}
            </div>
          </div>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #d8d8d8; margin: 14px 0;" />

      <!-- Product table -->
      <div style="font-size: 12.5px;">
        <div style="display: grid; grid-template-columns: 2.2fr 0.7fr 0.8fr 0.8fr; gap: 8px; font-weight: 600; margin-bottom: 6px;">
          <span>Product Name &amp; SKU</span>
          <span style="text-align: right;">Qty.</span>
          <span style="text-align: right;">Price</span>
          <span style="text-align: right;">Total</span>
        </div>
        ${order.items.map((item: any) => `
        <div style="display: grid; grid-template-columns: 2.2fr 0.7fr 0.8fr 0.8fr; gap: 8px; margin-bottom: 4px;">
          <span>${item.name}</span>
          <span style="text-align: right;">${item.quantity}</span>
          <span style="text-align: right;">${Number(item.price).toFixed(2)}</span>
          <span style="text-align: right;">${(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
        </div>
        <div style="display: grid; grid-template-columns: 2.2fr 0.7fr 0.8fr 0.8fr; gap: 8px; color: #444; font-size: 11.5px; margin-bottom: 12px;">
          <span>SKU:${item.size}</span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        `).join('')}
      </div>

      <div style="flex-grow: 1;"></div>
      <hr style="border: none; border-top: 1px solid #d8d8d8; margin: 14px 0;" />

      <!-- Footer -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 12px;">
        <p style="margin: 2px 0; font-size: 11.5px; color: #444; max-width: 420px;">
          Return Address: Afnan pk 6 yard, metro square manjeri opposite Ksfe manjeri 676121
          8590394491 , Manjeri, Kerala, India, 676121
        </p>
        <span style="font-size: 11.5px; color: #444; white-space: nowrap;">
          Page 1 of 1
        </span>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      try {
        JsBarcode("#barcode", "${orderIdStr}", {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: false,
          margin: 0
        });
      } catch(e) {}
      setTimeout(function() {
        window.focus();
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  openPrintFrame(html);
}
