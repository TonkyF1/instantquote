import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-xs font-medium tracking-wide text-fg-muted", className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export function Field({
  label, htmlFor, hint, className, children,
}: {
  label: string; htmlFor?: string; hint?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-fg-subtle">{hint}</p> : null}
    </div>
  );
}
