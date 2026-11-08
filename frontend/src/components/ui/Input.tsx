import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  helper?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, helper, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hintText = hint || helper;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-ink-900"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-xl border border-line-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-ink-900 ring-offset-white placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:border-primary-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-2xs",
            error && "border-danger-600 focus-visible:ring-danger-600",
            className
          )}
          ref={ref}
          {...props}
        />
        {hintText && !error && (
          <p className="text-[11px] text-ink-400 font-medium">{hintText}</p>
        )}
        {error && (
          <p className="text-[11px] text-danger-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
export default Input;
