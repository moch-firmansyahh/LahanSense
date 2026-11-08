"use client";

import React, { useState } from "react";
import { Check, Info, Clock, ChevronRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { formatNumber } from "@/lib/format";
import type { Recommendation } from "@/types/api";

interface HeroRecommendationProps {
  rec: Recommendation;
  plotName?: string;
  onLogIrrigation?: (volume: number) => void;
}

export default function HeroRecommendation({
  rec,
  plotName = "Sawah Karawang",
  onLogIrrigation,
}: HeroRecommendationProps) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [actualVolume, setActualVolume] = useState<string>(String(rec.irrigation_volume_m3));
  const [soilFeel, setSoilFeel] = useState<"kering" | "cukup" | "basah">("cukup");
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
      }, 1200);
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-card bg-forest-900 text-white p-5 md:p-6 shadow-float select-none border border-white/10">
        {/* Subtle contour topography SVG pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 20%),
                              radial-gradient(circle at 90% 80%, rgba(163,230,53,0.3) 0%, transparent 35%)`,
          }}
        />

        {/* Header: Label & Status Badge */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <h3 className="text-xs md:text-sm font-medium tracking-wide text-primary-100">
              Rekomendasi Hari Ini · {plotName}
            </h3>
          </div>
          <Badge status={rec.status} />
        </div>

        {/* Hero Number (Display) */}
        <div className="relative z-10 my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight tabular-nums text-white">
              {formatNumber(rec.irrigation_volume_m3, 0, 1)}
            </span>
            <span className="text-xl md:text-2xl font-medium text-emerald-300">m³</span>
          </div>

          <p className="text-xs md:text-sm text-white/80 mt-1.5 flex items-center gap-2 flex-wrap font-normal">
            <span>≈ {formatNumber(rec.deficit_mm, 1, 1)} mm defisit</span>
            {rec.pump_minutes ? (
              <>
                <span className="text-white/40">•</span>
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <Clock className="w-3.5 h-3.5" /> Pompa ~{rec.pump_minutes} menit (8 L/dtk)
                </span>
              </>
            ) : null}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="relative z-10 flex items-center justify-between gap-3 pt-3 mt-3 border-t border-white/10">
          <Button
            variant="on-dark"
            onClick={() => setShowLogModal(true)}
            icon={<Check className="w-4 h-4 text-forest-900 stroke-[3]" />}
          >
            Tandai sudah diairi
          </Button>

          <button
            type="button"
            onClick={() => setShowFormulaModal(true)}
            className="text-xs font-medium text-lime-400 hover:text-white inline-flex items-center gap-1 transition-colors group cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Lihat alasan</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Modal 1: Panel Transparansi Alasan (Rumus Petani) */}
      <Modal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        title="Transparansi Neraca Air"
        description="Perhitungan bertahap berdasarkan data satelit & cuaca (FAO-56)"
      >
        <div className="space-y-4 text-sm text-ink-900">
          {/* Step by step visual breakdown */}
          <div className="space-y-2.5 bg-surface-50 p-4 rounded-input border border-line-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-600">1. Evapotranspirasi Acuan (ET₀):</span>
              <span className="font-normal tabular-nums">{formatNumber(rec.et0_mm, 2)} mm/hari</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-600">2. Koefisien Tanaman (Kc fase):</span>
              <span className="font-normal tabular-nums">× {formatNumber(rec.kc, 2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-primary-700 pt-1 border-t border-line-200">
              <span>Kebutuhan Tanaman (ETc):</span>
              <span className="tabular-nums">{formatNumber(rec.etc_mm, 2)} mm/hari</span>
            </div>
            <div className="flex items-center justify-between text-xs text-water-600">
              <span>3. Dikurangi Hujan Efektif:</span>
              <span className="font-normal tabular-nums">− {formatNumber(rec.effective_rain_mm, 1)} mm</span>
            </div>
            <div className="flex items-center justify-between text-xs font-normal text-ink-900 pt-2 border-t border-line-200">
              <span>Defisit Air Bersih:</span>
              <span className="text-danger-600 tabular-nums">{formatNumber(rec.deficit_mm, 2)} mm</span>
            </div>
          </div>

          {/* Farmer Soil Feeling Correction */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-normal uppercase tracking-wider text-ink-400">
              Koreksi Lapangan (Kondisi Tanah Anda)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["kering", "cukup", "basah"] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setSoilFeel(level)}
                  className={`py-2 px-3 rounded-full text-xs font-medium capitalize border transition-all ${
                    soilFeel === level
                      ? "bg-forest-900 text-lime-400 border-forest-900"
                      : "bg-white text-ink-600 border-line-200 hover:bg-surface-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-400">
              Tingkat keyakinan data:{" "}
              <b className="text-ink-900 capitalize">{rec.confidence}</b>
              {rec.confidence === "rendah" ? " (belum ada kalibrasi tutupan awan)" : ""}
            </p>
          </div>

          <Button
            variant="primary"
            className="w-full mt-2"
            onClick={() => setShowFormulaModal(false)}
          >
            Tutup Penjelasan
          </Button>
        </div>
      </Modal>

      {/* Modal 2: Catat Volume Air Aktual */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Catat Irigasi Selesai"
        description={`Konfirmasi volume air yang telah dialirkan ke ${plotName}`}
      >
        <form onSubmit={handleSaveLog} className="space-y-4">
          <Input
            label="Volume Air Aktual (m³)"
            type="number"
            step="0.5"
            value={actualVolume}
            onChange={(e) => setActualVolume(e.target.value)}
            helper="Sesuaikan jika volume aktual berbeda dengan anjuran rekomendasi"
            required
          />

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowLogModal(false)} type="button">
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {loggedSuccess ? "Tercatat! Terima kasih" : "Simpan Catatan"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

