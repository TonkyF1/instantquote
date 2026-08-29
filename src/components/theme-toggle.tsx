import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuoteStore } from "@/store/quote-store";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useQuoteStore((s) => s.theme);
  const toggleTheme = useQuoteStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("relative", className)}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="relative size-4">
        <Sun
          className={cn(
            "absolute inset-0 size-4 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
            isDark
              ? "scale-[0.25] opacity-0 blur-[4px]"
              : "scale-100 opacity-100 blur-none",
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 size-4 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
            isDark
              ? "scale-100 opacity-100 blur-none"
              : "scale-[0.25] opacity-0 blur-[4px]",
          )}
        />
      </span>
    </Button>
  );
}
