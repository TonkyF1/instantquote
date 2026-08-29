import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { usePlatinum } from "@/lib/platinum";
import { joinPlatinumWaitlist } from "@/lib/server/account";
import { useQuoteStore } from "@/store/quote-store";

export const Route = createFileRoute("/upgrade")({ component: UpgradeRoute });

const perks = [
  "14-day trial on every new account (already granted)",
  "11 extra UK trade templates",
  "Atelier and Ledger looks",
  "Client book and rate card",
  "Hide InstantQuote on the page",
  "Convert estimate → invoice, duplicate, email",
];

function UpgradeRoute() {
  const user = useCurrentUser();
  const platinum = usePlatinum();
  const waitlistEmail = useQuoteStore((s) => s.waitlistEmail);
  const submitWaitlist = useQuoteStore((s) => s.submitWaitlist);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.primaryEmail && !email) setEmail(user.primaryEmail);
  }, [user, email]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await joinPlatinumWaitlist({ data: value });
      submitWaitlist(value);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not join the list.";
      setError(message);
      submitWaitlist(value);
    } finally {
      setBusy(false);
    }
  }

  const status = !platinum.ready
    ? null
    : platinum.active
      ? platinum.isPremium
        ? "Platinum is on"
        : `Trial · ${platinum.trialDaysLeft} days left`
      : null;

  return (
    <RequireAuth>
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold-deep">
          Platinum
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">
          Platinum for people who quote every week.
        </h1>
        <p className="mt-3 text-fg-muted">
          £9 / month (or £79 a year when billing ships). InstantQuote stays
          free; Platinum is the extra for trades who send documents constantly.
        </p>

        <ul className="mt-8 space-y-3 text-sm">
          {perks.map((p) => (
            <li key={p} className="flex gap-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-gold" />
              {p}
            </li>
          ))}
        </ul>

        {status ? (
          <p className="mt-10 text-sm" role="status">
            {status}
          </p>
        ) : !platinum.ready ? null : (
          <div className="mt-10">
            <p className="text-sm text-fg-muted">
              A 14-day trial starts automatically the first time you visit the
              studio. When it ends, join the list and we will email you as soon
              as billing is live.
            </p>
            {waitlistEmail ? (
              <p className="mt-6 text-sm" role="status">
                You’re on the list as {waitlistEmail}.
              </p>
            ) : (
              <form onSubmit={(e) => void join(e)} className="mt-6 space-y-3">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.co.uk"
                />
                {error ? (
                  <p className="text-sm text-danger" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" size="lg" className="w-full" disabled={busy}>
                  {busy ? "Joining…" : "Notify me"}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </AppShell>
    </RequireAuth>
  );
}
