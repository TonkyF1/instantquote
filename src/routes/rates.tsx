import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { formatMoney, parseDecimal } from "@/lib/document";
import { usePlatinum } from "@/lib/platinum";
import { useQuoteStore } from "@/store/quote-store";

export const Route = createFileRoute("/rates")({ component: RatesRoute });

function RatesRoute() {
  const navigate = useNavigate();
  const platinum = usePlatinum();
  const rates = useQuoteStore((s) => s.rates);
  const currency = useQuoteStore((s) => s.defaultCurrency);
  const upsertRate = useQuoteStore((s) => s.upsertRate);
  const applyRate = useQuoteStore((s) => s.applyRate);
  const removeRate = useQuoteStore((s) => s.removeRate);
  const [description, setDescription] = useState("");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    const next = description.trim();
    if (!next) return;
    upsertRate({
      description: next,
      qty: parseDecimal(qty, 2) || 1,
      unitPrice: parseDecimal(unitPrice, 2),
    });
    setDescription("");
    setQty("1");
    setUnitPrice("");
  }

  function apply(id: string) {
    if (!platinum.active) {
      void navigate({ to: "/upgrade" });
      return;
    }
    applyRate(id);
    void navigate({ to: "/builder" });
  }

  return (
    <RequireAuth>
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold-deep">
          Platinum
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Rate card</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Day rates, call-outs and extras you reuse on every quote.
        </p>

        {!platinum.active ? (
          <div className="mt-6 rounded-xl bg-navy px-5 py-4 text-paper">
            <p className="font-display text-2xl">Locked on the free plan</p>
            <p className="mt-1 text-sm text-paper/65">
              You can still browse saved rates. Apply is part of Platinum.{" "}
              <Link to="/upgrade" className="underline underline-offset-4">
                See Platinum
              </Link>
            </p>
          </div>
        ) : null}

        <form onSubmit={add} className="mt-8 space-y-3 rounded-xl bg-bg-elevated p-5 shadow-border">
          <h2 className="text-sm font-medium">Add a rate</h2>
          <Field label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Call-out + first hour"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Qty">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                className="tabular-nums"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </Field>
            <Field label="Unit price">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                className="tabular-nums"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="95"
              />
            </Field>
          </div>
          <Button type="submit">Save rate</Button>
        </form>

        {rates.length === 0 ? (
          <p className="mt-10 text-sm text-fg-muted">
            No rates yet. Add the lines you type every week.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {rates.map((rate) => (
              <li
                key={rate.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{rate.description}</p>
                  <p className="text-xs text-fg-muted">
                    {rate.qty} × {formatMoney(rate.unitPrice, currency)}
                  </p>
                </div>
                <p className="text-sm tabular-nums sm:w-28 sm:text-right">
                  {formatMoney(rate.qty * rate.unitPrice, currency)}
                </p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => apply(rate.id)}>
                    Apply
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeRate(rate.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
    </RequireAuth>
  );
}
