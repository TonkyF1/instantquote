import { isValidCurrency } from "@/lib/currency";

export type DocType = "estimate" | "invoice";
export type DiscountType = "amount" | "percent";
export type DocStatus = "draft" | "sent" | "paid" | "overdue";
export type LookId = "classic" | "atelier" | "ledger";

export type LineItem = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
};

export type Business = {
  name: string;
  email: string;
  phone: string;
  website: string;
  tagline: string;
  logoDataUrl: string;
};

export type Client = {
  name: string;
  email: string;
  address: string;
};

export type RateItem = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
};

export type SavedClient = Client & { id: string };

export type PaymentPresetId = "bank" | "paypal" | "stripe" | "cash" | "";

export type PaymentMethods = {
  preset: PaymentPresetId;
  paypal: string;
  venmo: string;
  bankName: string;
  bankDetails: string;
  sortCode: string;
  accountNumber: string;
  paymentLink: string;
};

export type QuoteDocument = {
  id: string;
  type: DocType;
  number: string;
  date: string;
  dueDate: string;
  validUntil: string;
  poNumber: string;
  currency: string;
  status: DocStatus;
  look: LookId;
  templateId: string;
  business: Business;
  client: Client;
  items: LineItem[];
  taxPercent: number;
  discountType: DiscountType;
  discountValue: number;
  depositAmount: number;
  notes: string;
  accentColor: string;
  hideCreatedWith: boolean;
  payment: PaymentMethods;
  savedAt?: string;
};

export type Totals = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  deposit: number;
  balance: number;
};

export const DRAFT_ID = "draft";
export const DRAFT_ITEM_ID = "item-0";
export const DEFAULT_ACCENT = "#8B9098";
export const DEFAULT_CURRENCY = "GBP";
export const DEFAULT_NOTES = "Payment due within 14 days.";
export const STORAGE_KEY = "instantquote-v3";

export const STATUSES: { id: DocStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "paid", label: "Paid" },
  { id: "overdue", label: "Overdue" },
];

export const PAYMENT_PRESETS: {
  id: Exclude<PaymentPresetId, "">;
  label: string;
  notes: string;
}[] = [
  {
    id: "bank",
    label: "Bank transfer",
    notes:
      "Please pay by bank transfer. Use the invoice number as your payment reference.",
  },
  {
    id: "paypal",
    label: "PayPal",
    notes: "Please pay via PayPal.",
  },
  {
    id: "stripe",
    label: "Stripe",
    notes: "Please pay online using the Stripe link on this invoice.",
  },
  {
    id: "cash",
    label: "Cash on completion",
    notes: "Cash due on completion of the work.",
  },
];

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

export function parseDecimal(raw: string, places = 2): number {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Number.parseFloat(n.toFixed(places));
}

export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatMoney(n: number, currency = DEFAULT_CURRENCY): string {
  const code = isValidCurrency(currency) ? currency : DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
    }).format(roundMoney(n));
  } catch {
    return `${code} ${roundMoney(n).toFixed(2)}`;
  }
}

export function currencySymbol(currency = DEFAULT_CURRENCY): string {
  const code = isValidCurrency(currency) ? currency : DEFAULT_CURRENCY;
  try {
    const part = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? code;
  } catch {
    return code;
  }
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `iq-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function emptyItem(id?: string): LineItem {
  return { id: id ?? newId(), description: "", qty: 1, unitPrice: 0 };
}

export function emptyBusiness(): Business {
  return {
    name: "",
    email: "",
    phone: "",
    website: "",
    tagline: "",
    logoDataUrl: "",
  };
}

export function emptyClient(): Client {
  return { name: "", email: "", address: "" };
}

export function emptyPayment(): PaymentMethods {
  return {
    preset: "",
    paypal: "",
    venmo: "",
    bankName: "",
    bankDetails: "",
    sortCode: "",
    accountNumber: "",
    paymentLink: "",
  };
}

export function paymentHasAny(p: PaymentMethods): boolean {
  return Boolean(
    p.preset ||
      p.paypal.trim() ||
      p.venmo.trim() ||
      p.bankName.trim() ||
      p.bankDetails.trim() ||
      p.sortCode.trim() ||
      p.accountNumber.trim() ||
      p.paymentLink.trim(),
  );
}

export function presetNotes(id: PaymentPresetId): string {
  return PAYMENT_PRESETS.find((p) => p.id === id)?.notes ?? DEFAULT_NOTES;
}

export function nextDocumentNumber(
  recent: Pick<QuoteDocument, "number">[],
  now = new Date(),
): string {
  const year = now.getFullYear();
  const prefix = `IQ-${year}-`;
  let max = 0;
  for (const doc of recent) {
    if (!doc.number.startsWith(prefix)) continue;
    const n = Number.parseInt(doc.number.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export function emptyDocument(
  recent: Pick<QuoteDocument, "number">[] = [],
  business: Business = emptyBusiness(),
  extras: Partial<Pick<QuoteDocument, "currency" | "payment" | "look">> = {},
): QuoteDocument {
  return {
    id: DRAFT_ID,
    type: "estimate",
    number: nextDocumentNumber(recent),
    date: todayISO(),
    dueDate: "",
    validUntil: "",
    poNumber: "",
    currency: extras.currency ?? DEFAULT_CURRENCY,
    status: "draft",
    look: extras.look ?? "classic",
    templateId: "",
    business,
    client: emptyClient(),
    items: [emptyItem(DRAFT_ITEM_ID)],
    taxPercent: 0,
    discountType: "amount",
    discountValue: 0,
    depositAmount: 0,
    notes: DEFAULT_NOTES,
    accentColor: DEFAULT_ACCENT,
    hideCreatedWith: false,
    payment: extras.payment ? { ...emptyPayment(), ...extras.payment } : emptyPayment(),
  };
}

export function normalizeDocument(raw: unknown): QuoteDocument {
  const doc = (raw ?? {}) as Partial<QuoteDocument>;
  const base = emptyDocument();
  const items = Array.isArray(doc.items) && doc.items.length > 0
    ? doc.items.map((item, i) => ({
        id: String(item?.id ?? `item-${i}`),
        description: String(item?.description ?? ""),
        qty: Number(item?.qty) || 0,
        unitPrice: Number(item?.unitPrice) || 0,
      }))
    : base.items;
  const look: LookId =
    doc.look === "atelier" || doc.look === "ledger" ? doc.look : "classic";
  const status: DocStatus =
    doc.status === "sent" || doc.status === "paid" || doc.status === "overdue"
      ? doc.status
      : "draft";
  return {
    ...base,
    ...doc,
    id: String(doc.id ?? base.id),
    type: doc.type === "invoice" ? "invoice" : "estimate",
    number: String(doc.number ?? base.number),
    date: String(doc.date ?? base.date),
    dueDate: String(doc.dueDate ?? ""),
    validUntil: String(doc.validUntil ?? ""),
    poNumber: String(doc.poNumber ?? ""),
    currency: isValidCurrency(String(doc.currency ?? ""))
      ? String(doc.currency)
      : DEFAULT_CURRENCY,
    status,
    look,
    templateId: String(doc.templateId ?? ""),
    business: { ...emptyBusiness(), ...(doc.business ?? {}) },
    client: { ...emptyClient(), ...(doc.client ?? {}) },
    items,
    taxPercent: Number(doc.taxPercent) || 0,
    discountType: doc.discountType === "percent" ? "percent" : "amount",
    discountValue: Number(doc.discountValue) || 0,
    depositAmount: Number(doc.depositAmount) || 0,
    notes: String(doc.notes ?? base.notes),
    accentColor: String(doc.accentColor ?? DEFAULT_ACCENT),
    hideCreatedWith: Boolean(doc.hideCreatedWith),
    payment: normalizePayment(doc.payment),
    savedAt: doc.savedAt,
  };
}

function normalizePayment(raw: unknown): PaymentMethods {
  const p = (raw ?? {}) as Partial<PaymentMethods>;
  const preset: PaymentPresetId =
    p.preset === "bank" ||
    p.preset === "paypal" ||
    p.preset === "stripe" ||
    p.preset === "cash"
      ? p.preset
      : "";
  return {
    ...emptyPayment(),
    ...p,
    preset,
    sortCode: String(p.sortCode ?? ""),
    accountNumber: String(p.accountNumber ?? ""),
  };
}

export function computeTotals(doc: QuoteDocument): Totals {
  const subtotal = roundMoney(
    doc.items.reduce((sum, item) => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0),
  );
  const rawDiscount =
    doc.discountType === "percent"
      ? subtotal * ((Number(doc.discountValue) || 0) / 100)
      : Number(doc.discountValue) || 0;
  const discount = roundMoney(Math.min(Math.max(0, rawDiscount), subtotal));
  const taxable = roundMoney(Math.max(0, subtotal - discount));
  const tax = roundMoney(taxable * ((Number(doc.taxPercent) || 0) / 100));
  const total = roundMoney(taxable + tax);
  const deposit = roundMoney(
    Math.min(Math.max(0, Number(doc.depositAmount) || 0), total),
  );
  const balance = roundMoney(Math.max(0, total - deposit));
  return { subtotal, discount, tax, total, deposit, balance };
}

export function filledItems(doc: QuoteDocument): LineItem[] {
  return doc.items.filter(
    (item) => item.description.trim().length > 0 || Number(item.unitPrice) > 0,
  );
}

export function canExport(doc: QuoteDocument): { ok: true } | { ok: false; message: string } {
  if (!doc.business.name.trim()) {
    return {
      ok: false,
      message: "Add your business name before printing.",
    };
  }
  if (filledItems(doc).length === 0) {
    return {
      ok: false,
      message: "Add at least one line item before printing.",
    };
  }
  return { ok: true };
}

export function sampleDocument(): QuoteDocument {
  return normalizeDocument({
    id: "sample",
    type: "estimate",
    number: "IQ-2026-018",
    date: todayISO(),
    dueDate: addDaysISO(todayISO(), 14),
    currency: "GBP",
    look: "classic",
    business: {
      name: "Hayes & Son Plumbing",
      email: "jobs@hayesandson.co.uk",
      phone: "0121 555 0148",
      website: "hayesandson.co.uk",
      tagline: "Reliable plumbing across Birmingham",
      logoDataUrl: "",
    },
    client: {
      name: "Mrs A. Patel",
      email: "a.patel@mail.com",
      address: "42 Kings Heath Road\nBirmingham B14 7AA",
    },
    items: [
      {
        id: "sample-1",
        description: "Supply and fit new bathroom suite",
        qty: 1,
        unitPrice: 780,
      },
      {
        id: "sample-2",
        description: "Wall and floor tiling",
        qty: 1,
        unitPrice: 420,
      },
      {
        id: "sample-3",
        description: "First and second fix plumbing",
        qty: 1,
        unitPrice: 390,
      },
      {
        id: "sample-4",
        description: "Waste, making good and clean down",
        qty: 1,
        unitPrice: 260,
      },
    ],
    notes:
      "Please pay by bank transfer. Use the invoice number as your payment reference.",
    payment: {
      preset: "bank",
      paypal: "",
      venmo: "",
      bankName: "Hayes & Son Plumbing",
      bankDetails: "",
      sortCode: "20-77-89",
      accountNumber: "40192837",
      paymentLink: "",
    },
  });
}

export function toPlainText(doc: QuoteDocument): string {
  const totals = computeTotals(doc);
  const money = (n: number) => formatMoney(n, doc.currency);
  const kind = doc.type === "invoice" ? "INVOICE" : "ESTIMATE";
  const b = doc.business;
  const c = doc.client;
  const lines: string[] = [
    `${kind} ${doc.number}`.trim(),
    b.name,
    b.tagline,
    [b.email, b.phone, b.website].filter(Boolean).join(" · "),
    "",
    `Date: ${formatDisplayDate(doc.date)}`,
    doc.dueDate ? `Due: ${formatDisplayDate(doc.dueDate)}` : "",
    doc.validUntil ? `Valid until: ${formatDisplayDate(doc.validUntil)}` : "",
    doc.poNumber.trim() ? `PO: ${doc.poNumber.trim()}` : "",
    `Currency: ${doc.currency}`,
    "",
    "Bill to",
    c.name,
    c.address,
    c.email,
    "",
    "Items",
  ].filter((line, i, arr) => line !== "" || arr[i - 1] !== "");

  for (const item of filledItems(doc)) {
    const amount = roundMoney((Number(item.qty) || 0) * (Number(item.unitPrice) || 0));
    lines.push(
      `${item.description} — ${item.qty} × ${money(item.unitPrice)} = ${money(amount)}`,
    );
  }

  lines.push("");
  lines.push(`Subtotal: ${money(totals.subtotal)}`);
  if (totals.discount > 0) {
    const label =
      doc.discountType === "percent"
        ? `Discount (${doc.discountValue}%)`
        : "Discount";
    lines.push(`${label}: −${money(totals.discount)}`);
  }
  if (totals.tax > 0) {
    lines.push(`VAT (${doc.taxPercent}%): ${money(totals.tax)}`);
  }
  lines.push(`Total: ${money(totals.total)}`);
  if (totals.deposit > 0) {
    lines.push(`Deposit paid: −${money(totals.deposit)}`);
    lines.push(`Balance due: ${money(totals.balance)}`);
  }
  const p = doc.payment;
  if (paymentHasAny(p)) {
    lines.push("", "Pay");
    if (p.preset === "bank") lines.push("Bank transfer");
    if (p.preset === "paypal") lines.push("PayPal");
    if (p.preset === "stripe") lines.push("Stripe");
    if (p.preset === "cash") lines.push("Cash on completion");
    if (p.paypal.trim()) lines.push(`PayPal: ${p.paypal.trim()}`);
    if (p.sortCode.trim()) lines.push(`Sort code: ${p.sortCode.trim()}`);
    if (p.accountNumber.trim()) lines.push(`Account number: ${p.accountNumber.trim()}`);
    if (p.bankName.trim() || p.bankDetails.trim()) {
      lines.push([p.bankName, p.bankDetails].filter(Boolean).join(" — "));
    }
    if (p.paymentLink.trim()) lines.push(p.paymentLink.trim());
  }
  if (doc.notes.trim()) {
    lines.push("", "Notes", doc.notes.trim());
  }
  lines.push("", "Thank you for your business.");
  return lines.filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n");
}

export async function fileToLogoDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const max = 360;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not read this image.");
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read this image."));
    img.src = src;
  });
}
