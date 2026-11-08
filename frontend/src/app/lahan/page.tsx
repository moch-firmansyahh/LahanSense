"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import KpiCard from "@/components/features/KpiCard";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  ArrowRight,
  Sprout,
  Wheat,
  Droplets,
  AlertTriangle,
  Layers,
  Calendar,
  MapPin,
  LayoutGrid,
  List,
  Check,
  X,
} from "lucide-react";
import type { Plot } from "@/types/api";

interface ExtendedPlotMeta {
  variety: string;
  location: string;
  daysAfterPlanting: number;
  stage: string;
  moisture: number;
  ndvi: number;
  deficitMm: number;
  volumeM3: number;
  pumpMinutes: number;
  status: "aman" | "waspada" | "kritis";
  advice: string;
}

const PLOT_EXTRA: Record<number, ExtendedPlotMeta> = {
  1: {
    variety: "Padi Ciherang",
    location: "Karawang, Jawa Barat",
    daysAfterPlanting: 47,
    stage: "Vegetatif Akhir · Bunting",
    moisture: 68,
    ndvi: 0.62,
    deficitMm: 2.8,
    volumeM3: 28.0,
    pumpMinutes: 55,
    status: "waspada",
    advice: "Kebutuhan air 5,1 mm tanpa hujan. Berikan 28 m³ sebelum Rabu untuk mencegah stres bulir.",
  },
  2: {
    variety: "Cabai Rawit Merah",
    location: "Lembang, Bandung Barat",
    daysAfterPlanting: 61,
    stage: "Pembungaan & Pembuahan",
    moisture: 78,
    ndvi: 0.74,
    deficitMm: 1.1,
    volumeM3: 16.5,
    pumpMinutes: 25,
    status: "aman",
    advice: "Kelembapan optimal. Tetes air terjadwal 16 m³ cukup menjaga kelembapan perakaran.",
  },
  3: {
    variety: "Jagung Hibrida Bisi-18",
    location: "Gunungkidul, D.I. Yogyakarta",
    daysAfterPlanting: 35,
    stage: "Fase Kritis Vegetatif",
    moisture: 42,
    ndvi: 0.48,
    deficitMm: 4.2,
    volumeM3: 42.0,
    pumpMinutes: 80,
    status: "kritis",
    advice: "Defisit kumulatif tinggi melampaui batas aman. Segera lakukan irigasi 42 m³ hari ini.",
  },
  4: {
    variety: "Bawang Merah Bima Brebes",
    location: "Brebes, Jawa Tengah",
    daysAfterPlanting: 28,
    stage: "Pembentukan Umbi (Bulbing)",
    moisture: 55,
    ndvi: 0.58,
    deficitMm: 3.1,
    volumeM3: 24.8,
    pumpMinutes: 48,
    status: "waspada",
    advice: "Fase pembentukan umbi sensitif kekeringan. Berikan 25 m³ air untuk menjaga pengisian.",
  },
  5: {
    variety: "Tomat Sayur Servo",
    location: "Pangalengan, Bandung Selatan",
    daysAfterPlanting: 50,
    stage: "Pemasakan Buah",
    moisture: 82,
    ndvi: 0.81,
    deficitMm: 0.9,
    volumeM3: 10.8,
    pumpMinutes: 18,
    status: "aman",
    advice: "Kondisi perakaran subur dan lembap. Kurangi frekuensi irigasi menjelang petik panen.",
  },
  6: {
    variety: "Kedelai Anjasmoro",
    location: "Grobogan, Jawa Tengah",
    daysAfterPlanting: 40,
    stage: "Pengisian Polong",
    moisture: 38,
    ndvi: 0.51,
    deficitMm: 4.5,
    volumeM3: 60.0,
    pumpMinutes: 115,
    status: "kritis",
    advice: "Anomali cuaca panas ekstrem. Kebutuhan air melonjak 60 m³ untuk mencegah polong hampa.",
  },
  7: {
    variety: "Padi Inpari 32 Organik",
    location: "Subang, Jawa Barat",
    daysAfterPlanting: 52,
    stage: "Pembentukan Malai",
    moisture: 78,
    ndvi: 0.78,
    deficitMm: 0.8,
    volumeM3: 8.0,
    pumpMinutes: 18,
    status: "aman",
    advice: "Kelembaban tanah optimal (78%). Pertahankan genangan macak-macak tipis 2 cm untuk bulir padi.",
  },
  8: {
    variety: "Jagung Manis Bonanza",
    location: "Malang, Jawa Timur",
    daysAfterPlanting: 38,
    stage: "Vegetatif Cepat V8",
    moisture: 46,
    ndvi: 0.65,
    deficitMm: 3.1,
    volumeM3: 31.0,
    pumpMinutes: 62,
    status: "waspada",
    advice: "Defisit 3.1 mm mulai menekan laju fotosintesis. Lakukan pengaliran alur 31 m³ sebelum jam 10 pagi.",
  },
  9: {
    variety: "Bawang Merah Tajuk Nganjuk",
    location: "Nganjuk, Jawa Timur",
    daysAfterPlanting: 34,
    stage: "Pembesaran Umbi",
    moisture: 32,
    ndvi: 0.52,
    deficitMm: 4.6,
    volumeM3: 41.4,
    pumpMinutes: 82,
    status: "kritis",
    advice: "Kadar lengas tanah kritis 32%. Risiko umbi kerdil. Segera hidupkan pompa 82 menit untuk siraman kabut.",
  },
  10: {
    variety: "Cabai Keriting Kencana",
    location: "Magelang, Jawa Tengah",
    daysAfterPlanting: 44,
    stage: "Pembungaan Pertama",
    moisture: 68,
    ndvi: 0.73,
    deficitMm: 1.4,
    volumeM3: 9.8,
    pumpMinutes: 20,
    status: "aman",
    advice: "Transpirasi normal. Fertigasi tetes 20 menit cukup menjaga turgor bunga agar tidak rontok.",
  },
};

const INITIAL_DEMO_PLOTS: Plot[] = [
  {
    id: 1,
    name: "Sawah Irigasi Karawang",
    crop: "padi",
    planting_date: "2026-09-22",
    irrigation_method: "genangan",
    area_ha: 1.0,
    centroid: { lat: -6.2450, lng: 107.3850 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
  {
    id: 2,
    name: "Kebun Cabai Rawit Lembang",
    crop: "cabai",
    planting_date: "2026-09-08",
    irrigation_method: "tetes",
    area_ha: 1.5,
    centroid: { lat: -6.812, lng: 107.617 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
  {
    id: 3,
    name: "Hamparan Jagung Gunungkidul",
    crop: "jagung",
    planting_date: "2026-10-04",
    irrigation_method: "alur",
    area_ha: 1.6,
    centroid: { lat: -7.95, lng: 110.6 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
  {
    id: 4,
    name: "Sentra Bawang Merah Brebes",
    crop: "bawang_merah",
    planting_date: "2026-10-11",
    irrigation_method: "pompa",
    area_ha: 0.8,
    centroid: { lat: -6.920, lng: 108.985 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
  {
    id: 5,
    name: "Kebun Tomat Pangalengan",
    crop: "cabai",
    planting_date: "2026-09-19",
    irrigation_method: "tetes",
    area_ha: 1.2,
    centroid: { lat: -7.185, lng: 107.565 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
  {
    id: 6,
    name: "Lahan Kedelai Grobogan",
    crop: "jagung",
    planting_date: "2026-09-29",
    irrigation_method: "alur",
    area_ha: 2.0,
    centroid: { lat: -7.085, lng: 110.915 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
  {
    id: 7,
    name: "Sawah Organik Subang",
    crop: "padi",
    planting_date: "2026-09-17",
    irrigation_method: "genangan",
    area_ha: 2.1,
    centroid: { lat: -6.565, lng: 107.755 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
  {
    id: 8,
    name: "Sentra Jagung Hibrida Malang",
    crop: "jagung",
    planting_date: "2026-10-01",
    irrigation_method: "alur",
    area_ha: 1.8,
    centroid: { lat: -8.020, lng: 112.632 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
  {
    id: 9,
    name: "Sentra Bawang Merah Nganjuk",
    crop: "bawang_merah",
    planting_date: "2026-10-05",
    irrigation_method: "pompa",
    area_ha: 0.9,
    centroid: { lat: -7.605, lng: 111.905 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
  {
    id: 10,
    name: "Kebun Cabai Rawit Magelang",
    crop: "cabai",
    planting_date: "2026-09-25",
    irrigation_method: "tetes",
    area_ha: 0.7,
    centroid: { lat: -7.480, lng: 110.220 },
    geometry: { type: "Polygon", coordinates: [] },
    is_demo: false,
  },
];

export default function LahanListPage() {
  const [plots, setPlots] = useState<Plot[]>(INITIAL_DEMO_PLOTS);
  const [search, setSearch] = useState("");
  const [filterCrop, setFilterCrop] = useState<string>("semua");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [sortBy, setSortBy] = useState<"nama" | "kebutuhan" | "luas" | "ndvi" | "lengas">("kebutuhan");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Log Irigasi Modal state
  const [activeLogPlot, setActiveLogPlot] = useState<{ plot: Plot; meta: ExtendedPlotMeta } | null>(null);
  const [logVolume, setLogVolume] = useState<string>("");
  const [logSuccess, setLogSuccess] = useState<boolean>(false);
  const [activeOverrides, setActiveOverrides] = useState<Record<number, Partial<ExtendedPlotMeta>>>({});

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

  // Ambil meta dengan pertimbangan override lokal (misal setelah catat irigasi)
  const getPlotMeta = useCallback(
    (plotId: number): ExtendedPlotMeta => {
      const base = PLOT_EXTRA[plotId] || {
        variety: "Tanaman Pangan",
        location: "Indonesia",
        daysAfterPlanting: 30,
        stage: "Vegetatif",
        moisture: 60,
        ndvi: 0.65,
        deficitMm: 1.5,
        volumeM3: 15.0,
        pumpMinutes: 30,
        status: "aman" as const,
        advice: "Kondisi kelembapan tanah relatif terjaga normal.",
      };
      return { ...base, ...(activeOverrides[plotId] || {}) };
    },
    [activeOverrides]
  );

  // Kalkulasi ringkasan agregat
  const totalArea = plots.reduce((acc, p) => acc + (p.area_ha || 0), 0);
  const avgMoisture = Math.round(
    plots.reduce((acc, p) => acc + getPlotMeta(p.id).moisture, 0) / (plots.length || 1)
  );
  const needWaterCount = plots.filter((p) => {
    const st = getPlotMeta(p.id).status;
    return st === "kritis" || st === "waspada";
  }).length;
  const criticalCount = plots.filter((p) => getPlotMeta(p.id).status === "kritis").length;

  // Filter & Urutkan
  const filteredPlots = useMemo(() => {
    return plots
      .filter((p) => {
        const meta = getPlotMeta(p.id);
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.crop.toLowerCase().includes(search.toLowerCase()) ||
          meta.variety.toLowerCase().includes(search.toLowerCase()) ||
          meta.location.toLowerCase().includes(search.toLowerCase());

        const matchCrop = filterCrop === "semua" || p.crop === filterCrop;
        const matchStatus = filterStatus === "semua" || meta.status === filterStatus;

        return matchSearch && matchCrop && matchStatus;
      })
      .sort((a, b) => {
        const metaA = getPlotMeta(a.id);
        const metaB = getPlotMeta(b.id);
        if (sortBy === "kebutuhan") return metaB.volumeM3 - metaA.volumeM3;
        if (sortBy === "luas") return b.area_ha - a.area_ha;
        if (sortBy === "ndvi") return metaB.ndvi - metaA.ndvi;
        if (sortBy === "lengas") return metaA.moisture - metaB.moisture; // Lengas terendah (kering) paling atas
        return a.name.localeCompare(b.name);
      });
  }, [plots, search, filterCrop, filterStatus, sortBy, getPlotMeta]);

  // Handle konfirmasi pencatatan irigasi cepat
  const handleSaveIrrigation = () => {
    if (!activeLogPlot) return;
    const vol = parseFloat(logVolume) || activeLogPlot.meta.volumeM3;
    const plotId = activeLogPlot.plot.id;

    setActiveOverrides((prev) => ({
      ...prev,
      [plotId]: {
        status: "aman",
        volumeM3: 0,
        deficitMm: 0,
        pumpMinutes: 0,
        moisture: Math.min(88, activeLogPlot.meta.moisture + 25),
        advice: `Irigasi aktual ${vol} m³ baru saja selesai dicatat. Lengas tanah kembali ke zona optimal.`,
      },
    }));

    api(`/plots/${plotId}/irrigation-log`, {
      method: "POST",
      body: JSON.stringify({
        log_date: new Date().toISOString().slice(0, 10),
        volume_m3: vol,
        note: `Irigasi mandiri via katalog petak LahanSense: ${vol} m³`,
      }),
    }).catch(() => {});

    setLogSuccess(true);
    setTimeout(() => {
      setLogSuccess(false);
      setActiveLogPlot(null);
    }, 1200);
  };

  return (
    <AppShell title="Katalog Lahan Pertanian">
      <div className="space-y-6 select-none">
        {/* Top Header Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-200/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
                Katalog Lahan Pertanian
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/80">
                10 Petak Terpantau
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
              Evaluasi kesehatan kanopi satelit Sentinel-2, kadar lengas tanah perakaran, dan instruksi irigasi presisi FAO-56.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/peta">
              <Button
                variant="outline"
                className="h-9 px-3.5 text-xs font-medium rounded-xl border-line-200 text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>Peta GIS Hamparan</span>
              </Button>
            </Link>

            <Link href="/lahan/baru">
              <Button
                variant="primary"
                className="h-9 px-4 text-xs font-medium rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Petak Baru</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Top Agronomic KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Petak Terdaftar"
            value={plots.length}
            unit="petak"
            subtext="100% aktif terpantau Sentinel-2"
            subtextColor="text-emerald-700 font-normal"
            icon={<Sprout className="w-5 h-5 text-emerald-700" />}
            iconBg="bg-emerald-50"
          />
          <KpiCard
            label="Total Luas Lahan Binaan"
            value={totalArea.toFixed(1)}
            unit="ha"
            subtext="Hamparan produktif 4 provinsi"
            subtextColor="text-ink-500 font-medium"
            icon={<Wheat className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
          />
          <KpiCard
            label="Rata-rata Lengas Tanah"
            value={`${avgMoisture}%`}
            subtext="Zona perakaran agregat"
            subtextColor="text-blue-600 font-normal"
            icon={<Droplets className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <KpiCard
            label="Perlu Pengairan Segera"
            value={needWaterCount}
            unit="petak"
            subtext={`${criticalCount} kritis · ${needWaterCount - criticalCount} waspada`}
            subtextColor="text-rose-600 font-normal"
            alert={criticalCount > 0}
            icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
            iconBg="bg-rose-50"
          />
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-line-200/80 shadow-2xs">
          {/* Row 1: Search + Crop Filter Chips + View Mode Switcher */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari petak, varietas, atau wilayah..."
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-surface-50 border border-line-200/70 text-xs text-ink-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Chips by Commodity */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {[
                { id: "semua", label: "Semua Komoditas", icon: "🌱" },
                { id: "padi", label: "Padi", icon: "🌾" },
                { id: "cabai", label: "Cabai", icon: "🌶️" },
                { id: "jagung", label: "Jagung", icon: "🌽" },
                { id: "bawang_merah", label: "Bawang Merah", icon: "🧅" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilterCrop(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-normal whitespace-nowrap transition-all cursor-pointer ${
                    filterCrop === c.id
                      ? "bg-[#1E3926] text-[#A3E635] shadow-2xs"
                      : "bg-surface-50 text-ink-600 hover:bg-line-200/60 hover:text-ink-900"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* View Mode Switcher (Grid vs Table) */}
            <div className="flex items-center gap-1 self-end lg:self-auto p-1 rounded-xl bg-surface-50 border border-line-200/70 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-normal transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-white text-ink-900 shadow-2xs"
                    : "text-ink-500 hover:text-ink-800"
                }`}
                title="Tampilan Kartu Satelit"
              >
                <LayoutGrid className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Galeri</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-normal transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-white text-ink-900 shadow-2xs"
                    : "text-ink-500 hover:text-ink-800"
                }`}
                title="Tampilan Tabel GIS"
              >
                <List className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Tabel GIS</span>
              </button>
            </div>
          </div>

          {/* Row 2: Secondary Status Filter + Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line-200/50 text-xs">
            {/* Status Pills */}
            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-medium text-[11px] hidden sm:inline">Status Air:</span>
              {[
                { id: "semua", label: "Semua Status" },
                { id: "kritis", label: "🚨 Kritis" },
                { id: "waspada", label: "⚠️ Waspada" },
                { id: "aman", label: "✅ Aman" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFilterStatus(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-normal transition-all cursor-pointer ${
                    filterStatus === s.id
                      ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300"
                      : "bg-stone-100/70 text-ink-600 hover:bg-stone-200/60"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-ink-600">
              <span className="text-[11px] font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "nama" | "kebutuhan" | "luas" | "ndvi" | "lengas")
                }
                className="bg-surface-50 px-2.5 py-1 rounded-lg font-normal text-ink-900 border border-line-200/60 outline-none cursor-pointer text-xs"
              >
                <option value="kebutuhan">Kebutuhan Air Terbesar (Prioritas)</option>
                <option value="lengas">Lengas Tanah Terendah (Kering)</option>
                <option value="ndvi">NDVI Kanopi Tertinggi</option>
                <option value="luas">Luas Lahan Terbesar</option>
                <option value="nama">Nama Petak (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredPlots.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-line-200/80">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-normal text-ink-900 text-lg">Tidak ada petak yang sesuai</h3>
            <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
              Cobalah ubah kata kunci pencarian atau reset filter komoditas dan status air.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterCrop("semua");
                setFilterStatus("semua");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-normal text-xs hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

        {/* TAMPILAN 1: GRID KARTU SATELIT (ANTI-SLOP DESIGN) */}
        {viewMode === "grid" && filteredPlots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filteredPlots.map((plot) => {
              const meta = getPlotMeta(plot.id);
              const isKritis = meta.status === "kritis";
              const isWaspada = meta.status === "waspada";

              return (
                <div
                  key={plot.id}
                  className="group rounded-2xl bg-white border border-line-200/80 shadow-2xs hover:shadow-card hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Visual Aerial Agriculture Card Header (Eliminates the boring green placeholder!) */}
                    <div className="relative w-full h-44 overflow-hidden border-b border-line-200/60 select-none">
                      {/* Stylized Aerial Crop Terrain Graphic */}
                      <div className="absolute inset-0">
                        {plot.crop === "padi" ? (
                          // Padi: Lush Terraced Paddy Contour with Water Glint
                          <div className="w-full h-full bg-[#183925] relative overflow-hidden">
                            <svg className="w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="padiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#14532D" />
                                  <stop offset="50%" stopColor="#166534" />
                                  <stop offset="100%" stopColor="#0F3820" />
                                </linearGradient>
                              </defs>
                              <rect width="400" height="200" fill="url(#padiGrad)" />
                              {/* Terraced Paddy Curves */}
                              <path d="M-20,40 Q100,10 200,50 T420,30 L420,200 L-20,200 Z" fill="#15803D" opacity="0.5" />
                              <path d="M-20,90 Q120,60 220,110 T420,80 L420,200 L-20,200 Z" fill="#166534" opacity="0.6" />
                              <path d="M-20,140 Q80,120 240,160 T420,130 L420,200 L-20,200 Z" fill="#047857" opacity="0.7" />
                              {/* Water Irrigation Canals Reflection Lines */}
                              <path d="M0,40 Q100,10 200,50 T400,30" stroke="#6EE7B7" strokeWidth="1.5" fill="none" opacity="0.4" />
                              <path d="M0,90 Q120,60 220,110 T400,80" stroke="#38BDF8" strokeWidth="1.5" fill="none" opacity="0.3" />
                              <path d="M0,140 Q80,120 240,160 T400,130" stroke="#6EE7B7" strokeWidth="1.5" fill="none" opacity="0.4" />
                            </svg>
                          </div>
                        ) : plot.crop === "cabai" ? (
                          // Cabai: Deep green rows with red pepper accents
                          <div className="w-full h-full bg-[#152e22] relative overflow-hidden">
                            <svg className="w-full h-full opacity-65" viewBox="0 0 400 200" preserveAspectRatio="none">
                              <rect width="400" height="200" fill="#143A27" />
                              {/* Parallel Mulch Rows */}
                              {[25, 60, 95, 130, 165].map((y, idx) => (
                                <g key={idx}>
                                  <line x1="0" y1={y} x2="400" y2={y + 15} stroke="#0F2D1F" strokeWidth="16" />
                                  <line x1="0" y1={y - 2} x2="400" y2={y + 13} stroke="#22C55E" strokeWidth="6" strokeDasharray="14 6" opacity="0.8" />
                                  <circle cx="80" cy={y} r="2.5" fill="#EF4444" />
                                  <circle cx="160" cy={y + 3} r="2.5" fill="#EF4444" />
                                  <circle cx="270" cy={y + 8} r="2.5" fill="#EF4444" />
                                  <circle cx="340" cy={y + 11} r="2.5" fill="#EF4444" />
                                </g>
                              ))}
                            </svg>
                          </div>
                        ) : plot.crop === "jagung" ? (
                          // Jagung: Golden-green sunlit corn ridges
                          <div className="w-full h-full bg-[#1C3622] relative overflow-hidden">
                            <svg className="w-full h-full opacity-70" viewBox="0 0 400 200" preserveAspectRatio="none">
                              <rect width="400" height="200" fill="#1C3825" />
                              {[15, 45, 75, 105, 135, 165, 195].map((y, idx) => (
                                <g key={idx}>
                                  <line x1="0" y1={y} x2="400" y2={y + 25} stroke="#14532D" strokeWidth="12" />
                                  <line x1="0" y1={y} x2="400" y2={y + 25} stroke="#84CC16" strokeWidth="4" strokeDasharray="12 8" opacity="0.75" />
                                  <line x1="0" y1={y - 3} x2="400" y2={y + 22} stroke="#EAB308" strokeWidth="1.5" strokeDasharray="6 14" opacity="0.6" />
                                </g>
                              ))}
                            </svg>
                          </div>
                        ) : (
                          // Bawang Merah: Raised alluvial beds with purple-green hints
                          <div className="w-full h-full bg-[#203328] relative overflow-hidden">
                            <svg className="w-full h-full opacity-70" viewBox="0 0 400 200" preserveAspectRatio="none">
                              <rect width="400" height="200" fill="#1E2F26" />
                              {[20, 50, 80, 110, 140, 170].map((y, idx) => (
                                <g key={idx}>
                                  <line x1="0" y1={y} x2="400" y2={y + 8} stroke="#2D4638" strokeWidth="14" />
                                  <line x1="0" y1={y - 1} x2="400" y2={y + 7} stroke="#10B981" strokeWidth="3" strokeDasharray="8 6" opacity="0.8" />
                                  <circle cx="50" cy={y} r="2" fill="#C084FC" opacity="0.7" />
                                  <circle cx="130" cy={y + 2} r="2" fill="#C084FC" opacity="0.7" />
                                  <circle cx="210" cy={y + 4} r="2" fill="#C084FC" opacity="0.7" />
                                  <circle cx="310" cy={y + 6} r="2" fill="#C084FC" opacity="0.7" />
                                </g>
                              ))}
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Geometric GIS Parcel Border Overlay */}
                      <div className="absolute inset-3 rounded-xl border border-white/25 pointer-events-none flex flex-col justify-between p-2">
                        {/* Centroid Coordinate Tag */}
                        <div className="self-end px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-[9px] font-mono text-emerald-300">
                          {plot.centroid ? `${plot.centroid.lat.toFixed(3)}°, ${plot.centroid.lng.toFixed(3)}°` : "GIS 10m"}
                        </div>
                      </div>

                      {/* Gradient vignette for top & bottom microcopy */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />

                      {/* Top Badges Row */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        {/* Crop Tag with Emoji */}
                        <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-normal flex items-center gap-1.5 shadow-2xs border border-white/15">
                          <span>
                            {plot.crop === "padi"
                              ? "🌾"
                              : plot.crop === "cabai"
                              ? "🌶️"
                              : plot.crop === "jagung"
                              ? "🌽"
                              : "🧅"}
                          </span>
                          <span>{meta.variety}</span>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-normal flex items-center gap-1.5 shadow-xs border ${
                            isKritis
                              ? "bg-rose-950/85 text-rose-300 border-rose-500/40"
                              : isWaspada
                              ? "bg-amber-950/85 text-amber-300 border-amber-500/40"
                              : "bg-emerald-950/85 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isKritis
                                ? "bg-rose-400"
                                : isWaspada
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            }`}
                          />
                          <span className="capitalize">{meta.status}</span>
                        </div>
                      </div>

                      {/* Bottom Telemetry Strip */}
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-stone-200 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>{meta.daysAfterPlanting} HST · {meta.stage}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs text-[9px] text-stone-300">
                          Sentinel-2 10m
                        </span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 space-y-3.5">
                      {/* Plot Name & Location */}
                      <div>
                        <Link href={`/lahan/${plot.id}`} className="group-hover:text-emerald-700 transition-colors">
                          <h3 className="font-normal text-base text-ink-900 tracking-tight leading-snug line-clamp-1">
                            {plot.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-ink-500 font-medium mt-1">
                          <MapPin className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                          <span className="truncate">{meta.location}</span>
                          <span>•</span>
                          <span className="font-normal text-ink-800">{plot.area_ha.toFixed(2)} ha</span>
                        </div>
                      </div>

                      {/* 3 Agronomic Key Metrics HUD */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-50 border border-line-200/60 text-center">
                        {/* Lengas Tanah with micro progress bar */}
                        <div className="flex flex-col justify-between">
                          <span className="text-[10px] font-normal text-ink-400 uppercase tracking-wider">
                            Lengas Tanah
                          </span>
                          <span
                            className={`text-sm font-normal tabular-nums mt-0.5 ${
                              meta.moisture < 45
                                ? "text-rose-600"
                                : meta.moisture < 65
                                ? "text-amber-600"
                                : "text-blue-600"
                            }`}
                          >
                            {meta.moisture}%
                          </span>
                          <div className="w-full bg-stone-200 h-1 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                meta.moisture < 45
                                  ? "bg-rose-500"
                                  : meta.moisture < 65
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${meta.moisture}%` }}
                            />
                          </div>
                        </div>

                        {/* NDVI Kanopi */}
                        <div className="flex flex-col justify-between">
                          <span className="text-[10px] font-normal text-ink-400 uppercase tracking-wider">
                            NDVI Kanopi
                          </span>
                          <span className="text-sm font-normal text-emerald-700 tabular-nums mt-0.5">
                            {meta.ndvi.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-ink-400 font-medium truncate mt-1">
                            {meta.ndvi > 0.7 ? "Sangat Lebat" : meta.ndvi > 0.5 ? "Subur Normal" : "Stres Ringan"}
                          </span>
                        </div>

                        {/* Defisit Neraca Air FAO-56 */}
                        <div className="flex flex-col justify-between">
                          <span className="text-[10px] font-normal text-ink-400 uppercase tracking-wider">
                            Defisit FAO
                          </span>
                          <span
                            className={`text-sm font-normal tabular-nums mt-0.5 ${
                              meta.deficitMm > 3.5
                                ? "text-rose-600"
                                : meta.deficitMm > 1.8
                                ? "text-amber-600"
                                : "text-ink-800"
                            }`}
                          >
                            {meta.deficitMm.toFixed(1)}{" "}
                            <span className="text-[10px] font-normal text-ink-400">mm</span>
                          </span>
                          <span className="text-[9px] text-ink-400 font-medium truncate mt-1 capitalize">
                            {plot.irrigation_method}
                          </span>
                        </div>
                      </div>

                      {/* Advisory & Recommendation Callout Box */}
                      <div
                        className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                          isKritis
                            ? "bg-rose-50/70 border-rose-200/80 text-rose-900"
                            : isWaspada
                            ? "bg-amber-50/70 border-amber-200/80 text-amber-900"
                            : "bg-emerald-50/60 border-emerald-200/70 text-emerald-900"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-normal uppercase tracking-wide opacity-80">
                            Rekomendasi Air Hari Ini
                          </span>
                          <span className="text-sm font-serif font-normal tabular-nums">
                            {meta.volumeM3.toFixed(1)} m³
                          </span>
                        </div>

                        <p className="text-[11px] leading-relaxed line-clamp-2 opacity-90">
                          {meta.advice}
                        </p>

                        <div className="text-[10px] font-normal opacity-75 pt-1 border-t border-black/5 flex items-center justify-between">
                          <span>Estimasi Operasi:</span>
                          <span>
                            {meta.volumeM3 > 0
                              ? `Pompa ${meta.pumpMinutes} menit (debit 8 L/s)`
                              : "Cukup lengas alami"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-3 bg-surface-50/80 border-t border-line-200/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLogPlot({ plot, meta });
                        setLogVolume(meta.volumeM3.toFixed(0));
                      }}
                      className="h-8 px-2.5 rounded-lg bg-white hover:bg-stone-100 text-ink-800 text-xs font-normal border border-line-200/80 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>Catat Air</span>
                    </button>

                    <Link
                      href={`/lahan/${plot.id}`}
                      className="h-8 px-3 rounded-lg bg-[#1E3926] hover:bg-[#14261a] text-[#A3E635] text-xs font-normal flex items-center gap-1 transition-all shadow-2xs group-hover:px-3.5"
                    >
                      <span>Detail & Peta</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAMPILAN 2: TABEL DATA GIS LENGKAP */}
        {viewMode === "table" && filteredPlots.length > 0 && (
          <div className="rounded-2xl bg-white border border-line-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-50 text-ink-500 font-normal border-b border-line-200/80">
                    <th className="py-3 px-4">Petak Lahan</th>
                    <th className="py-3 px-3">Komoditas & Varietas</th>
                    <th className="py-3 px-3 text-right">Luas (ha)</th>
                    <th className="py-3 px-3">Fase HST</th>
                    <th className="py-3 px-3 text-center">Lengas Tanah</th>
                    <th className="py-3 px-3 text-center">NDVI Satelit</th>
                    <th className="py-3 px-3 text-right">Kebutuhan Air</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-200/60">
                  {filteredPlots.map((plot) => {
                    const meta = getPlotMeta(plot.id);

                    return (
                      <tr key={plot.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <Link href={`/lahan/${plot.id}`} className="font-normal text-ink-900 hover:text-emerald-700">
                            {plot.name}
                          </Link>
                          <span className="text-[11px] text-ink-400 block truncate max-w-[180px]">
                            {meta.location}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-normal text-ink-800 capitalize">
                            {plot.crop.replace("_", " ")}
                          </span>
                          <span className="text-[11px] text-ink-500 block">
                            {meta.variety}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-normal text-ink-900">
                          {plot.area_ha.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-normal text-ink-800">{meta.daysAfterPlanting} HST</span>
                          <span className="text-[10px] text-ink-400 block truncate max-w-[140px]">
                            {meta.stage}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-normal tabular-nums ${
                              meta.moisture < 45
                                ? "text-rose-600"
                                : meta.moisture < 65
                                ? "text-amber-600"
                                : "text-blue-600"
                            }`}
                          >
                            {meta.moisture}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-normal text-emerald-700">
                          {meta.ndvi.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-serif font-normal text-ink-900 tabular-nums">
                            {meta.volumeM3.toFixed(1)} m³
                          </span>
                          <span className="text-[10px] text-ink-400 block">
                            {meta.pumpMinutes} mnt pompa
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge status={meta.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveLogPlot({ plot, meta });
                                setLogVolume(meta.volumeM3.toFixed(0));
                              }}
                              className="px-2 py-1 rounded-lg bg-surface-50 hover:bg-stone-200/80 text-ink-800 text-[11px] font-normal border border-line-200 transition-colors cursor-pointer"
                              title="Catat Irigasi"
                            >
                              💧
                            </button>
                            <Link
                              href={`/lahan/${plot.id}`}
                              className="px-2.5 py-1 rounded-lg bg-[#1E3926] hover:bg-[#14261a] text-[#A3E635] text-[11px] font-normal transition-colors"
                            >
                              Detail
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Catat Irigasi Cepat */}
        <Modal
          isOpen={Boolean(activeLogPlot)}
          onClose={() => {
            if (!logSuccess) setActiveLogPlot(null);
          }}
          title={logSuccess ? "Pencatatan Sukses!" : "Catat Realisasi Irigasi"}
          description={
            logSuccess
              ? "Data tersimpan. Status petak telah diperbarui ke Zona Optimal."
              : `Catat volume air yang baru saja dialirkan ke ${activeLogPlot?.plot.name}.`
          }
        >
          {logSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <p className="text-sm font-normal text-ink-900">Irigasi Berhasil Dicatat</p>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="p-3 rounded-xl bg-surface-50 border border-line-200/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-500">Petak Lahan:</span>
                  <span className="font-normal text-ink-900">{activeLogPlot?.plot.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Saran FAO-56:</span>
                  <span className="font-normal text-emerald-800">{activeLogPlot?.meta.volumeM3} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Metode Irigasi:</span>
                  <span className="font-normal text-ink-900 capitalize">{activeLogPlot?.plot.irrigation_method}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-normal text-ink-900 block mb-1">
                  Volume Air Aktual yang Dialirkan (m³)
                </label>
                <Input
                  type="number"
                  value={logVolume}
                  onChange={(e) => setLogVolume(e.target.value)}
                  placeholder="Masukkan volume air dalam meter kubik..."
                  className="font-normal text-sm"
                />
                <span className="text-[11px] text-ink-400 mt-1 block">
                  Standar pompa sumur dangkal 8 L/detik = ~28,8 m³/jam.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-200">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setActiveLogPlot(null)}
                  className="text-xs font-normal"
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleSaveIrrigation}
                  className="text-xs font-normal bg-[#1E3926] hover:bg-[#14261a] text-[#A3E635]"
                >
                  Simpan & Update Lengas
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
