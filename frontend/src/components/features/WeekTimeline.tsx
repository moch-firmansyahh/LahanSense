"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, SunMedium, CloudRain } from "lucide-react";
import { formatDayInitial } from "@/lib/format";
import type { ForecastDay } from "@/types/api";

interface WeekTimelineProps {
  forecast: ForecastDay[];
}

export default function WeekTimeline({ forecast }: WeekTimelineProps) {
  const days = forecast.slice(0, 7);
  const hasAlert = days.some((d) => d.status === "waspada" || d.status === "kritis");

  return (
    <div className="rounded-card bg-white p-4 md:p-5 border border-line-200 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-normal text-ink-900 flex items-center gap-2">
          <span>Peringatan Dini 7 Hari</span>
          {hasAlert && <span className="w-2 h-2 rounded-full bg-warn-500" />}
        </h3>
        <Link
          href="/peringatan"
          className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
        >
          <span>Detail</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 7-Day segmented bar */}
      <div className="grid grid-cols-7 gap-1.5 my-2">
        {days.map((d, i) => {
          const isToday = i === 0;
          const statusBg =
            d.status === "kritis"
              ? "bg-danger-600"
              : d.status === "waspada"
              ? "bg-warn-500"
              : "bg-primary-600";

          return (
            <div
              key={d.date}
              className={`flex flex-col items-center py-2 px-1 rounded-sm transition-colors ${
                isToday ? "bg-primary-50 ring-1 ring-primary-600/30" : "bg-surface-50"
              }`}
            >
              <span className="text-[10px] font-normal text-ink-400 uppercase">
                {formatDayInitial(d.date)}
              </span>

              <div className="my-1.5">
                {d.rain_mm > 5 ? (
                  <CloudRain className="w-3.5 h-3.5 text-water-600" />
                ) : (
                  <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>

              {/* Status bar pill */}
              <div className={`w-full h-1.5 rounded-full ${statusBg}`} />
            </div>
          );
        })}
      </div>

      {/* Summary message */}
      <div className="mt-2 pt-2 border-t border-line-200 flex items-start gap-2 text-xs text-ink-600">
        <AlertTriangle className="w-4 h-4 text-warn-500 shrink-0 mt-0.5" />
        <p className="line-clamp-2">
          {hasAlert
            ? "Risiko kekeringan diperkirakan terjadi dalam 3 hari ke depan. Majukan jadwal irigasi."
            : "Kondisi air tanah dan prakiraan cuaca 7 hari ke depan relatif aman."}
        </p>
      </div>
    </div>
  );
}

