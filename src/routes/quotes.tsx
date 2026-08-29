import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import {
  STATUSES,
  computeTotals,
  formatDisplayDate,
  formatMoney,
  type DocStatus,
  type QuoteDocument,
} from "@/lib/document";
import { deleteCloudDocument, listCloudDocuments, upsertCloudDocument } from "@/lib/server/account";
import { useQuoteStore } from "@/store/quote-store";

export const Route = createFileRoute("/quotes")({ component: QuotesRoute });

function QuotesRoute() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const recent = useQuoteStore((s) => s.recent);
  const loadDocument = useQuoteStore((s) => s.loadDocument);
  const deleteDocument = useQuoteStore((s) => s.deleteDocument);
  const mergeCloud = useQuoteStore((s) => s.mergeCloud);
  const patchCurrent = useQuoteStore((s) => s.patchCurrent);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (!user) return;
    void listCloudDocuments().then(mergeCloud).catch(() => undefined);
  }, [user, mergeCloud]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return recent.filter((doc) => {
      if (status !== "all" && doc.status !== status) return false;
      if (!needle) return true;
      const hay = `${doc.client.name} ${doc.number} ${doc.business.name} ${doc.type}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [recent, q, status]);

  function exportCsv() {
    const rows = [
      ["Number", "Type", "Status", "Date", "Client", "Total", "Currency"].join(","),
      ...recent.map((doc) => {
        const total = computeTotals(doc).total;
        const cells = [
          doc.number,
          doc.type,
          doc.status,
          doc.date,
          `"${doc.client.name.replaceAll('"', '""')}"`,
          String(total),
          doc.currency,
        ];
        return cells.join(",");
      }),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "instantquote-quotes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function open(doc: QuoteDocument) {
    loadDocument(doc.id);
    void navigate({ to: "/builder" });
  }

  function remove(id: string) {
    deleteDocument(id);
    if (user) void deleteCloudDocument({ data: id }).catch(() => undefined);
  }

  function markPaid(doc: QuoteDocument) {
    const updated = {
      ...doc,
      status: "paid" as DocStatus,
      savedAt: new Date().toISOString(),
    };
    mergeCloud([updated]);
    if (useQuoteStore.getState().current.id === doc.id) {
      patchCurrent({ status: "paid" });
    }
    if (user) void upsertCloudDocument({ data: updated }).catch(() => undefined);
  }

  return (
    <RequireAuth>
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Quotes</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Stored on this device and in your account.
        </p>
        <div className="mt-4">
          <Button type="button" variant="secondary" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_10rem]">
          <Input
            placeholder="Search client or number"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-fg-muted">No documents match.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {filtered.map((doc) => {
              const total = computeTotals(doc).total;
              return (
                <li key={doc.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => open(doc)}>
                    <p className="truncate font-medium">{doc.client.name.trim() || "Untitled client"}</p>
                    <p className="text-xs text-fg-muted">
                      {doc.type === "invoice" ? "Invoice" : "Estimate"} · {doc.number} ·{" "}
                      {formatDisplayDate(doc.date)} · {doc.status} · {doc.currency}
                    </p>
                  </button>
                  <p className="text-sm tabular-nums sm:w-28 sm:text-right">
                    {formatMoney(total, doc.currency)}
                  </p>
                  <div className="flex gap-2">
                    {doc.status !== "paid" ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => markPaid(doc)}>
                        Paid
                      </Button>
                    ) : null}
                    <Button type="button" variant="danger" size="sm" onClick={() => void remove(doc.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
    </RequireAuth>
  );
}
