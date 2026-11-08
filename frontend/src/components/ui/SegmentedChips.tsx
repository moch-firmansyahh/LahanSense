import React from "react";

interface Option<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  hint?: string;
}

interface SegmentedChipsProps<T extends string> {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}

export default function SegmentedChips<T extends string>({
  label,
  options,
  value,
  onChange,
  className = "",
}: SegmentedChipsProps<T>) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-ink-900">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-150 select-none ${
                isSelected
                  ? "bg-forest-900 text-lime-400 shadow-sm ring-1 ring-forest-900 scale-[1.02]"
                  : "bg-surface-50 hover:bg-line-200/60 text-ink-600 border border-line-200"
              }`}
            >
              {opt.icon && <span>{opt.icon}</span>}
              <span>{opt.label}</span>
              {opt.hint && (
                <span className={`text-[10px] ${isSelected ? "text-primary-100" : "text-ink-400"}`}>
                  ({opt.hint})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

