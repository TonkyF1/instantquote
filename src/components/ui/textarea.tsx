import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-sm border border-border bg-bg-elevated px-3 py-2.5 text-base text-fg transition-[border-color,box-shadow] duration-150 md:text-sm",
        "placeholder:text-fg-subtle",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:border-gold",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
