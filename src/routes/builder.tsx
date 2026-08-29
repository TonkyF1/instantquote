import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { BuilderPage } from "@/components/builder-page";
import { RequireAuth } from "@/components/require-auth";

type BuilderSearch = {
  sample?: boolean;
};

export const Route = createFileRoute("/builder")({
  validateSearch: (search: Record<string, unknown>): BuilderSearch => {
    const sample =
      search.sample === true ||
      search.sample === "true" ||
      search.sample === "1";
    return sample ? { sample: true } : {};
  },
  component: BuilderRoute,
});

function BuilderRoute() {
  const { sample } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sample) return;
    void navigate({ to: "/builder", replace: true });
  }, [sample, navigate]);

  return (
    <RequireAuth>
      <AppShell fill hideTabs hideHeader>
        <BuilderPage loadSampleOnMount={Boolean(sample)} />
      </AppShell>
    </RequireAuth>
  );
}
