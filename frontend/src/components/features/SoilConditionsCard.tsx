"use client";

import React from "react";
import Link from "next/link";
import { Droplets, Sprout, Thermometer, Leaf, ArrowRight } from "lucide-react";

interface SoilMetric {
  label: string;
  value: string;
  unit?: string;
  percentage: number;
  barColor: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface SoilConditionsCardProps {
  lastUpdated?: string;
  plotId?: number;
}

export default function SoilConditionsCard({
  lastUpdated = "10.30 WIB",
  plotId = 1,
}: SoilConditionsCardProps) {
  const metrics: SoilMetric[] = [
    {
      label: "Kelembapan Tanah",
      value: "68%",
      percentage: 68,
      barColor: "bg-emerald-500",
      icon: <Droplets className="w-4 h-4 text-blue-600" />,
      iconBg: "bg-blue-50",
    },
    {
      label: "Tingkat pH Tanah",
      value: "6.5",
      percentage: 65,
      barColor: "bg-emerald-500",
      icon: <Sprout className="w-4 h-4 text-emerald-600" />,
      iconBg: "bg-emerald-50",
    },
    {
      label: "Suhu Permukaan",
      value: "28°C",
      percentage: 56,
      barColor: "bg-amber-500",
      icon: <Thermometer className="w-4 h-4 text-rose-500" />,
      iconBg: "bg-rose-50",
    },
    {
      label: "Kesehatan Kanopi (NDVI)",
      value: "Subur (0.68)",
      percentage: 82,
      barColor: "bg-emerald-500",
      icon: <Leaf className="w-4 h-4 text-emerald-600" />,
      iconBg: "bg-emerald-50",
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-5 border border-line-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-normal text-ink-900">Kondisi Tanah & Satelit</h3>
          <p className="text-xs text-ink-400 mt-0.5">
            Pembaruan terakhir: {lastUpdated} · Estimasi Satelit Sentinel-2
          </p>
        </div>
        <Link
          href={`/lahan/${plotId}`}
          className="text-xs font-normal text-primary-700 hover:text-primary-800 flex items-center gap-1 group"
        >
          <span>Lihat Detail</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 2x2 Grid of Metrics with Progress Bars (Matches reference UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="p-3.5 rounded-xl bg-surface-50 border border-line-200/60 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${m.iconBg}`}>
                {m.icon}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-ink-400 block truncate">
                  {m.label}
                </span>
                <span className="text-lg font-normal text-ink-900 tracking-tight tabular-nums">
                  {m.value}
                </span>
              </div>
            </div>

            {/* Progress Mini Bar */}
            <div className="w-full h-1.5 bg-line-200 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${m.barColor} transition-all duration-500`}
                style={{ width: `${m.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

