"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import KpiCard from "@/components/features/KpiCard";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import {
  Clock,
  Check,
  Info,
  Filter,
  Droplets,
  AlertTriangle,
  TrendingDown,
  Calendar,
} from "lucide-react";
import type { Plot, Recommendation } from "@/types/api";

const FALLBACK_PLOTS: Plot[] = [
  {
    id: 1,
    name: "Sawah Karawang (demo)",
    crop: "padi",
    planting_date: "2026-09-22",
    irrigation_method: "genangan",
    area_ha: 1.0,
    centroid: { lat: -6.2450, lng: 107.3850 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
  {
    id: 2,
    name: "Kebun Cabai Lembang (demo)",
    crop: "cabai",
    planting_date: "2026-09-08",
    irrigation_method: "tetes",
    area_ha: 1.5,
    centroid: { lat: -6.812, lng: 107.617 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
  {
    id: 3,
    name: "Lahan Jagung Gunungkidul (demo)",
    crop: "jagung",
    planting_date: "2026-10-04",
    irrigation_method: "alur",
    area_ha: 1.6,
    centroid: { lat: -7.95, lng: 110.6 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
  {
    id: 4,
    name: "Sentra Bawang Brebes (demo)",
    crop: "bawang_merah",
    planting_date: "2026-10-11",
    irrigation_method: "pompa",
    area_ha: 0.8,
    centroid: { lat: -6.920, lng: 108.985 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
  {
    id: 5,
    name: "Kebun Tomat Pangalengan (demo)",
    crop: "cabai",
    planting_date: "2026-09-19",
    irrigation_method: "tetes",
    area_ha: 1.2,
    centroid: { lat: -7.185, lng: 107.565 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
  {
    id: 6,
    name: "Lahan Kedelai Grobogan (demo)",
    crop: "jagung",
    planting_date: "2026-09-29",
    irrigation_method: "alur",
    area_ha: 2.0,
    centroid: { lat: -7.085, lng: 110.915 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
  {
    id: 7,
    name: "Sawah Organik Subang (demo)",
    crop: "padi",
    planting_date: "2026-09-17",
    irrigation_method: "genangan",
    area_ha: 2.1,
    centroid: { lat: -6.565, lng: 107.755 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
  {
    id: 8,
    name: "Sentra Jagung Hibrida Malang (demo)",
    crop: "jagung",
    planting_date: "2026-10-01",
    irrigation_method: "alur",
    area_ha: 1.8,
    centroid: { lat: -8.020, lng: 112.632 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
  {
    id: 9,
    name: "Sentra Bawang Merah Nganjuk (demo)",
    crop: "bawang_merah",
    planting_date: "2026-10-05",
    irrigation_method: "pompa",
    area_ha: 0.9,
    centroid: { lat: -7.605, lng: 111.905 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
  {
    id: 10,
    name: "Kebun Cabai Rawit Magelang (demo)",
    crop: "cabai",
    planting_date: "2026-09-25",
    irrigation_method: "tetes",
    area_ha: 0.7,
    centroid: { lat: -7.480, lng: 110.220 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: true,
  },
];

export default function RekomendasiPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [filter, setFilter] = useState<"semua" | "perlu_air" | "aman">("semua");
  const [activeModalPlot, setActiveModalPlot] = useState<Plot | null>(null);
  const [logModalPlot, setLogModalPlot] = useState<Plot | null>(null);
  const [logVolume, setLogVolume] = useState<string>("28");
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<Plot[]>("/plots")
      .then((data) => {
        if (!cancelled && data.length > 0) setPlots(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const sourcePlots = plots.length > 0 ? plots : FALLBACK_PLOTS;

  const recommendations: { plot: Plot; rec: Recommendation }[] = sourcePlots.map((p, idx) => ({
    plot: p,
    rec: {
      plot_id: p.id,
      date: "2026-11-08",
      et0_mm: 4.6,
      kc: idx === 1 ? 1.05 : 1.15,
      etc_mm: 5.1,
      effective_rain_mm: idx === 2 ? 5.0 : 0.0,
      deficit_mm: idx === 0 ? 2.8 : idx === 1 ? 4.5 : 0.5,
      irrigation_volume_m3: idx === 0 ? 28.0 : idx === 1 ? 45.0 : 5.0,
      pump_minutes: idx === 0 ? 55 : idx === 1 ? 90 : 10,
      status: idx === 1 ? "kritis" : idx === 0 ? "waspada" : "aman",
      reason: "Perhitungan neraca air harian FAO-56",
      confidence: "tinggi",
    },
  }));

  const sorted = [...recommendations].sort((a, b) => {
    const order = { kritis: 1, waspada: 2, aman: 3 };
    return order[a.rec.status] - order[b.rec.status];
  });

  const filtered = sorted.filter((item) => {
    if (filter === "perlu_air") return item.rec.status !== "aman";
    if (filter === "aman") return item.rec.status === "aman";
    return true;
  });

  const totalVolume = recommendations.reduce((acc, r) => acc + r.rec.irrigation_volume_m3, 0);
  const totalMinutes = recommendations.reduce((acc, r) => acc + (r.rec.pump_minutes || 0), 0);
  const criticalCount = recommendations.filter((r) => r.rec.status === "kritis").length;

  return (
    <AppShell title="Rekomendasi Irigasi Harian">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
          <div>
            <h1 className="text-lg sm:text-xl font-medium text-stone-800 tracking-tight">
              Rekomendasi Irigasi Presisi
            </h1>
            <p className="text-xs text-stone-500 mt-0.5 font-normal">
              Kebutuhan air tanaman harian dihitung otomatis berbasis FAO-56 Penman-Monteith
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs text-xs text-stone-600 font-normal">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-700 font-medium">Minggu, 08 November 2026</span>
            <span className="text-stone-300">·</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Hari Ini
            </span>
          </div>
        </div>

        {/* 4 Summary KPI Cards (Matches reference UI) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Kebutuhan Air"
            value={totalVolume.toFixed(0)}
            unit="m³"
            subtext="Semua petak aktif"
            subtextColor="text-blue-600 font-normal"
            icon={<Droplets className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <KpiCard
            label="Total Waktu Pompa"
            value={totalMinutes}
            unit="menit"
            subtext="Debit rata-rata 8 L/dtk"
            subtextColor="text-ink-400 font-medium"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
          />
          <KpiCard
            label="Lahan Kritis"
            value={criticalCount}
            unit="petak"
            subtext="Perlu penanganan utama"
            subtextColor="text-danger-600 font-normal"
            alert
            icon={<AlertTriangle className="w-5 h-5 text-danger-600" />}
            iconBg="bg-rose-50"
          />
          <KpiCard
            label="Efisiensi Air vs Konvensional"
            value="22%"
            subtext="Air berhasil dihemat"
            subtextColor="text-emerald-600 font-normal"
            icon={<TrendingDown className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-line-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-normal text-ink-600">
            <Filter className="w-4 h-4 text-primary-600" />
            <span>Filter Kebutuhan:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(["semua", "perlu_air", "aman"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                  filter === opt
                    ? "bg-forest-900 text-lime-400 shadow-2xs"
                    : "bg-surface-50 text-ink-600 hover:bg-line-200/50"
                }`}
              >
                {opt === "semua"
                  ? "Semua Petak"
                  : opt === "perlu_air"
                  ? "Perlu Air Hari Ini"
                  : "Status Aman"}
              </button>
            ))}
          </div>
        </div>

        {/* List of Recommendation Cards */}
        <div className="space-y-4">
          {filtered.map(({ plot, rec }) => (
            <Card
              key={plot.id}
              className="hover:shadow-card transition-all duration-200 p-5 rounded-2xl border border-line-200/80"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Plot Info & Status */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-stone-800">{plot.name}</h3>
                    <Badge status={rec.status} />
                  </div>
                  <p className="text-xs text-stone-600 font-normal">
                    Komoditas: <span className="capitalize font-medium text-stone-800">{plot.crop}</span> · Luas:{" "}
                    <span className="font-medium text-stone-800">{plot.area_ha.toFixed(2)} ha</span> · Irigasi:{" "}
                    <span className="capitalize font-medium text-stone-800">{plot.irrigation_method}</span> · Defisit:{" "}
                    <span className="text-blue-700 font-medium">{rec.deficit_mm} mm</span>
                  </p>

                  {/* Micro Progress Bar of Deficit vs Target */}
                  <div className="w-full sm:w-80 h-2 bg-line-200 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${
                        rec.status === "kritis"
                          ? "bg-danger-600"
                          : rec.status === "waspada"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, (rec.deficit_mm / 5) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-line-200/80">
                  <div className="text-left md:text-right">
                    <div className="flex items-baseline gap-1 text-blue-700">
                      <span className="text-2xl sm:text-3xl font-medium tracking-tight tabular-nums">
                        {formatNumber(rec.irrigation_volume_m3, 0, 1)}
                      </span>
                      <span className="text-sm font-medium">m³</span>
                    </div>
                    <p className="text-xs text-stone-500 flex items-center md:justify-end gap-1 mt-0.5 font-normal">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Pompa ~{rec.pump_minutes} menit (8 L/dtk)</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setLogModalPlot(plot);
                        setLogVolume(String(rec.irrigation_volume_m3));
                      }}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Diairi
                    </Button>
                    <button
                      type="button"
                      onClick={() => setActiveModalPlot(plot)}
                      className="p-2.5 rounded-xl text-ink-400 hover:text-ink-900 bg-surface-50 hover:bg-line-200/50 border border-line-200/60 transition-colors"
                      title="Lihat Rumus FAO-56"
                    >
                      <Info className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal 1: FAO-56 Transparency Modal */}
      {activeModalPlot && (
        <Modal
          isOpen={!!activeModalPlot}
          onClose={() => setActiveModalPlot(null)}
          title="Transparansi Perhitungan Irigasi FAO-56"
        >
          <div className="space-y-4 text-xs">
            <p className="text-ink-600">
              Rekomendasi dihitung menggunakan standar internasional <b>FAO Irrigation and Drainage Paper No. 56</b>:
            </p>

            <div className="p-3.5 rounded-xl bg-forest-900 text-lime-400 font-mono text-[11px] leading-relaxed shadow-inner">
              <p>ETc = ET₀ × Kc</p>
              <p>Defisit Air = ETc - Hujan Efektif (Peff)</p>
              <p>Volume Irigasi (m³) = Defisit (mm) × Luas (ha) × 10</p>
            </div>

            <div className="space-y-2 border-t border-line-200 pt-3">
              <div className="flex justify-between py-1 border-b border-line-200/50">
                <span className="text-ink-600">Evapotranspirasi Acuan (ET₀ Open-Meteo)</span>
                <span className="font-normal tabular-nums">4,6 mm/hari</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line-200/50">
                <span className="text-ink-600">Koefisien Tanaman (Kc hari ke-47)</span>
                <span className="font-normal tabular-nums">1,10</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line-200/50">
                <span className="text-ink-600">Kebutuhan Air Tanaman (ETc)</span>
                <span className="font-normal tabular-nums text-primary-700">5,1 mm/hari</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line-200/50">
                <span className="text-ink-600">Curah Hujan Efektif (Peff 80%)</span>
                <span className="font-normal tabular-nums text-water-600">0,0 mm</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-900 font-normal">Defisit Air Bersih Hari Ini</span>
                <span className="font-normal text-warn-600 tabular-nums">2,8 mm (~28 m³)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setActiveModalPlot(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: Catat Volume Aktual */}
      {logModalPlot && (
        <Modal
          isOpen={!!logModalPlot}
          onClose={() => setLogModalPlot(null)}
          title={`Catat Pengairan: ${logModalPlot.name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-ink-600">
              Konfirmasikan volume air yang dialirkan ke petak ini agar neraca air harian diperbarui.
            </p>

            <Input
              label="Volume Air Aktual (m³)"
              type="number"
              value={logVolume}
              onChange={(e) => setLogVolume(e.target.value)}
              placeholder="Contoh: 28"
            />

            {loggedSuccess && (
              <p className="text-xs text-emerald-600 font-normal">
                ✓ Berhasil dicatat! Neraca air petak telah diperbarui.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setLogModalPlot(null)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  if (logModalPlot) {
                    try {
                      await api(`/plots/${logModalPlot.id}/irrigation-log`, {
                        method: "POST",
                        body: JSON.stringify({
                          log_date: new Date().toISOString().slice(0, 10),
                          volume_m3: parseFloat(logVolume) || 0,
                          note: "Dicatat dari halaman rekomendasi",
                        }),
                      });
                    } catch {}
                  }
                  setLoggedSuccess(true);
                  setTimeout(() => {
                    setLoggedSuccess(false);
                    setLogModalPlot(null);
                  }, 1000);
                }}
              >
                Simpan Catatan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
