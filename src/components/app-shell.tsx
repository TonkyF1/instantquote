import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, Home, LayoutTemplate, Plus, Settings } from "lucide-react";
import { Wordmark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/quotes", label: "Quotes", icon: FileText },
  { to: "/builder", label: "New", icon: Plus },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  children,
  fill = false,
  hideTabs = false,
  hideHeader = false,
}: {
  children: React.ReactNode;
  fill?: boolean;
  hideTabs?: boolean;
  hideHeader?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className={cn("flex flex-col bg-bg text-fg lg:flex-row", fill ? "h-dvh overflow-hidden" : "min-h-dvh")}>
      <aside className="no-print hidden w-56 shrink-0 flex-col border-r border-border bg-bg-elevated pt-[env(safe-area-inset-top)] lg:flex">
        <div className="flex h-14 items-center px-4">
          <Wordmark compact to="/app" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
          {tabs.map((tab) => (
            <NavLink key={tab.to} {...tab} active={isActive(pathname, tab.to)} />
          ))}
        </nav>
        <div className="px-4 pb-6">
          <AuthChip />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {hideHeader ? null : (
        <header className="no-print sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border/80 bg-bg/90 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-sm lg:hidden">
          <Wordmark compact to="/app" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <AuthChip compact />
          </div>
        </header>
        )}
        {hideHeader ? null : (
        <div className="hidden items-center justify-end gap-2 border-b border-border px-6 py-3 lg:flex">
          <ThemeToggle />
        </div>
        )}
        <main
          className={cn(
            "min-h-0 flex-1",
            fill ? "flex flex-col overflow-hidden" : "overflow-y-auto overscroll-y-contain pb-24 lg:pb-8",
            hideTabs && !fill && "pb-8",
          )}
        >
          {children}
        </main>
        {hideTabs ? null : (
        <nav className="no-print fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(pathname, tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[0.65rem] font-medium",
                  active ? "text-fg" : "text-fg-subtle",
                )}
              >
                <Icon className={cn("size-5", tab.to === "/builder" && "size-6")} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
        )}
      </div>
    </div>
  );
}

function isActive(pathname: string, to: string) {
  if (to === "/app") return pathname === "/app" || pathname === "/app/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium",
        active ? "bg-fg/5 text-fg" : "text-fg-muted hover:bg-fg/5 hover:text-fg",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function AuthChip({ compact = false }: { compact?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-8 animate-pulse rounded-full bg-fg/10" />;
  }
  return (
    <>
      <SignedIn>
        <Link
          to="/settings"
          className="flex items-center gap-2 rounded-full text-sm font-medium"
        >
          <span className="grid size-8 place-items-center rounded-full bg-navy text-[0.7rem] text-paper">
            {(user?.displayName ?? user?.primaryEmail ?? "A").charAt(0).toUpperCase()}
          </span>
          {compact ? null : (
            <span className="max-w-[8rem] truncate text-fg-muted">
              {user?.displayName ?? user?.primaryEmail ?? "Account"}
            </span>
          )}
        </Link>
      </SignedIn>
      <SignedOut>
        <Link
          to="/login"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-fg underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </SignedOut>
    </>
  );
}
