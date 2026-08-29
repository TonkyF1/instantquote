import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePlatinum } from "@/lib/platinum";
import { useQuoteStore } from "@/store/quote-store";

export const Route = createFileRoute("/clients")({ component: ClientsRoute });

function ClientsRoute() {
  const navigate = useNavigate();
  const platinum = usePlatinum();
  const clients = useQuoteStore((s) => s.clients);
  const upsertClient = useQuoteStore((s) => s.upsertClient);
  const applyClient = useQuoteStore((s) => s.applyClient);
  const removeClient = useQuoteStore((s) => s.removeClient);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((c) => {
      const hay = `${c.name} ${c.email} ${c.address}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [clients, q]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const nextName = name.trim();
    if (!nextName) return;
    upsertClient({ name: nextName, email: email.trim(), address: address.trim() });
    setName("");
    setEmail("");
    setAddress("");
  }

  function apply(id: string) {
    if (!platinum.active) {
      void navigate({ to: "/upgrade" });
      return;
    }
    applyClient(id);
    void navigate({ to: "/builder" });
  }

  return (
    <RequireAuth>
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold-deep">
          Platinum
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Client book</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Names you have quoted before, ready to drop on the next document.
        </p>

        {!platinum.active ? (
          <div className="mt-6 rounded-xl bg-navy px-5 py-4 text-paper">
            <p className="font-display text-2xl">Locked on the free plan</p>
            <p className="mt-1 text-sm text-paper/65">
              You can still browse saved clients. Apply is part of Platinum.{" "}
              <Link to="/upgrade" className="underline underline-offset-4">
                See Platinum
              </Link>
            </p>
          </div>
        ) : null}

        <form onSubmit={add} className="mt-8 space-y-3 rounded-xl bg-bg-elevated p-5 shadow-border">
          <h2 className="text-sm font-medium">Add a client</h2>
          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Hayes & Son"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jobs@example.co.uk"
            />
          </Field>
          <Field label="Address">
            <Textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="12 Railway Cuttings, Bath"
            />
          </Field>
          <Button type="submit">Save client</Button>
        </form>

        <Input
          className="mt-8"
          placeholder="Search name, email or address"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {clients.length === 0 ? (
          <p className="mt-10 text-sm text-fg-muted">
            Clients appear when you save a quote.
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-sm text-fg-muted">No clients match.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {filtered.map((client) => (
              <li
                key={client.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{client.name}</p>
                  {client.email ? (
                    <p className="truncate text-xs text-fg-muted">{client.email}</p>
                  ) : null}
                  {client.address ? (
                    <p className="truncate text-xs text-fg-subtle">
                      {client.address.replace(/\s*\n\s*/g, ", ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => apply(client.id)}>
                    Apply
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeClient(client.id)}
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
