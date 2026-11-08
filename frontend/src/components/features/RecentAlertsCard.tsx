"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface AlertItem {
  id: number;
  severity: "kritis" | "waspada" | "selesai";
  title: string;
  time: string;
}

const DEFAULT_ALERTS: AlertItem[] = [
  {
    id: 1,
    severity: "kritis",
    title: "Kelembapan tanah rendah di Blok B (Cabai)",
    time: "Hari ini, 08.15 WIB",
  },
  {
    id: 2,
    severity: "waspada",
    title: "Prakiraan suhu ekstrem 34°C besok siang",
    time: "Besok, 06.00 WIB",
  },
  {
    id: 3,
    severity: "selesai",
    title: "Irigasi 28 m³ selesai dicatat di Blok A (Padi)",
    time: "Hari ini, 07.30 WIB",
  },
];

export default function RecentAlertsCard({
  alerts = DEFAULT_ALERTS,
}: {
  alerts?: AlertItem[];
}) {
  return (
    <div className="rounded-2xl bg-white p-5 border border-line-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-base font-normal text-ink-900">Peringatan Terbaru</h3>
        <Link
          href="/peringatan"
          className="text-xs font-normal text-primary-700 hover:text-primary-800 flex items-center gap-1 group"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Alert Rows List (Matches reference UI) */}
      <div className="space-y-2.5">
        {alerts.map((a) => {
          const iconConfig = {
            kritis: {
              icon: <AlertTriangle className="w-4 h-4 text-danger-600" />,
              bg: "bg-rose-50 border-rose-200/60",
            },
            waspada: {
              icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
              bg: "bg-amber-50 border-amber-200/60",
            },
            selesai: {
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
              bg: "bg-emerald-50 border-emerald-200/60",
            },
          }[a.severity];

          return (
            <div
              key={a.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 border border-line-200/50 transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${iconConfig.bg}`}
              >
                {iconConfig.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-normal text-ink-900 truncate">{a.title}</p>
                <p className="text-[11px] text-ink-400 mt-0.5 font-medium">{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

