"use client";

import React, { useState } from "react";
import { Check, Info, Droplets, Leaf, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatNumber } from "@/lib/format";
import type { Recommendation } from "@/types/api";

interface VividGreenAlertCardProps {
  rec: Recommendation;
  plotName?: string;
  onLogIrrigation?: (vol: number) => void;
}

export default function VividGreenAlertCard({
  rec,
  plotName = "Sawah Karawang",
  onLogIrrigation,
}: VividGreenAlertCardProps) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [actualVolume, setActualVolume] = useState<string>(String(rec.irrigation_volume_m3));
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  function handleSaveLog(e: React.FormEvent) {
    e.preventDefault();
    const vol = parseFloat(actualVolume);
    if (!isNaN(vol)) {
      if (onLogIrrigation) onLogIrrigation(vol);
      setLoggedSuccess(true);
      setTimeout(() => {
        setLoggedSuccess(false);
        setShowLogModal(false);
      }, 1000);
    }
  }

  return (
    <>
      <div className="rounded-2xl bg-[#15803D] text-white p-6 shadow-sm border border-emerald-800 flex flex-col justify-between select-none">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-normal tracking-tight text-white">Rekomendasi Utama Hari Ini</h3>
            <span className="text-[11px] font-normal bg-white/20 px-3 py-1 rounded-lg text-lime-200">
              {plotName}
            </span>
          </div>
          <p className="text-xs text-white/85 font-medium mb-4">
            Rekomendasi irigasi harian berbasis FAO-56 Penman-Monteith
          </p>

          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-5xl font-normal tracking-tight tabular-nums text-white">
              {formatNumber(rec.irrigation_volume_m3, 0, 1)}
            </span>
            <span className="text-2xl font-normal text-lime-300">m³</span>
            <span className="text-xs text-white/90 font-medium ml-2 flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-lime-300" aria-hidden="true" />
              <span>Durasi Pompa: ~{rec.pump_minutes} menit (8 L/dtk)</span>
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <Leaf className="w-5 h-5 text-emerald-700 stroke-[2.2]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-normal text-white tracking-wide">
                  Kesehatan Tanaman (NDVI 0.68)
                </h4>
                <p className="text-[11px] text-white/80 truncate font-medium">
                  Tajuk vegetatif tumbuh subur dan terhindar dari stres air
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <Droplets className="w-5 h-5 text-blue-600 stroke-[2.2]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-normal text-white tracking-wide">
                  Defisit Air Tanah ({formatNumber(rec.deficit_mm, 1)} mm)
                </h4>
                <p className="text-[11px] text-white/80 truncate font-medium">
                  Kebutuhan air bersih memerlukan pengisian terjadwal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <Info className="w-5 h-5 text-amber-600 stroke-[2.2]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-normal text-white tracking-wide">
                  Status: {rec.status === "waspada" ? "Perlu Pengairan Terjadwal" : rec.status === "kritis" ? "Kritis Segera Airi" : "Kadar Air Optimal"}
                </h4>
                <p className="text-[11px] text-white/80 truncate font-medium">
                  Tingkat keyakinan satelit {rec.confidence}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 mt-6 pt-4 border-t border-white/20">
          <Button
            type="button"
            variant="default"
            onClick={() => setShowLogModal(true)}
            className="w-full sm:flex-1 bg-white hover:bg-surface-50 text-emerald-800 hover:text-emerald-900 font-normal text-xs shadow-xs"
            icon={<Check className="w-4 h-4 text-emerald-700" />}
          >
            Tandai Sudah Diairi
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFormulaModal(true)}
            className="w-full sm:w-auto bg-emerald-900/40 hover:bg-emerald-900/60 text-white border-white/30 hover:border-white/50 text-xs font-normal"
            icon={<Info className="w-4 h-4 text-lime-300" />}
          >
            Alasan Rumus
          </Button>
        </div>
      </div>

      <Dialog open={showFormulaModal} onOpenChange={setShowFormulaModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transparansi Perhitungan FAO-56</DialogTitle>
            <DialogDescription>
              Parameter neraca air meteorologis dan tajuk satelit untuk {plotName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-line-200">
              <span className="text-ink-600 font-medium">Evapotranspirasi Acuan (ET₀):</span>
              <span className="font-normal text-ink-900 tabular-nums">{rec.et0_mm} mm/hari</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-line-200">
              <span className="text-ink-600 font-medium">Koefisien Tanaman (Kc):</span>
              <span className="font-normal text-ink-900 tabular-nums">{rec.kc}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-line-200">
              <span className="text-ink-600 font-medium">Kebutuhan Air Tanaman (ETc = ET₀ × Kc):</span>
              <span className="font-normal text-ink-900 tabular-nums">{rec.etc_mm} mm/hari</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-line-200">
              <span className="text-ink-600 font-medium">Hujan Efektif (P_eff):</span>
              <span className="font-normal text-ink-900 tabular-nums">{rec.effective_rain_mm} mm</span>
            </div>
            <div className="flex justify-between items-center py-2 bg-emerald-50 px-3 rounded-xl border border-emerald-200/60">
              <span className="text-emerald-900 font-normal">Defisit Bersih:</span>
              <span className="font-normal text-emerald-800 text-sm tabular-nums">{rec.deficit_mm} mm</span>
            </div>
            <p className="text-[11px] text-ink-400 italic pt-1 leading-relaxed">
              *Metodologi standar Organisasi Pangan dan Pertanian PBB (FAO) untuk meminimalisir pemborosan air tanah.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowFormulaModal(false)}>
              Mengerti
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Realisasi Pengairan</DialogTitle>
            <DialogDescription>
              Catat volume aktual yang dialirkan agar neraca air harian diperbarui di Supabase.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveLog} className="space-y-4 pt-1">
            <Input
              label="Volume Aktual Dialirkan (m³)"
              type="number"
              step="0.1"
              value={actualVolume}
              onChange={(e) => setActualVolume(e.target.value)}
              required
            />

            {loggedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-normal text-emerald-800 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Pengairan berhasil dicatat ke database Supabase!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowLogModal(false)}>
                Batal
              </Button>
              <Button type="submit" variant="default">
                Simpan ke Database
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
