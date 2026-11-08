"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import KpiCard from "@/components/features/KpiCard";
import HeroRecommendation from "@/components/features/HeroRecommendation";
import SoilConditionsCard from "@/components/features/SoilConditionsCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import {
  ArrowLeft,
  FileDown,
  Trash2,
  Calendar,
  Droplets,
  Wheat,
  Activity,
  Layers,
} from "lucide-react";
import type { Plot, Recommendation } from "@/types/api";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full min-h-[440px]" />,
});

function LahanDetailContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = use(idPromise);
  const router = useRouter();
  const plotId = Number(id);

  const [plot, setPlot] = useState<Plot | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<Plot>(`/plots/${plotId}`)
      .then((data) => {
        if (!cancelled) setPlot(data);
      })
      .catch(() => {
        if (!cancelled) {
          setPlot({
            id: plotId,
            name: "Sawah Karawang (demo)",
            crop: "padi",
            planting_date: "2026-09-22",
            irrigation_method: "genangan",
            area_ha: 1.0,
            centroid: { lat: -6.3, lng: 107.3 },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [107.3, -6.3],
                  [107.3015, -6.3],
                  [107.3015, -6.2985],
                  [107.3, -6.2985],
                  [107.3, -6.3],
                ],
              ],
            },
            is_demo: true,
          });
          setRec({
            plot_id: plotId,
            date: "2026-11-08",
            et0_mm: 4.6,
            kc: 1.1,
            etc_mm: 5.1,
            effective_rain_mm: 0.0,
            deficit_mm: 2.8,
            irrigation_volume_m3: 28.0,
            pump_minutes: 55,
            status: "waspada",
            reason: "Hari ke-47 setelah tanam. Kebutuhan air 5,1 mm, hujan efektif 0 mm, defisit 2,8 mm.",
            confidence: "tinggi",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [plotId]);

  async function handleDelete() {
    if (confirm("Apakah Anda yakin ingin menghapus petak lahan ini?")) {
      try {
        await api(`/plots/${plotId}`, { method: "DELETE" });
      } catch {}
      router.push("/lahan");
    }
  }

  return (
    <AppShell title={plot ? plot.name : "Detail Lahan"}>
      <div className="space-y-6">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-normal text-ink-900 tracking-tight">
                  {plot?.name}
                </h1>
                {rec && <Badge status={rec.status} />}
              </div>
              <p className="text-xs text-ink-600 mt-0.5 font-medium">
                Komoditas: <b className="capitalize text-ink-900">{plot?.crop}</b> · Luas:{" "}
                <b>{plot?.area_ha.toFixed(2)} ha</b> · Hari ke-47 (Fase Vegetatif Akhir)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="secondary"
              icon={<FileDown className="w-4 h-4" />}
              onClick={() => alert("Laporan PDF petak lahan berhasil digenerate.")}
            >
              Ekspor PDF
            </Button>
            <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>
              Hapus
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Cards (Matches reference UI style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Luas Hamparan"
            value={plot?.area_ha ? plot.area_ha.toFixed(2) : "1.00"}
            unit="ha"
            subtext="Batas geofencing poligon"
            subtextColor="text-emerald-600 font-normal"
            icon={<Layers className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
          />
          <KpiCard
            label="Koefisien Tanaman (Kc)"
            value={rec?.kc ? rec.kc.toFixed(2) : "1.10"}
            subtext="Fase vegetatif akhir"
            subtextColor="text-ink-400 font-medium"
            icon={<Wheat className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
          />
          <KpiCard
            label="Kelembapan Tanah"
            value="68%"
            subtext="Kondisi tajuk optimal"
            subtextColor="text-blue-600 font-normal"
            icon={<Droplets className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <KpiCard
            label="Kebutuhan Air Hari Ini"
            value={rec?.irrigation_volume_m3 || 28}
            unit="m³"
            subtext="Pompa ~55 menit (8 L/dtk)"
            subtextColor="text-warn-600 font-normal"
            alert={rec?.status !== "aman"}
            icon={<Activity className="w-5 h-5 text-warn-500" />}
            iconBg="bg-warn-50"
          />
        </div>

        {/* 12-Column Responsive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-start">
          {/* Left (7 Cols): Satellite Map & Soil Conditions */}
          <div className="col-span-1 lg:col-span-7 flex flex-col gap-5">
            <div className="rounded-2xl bg-white p-5 border border-line-200/80 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-normal text-base text-ink-900">
                  Citra Satelit Resolusi Tinggi
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-ink-400 font-normal">
                  <Calendar className="w-3.5 h-3.5 text-primary-600" />
                  <span>Sentinel-2 (10m) · 03 Nov 2026</span>
                </div>
              </div>

              {/* Map Canvas */}
              <div className="h-[440px] sm:h-[500px] rounded-xl overflow-hidden relative border border-line-200/70">
                <MapView
                  plots={plot ? [plot] : []}
                  selectedId={plotId}
                  onSelect={() => {}}
                  showNdviLayer={true}
                />
              </div>
            </div>

            {/* Soil Conditions Card */}
            <SoilConditionsCard lastUpdated="10.30 WIB" plotId={plotId} />
          </div>

          {/* Right (5 Cols): Hero Action & Daily Water Balance Table */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-5">
            {/* Hero Recommendation Card */}
            {rec && <HeroRecommendation rec={rec} plotName={plot?.name} />}

            {/* Neraca Air Harian Table Card */}
            <div className="rounded-2xl bg-white p-5 border border-line-200/80 shadow-xs space-y-3">
              <h3 className="font-normal text-base text-ink-900 pb-2 border-b border-line-200/60">
                Neraca Air Harian (FAO-56 Penman-Monteith)
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-line-200/40">
                  <span className="text-ink-600">Evapotranspirasi Acuan (ET₀ Open-Meteo)</span>
                  <span className="font-normal tabular-nums text-ink-900">
                    {formatNumber(rec?.et0_mm || 4.6, 2)} mm/hari
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-line-200/40">
                  <span className="text-ink-600">Kebutuhan Air Tanaman (ETc = Kc × ET₀)</span>
                  <span className="font-normal tabular-nums text-primary-700">
                    {formatNumber(rec?.etc_mm || 5.1, 2)} mm/hari
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-line-200/40">
                  <span className="text-ink-600">Curah Hujan Efektif (Peff 80%)</span>
                  <span className="font-normal tabular-nums text-water-600">
                    {formatNumber(rec?.effective_rain_mm || 0, 1)} mm/hari
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-line-200/40">
                  <span className="text-ink-600">Defisit Air Bersih Tanaman</span>
                  <span className="font-normal tabular-nums text-warn-600">
                    {formatNumber(rec?.deficit_mm || 2.8, 1)} mm
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 bg-surface-50 px-3 rounded-xl border border-line-200/60 font-normal">
                  <span className="text-ink-900">Volume Pengairan Disarankan</span>
                  <span className="text-base font-normal tabular-nums text-water-600">
                    {formatNumber(rec?.irrigation_volume_m3 || 28, 0, 1)} m³
                  </span>
                </div>
              </div>

              {/* Pump calculation specs */}
              <div className="pt-2 text-[11px] text-ink-400 font-medium">
                <span>Dihitung berdasarkan debit pompa rata-rata <b>8 Liter/detik</b> (0,48 m³/menit). Waktu operasional optimal: <b>{rec?.pump_minutes || 55} menit</b>.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function LahanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <LahanDetailContent idPromise={params} />
    </Suspense>
  );
}
