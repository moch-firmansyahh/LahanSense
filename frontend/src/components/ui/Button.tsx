import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white shadow-xs hover:bg-primary-700 hover:shadow-sm",
        primary:
          "bg-primary-600 text-white shadow-xs hover:bg-primary-700 hover:shadow-sm",
        destructive:
          "bg-danger-600 text-white shadow-xs hover:bg-red-700",
        danger:
          "bg-danger-600 text-white shadow-xs hover:bg-red-700",
        outline:
          "border border-line-200 bg-white text-ink-900 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200",
        secondary:
          "bg-surface-50 text-ink-900 border border-line-200 hover:bg-white hover:border-line-200/80",
        ghost:
          "text-ink-600 hover:bg-surface-50 hover:text-ink-900",
        link: "text-primary-600 underline-offset-4 hover:underline",
        forest:
          "bg-forest-900 text-white hover:bg-forest-800 shadow-sm",
        "on-dark":
          "bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-xs",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-sm font-normal",
        icon: "h-9 w-9 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, icon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
