import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { CURRENCIES } from "@/lib/currency";
import { emptyPayment } from "@/lib/document";
import { getProfile, saveProfile, type Profile } from "@/lib/server/account";
import { useQuoteStore } from "@/store/quote-store";

export const Route = createFileRoute("/settings")({ component: SettingsRoute });

function SettingsRoute() {
  const user = useCurrentUser();
  const theme = useQuoteStore((s) => s.theme);
  const setTheme = useQuoteStore((s) => s.setTheme);
  const defaultCurrency = useQuoteStore((s) => s.defaultCurrency);
  const setDefaultCurrency = useQuoteStore((s) => s.setDefaultCurrency);
  const patchBusiness = useQuoteStore((s) => s.patchBusiness);
  const patchPayment = useQuoteStore((s) => s.patchPayment);
  const current = useQuoteStore((s) => s.current);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void getProfile()
      .then((p) => {
        setProfile(p);
        setDefaultCurrency(p.currency);
        if (p.business.name) patchBusiness(p.business);
        if (p.payment) patchPayment(p.payment);
      })
      .catch(() => undefined);
  }, [user, patchBusiness, patchPayment, setDefaultCurrency]);

  async function persist() {
    setSaving(true);
    try {
      if (user) {
        const next = await saveProfile({
          data: {
            displayName: profile?.displayName ?? user.displayName ?? "",
            currency: defaultCurrency,
            business: current.business,
            payment: current.payment ?? emptyPayment(),
          },
        });
        setProfile(next);
      }
      toast.success("Settings saved");
    } catch {
      toast.error("Saved on this device. Could not reach your account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Defaults for every new document.
        </p>

        <section className="mt-8 rounded-xl bg-bg-elevated p-5 shadow-border">
          <h2 className="text-sm font-medium">Account</h2>
          <div className="mt-3">
            <UserButton />
            <p className="mt-2 text-xs text-fg-muted">
              Signed in with email. Sign out from here.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link to="/clients">Client book</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to="/rates">Rate card</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to="/upgrade">Platinum</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <Field label="Default currency">
            <Select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Appearance">
            <Select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
              <option value="light">Light — ivory</option>
              <option value="dark">Dark — graphite</option>
            </Select>
          </Field>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium">Business</h2>
          <div className="mt-3 grid gap-3">
            <Field label="Name">
              <Input
                value={current.business.name}
                onChange={(e) => patchBusiness({ name: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={current.business.email}
                onChange={(e) => patchBusiness({ email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={current.business.phone}
                onChange={(e) => patchBusiness({ phone: e.target.value })}
              />
            </Field>
            <Field label="Website">
              <Input
                value={current.business.website}
                onChange={(e) => patchBusiness({ website: e.target.value })}
              />
            </Field>
            <Field label="Tagline">
              <Input
                value={current.business.tagline}
                onChange={(e) => patchBusiness({ tagline: e.target.value })}
              />
            </Field>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium">Bank details</h2>
          <p className="mt-1 text-xs text-fg-muted">
            Optional. Printed when you add them to a quote.
          </p>
          <div className="mt-3 grid gap-3">
            <Field label="Sort code">
              <Input
                placeholder="20-00-00"
                value={current.payment.sortCode}
                onChange={(e) => patchPayment({ sortCode: e.target.value })}
              />
            </Field>
            <Field label="Account number">
              <Input
                placeholder="12345678"
                value={current.payment.accountNumber}
                onChange={(e) => patchPayment({ accountNumber: e.target.value })}
              />
            </Field>
            <Field label="Extra notes">
              <Textarea
                rows={3}
                value={current.payment.bankDetails}
                onChange={(e) => patchPayment({ bankDetails: e.target.value })}
                placeholder="Account name, reference…"
              />
            </Field>
            <Field label="PayPal (optional)">
              <Input
                value={current.payment.paypal}
                onChange={(e) => patchPayment({ paypal: e.target.value })}
              />
            </Field>
            <Field label="Stripe link (optional)">
              <Input
                type="url"
                value={current.payment.paymentLink}
                onChange={(e) => patchPayment({ paymentLink: e.target.value })}
              />
            </Field>
          </div>
        </section>

        <Button
          type="button"
          className="mt-8"
          disabled={saving}
          onClick={() => void persist()}
        >
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </AppShell>
    </RequireAuth>
  );
}
