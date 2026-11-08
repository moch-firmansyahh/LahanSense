"use client";

import React from "react";
import { CloudSun, Wind, Droplets } from "lucide-react";

interface WeatherStripedCardProps {
  temp?: number;
  condition?: string;
  windKm?: number;
  humidity?: number;
}

export default function WeatherStripedCard({
  temp = 30,
  condition = "Cerah Berawan",
  windKm = 14,
  humidity = 62,
}: WeatherStripedCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 border border-line-200/80 shadow-2xs flex flex-col justify-between select-none">
      {/* Top Header & Conditions */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-normal text-ink-900 tracking-tight">Cuaca Hari Ini</span>
        <div className="flex flex-col items-end gap-1 text-[11px] font-medium text-ink-600">
          <div className="flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
            <span>{condition}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-ink-400">
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-ink-400" /> {windKm} km/j
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-blue-500" /> {humidity}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Temperature Display */}
      <div className="my-2 sm:my-3 flex items-baseline justify-center">
        <span className="text-4xl sm:text-5xl font-normal text-ink-900 tracking-tight tabular-nums font-serif">
          {temp}°
        </span>
      </div>

      {/* Temperature Range Striped Bars (Matching Reference Image) */}
      <div className="flex items-center gap-2.5 pt-1">
        {/* Left Striped Bar: Green range 27° - 28° */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-normal text-ink-600 tabular-nums px-1">
            <span>27°</span>
            <span>28°</span>
          </div>
          <div
            className="h-7 w-full rounded-xl overflow-hidden shadow-2xs border border-emerald-400/30 relative"
            style={{
              backgroundColor: "#78D352",
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255, 255, 255, 0.45) 6px, rgba(255, 255, 255, 0.45) 12px)",
            }}
          />
        </div>

        {/* Right Striped Bar: Amber/Yellow range 30° - 31° */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-normal text-ink-600 tabular-nums px-1">
            <span>30°</span>
            <span>31°</span>
          </div>
          <div
            className="h-7 w-full rounded-xl overflow-hidden shadow-2xs border border-amber-400/30 relative"
            style={{
              backgroundColor: "#F2B838",
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255, 255, 255, 0.45) 6px, rgba(255, 255, 255, 0.45) 12px)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

