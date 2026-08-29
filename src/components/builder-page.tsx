import { useEffect, useRef, useState } from "react";
import {
  ActionToolbar,
  BuilderFooter,
  BuilderHeader,
  MobileDock,
} from "@/components/builder-actions";
import { BuilderForm } from "@/components/builder-form";
import { DocumentPreview } from "@/components/document-preview";
import { cn } from "@/lib/utils";
import { useQuoteStore } from "@/store/quote-store";

export type BuilderPane = "edit" | "preview";

export function BuilderPage({ loadSampleOnMount }: { loadSampleOnMount?: boolean }) {
  const doc = useQuoteStore((s) => s.current);
  const loadSample = useQuoteStore((s) => s.loadSample);
  const didLoadSample = useRef(false);
  const [pane, setPane] = useState<BuilderPane>(
    loadSampleOnMount ? "preview" : "edit",
  );

  useEffect(() => {
    if (!loadSampleOnMount || didLoadSample.current) return;
    didLoadSample.current = true;
    loadSample();
    setPane("preview");
  }, [loadSampleOnMount, loadSample]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-bg text-fg lg:min-h-0">
      <BuilderHeader />

      <div
        role="tablist"
        aria-label="Builder views"
        className="no-print grid shrink-0 grid-cols-2 gap-1 bg-bg px-3 pb-2 pt-1 lg:hidden"
      >
        {(["edit", "preview"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={pane === id}
            className={cn(
              "h-11 rounded-md text-sm font-medium capitalize transition-colors duration-150",
              pane === id
                ? "bg-bg-elevated text-fg shadow-border"
                : "text-fg-muted hover:text-fg",
            )}
            onClick={() => setPane(id)}
          >
            {id === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="mx-auto grid min-h-0 w-full max-w-[1400px] flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-stretch lg:overflow-hidden lg:px-5 lg:pb-4 lg:pt-4">
        <div
          className={cn(
            "no-print min-h-0 min-w-0 overflow-y-auto overscroll-y-contain px-3 pb-4 pt-2 lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-0",
            pane !== "edit" && "max-lg:hidden",
          )}
        >
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-gold-deep dark:text-gold">
            {doc.type === "invoice" ? "Invoice" : "Estimate"} · {doc.number}
          </p>
          <h1 className="mt-1 hidden font-display text-3xl tracking-tight text-fg lg:block">
            Build it live
          </h1>
          <p className="mt-2 hidden text-sm text-fg-muted lg:block">
            The page on the right is what they receive. Print when it looks
            right.
          </p>
          <div className="mt-4 hidden lg:mt-5 lg:block">
            <ActionToolbar />
          </div>
          <div className="mt-4 lg:mt-8">
            <BuilderForm />
          </div>
        </div>

        <aside
          id="live-preview"
          className={cn(
            "flex min-h-0 min-w-0 flex-col overflow-hidden px-3 pb-3 pt-1 lg:h-full lg:overflow-hidden lg:px-0 lg:pb-0 lg:pt-0",
            pane !== "preview" && "max-lg:hidden",
          )}
        >
          <p className="no-print mb-2 hidden text-[0.7rem] font-medium uppercase tracking-[0.16em] text-fg-subtle lg:mb-3 lg:block">
            Live preview
          </p>
          <div className="no-print min-h-0 flex-1 lg:h-full">
            <DocumentPreview doc={doc} fit="contain" />
          </div>
        </aside>
      </div>

      <div className="print-only print-root">
        <DocumentPreview doc={doc} scaleToFit={false} />
      </div>

      <div className="no-print hidden lg:block">
        <BuilderFooter />
      </div>
      <MobileDock pane={pane} onPaneChange={setPane} />
    </div>
  );
}
