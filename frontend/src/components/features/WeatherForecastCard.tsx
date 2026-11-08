"use client";

import React from "react";
import Link from "next/link";
import {
  SunMedium,
  CloudSun,
  CloudRain,
  MapPin,
  ArrowRight,
  Wind,
  Droplets,
} from "lucide-react";

import type { ForecastDay } from "@/types/api";

interface WeatherDay {
  day: string;
  icon: "sun" | "cloud-sun" | "rain";
  temp: number;
}

interface WeatherForecastCardProps {
  location?: string;
  temp?: number;
  condition?: string;
  forecast?: ForecastDay[];
}

const FORECAST_DAYS: WeatherDay[] = [
  { day: "Sel", icon: "sun", temp: 28 },
  { day: "Rab", icon: "rain", temp: 27 },
  { day: "Kam", icon: "sun", temp: 29 },
  { day: "Jum", icon: "rain", temp: 28 },
  { day: "Sab", icon: "cloud-sun", temp: 27 },
];

export default function WeatherForecastCard({
  location = "Karawang, Jawa Barat",
  temp = 28,
  condition = "Cerah Berawan",
}: WeatherForecastCardProps) {
  function renderIcon(type: WeatherDay["icon"], className = "w-4 h-4") {
    if (type === "rain") return <CloudRain className={`${className} text-water-600`} />;
    if (type === "cloud-sun") return <CloudSun className={`${className} text-amber-500`} />;
    return <SunMedium className={`${className} text-amber-500`} />;
  }

  return (
    <div className="rounded-2xl bg-white p-5 border border-line-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-normal text-ink-900">Prakiraan Cuaca</h3>
          <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary-600" />
            <span>{location}</span>
          </p>
        </div>
        <Link
          href="/peringatan"
          className="text-xs font-normal text-primary-700 hover:text-primary-800 flex items-center gap-1 group"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Current Main Weather Highlight (Matches reference UI) */}
      <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-50/60 to-surface-50 border border-line-200/50 mb-3.5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-100/70 flex items-center justify-center shrink-0">
            <CloudSun className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-normal text-ink-900 tracking-tight tabular-nums">
                {temp}°C
              </span>
            </div>
            <span className="text-xs font-medium text-ink-600">{condition}</span>
          </div>
        </div>

        <div className="hidden sm:flex flex-col gap-1 text-[11px] text-ink-400 font-medium text-right">
          <span className="flex items-center gap-1 justify-end">
            <Wind className="w-3 h-3 text-ink-400" /> 12 km/jam
          </span>
          <span className="flex items-center gap-1 justify-end">
            <Droplets className="w-3 h-3 text-water-600" /> Hujan 0 mm
          </span>
        </div>
      </div>

      {/* 5-Day Forecast Strip (Matches reference UI) */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-2 border-t border-line-200/60">
        {FORECAST_DAYS.map((item, idx) => (
          <div
            key={item.day}
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              idx === 0 ? "bg-amber-50/50 font-normal" : "hover:bg-surface-50"
            }`}
          >
            <span className="text-[11px] font-normal text-ink-600 uppercase mb-1.5">
              {item.day}
            </span>
            <div className="my-1">{renderIcon(item.icon, "w-5 h-5")}</div>
            <span className="text-xs font-normal text-ink-900 tabular-nums mt-1">
              {item.temp}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

