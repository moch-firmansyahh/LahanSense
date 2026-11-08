"use client";

import React, { useState } from "react";
import { Check, Droplets } from "lucide-react";

interface SoilHealthCardProps {
  deficitMm?: number;
  etcMm?: number;
  peffMm?: number;
  volumeM3?: number;
  onLogIrrigation?: (volume: number) => void;
}

export default function SoilHealthCard({
  deficitMm = 2.8,
  etcMm = 5.1,
  peffMm = 0.0,
  volumeM3 = 28.0,
  onLogIrrigation,
}: SoilHealthCardProps) {
  const [logged, setLogged] = useState(false);

  function handleLog() {
    setLogged(true);
    if (onLogIrrigation) {
      onLogIrrigation(volumeM3);
    }
    setTimeout(() => setLogged(false), 3000);
  }

  return (
    <div className="rounded-2xl p-5 select-none text-white shadow-sm flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#457943] via-[#3B6A39] to-[#2B522A] border border-white/10">
      {/* Background soft ambient leaf glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h4 className="text-xs font-normal text-white tracking-tight">
          Kesehatan Tanah & Air
        </h4>
        <span className="text-white/60 font-normal text-xs tracking-widest cursor-pointer hover:text-white">
          ••
        </span>
      </div>

      {/* Progress Bars (Matching Reference Image) */}
      <div className="flex flex-col gap-3.5 my-1 relative z-10">
        {/* Metric 1: Defisit Bersih (N Level in ref) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
            <span>Defisit Bersih</span>
            <span className="font-normal tabular-nums">{deficitMm.toFixed(1)} mm</span>
          </div>
          <div className="h-3 w-full rounded-full bg-black/20 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-white/60 to-white shadow-xs transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(15, (deficitMm / 4.0) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Kebutuhan ETc (P Level in ref) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
            <span>Kebutuhan Tanaman (ETc)</span>
            <span className="font-normal tabular-nums">{etcMm.toFixed(1)} mm</span>
          </div>
          <div className="h-3 w-full rounded-full bg-black/20 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-white/60 to-white shadow-xs transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(20, (etcMm / 6.0) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Hujan Efektif (K Level in ref) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
            <span>Hujan Efektif (Peff)</span>
            <span className="font-normal tabular-nums">{peffMm.toFixed(1)} mm</span>
          </div>
          <div className="h-3 w-full rounded-full bg-black/20 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-white/60 to-white shadow-xs transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(12, (peffMm / 10.0) * 100 + 15))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between relative z-10">
        <span className="text-[11px] text-white/80 font-medium">
          Rekomendasi: {volumeM3.toFixed(0)} m³ air
        </span>
        <button
          type="button"
          onClick={handleLog}
          disabled={logged}
          className={`px-3 py-1.5 rounded-xl text-xs font-normal flex items-center gap-1.5 transition-all cursor-pointer ${
            logged
              ? "bg-white text-emerald-900 shadow-sm"
              : "bg-white/20 hover:bg-white text-white hover:text-emerald-950 backdrop-blur-xs"
          }`}
        >
          {logged ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tercatat!</span>
            </>
          ) : (
            <>
              <Droplets className="w-3.5 h-3.5" />
              <span>Sudah Diairi</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

