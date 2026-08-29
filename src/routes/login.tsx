import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type LoginSearch = { next?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const next = typeof search.next === "string" && search.next.startsWith("/")
      ? search.next
      : undefined;
    return next ? { next } : {};
  },
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const dest =
    next === "/app" ||
    next === "/quotes" ||
    next === "/settings" ||
    next === "/templates" ||
    next === "/upgrade" ||
    next === "/builder"
      ? next
      : "/builder";
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isPending && user) {
    return <Navigate to={dest} />;
  }

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0],
        });
        if (err) throw new Error(err.message || "Could not create account.");
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message || "Could not sign in.");
      }
      void navigate({ to: dest });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-navy px-4 py-10 text-paper">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Wordmark to="/" compact onDark />
        </div>
        <p className="text-center text-[0.7rem] font-medium uppercase tracking-[0.22em] text-gold">
          InstantQuote
        </p>
        <h1 className="mt-3 text-center font-display text-4xl tracking-tight">
          {mode === "up" ? "Create your studio." : "Sign in to your studio."}
        </h1>
        <p className="mt-3 text-center text-sm text-paper/60">
          Email and password. Quotes stay with your account.
        </p>
        {!authEnabled ? (
          <p className="mt-8 text-center text-sm text-paper/50">Sign-in is disabled in this preview.</p>
        ) : (
          <form onSubmit={onEmail} className="mt-8 space-y-3">
            {mode === "up" ? (
              <div>
                <Label htmlFor="name" className="text-paper/70">Name</Label>
                <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-12 border-paper/15 bg-paper/5 text-paper placeholder:text-paper/40" placeholder="Hayes & Son" />
              </div>
            ) : null}
            <div>
              <Label htmlFor="email" className="text-paper/70">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-12 border-paper/15 bg-paper/5 text-paper placeholder:text-paper/40" placeholder="you@business.co.uk" />
            </div>
            <div>
              <Label htmlFor="password" className="text-paper/70">Password</Label>
              <Input id="password" type="password" autoComplete={mode === "up" ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-12 border-paper/15 bg-paper/5 text-paper placeholder:text-paper/40" placeholder="At least 8 characters" />
            </div>
            {error ? <p className="text-sm text-gold" role="alert">{error}</p> : null}
            <Button type="submit" size="lg" variant="gold" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
            </Button>
            <button type="button" className="w-full pt-2 text-sm text-paper/70 underline-offset-4 hover:text-paper hover:underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(""); }}>
              {mode === "in" ? "Need an account? Create one" : "Have an account? Sign in"}
            </button>
          </form>
        )}
        <p className="mt-10 text-center text-xs text-paper/40">
          <Link to="/" className="underline-offset-4 hover:underline">Back to InstantQuote</Link>
        </p>
      </div>
    </main>
  );
}
