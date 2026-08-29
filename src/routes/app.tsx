import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { computeTotals, formatMoney, type QuoteDocument } from "@/lib/document";
import { usePlatinum } from "@/lib/platinum";
import { getProfile, listCloudDocuments, type Profile } from "@/lib/server/account";
import { useQuoteStore } from "@/store/quote-store";

export const Route = createFileRoute("/app")({ component: DashboardRoute });

function DashboardRoute() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const recent = useQuoteStore((s) => s.recent);
  const current = useQuoteStore((s) => s.current);
  const loadDocument = useQuoteStore((s) => s.loadDocument);
  const mergeCloud = useQuoteStore((s) => s.mergeCloud);
  const platinum = usePlatinum();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    void getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
    void listCloudDocuments()
      .then(mergeCloud)
      .catch(() => undefined);
  }, [user, mergeCloud]);

  const stats = useMemo(() => summarize(recent), [recent]);
  const name =
    profile?.displayName ||
    user?.displayName ||
    current.business.name.trim();

  return (
    <RequireAuth>
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-gold-deep dark:text-gold">
          Studio
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          {name ? `Good to see you, ${name}.` : "Your studio."}
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          Saved on this device and in your account.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="This month" value={formatMoney(stats.month, stats.currency)} />
          <Stat
            label={stats.unpaidCount ? `Unpaid · ${stats.unpaidCount}` : "Unpaid"}
            value={formatMoney(stats.unpaid, stats.currency)}
          />
          <Stat label="Overdue" value={String(stats.overdueCount)} />
          <Stat label="Documents" value={String(recent.length)} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/builder">
              <Plus className="size-4" />
              New quote
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link to="/templates">Browse templates</Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link to="/clients" className="text-fg-muted hover:text-fg">
            Clients
          </Link>
          <Link to="/rates" className="text-fg-muted hover:text-fg">
            Rate card
          </Link>
          <Link to="/upgrade" className="text-fg-muted hover:text-fg">
            Platinum
          </Link>
        </div>

        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl">Recent</h2>
            <Link to="/quotes" className="text-sm text-fg-muted hover:text-fg">
              All quotes
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-fg-muted">
              Nothing saved yet. A quote takes about a minute.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recent.slice(0, 6).map((doc) => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  onOpen={() => {
                    loadDocument(doc.id);
                    void navigate({ to: "/builder" });
                  }}
                />
              ))}
            </ul>
          )}
        </section>

        {platinum.active ? (
          <Link
            to="/upgrade"
            className="mt-12 flex items-center justify-between rounded-xl bg-navy px-5 py-5 text-paper"
          >
            <div>
              <p className="font-display text-2xl">Platinum</p>
              <p className="mt-1 text-sm text-paper/65">
                {platinum.isPremium
                  ? "Platinum is on"
                  : `Trial · ${platinum.trialDaysLeft} days left`}
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0" />
          </Link>
        ) : (
          <Link
            to="/upgrade"
            className="mt-12 flex items-center justify-between rounded-xl bg-navy px-5 py-5 text-paper"
          >
            <div>
              <p className="font-display text-2xl">Trades pack</p>
              <p className="mt-1 text-sm text-paper/65">
                Unlock the trades pack
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0" />
          </Link>
        )}
      </div>
    </AppShell>
    </RequireAuth>
  );
}

function summarize(recent: QuoteDocument[]) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  let month = 0;
  let unpaid = 0;
  let unpaidCount = 0;
  let overdueCount = 0;
  let currency = "GBP";
  for (const doc of recent) {
    const total = computeTotals(doc).total;
    const stamp = doc.savedAt || doc.date || "";
    if (stamp.startsWith(monthKey)) month += total;
    if (doc.status !== "paid") {
      unpaid += total;
      unpaidCount += 1;
    }
    if (doc.status === "overdue") overdueCount += 1;
    if (doc.currency) currency = doc.currency;
  }
  return { month, unpaid, unpaidCount, overdueCount, currency };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg-elevated p-4 shadow-border">
      <p className="text-[0.65rem] uppercase tracking-[0.14em] text-fg-subtle">{label}</p>
      <p className="mt-2 font-display text-2xl tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

function DocRow({ doc, onOpen }: { doc: QuoteDocument; onOpen: () => void }) {
  const total = computeTotals(doc).total;
  return (
    <li>
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 py-3 text-left">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{doc.client.name.trim() || "Untitled client"}</p>
          <p className="truncate text-xs text-fg-muted">
            {doc.type === "invoice" ? "Invoice" : "Estimate"} · {doc.number}
          </p>
        </div>
        <p className="shrink-0 text-sm tabular-nums">{formatMoney(total, doc.currency)}</p>
      </button>
    </li>
  );
}
