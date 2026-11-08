"use client";

import React, { useState } from "react";
import { Droplets, Sprout, Thermometer, Leaf, ArrowRight, Satellite, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";

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
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    <>
      <div className="rounded-2xl bg-white p-5 border border-line-200/80 shadow-xs flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-normal text-ink-900">Kondisi Tanah & Satelit</h3>
            <p className="text-xs text-ink-400 mt-0.5">
              Pembaruan terakhir: {lastUpdated} · Estimasi Satelit Sentinel-2
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDetailOpen(true)}
            className="text-xs font-normal text-primary-700 hover:text-primary-800 flex items-center gap-1 group cursor-pointer"
          >
            <span>Lihat Detail</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
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

      {/* Modal Detail Analisis Biofisik Tanah & Satelit */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Rincian Biofisik Tanah & Spektral Satelit"
        description={`Telemetri penginderaan jauh Sentinel-2 · Pembaruan ${lastUpdated}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 pt-1">
          {/* Telemetri Satelit Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Satellite className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-950">Satelit Sentinel-2 MSI (L2A)</p>
                <p className="text-[11px] text-emerald-700 font-normal">Resolusi spasial 10m · Bebas awan</p>
              </div>
            </div>
            <span className="text-[10px] font-normal text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
              Kualitas Tinggi
            </span>
          </div>

          {/* Grid 4 Parameter Biofisik Lengkap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-50 border border-line-200/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-600 font-normal">Kelembapan Volumetrik</span>
                <span className="text-xs font-medium text-blue-700 tabular-nums">68%</span>
              </div>
              <div className="w-full h-1.5 bg-line-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "68%" }} />
              </div>
              <p className="text-[10px] text-ink-400 font-normal">
                Kapasitas Lapang: 70% · Titik Layu: 25%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-50 border border-line-200/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-600 font-normal">Derajat Keasaman (pH)</span>
                <span className="text-xs font-medium text-emerald-700 tabular-nums">6.5</span>
              </div>
              <div className="w-full h-1.5 bg-line-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
              </div>
              <p className="text-[10px] text-ink-400 font-normal">
                Reaksi Netral: Penyerapan hara N-P-K optimal
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-50 border border-line-200/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-600 font-normal">Suhu Permukaan (LST)</span>
                <span className="text-xs font-medium text-amber-700 tabular-nums">28°C</span>
              </div>
              <div className="w-full h-1.5 bg-line-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "56%" }} />
              </div>
              <p className="text-[10px] text-ink-400 font-normal">
                Termal tanah stabil, bebas stres panas perakaran
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-50 border border-line-200/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-600 font-normal">Indeks Kanopi (NDVI)</span>
                <span className="text-xs font-medium text-emerald-700 tabular-nums">0.68</span>
              </div>
              <div className="w-full h-1.5 bg-line-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "82%" }} />
              </div>
              <p className="text-[10px] text-ink-400 font-normal">
                Band NIR B08 / Red B04: Biomassa kanopi sehat
              </p>
            </div>
          </div>

          {/* Rangkuman Agronomis */}
          <div className="p-3 rounded-xl bg-surface-50 border border-line-200/60 text-xs text-ink-600 space-y-1">
            <p className="font-medium text-ink-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kesimpulan Kondisi Tanah:</span>
            </p>
            <p className="font-normal text-[11px] leading-relaxed">
              Kadar air di lapisan perakaran berada di zona ketersediaan air optimum (RAW). Tanaman memiliki turgor optimal dan tidak memerlukan irigasi darurat saat ini.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-ink-700 text-xs font-normal transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

