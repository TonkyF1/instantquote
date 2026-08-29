import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark } from "@/components/brand-mark";
import { DocumentPreview } from "@/components/document-preview";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { sampleDocument } from "@/lib/document";
import { useQuoteStore } from "@/store/quote-store";

export function LandingPage() {
  const waitlistEmail = useQuoteStore((s) => s.waitlistEmail);
  const submitWaitlist = useQuoteStore((s) => s.submitWaitlist);
  const { user, isPending } = useCurrentUserState();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const sample = sampleDocument();
  const quoteTo = !isPending && user ? "/builder" : "/login";

  function onWaitlist(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email.");
      return;
    }
    setError("");
    submitWaitlist(value);
  }

  return (
    <div className="min-h-dvh max-w-full overflow-x-hidden bg-bg text-fg">
      <header className="no-print sticky top-0 z-30 border-b border-border/80 bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex h-14 min-w-0 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:px-6">
          <Wordmark compact />
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <SignedOut>
              <Button asChild size="sm" variant="ghost">
                <Link to="/login">Sign in</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild size="sm" variant="ghost">
                <Link to="/app">Studio</Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-w-0 max-w-6xl items-center gap-8 overflow-x-hidden px-4 py-8 sm:gap-12 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-20">
          <div className="min-w-0">
            <p className="stagger-item text-[0.68rem] font-medium uppercase tracking-[0.18em] text-gold-deep sm:text-[0.72rem] sm:tracking-[0.22em] dark:text-gold">
              Free for sole traders
            </p>
            <h1 className="stagger-item mt-4 font-display text-[2.15rem] leading-[1.1] tracking-[-0.03em] text-fg sm:mt-5 sm:text-5xl lg:text-[3.25rem]">
              Send a quote that looks like a real company
            </h1>
            <p className="stagger-item mt-4 max-w-md text-[0.95rem] leading-relaxed text-fg-muted sm:mt-5 sm:text-lg">
              One-page estimates and invoices in pounds, with VAT and bank
              details. Live as you type. Print or save as PDF. Sign in with
              email to keep quotes in your studio.
            </p>
            <div className="stagger-item mt-6 sm:mt-8">
              <Button asChild size="lg" className="w-full min-w-0 sm:w-auto">
                <Link to={quoteTo} className="whitespace-nowrap">
                  Create a quote — free
                </Link>
              </Button>
            </div>
          </div>

          <div className="stagger-item relative min-w-0 max-w-full overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-2xl bg-navy max-lg:hidden dark:bg-bg-elevated"
            />
            <div className="relative min-w-0 overflow-hidden rounded-lg lg:p-8">
              <DocumentPreview doc={sample} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="rounded-xl border border-border bg-bg-elevated px-5 py-6 sm:px-7 sm:py-7">
            {waitlistEmail ? (
              <p className="text-sm text-fg" role="status">
                You’re on the list as {waitlistEmail}. We’ll email the trades
                pack when it launches.
              </p>
            ) : (
              <form
                onSubmit={onWaitlist}
                className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="waitlist-email"
                    className="text-sm font-medium text-fg"
                  >
                    Get the trades pack when it launches
                  </label>
                  <Input
                    id="waitlist-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@business.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 h-12"
                  />
                </div>
                <Button type="submit" size="lg" className="shrink-0">
                  Notify me
                </Button>
              </form>
            )}
            {error ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <p className="mt-3 text-xs text-fg-subtle">
              Stored on this device only. No account, no mailing list server.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>Created with InstantQuote</p>
          <p>
            This is a document generator, not legal or tax advice. You are
            responsible for the contents.
          </p>
        </div>
      </footer>
    </div>
  );
}
