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
