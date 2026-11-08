import React from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  subtextColor?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: React.ReactNode;
  iconBg?: string;
  alert?: boolean;
}

export default function KpiCard({
  label,
  value,
  unit,
  subtext,
  subtextColor = "text-primary-700",
  delta,
  deltaPositive = true,
  icon,
  iconBg = "bg-primary-50 text-primary-600",
  alert = false,
}: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 border border-line-200/80 shadow-xs flex items-center gap-3.5 sm:gap-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card">
      {/* Icon Box in soft rounded square (Matches reference UI) */}
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>

      {/* Metric Content */}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-stone-500 truncate block">
          {label}
        </span>

        <div className="flex items-baseline gap-1 mt-0.5">
          <span
            className={`text-2xl sm:text-[26px] font-semibold tracking-tight tabular-nums leading-none ${
              alert ? "text-amber-600" : "text-stone-900"
            }`}
          >
            {value}
          </span>
          {unit && <span className="text-xs font-medium text-stone-500">{unit}</span>}
        </div>

        {subtext ? (
          <p className={`text-[11px] font-medium mt-1 truncate ${subtextColor}`}>
            {subtext}
          </p>
        ) : delta ? (
          <span
            className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${
              deltaPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-50 text-rose-600"
            }`}
          >
            {delta}
          </span>
        ) : null}
      </div>
    </div>
  );
}

