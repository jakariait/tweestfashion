import { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getVariantDisplayName } from '../../utils/variantDisplay.js';
import { Loader2, Plus, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAYMENT_STATUS_META = {
  unpaid: {
    label: 'Unpaid',
    className:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
  },
  paid: {
    label: 'Paid',
    className:
      'border-green-200 bg-green-50 text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-300',
  },
};

const PAYMENT_METHOD_TEXT = {
  cash_on_delivery: 'Cash on Delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
  card: 'Card',
};

const DELIVERY_METHOD_TEXT = {
  home_delivery: 'Home Delivery',
};

const getPaymentStatusMeta = (status) =>
  PAYMENT_STATUS_META[status] ?? {
    label: 'Unknown',
    className: 'border-border bg-muted text-muted-foreground',
  };

const getPaymentMethodText = (method) =>
  PAYMENT_METHOD_TEXT[method] ?? 'Unknown Method';

const getDeliveryMethodText = (method) =>
  DELIVERY_METHOD_TEXT[method] ?? 'Unknown Method';

const formatMoney = (value) =>
  Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getFirstValue = (value) =>
  Array.isArray(value) ? value.find(Boolean) : value;

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) => HTML_ENTITIES[character],
  );

const getImageUrl = (imageName) => {
  if (typeof imageName !== 'string' || !imageName) return '';
  if (imageName.startsWith('blob:') || imageName.startsWith('data:')) {
    return imageName;
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? '';
  return `${apiUrl.replace('/api', '')}/uploads/${imageName}`;
};

// Combo selections keep their own thumbnail, but older orders (or freshly
// populated selections) may only carry the product id — resolve the image
// from the populated product, preferring the selected variant's image.
const getComboSelectionImage = (selection) => {
  if (!selection) return '';
  const product =
    selection.productId && typeof selection.productId === 'object'
      ? selection.productId
      : null;
  const variant = product?.variants?.find(
    (item) => String(item._id) === String(selection.variantId),
  );

  return (
    selection.thumbnailImage || variant?.image || product?.thumbnailImage || ''
  );
};

const InvoiceSectionHeading = ({ id, children, className }) => (
  <h2
    id={id}
    className={cn(
      'flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
      className,
    )}
  >
    <span
      className="h-3.5 w-0.5 shrink-0 rounded-full bg-primary"
      aria-hidden="true"
    />
    {children}
  </h2>
);

const MetaRow = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 md:justify-end md:gap-3">
    <dt className="shrink-0 text-muted-foreground">{label}</dt>
    <dd className="break-words text-right font-medium text-foreground">
      {value}
    </dd>
  </div>
);

const SummaryRow = ({
  label,
  value,
  emphasis = false,
  destructive = false,
  highlight = false,
}) => (
  <div className="flex items-baseline justify-between gap-4">
    <dt
      className={cn(
        'text-muted-foreground',
        destructive && 'text-destructive',
        (emphasis || highlight) && 'font-medium text-foreground',
      )}
    >
      {label}
    </dt>
    <dd
      className={cn(
        'tabular-nums',
        highlight
          ? 'text-lg font-semibold'
          : emphasis
            ? 'text-base font-semibold'
            : 'font-medium',
        destructive && 'text-destructive',
      )}
    >
      {value}
    </dd>
  </div>
);

const OrderInvoice = forwardRef(function OrderInvoice(
  {
    order,
    isEditMode,
    saving,
    generalInfo,
    orderStatusMeta,
    onShippingInfoChange,
    onBillingInfoChange,
    onItemQuantityChange,
    onRemoveItem,
    onSave,
    onCancel,
    onAddProduct,
  },
  ref,
) {
  const paymentStatus = getPaymentStatusMeta(order.paymentStatus);
  const items = useMemo(() => order.items ?? [], [order.items]);
  const itemCount = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );
  const columnCount = isEditMode ? 8 : 7;

  const handlePrint = useCallback(() => {
    const companyName = escapeHtml(generalInfo?.CompanyName || 'Company');
    const companyPhone = escapeHtml(
      getFirstValue(generalInfo?.PhoneNumber) || '',
    );
    const companyEmail = escapeHtml(
      getFirstValue(generalInfo?.CompanyEmail) || '',
    );
    const companyAddress = escapeHtml(generalInfo?.CompanyAddress || '');
    const companyContact = [companyPhone, companyEmail]
      .filter(Boolean)
      .join(' · ');
    const logoUrl = getImageUrl(generalInfo?.PrimaryLogo);
    const orderNo = escapeHtml(order?.orderNo ?? 'N/A');
    const orderDate = formatDate(order?.orderDate);
    const statusLabel = escapeHtml(orderStatusMeta?.label || 'Unknown');
    const paymentLabel = escapeHtml(paymentStatus.label);
    const paymentChipClass =
      paymentStatus.label === 'Paid'
        ? 'paid'
        : paymentStatus.label === 'Unpaid'
          ? 'unpaid'
          : '';
    const billingName = escapeHtml(
      order?.billingInfo?.fullName || order?.shippingInfo?.fullName || 'N/A',
    );
    const billingAddress = escapeHtml(
      order?.billingInfo?.address || order?.shippingInfo?.address || 'N/A',
    );
    const shippingMobile = escapeHtml(order?.shippingInfo?.mobileNo || 'N/A');
    const shippingEmail = escapeHtml(order?.shippingInfo?.email || 'N/A');
    const paymentMethod = escapeHtml(
      getPaymentMethodText(order?.paymentMethod),
    );
    const deliveryMethod = escapeHtml(
      getDeliveryMethodText(order?.deliveryMethod),
    );
    const paymentId = escapeHtml(order?.paymentId || '');
    const transId = escapeHtml(order?.transId || '');
    const dueAmount = Number(order?.dueAmount ?? 0);
    const isSettled = dueAmount <= 0;

    const itemRows = items.length
      ? items
          .map((item, index) => {
            const product = item.product || item.productId;
            const variant = product?.variants?.[0];
            const imageUrl = getImageUrl(product?.images?.[0]);
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.price) || 0;
            const lineTotal = unitPrice * quantity;
            const comboSelections = Array.isArray(item.comboSelections)
              ? item.comboSelections
              : [];
            const comboRows = comboSelections
              .map((selection) => {
                const thumbUrl = getImageUrl(getComboSelectionImage(selection));
                return `<div class="combo-row">${
                  thumbUrl
                    ? `<img class="combo-thumb" src="${escapeHtml(thumbUrl)}" alt="" />`
                    : ''
                }<span>${escapeHtml(selection?.name || 'Item')}${
                  selection?.variant && selection.variant !== 'Default'
                    ? ` (${escapeHtml(selection.variant)})`
                    : ''
                }${Number(selection?.quantity) > 1 ? ` × ${Number(selection.quantity)}` : ''}</span></div>`;
              })
              .join('');

            return `<tr>
              <td class="num">${index + 1}</td>
              <td>
                <div class="item-wrap">
                  ${
                    imageUrl
                      ? `<img class="thumb" src="${escapeHtml(imageUrl)}" alt="" />`
                      : '<span class="thumb-placeholder"></span>'
                  }
                  <div>
                    <div class="item-name">${escapeHtml(product?.name || 'Unknown Product')}</div>
                    <div class="item-meta">${escapeHtml(product?.productCode || 'N/A')} · ${escapeHtml(product?.category?.name || 'N/A')}</div>
                  </div>
                </div>
              </td>
              <td><span class="variant-pill">${escapeHtml(getVariantDisplayName(variant))}</span>${comboRows}</td>
              <td class="num">${quantity}</td>
              <td class="num">Tk. ${formatMoney(unitPrice)}</td>
              <td class="num"><strong>Tk. ${formatMoney(lineTotal)}</strong></td>
            </tr>`;
          })
          .join('')
      : '<tr class="empty-row"><td colspan="6">No items in this order.</td></tr>';

    const summaryRow = (label, value, className = '') =>
      `<div class="summary-row ${className}"><span>${label}</span><span class="value">${value}</span></div>`;

    const summaryRows = [
      summaryRow('Sub-total', `Tk. ${formatMoney(order?.subtotalAmount)}`),
    ];

    if ((order?.promoDiscount ?? 0) > 0) {
      summaryRows.push(
        summaryRow(
          'Promo discount',
          `Tk. ${formatMoney(order?.promoDiscount)}`,
          'discount',
        ),
      );
    }

    if ((order?.rewardPointsUsed ?? 0) > 0) {
      summaryRows.push(
        summaryRow('Reward points used', order?.rewardPointsUsed ?? 0),
      );
    }

    if ((order?.vat ?? 0) > 0) {
      summaryRows.push(
        summaryRow('VAT / tax', `Tk. ${formatMoney(order?.vat)}`),
      );
    }

    summaryRows.push(
      summaryRow(
        'Delivery charge',
        `Tk. ${formatMoney(order?.deliveryCharge)}`,
      ),
    );

    if ((order?.specialDiscount ?? 0) > 0) {
      summaryRows.push(
        summaryRow(
          'Special discount',
          `Tk. ${formatMoney(order?.specialDiscount)}`,
          'discount',
        ),
      );
    }

    summaryRows.push(
      summaryRow(
        'Total amount',
        `Tk. ${formatMoney(order?.totalAmount)}`,
        'total',
      ),
    );

    if ((order?.advanceAmount ?? 0) > 0) {
      summaryRows.push(
        summaryRow(
          'Advance paid',
          `Tk. ${formatMoney(order?.advanceAmount)}`,
          'discount',
        ),
      );
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      return;
    }

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 1000);
    };

    doc.open();
    doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice #${orderNo}</title>
<style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Helvetica Neue", Arial, sans-serif; color: #111827; font-size: 9.5pt; line-height: 1.45; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h1, h2, h3, p, dl, dd, dt { margin: 0; }
    .invoice { display: flex; flex-direction: column; min-height: 273mm; }
    .header { display: flex; justify-content: space-between; gap: 20mm; padding-bottom: 5mm; border-bottom: 1.5pt solid #111827; }
    .brand { display: flex; align-items: center; gap: 4mm; min-width: 0; }
    .logo { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 17mm; height: 17mm; padding: 2mm; border: 1px solid #d1d5db; border-radius: 2.5mm; }
    .logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .brand-name { font-size: 16pt; font-weight: 700; letter-spacing: -0.02em; }
    .brand-meta { margin-top: 1.2mm; color: #6b7280; font-size: 7.5pt; line-height: 1.5; }
    .document { flex-shrink: 0; min-width: 55mm; text-align: right; }
    .document-title { font-size: 22pt; font-weight: 800; letter-spacing: 0.08em; line-height: 1; text-transform: uppercase; }
    .document-subtitle { margin-top: 1.5mm; color: #6b7280; font-size: 7.5pt; letter-spacing: 0.16em; text-transform: uppercase; }
    .meta { display: grid; gap: 1mm; margin-top: 4mm; font-size: 8.5pt; }
    .meta-row { display: flex; justify-content: flex-end; gap: 3mm; }
    .meta-label { color: #6b7280; }
    .meta-value { font-weight: 600; }
    .chips { display: flex; justify-content: flex-end; gap: 2mm; margin-top: 3mm; }
    .chip { display: inline-block; padding: 0.8mm 2.5mm; border: 1px solid #d1d5db; border-radius: 999px; font-size: 7pt; font-weight: 700; }
    .chip.paid { border-color: #86efac; background: #f0fdf4; color: #166534; }
    .chip.unpaid { border-color: #fcd34d; background: #fffbeb; color: #92400e; }
    .info-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 8mm; padding: 5mm 0; border-bottom: 1px solid #e5e7eb; }
    .section-label { margin-bottom: 2mm; color: #6b7280; font-size: 7pt; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
    .info-name { font-size: 10pt; font-weight: 700; }
    .info-line { margin-top: 1mm; color: #374151; font-size: 8.5pt; word-break: break-word; }
    .info-list { display: grid; gap: 1.1mm; }
    .info-pair { display: flex; justify-content: space-between; gap: 4mm; font-size: 8.5pt; }
    .info-pair .label { color: #6b7280; }
    .info-pair .value { font-weight: 600; text-align: right; word-break: break-word; }
    .items { padding-top: 5mm; }
    .items-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 4mm; margin-bottom: 2.5mm; }
    .items-title { font-size: 11pt; font-weight: 700; }
    .items-count { color: #6b7280; font-size: 8pt; }
    .items-table { width: 100%; border-collapse: collapse; }
    .items-table thead { display: table-header-group; }
    .items-table th { padding: 2.5mm 2mm; background: #111827; color: #ffffff; font-size: 7pt; letter-spacing: 0.08em; text-align: left; text-transform: uppercase; }
    .items-table th.num, .items-table td.num { text-align: right; }
    .items-table td { padding: 2.5mm 2mm; border-bottom: 1px solid #e5e7eb; font-size: 9pt; vertical-align: top; }
    .items-table tr { page-break-inside: avoid; }
    .item-wrap { display: flex; align-items: flex-start; gap: 2.5mm; }
    .thumb, .thumb-placeholder { width: 10mm; height: 10mm; flex-shrink: 0; border: 1px solid #e5e7eb; border-radius: 1.5mm; object-fit: cover; }
    .thumb-placeholder { display: block; background: #f3f4f6; }
    .item-name { font-weight: 600; }
    .item-meta { margin-top: 0.6mm; color: #6b7280; font-size: 7.5pt; }
    .variant-pill { display: inline-block; padding: 0.6mm 2mm; border: 1px solid #e5e7eb; border-radius: 999px; background: #f9fafb; color: #4b5563; font-size: 7.5pt; }
    .combo-row { display: flex; align-items: center; gap: 1.5mm; margin-top: 1mm; color: #6b7280; font-size: 7.5pt; }
    .combo-thumb { width: 8mm; height: 8mm; flex-shrink: 0; border: 1px solid #e5e7eb; border-radius: 1.5mm; object-fit: cover; }
    .empty-row td { padding: 9mm 2mm; color: #6b7280; text-align: center; }
    .bottom-grid { display: grid; grid-template-columns: 1fr 78mm; gap: 8mm; padding-top: 5mm; page-break-inside: avoid; }
    .notes-title { margin-bottom: 1.5mm; color: #374151; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
    .notes p { color: #6b7280; font-size: 8pt; line-height: 1.55; }
    .summary { padding: 4mm; border: 1px solid #e5e7eb; border-radius: 2mm; background: #f9fafb; page-break-inside: avoid; }
    .summary-row { display: flex; justify-content: space-between; gap: 4mm; padding: 1mm 0; color: #4b5563; font-size: 8.5pt; }
    .summary-row .value { color: #111827; font-weight: 600; font-variant-numeric: tabular-nums; }
    .summary-row.discount .value { color: #b91c1c; }
    .summary-row.total { margin-top: 1.5mm; padding-top: 2mm; border-top: 1px solid #d1d5db; color: #111827; font-size: 9.5pt; font-weight: 700; }
    .summary-row.total .value { font-weight: 800; }
    .due-box { display: flex; align-items: center; justify-content: space-between; gap: 4mm; margin-top: 2.5mm; padding: 3mm; border-radius: 1.5mm; background: #111827; color: #ffffff; }
    .due-box.settled { background: #065f46; }
    .due-label { color: #e5e7eb; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
    .due-amount { font-size: 13pt; font-weight: 800; font-variant-numeric: tabular-nums; }
    .footer { display: flex; justify-content: space-between; gap: 6mm; margin-top: auto; padding-top: 5mm; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 7.5pt; }
    .footer strong { color: #111827; }
    .footer-right { text-align: right; }
</style>
</head>
<body>
  <div class="invoice">
    <header class="header">
      <div class="brand">
        ${
          logoUrl
            ? `<span class="logo"><img src="${escapeHtml(logoUrl)}" alt="" /></span>`
            : ''
        }
        <div>
          <div class="brand-name">${companyName}</div>
          <div class="brand-meta">
            ${companyAddress ? `<div>${companyAddress}</div>` : ''}
            ${companyContact ? `<div>${companyContact}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="document">
        <div class="document-title">Invoice</div>
        <div class="document-subtitle">Order billing document</div>
        <div class="meta">
          <div class="meta-row"><span class="meta-label">Invoice no.</span><span class="meta-value">#${orderNo}</span></div>
          <div class="meta-row"><span class="meta-label">Invoice date</span><span class="meta-value">${orderDate}</span></div>
        </div>
        <div class="chips">
          <span class="chip">${statusLabel}</span>
          <span class="chip ${paymentChipClass}">${paymentLabel}</span>
        </div>
      </div>
    </header>

    <section class="info-grid">
      <div>
        <div class="section-label">Billed &amp; shipped to</div>
        <div class="info-name">${billingName}</div>
        <div class="info-line">${billingAddress}</div>
        <div class="info-line">${shippingMobile}</div>
        <div class="info-line">${shippingEmail}</div>
      </div>
      <div>
        <div class="section-label">Order details</div>
        <div class="info-list">
          <div class="info-pair"><span class="label">Order no.</span><span class="value">#${orderNo}</span></div>
          <div class="info-pair"><span class="label">Order date</span><span class="value">${orderDate}</span></div>
          <div class="info-pair"><span class="label">Payment</span><span class="value">${paymentMethod}</span></div>
          <div class="info-pair"><span class="label">Delivery</span><span class="value">${deliveryMethod}</span></div>
          ${paymentId ? `<div class="info-pair"><span class="label">Payment ID</span><span class="value">${paymentId}</span></div>` : ''}
          ${transId ? `<div class="info-pair"><span class="label">Transaction ID</span><span class="value">${transId}</span></div>` : ''}
        </div>
      </div>
    </section>

    <section class="items">
      <div class="items-header">
        <div class="items-title">Order items</div>
        <div class="items-count">${items.length} ${items.length === 1 ? 'line' : 'lines'} · ${itemCount} ${itemCount === 1 ? 'unit' : 'units'}</div>
      </div>
      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Variant</th>
            <th class="num">Qty</th>
            <th class="num">Unit price</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </section>

    <section class="bottom-grid">
      <div class="notes">
        <div class="notes-title">Notes</div>
        <p>Thank you for shopping with ${companyName}. Please retain this invoice for your records.</p>
        ${companyContact ? `<p>For questions about this order, contact us at ${companyContact}.</p>` : ''}
      </div>
      <div class="summary">
        ${summaryRows.join('')}
        <div class="due-box ${isSettled ? 'settled' : ''}">
          <span class="due-label">${isSettled ? 'Paid in full' : 'Amount due'}</span>
          <span class="due-amount">Tk. ${formatMoney(dueAmount)}</span>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div>
        <strong>Thank you for your business.</strong>
        <div>This invoice was generated for order #${orderNo}.</div>
      </div>
      <div class="footer-right">Invoice #${orderNo}<br />${orderDate}</div>
    </footer>
  </div>
</body>
</html>`);
    doc.close();
  }, [items, itemCount, order, generalInfo, orderStatusMeta, paymentStatus]);

  useImperativeHandle(ref, () => ({ print: handlePrint }), [handlePrint]);

  return (
    <Card
      role="region"
      aria-label="Order invoice"
      className="overflow-hidden border border-border/60 py-0 shadow-sm"
    >
      <CardContent className="space-y-8 p-4 sm:p-6 lg:p-8" id="print-area">
        <div
          id="firstRow"
          className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border/60 pb-6 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center"
        >
          <p className="col-start-1 row-start-1 min-w-0 text-lg font-semibold tracking-tight sm:text-2xl">
            {generalInfo?.CompanyName ?? ''}
          </p>
          <div className="col-span-2 row-start-2 flex h-14 w-40 max-w-full items-center justify-start sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:w-48 sm:justify-center">
            <ImageComponent
              imageName={generalInfo?.PrimaryLogo}
              className="max-h-14 w-auto max-w-full object-contain"
              skeletonHeight={56}
              altName={generalInfo?.CompanyName || 'Company logo'}
              fetchpriority="high"
            />
          </div>
          <span className="col-start-2 row-start-1 justify-self-end text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:col-start-3 sm:text-xl">
            Invoice
          </span>
        </div>

        <div id="secondRow" className="grid gap-8 md:grid-cols-2">
          <section aria-labelledby="shipping-heading" className="min-w-0">
            <InvoiceSectionHeading id="shipping-heading">
              Shipping Info
            </InvoiceSectionHeading>
            <div className="mt-3">
              {isEditMode ? (
                <div className="space-y-3">
                  <Input
                    aria-label="Recipient full name"
                    placeholder="Full Name"
                    name="fullName"
                    value={order?.shippingInfo?.fullName ?? ''}
                    onChange={onShippingInfoChange}
                    className="h-11"
                  />
                  <Input
                    aria-label="Recipient mobile number"
                    placeholder="Mobile No"
                    name="mobileNo"
                    value={order?.shippingInfo?.mobileNo ?? ''}
                    onChange={onShippingInfoChange}
                    className="h-11"
                  />
                  <Input
                    aria-label="Recipient email"
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={order?.shippingInfo?.email ?? ''}
                    onChange={onShippingInfoChange}
                    className="h-11"
                  />
                  <Textarea
                    aria-label="Shipping address"
                    placeholder="Address"
                    name="address"
                    value={order?.shippingInfo?.address ?? ''}
                    onChange={onShippingInfoChange}
                    rows={2}
                    className="min-h-20 resize-y"
                  />
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">
                    {order.shippingInfo?.fullName || 'N/A'}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shippingInfo?.mobileNo || 'N/A'}
                  </p>
                  <p className="break-all text-muted-foreground">
                    {order.shippingInfo?.email || 'N/A'}
                  </p>
                  <p className="break-words text-muted-foreground">
                    {order.shippingInfo?.address || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section id="secondRowRight" aria-labelledby="order-info-heading">
            <InvoiceSectionHeading
              id="order-info-heading"
              className="md:justify-end"
            >
              Order Info
            </InvoiceSectionHeading>
            <dl className="mt-3 space-y-2 text-sm">
              <MetaRow label="Order No" value={`#${order.orderNo ?? 'N/A'}`} />
              <MetaRow
                label="Order Date"
                value={
                  order?.orderDate
                    ? new Date(order.orderDate).toLocaleDateString()
                    : 'N/A'
                }
              />
              <div className="flex items-center justify-between gap-4 md:justify-end md:gap-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge className={cn('border', orderStatusMeta.className)}>
                    {orderStatusMeta.label}
                  </Badge>
                </dd>
              </div>
              <MetaRow
                label="Payment Method"
                value={getPaymentMethodText(order.paymentMethod)}
              />
              <div className="flex items-center justify-between gap-4 md:justify-end md:gap-3">
                <dt className="text-muted-foreground">Payment Status</dt>
                <dd>
                  <Badge className={cn('border', paymentStatus.className)}>
                    {paymentStatus.label}
                  </Badge>
                </dd>
              </div>
              {order.paymentId && (
                <MetaRow label="Payment ID" value={order.paymentId} />
              )}
              {order.transId && (
                <MetaRow label="Transaction ID" value={order.transId} />
              )}
              <MetaRow
                label="Delivery Method"
                value={getDeliveryMethodText(order.deliveryMethod)}
              />
            </dl>
          </section>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <InvoiceSectionHeading>Items</InvoiceSectionHeading>
            <span className="text-xs tabular-nums text-muted-foreground">
              {items.length} {items.length === 1 ? 'line' : 'lines'} ·{' '}
              {itemCount} {itemCount === 1 ? 'unit' : 'units'}
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/60 print:overflow-visible">
            <Table
              aria-label="Order items"
              className="min-w-[720px] print:min-w-0"
            >
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead
                    scope="col"
                    className="w-12 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    SL
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Image
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Item
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Variant
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Qty
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Unit Cost
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Total
                  </TableHead>
                  {isEditMode && (
                    <TableHead
                      scope="col"
                      className="no-print text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const product = item.product || item.productId;
                  const variant = product?.variants?.[0];
                  const totalPrice = item.price * item.quantity;

                  return (
                    <TableRow
                      key={item._id || index}
                      className="transition-colors"
                    >
                      <TableCell className="tabular-nums text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        {product?.images?.[0] ? (
                          <ImageComponent
                            imageName={product.images[0]}
                            className="size-12 rounded-md border border-border/60 object-cover"
                            skeletonHeight={48}
                            width={48}
                            height={48}
                            altName={product?.name}
                          />
                        ) : (
                          <div
                            className="size-12 rounded-md bg-muted"
                            aria-hidden="true"
                          />
                        )}
                      </TableCell>
                      <TableCell className="max-w-56">
                        <div className="truncate font-medium text-foreground">
                          {product?.name || 'Unknown Product'}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          Category: {product?.category?.name || 'N/A'}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          Code: {product?.productCode || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {variant ? getVariantDisplayName(variant) : 'N/A'}
                        {item.comboSelections?.length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                            {item.comboSelections.map((selection, sIndex) => {
                              const comboImage = getImageUrl(
                                getComboSelectionImage(selection),
                              );

                              return (
                                <li
                                  key={`${selection.productId || selection.variantId}-${sIndex}`}
                                  className="flex items-center gap-1.5"
                                >
                                  {comboImage ? (
                                    <img
                                      src={comboImage}
                                      alt=""
                                      className="size-10 shrink-0 rounded border border-border/60 object-cover"
                                    />
                                  ) : null}
                                  <span>
                                    {selection.name || 'Item'}
                                    {selection.variant &&
                                    selection.variant !== 'Default'
                                      ? ` (${selection.variant})`
                                      : ''}
                                    {Number(selection.quantity) > 1
                                      ? ` × ${selection.quantity}`
                                      : ''}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditMode ? (
                          <Input
                            type="number"
                            min={1}
                            aria-label={`Quantity for ${product?.name || 'item'}`}
                            value={item.quantity}
                            onChange={(e) =>
                              onItemQuantityChange(index, e.target.value)
                            }
                            className="ml-auto h-11 w-20 text-right"
                          />
                        ) : (
                          <span className="tabular-nums">{item.quantity}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(item?.price)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatMoney(totalPrice)}
                      </TableCell>
                      {isEditMode && (
                        <TableCell className="no-print text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveItem(index)}
                            aria-label={`Remove ${product?.name || 'item'} from order`}
                            className="h-11 w-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/30"
                          >
                            <X className="size-4" aria-hidden="true" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {items.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={columnCount}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No items in this order.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {isEditMode && (
            <div className="mt-4 flex justify-start">
              <Button
                type="button"
                onClick={onAddProduct}
                className="h-11 gap-2 sm:h-10"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add Product
              </Button>
            </div>
          )}
        </div>

        <div id="thirdRow" className="grid gap-8 md:grid-cols-2">
          <section aria-labelledby="billing-heading" className="min-w-0">
            <InvoiceSectionHeading id="billing-heading">
              Billing Address
            </InvoiceSectionHeading>
            <div className="mt-3">
              {isEditMode ? (
                <div className="space-y-3">
                  <Input
                    aria-label="Billing full name"
                    placeholder="Full Name"
                    name="fullName"
                    value={order.billingInfo?.fullName || ''}
                    onChange={onBillingInfoChange}
                    className="h-11"
                  />
                  <Textarea
                    aria-label="Billing address"
                    placeholder="Address"
                    name="address"
                    value={order.billingInfo?.address || ''}
                    onChange={onBillingInfoChange}
                    rows={2}
                    className="min-h-20 resize-y"
                  />
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">
                    {order.billingInfo?.fullName ||
                      order.shippingInfo?.fullName ||
                      'N/A'}
                  </p>
                  <p className="break-words text-muted-foreground">
                    {order.billingInfo?.address ||
                      order.shippingInfo?.address ||
                      'N/A'}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section
            id="thirdRowRight"
            aria-labelledby="totals-heading"
            className="w-full md:max-w-sm md:justify-self-end"
          >
            <InvoiceSectionHeading
              id="totals-heading"
              className="md:justify-end"
            >
              Payment Summary
            </InvoiceSectionHeading>
            <dl className="mt-3 space-y-2 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm shadow-sm sm:p-5">
              <SummaryRow
                label="Sub-total"
                value={`Tk. ${formatMoney(order?.subtotalAmount)}`}
              />
              {(order?.promoDiscount ?? 0) > 0 && (
                <SummaryRow
                  label="Promo Discount"
                  value={`Tk. ${formatMoney(order?.promoDiscount)}`}
                />
              )}
              {(order?.rewardPointsUsed ?? 0) > 0 && (
                <SummaryRow
                  label="Reward Points Used"
                  value={order?.rewardPointsUsed ?? 0}
                />
              )}
              {(order?.vat ?? 0) > 0 && (
                <SummaryRow
                  label="VAT / Tax"
                  value={`Tk. ${formatMoney(order?.vat)}`}
                />
              )}
              <SummaryRow
                label="Delivery Charge"
                value={`Tk. ${formatMoney(order?.deliveryCharge)}`}
              />
              {(order?.specialDiscount ?? 0) > 0 && (
                <SummaryRow
                  label="Special Discount"
                  value={`Tk. ${formatMoney(order?.specialDiscount)}`}
                />
              )}
              <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                <SummaryRow
                  label="Total Order Amount"
                  value={`Tk. ${formatMoney(order?.totalAmount)}`}
                  emphasis
                />
                {(order?.advanceAmount ?? 0) > 0 && (
                  <SummaryRow
                    label="Advance"
                    value={`Tk. ${formatMoney(order?.advanceAmount)}`}
                    destructive
                  />
                )}
                <SummaryRow
                  label="Total Due Amount"
                  value={`Tk. ${formatMoney(order?.dueAmount)}`}
                  highlight
                />
              </div>
            </dl>
          </section>
        </div>

        {isEditMode && (
          <div className="flex flex-col gap-2 border-t border-border/60 pt-6 no-print sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="h-11 sm:h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSave}
              disabled={saving}
              aria-busy={saving}
              className="h-11 min-w-40 gap-2 transition-transform active:scale-[0.99] sm:h-10"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default OrderInvoice;
