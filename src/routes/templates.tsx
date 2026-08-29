import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { newId } from "@/lib/document";
import { usePlatinum } from "@/lib/platinum";
import {
  LOOKS,
  TEMPLATES,
  type QuoteTemplate,
} from "@/lib/templates";
import { useQuoteStore } from "@/store/quote-store";

export const Route = createFileRoute("/templates")({ component: TemplatesRoute });

function groupByProfession(templates: QuoteTemplate[]) {
  const order: string[] = [];
  const map = new Map<string, QuoteTemplate[]>();
  for (const tpl of templates) {
    if (!map.has(tpl.profession)) {
      order.push(tpl.profession);
      map.set(tpl.profession, []);
    }
    map.get(tpl.profession)!.push(tpl);
  }
  return order.map((profession) => ({
    profession,
    templates: map.get(profession)!,
  }));
}

function PlatinumBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-gold-deep">
      <Lock className="size-3" />
      Platinum
    </span>
  );
}

function TemplatesRoute() {
  const navigate = useNavigate();
  const platinum = usePlatinum();
  const loadTemplate = useQuoteStore((s) => s.loadTemplate);
  const loadSample = useQuoteStore((s) => s.loadSample);
  const patchCurrent = useQuoteStore((s) => s.patchCurrent);
  const groups = groupByProfession(TEMPLATES);

  function applyTpl(tpl: QuoteTemplate) {
    if (tpl.tier === "platinum" && !platinum.active) {
      void navigate({ to: "/upgrade" });
      return;
    }
    const doc = { ...tpl.build(), id: newId() };
    loadTemplate(doc);
    void navigate({ to: "/builder" });
  }

  function applyLook(lookId: (typeof LOOKS)[number]["id"], tier: (typeof LOOKS)[number]["tier"]) {
    if (tier === "platinum" && !platinum.active) {
      void navigate({ to: "/upgrade" });
      return;
    }
    patchCurrent({ look: lookId });
    void navigate({ to: "/builder" });
  }

  return (
    <RequireAuth>
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl tracking-tight">Templates</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Start from a finished document. Free templates stay free; the trades
          pack is Platinum.
        </p>

        <Button
          type="button"
          className="mt-6"
          onClick={() => {
            loadSample();
            void navigate({ to: "/builder" });
          }}
        >
          Load sample bathroom quote
        </Button>

        <h2 className="mt-10 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fg-subtle">
          Looks
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {LOOKS.map((look) => {
            const locked = look.tier === "platinum" && !platinum.active;
            return (
              <button
                key={look.id}
                type="button"
                className="rounded-xl bg-bg-elevated p-4 text-left shadow-border"
                onClick={() => applyLook(look.id, look.tier)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{look.name}</p>
                  {locked ? <PlatinumBadge /> : null}
                </div>
                <p className="mt-1 text-xs text-fg-muted">{look.blurb}</p>
              </button>
            );
          })}
        </div>

        <h2 className="mt-10 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fg-subtle">
          Trades
        </h2>
        <div className="mt-3 space-y-8">
          {groups.map((group) => (
            <section key={group.profession}>
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-gold-deep">
                {group.profession}
              </p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {group.templates.map((tpl) => {
                  const locked = tpl.tier === "platinum" && !platinum.active;
                  return (
                    <li
                      key={`${tpl.profession}-${tpl.name}-${tpl.look}`}
                      className="rounded-xl bg-bg-elevated p-5 shadow-border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-gold-deep">
                          {tpl.profession}
                        </p>
                        {locked ? <PlatinumBadge /> : null}
                      </div>
                      <h3 className="mt-1 font-display text-2xl">{tpl.name}</h3>
                      <p className="mt-2 text-sm text-fg-muted">{tpl.blurb}</p>
                      <p className="mt-2 text-xs text-fg-subtle">
                        {tpl.currency} · {tpl.look}
                      </p>
                      {locked ? (
                        <Button asChild size="sm" className="mt-4" variant="gold">
                          <Link to="/upgrade">Unlock with Platinum</Link>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className="mt-4"
                          onClick={() => applyTpl(tpl)}
                        >
                          Use template
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-8 text-sm text-fg-muted">
          <Link to="/upgrade" className="underline-offset-4 hover:underline">
            Platinum
          </Link>{" "}
          unlocks Atelier, Ledger, the trades pack, the client book and the rate
          card.
        </p>
      </div>
    </AppShell>
    </RequireAuth>
  );
}
