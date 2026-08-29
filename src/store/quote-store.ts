import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Business,
  type Client,
  type DiscountType,
  type DocType,
  type LineItem,
  type LookId,
  type PaymentMethods,
  type QuoteDocument,
  type RateItem,
  type SavedClient,
  DRAFT_ID,
  DEFAULT_CURRENCY,
  STORAGE_KEY,
  addDaysISO,
  emptyDocument,
  emptyItem,
  emptyPayment,
  newId,
  normalizeDocument,
  sampleDocument,
  todayISO,
} from "@/lib/document";

const MAX_RECENT = 80;
const MAX_CLIENTS = 80;
const MAX_RATES = 80;

type QuoteState = {
  _hasHydrated: boolean;
  theme: "light" | "dark";
  waitlistEmail: string;
  defaultCurrency: string;
  current: QuoteDocument;
  recent: QuoteDocument[];
  clients: SavedClient[];
  rates: RateItem[];
  setHasHydrated: (value: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  submitWaitlist: (email: string) => void;
  setDefaultCurrency: (currency: string) => void;
  patchCurrent: (patch: Partial<QuoteDocument>) => void;
  patchBusiness: (patch: Partial<Business>) => void;
  patchClient: (patch: Partial<Client>) => void;
  patchPayment: (patch: Partial<PaymentMethods>) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  patchItem: (id: string, patch: Partial<LineItem>) => void;
  addRateItem: (item: Omit<RateItem, "id"> | RateItem) => void;
  setType: (type: DocType) => void;
  setDiscount: (discountType: DiscountType, discountValue: number) => void;
  newDocument: () => void;
  saveDocument: () => QuoteDocument;
  loadDocument: (id: string) => void;
  mergeCloud: (docs: QuoteDocument[]) => void;
  deleteDocument: (id: string) => void;
  loadSample: () => void;
  loadTemplate: (doc: QuoteDocument) => void;
  convertToInvoice: () => void;
  duplicateDocument: () => void;
  upsertClient: (client: Client) => void;
  applyClient: (id: string) => void;
  removeClient: (id: string) => void;
  upsertRate: (item: Omit<RateItem, "id"> & { id?: string }) => void;
  applyRate: (id: string) => void;
  removeRate: (id: string) => void;
};

function withCurrent(
  current: QuoteDocument,
  patch: Partial<QuoteDocument>,
): QuoteDocument {
  return { ...current, ...patch };
}

function rememberClient(clients: SavedClient[], client: Client): SavedClient[] {
  const name = client.name.trim();
  if (!name) return clients;
  const existing = clients.find(
    (c) => c.name.trim().toLowerCase() === name.toLowerCase(),
  );
  const next: SavedClient = {
    id: existing?.id ?? newId(),
    name,
    email: client.email,
    address: client.address,
  };
  return [next, ...clients.filter((c) => c.id !== next.id)].slice(0, MAX_CLIENTS);
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      theme: "light",
      waitlistEmail: "",
      defaultCurrency: DEFAULT_CURRENCY,
      current: emptyDocument(),
      recent: [],
      clients: [],
      rates: [],
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
      submitWaitlist: (email) => set({ waitlistEmail: email.trim() }),
      setDefaultCurrency: (currency) =>
        set({
          defaultCurrency: currency,
          current: { ...get().current, currency },
        }),
      patchCurrent: (patch) =>
        set({ current: withCurrent(get().current, patch) }),
      patchBusiness: (patch) => {
        const current = get().current;
        set({
          current: {
            ...current,
            business: { ...current.business, ...patch },
          },
        });
      },
      patchClient: (patch) => {
        const current = get().current;
        set({ current: { ...current, client: { ...current.client, ...patch } } });
      },
      patchPayment: (patch) => {
        const current = get().current;
        set({
          current: { ...current, payment: { ...current.payment, ...patch } },
        });
      },
      addItem: () => {
        const current = get().current;
        set({ current: { ...current, items: [...current.items, emptyItem()] } });
      },
      removeItem: (id) => {
        const current = get().current;
        const next = current.items.filter((item) => item.id !== id);
        set({
          current: {
            ...current,
            items: next.length > 0 ? next : [emptyItem()],
          },
        });
      },
      patchItem: (id, patch) => {
        const current = get().current;
        set({
          current: {
            ...current,
            items: current.items.map((item) =>
              item.id === id ? { ...item, ...patch } : item,
            ),
          },
        });
      },
      addRateItem: (item) => {
        const current = get().current;
        const line: LineItem = {
          id: newId(),
          description: item.description,
          qty: item.qty || 1,
          unitPrice: item.unitPrice || 0,
        };
        const items =
          current.items.length === 1 &&
          !current.items[0].description.trim() &&
          !current.items[0].unitPrice
            ? [line]
            : [...current.items, line];
        set({ current: { ...current, items } });
      },
      setType: (type) => set({ current: { ...get().current, type } }),
      setDiscount: (discountType, discountValue) =>
        set({ current: { ...get().current, discountType, discountValue } }),
      newDocument: () => {
        const { current, recent, defaultCurrency } = get();
        const next = emptyDocument(recent, current.business, {
          currency: current.currency || defaultCurrency,
          payment: current.payment,
          look: current.look as LookId,
        });
        set({
          current: {
            ...next,
            accentColor: current.accentColor,
            hideCreatedWith: current.hideCreatedWith,
            notes: current.notes,
            taxPercent: current.taxPercent,
          },
        });
      },
      saveDocument: () => {
        const current = get().current;
        const saved: QuoteDocument = {
          ...current,
          id: current.id === DRAFT_ID ? newId() : current.id,
          savedAt: new Date().toISOString(),
        };
        const rest = get().recent.filter((doc) => doc.id !== saved.id);
        set({
          current: saved,
          recent: [saved, ...rest].slice(0, MAX_RECENT),
          clients: rememberClient(get().clients, saved.client),
        });
        return saved;
      },
      loadDocument: (id) => {
        const found = get().recent.find((doc) => doc.id === id);
        if (found) set({ current: found });
      },
      mergeCloud: (docs) => {
        const local = get().recent;
        const map = new Map<string, QuoteDocument>();
        for (const doc of [...docs, ...local]) {
          const n = normalizeDocument(doc);
          const prev = map.get(n.id);
          if (!prev || (n.savedAt ?? "") > (prev.savedAt ?? "")) map.set(n.id, n);
        }
        const recent = [...map.values()]
          .sort((a, b) => (b.savedAt ?? "").localeCompare(a.savedAt ?? ""))
          .slice(0, MAX_RECENT);
        set({ recent });
      },
      deleteDocument: (id) => {
        set({ recent: get().recent.filter((doc) => doc.id !== id) });
      },
      loadSample: () =>
        set({ current: { ...sampleDocument(), id: newId() } }),
      loadTemplate: (doc) =>
        set({
          current: {
            ...normalizeDocument(doc),
            id: newId(),
            date: doc.date,
          },
        }),
      convertToInvoice: () => {
        const current = get().current;
        set({
          current: {
            ...current,
            type: "invoice",
            status: current.status === "draft" ? "sent" : current.status,
            dueDate: current.dueDate || addDaysISO(todayISO(), 14),
          },
        });
      },
      duplicateDocument: () => {
        const { current, recent } = get();
        const copy = emptyDocument(recent, current.business, {
          currency: current.currency,
          payment: current.payment,
          look: current.look,
        });
        set({
          current: {
            ...current,
            ...copy,
            id: newId(),
            type: "estimate",
            status: "draft",
            items: current.items.map((item) => ({ ...item, id: newId() })),
            client: current.client,
            notes: current.notes,
            taxPercent: current.taxPercent,
            discountType: current.discountType,
            discountValue: current.discountValue,
            depositAmount: 0,
            accentColor: current.accentColor,
            hideCreatedWith: current.hideCreatedWith,
          },
        });
      },
      upsertClient: (client) =>
        set({ clients: rememberClient(get().clients, client) }),
      applyClient: (id) => {
        const found = get().clients.find((c) => c.id === id);
        if (!found) return;
        const current = get().current;
        set({
          current: {
            ...current,
            client: { name: found.name, email: found.email, address: found.address },
          },
        });
      },
      removeClient: (id) =>
        set({ clients: get().clients.filter((c) => c.id !== id) }),
      upsertRate: (item) => {
        const id = item.id ?? newId();
        const next: RateItem = {
          id,
          description: item.description.trim(),
          qty: item.qty || 1,
          unitPrice: item.unitPrice || 0,
        };
        if (!next.description) return;
        set({
          rates: [next, ...get().rates.filter((r) => r.id !== id)].slice(0, MAX_RATES),
        });
      },
      applyRate: (id) => {
        const found = get().rates.find((r) => r.id === id);
        if (found) get().addRateItem(found);
      },
      removeRate: (id) =>
        set({ rates: get().rates.filter((r) => r.id !== id) }),
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      partialize: (state) => ({
        theme: state.theme,
        waitlistEmail: state.waitlistEmail,
        defaultCurrency: state.defaultCurrency,
        current: state.current,
        recent: state.recent,
        clients: state.clients,
        rates: state.rates,
      }),
    },
  ),
);

export async function rehydrateQuoteStore() {
  await Promise.resolve(useQuoteStore.persist.rehydrate());
  const state = useQuoteStore.getState();
  const today = todayISO();
  const recent = state.recent.map((doc) => {
    const n = normalizeDocument(doc);
    if (n.status === "sent" && n.dueDate && n.dueDate < today) {
      return { ...n, status: "overdue" as const };
    }
    return n;
  });
  useQuoteStore.setState({
    _hasHydrated: true,
    current: normalizeDocument(state.current),
    recent,
    defaultCurrency: state.defaultCurrency || DEFAULT_CURRENCY,
    clients: Array.isArray(state.clients) ? state.clients : [],
    rates: Array.isArray(state.rates) ? state.rates : [],
  });
}
