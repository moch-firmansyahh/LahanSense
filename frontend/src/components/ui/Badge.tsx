import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-normal transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-primary-600 text-white",
        secondary:
          "border border-line-200 bg-surface-50 text-ink-900",
        destructive:
          "border border-transparent bg-danger-600 text-white",
        outline:
          "border border-line-200 text-ink-900 bg-white",
        aman: "bg-primary-100 text-forest-900 border border-primary-200/60",
        waspada: "bg-warn-50 text-amber-900 border border-warn-500/30",
        kritis: "bg-danger-50 text-red-900 border border-danger-600/30",
        water: "bg-water-50 text-water-600 border border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: "aman" | "waspada" | "kritis";
}

function Badge({ className, variant, status, children, ...props }: BadgeProps) {
  const resolvedVariant = status ? status : variant;

  const dotColors: Record<string, string> = {
    aman: "bg-primary-600",
    waspada: "bg-warn-500",
    kritis: "bg-danger-600",
  };

  const statusLabels: Record<string, string> = {
    aman: "Aman",
    waspada: "Waspada",
    kritis: "Kritis",
  };

  return (
    <div className={cn(badgeVariants({ variant: resolvedVariant }), className)} {...props}>
      {status && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[status])}
          aria-hidden="true"
        />
      )}
      {children || (status ? statusLabels[status] : null)}
    </div>
  );
}

export { Badge, badgeVariants };
export default Badge;
