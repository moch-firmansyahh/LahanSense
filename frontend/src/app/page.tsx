"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import AppShell from "@/components/layout/AppShell";
import FarmPerformanceDonut from "@/components/features/FarmPerformanceDonut";
import WeatherStripedCard from "@/components/features/WeatherStripedCard";
import SoilHealthCard from "@/components/features/SoilHealthCard";
import FarmTaskCards from "@/components/features/FarmTaskCards";
import { Button } from "@/components/ui/Button";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] rounded-[24px] bg-[#162B1D] flex items-center justify-center border border-stone-200/90 shadow-md">
      <div className="flex flex-col items-center gap-2 text-stone-400 text-xs">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span>Memuat Peta Satelit...</span>
      </div>
    </div>
  ),
});
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import {
  ChevronDown,
  Check,
  Search,
  Bell,
  SlidersHorizontal,
  Settings,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import type { Plot, Recommendation } from "@/types/api";

const DEFAULT_REC: Recommendation = {
  plot_id: 1,
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
};

const REC_MAP: Record<number, Recommendation> = {
  1: DEFAULT_REC,
  2: {
    plot_id: 2,
    date: "2026-11-08",
    et0_mm: 4.2,
    kc: 0.85,
    etc_mm: 3.6,
    effective_rain_mm: 0.0,
    deficit_mm: 1.1,
    irrigation_volume_m3: 16.5,
    pump_minutes: 25,
    status: "aman",
    reason: "Hari ke-61. Kebutuhan air 3,6 mm, kondisi perakaran optimal.",
    confidence: "tinggi",
  },
  3: {
    plot_id: 3,
    date: "2026-11-08",
    et0_mm: 5.0,
    kc: 1.15,
    etc_mm: 5.75,
    effective_rain_mm: 0.0,
    deficit_mm: 4.2,
    irrigation_volume_m3: 42.0,
    pump_minutes: 80,
    status: "kritis",
    reason: "Hari ke-35. Defisit kumulatif tinggi melampaui ambang batas aman.",
    confidence: "sedang",
  },
  4: {
    plot_id: 4,
    date: "2026-11-08",
    et0_mm: 4.8,
    kc: 1.05,
    etc_mm: 5.0,
    effective_rain_mm: 0.0,
    deficit_mm: 3.1,
    irrigation_volume_m3: 24.8,
    pump_minutes: 48,
    status: "waspada",
    reason: "Hari ke-28 (fase pembentukan umbi). Kebutuhan 5,0 mm air.",
    confidence: "tinggi",
  },
  5: {
    plot_id: 5,
    date: "2026-11-08",
    et0_mm: 3.8,
    kc: 0.80,
    etc_mm: 3.0,
    effective_rain_mm: 0.0,
    deficit_mm: 0.9,
    irrigation_volume_m3: 10.8,
    pump_minutes: 18,
    status: "aman",
    reason: "Hari ke-50 (pemasakan buah). Kelembapan tanah terjaga subur.",
    confidence: "tinggi",
  },
  6: {
    plot_id: 6,
    date: "2026-11-08",
    et0_mm: 5.2,
    kc: 1.10,
    etc_mm: 5.7,
    effective_rain_mm: 0.0,
    deficit_mm: 4.5,
    irrigation_volume_m3: 60.0,
    pump_minutes: 115,
    status: "kritis",
    reason: "Hari ke-40 (pengisian polong). Anomali cuaca panas memicu stres air.",
    confidence: "tinggi",
  },
  7: {
    plot_id: 7,
    date: "2026-11-08",
    et0_mm: 4.1,
    kc: 1.10,
    etc_mm: 4.5,
    effective_rain_mm: 0.0,
    deficit_mm: 0.8,
    irrigation_volume_m3: 8.0,
    pump_minutes: 18,
    status: "aman",
    reason: "Hari ke-52 (pembentukan malai). Genangan macak-macak optimal.",
    confidence: "tinggi",
  },
  8: {
    plot_id: 8,
    date: "2026-11-08",
    et0_mm: 4.9,
    kc: 1.05,
    etc_mm: 5.1,
    effective_rain_mm: 0.0,
    deficit_mm: 3.1,
    irrigation_volume_m3: 31.0,
    pump_minutes: 62,
    status: "waspada",
    reason: "Hari ke-38 (vegetatif cepat V8). Pengaliran alur 31 m³ dianjurkan sebelum terik siang.",
    confidence: "tinggi",
  },
  9: {
    plot_id: 9,
    date: "2026-11-08",
    et0_mm: 5.1,
    kc: 1.15,
    etc_mm: 5.8,
    effective_rain_mm: 0.0,
    deficit_mm: 4.6,
    irrigation_volume_m3: 41.4,
    pump_minutes: 82,
    status: "kritis",
    reason: "Hari ke-34 (pembesaran umbi). Lengas tanah kritis 32%, butuh siraman pompa segera.",
    confidence: "sedang",
  },
  10: {
    plot_id: 10,
    date: "2026-11-08",
    et0_mm: 4.0,
    kc: 0.85,
    etc_mm: 3.4,
    effective_rain_mm: 0.0,
    deficit_mm: 1.4,
    irrigation_volume_m3: 9.8,
    pump_minutes: 20,
    status: "aman",
    reason: "Hari ke-44 (pembungaan & buah pertama). Fertigasi tetes 20 menit menjaga turgor bunga.",
    confidence: "tinggi",
  },
};

// 6 Lahan Demo Lengkap untuk Testing & Penjurian
const FALLBACK_PLOTS: Plot[] = [
  {
    id: 1,
    name: "Sawah Karawang (demo)",
    crop: "padi",
    planting_date: "2026-09-22",
    irrigation_method: "genangan",
    area_ha: 1.0,
    centroid: { lat: -6.2450, lng: 107.3850 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [107.3850, -6.2450],
          [107.3868, -6.2450],
          [107.3868, -6.2432],
          [107.3850, -6.2432],
          [107.3850, -6.2450],
        ],
      ],
    },
    is_demo: true,
  },
  {
    id: 2,
    name: "Kebun Cabai Lembang (demo)",
    crop: "cabai",
    planting_date: "2026-09-08",
    irrigation_method: "tetes",
    area_ha: 1.5,
    centroid: { lat: -6.7850, lng: 107.6450 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [107.6450, -6.7850],
          [107.6466, -6.7850],
          [107.6466, -6.7834],
          [107.6450, -6.7834],
          [107.6450, -6.7850],
        ],
      ],
    },
    is_demo: true,
  },
  {
    id: 3,
    name: "Lahan Jagung Gunungkidul (demo)",
    crop: "jagung",
    planting_date: "2026-10-04",
    irrigation_method: "alur",
    area_ha: 1.6,
    centroid: { lat: -7.9400, lng: 110.5500 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.5500, -7.9400],
          [110.5518, -7.9400],
          [110.5518, -7.9382],
          [110.5500, -7.9382],
          [110.5500, -7.9400],
        ],
      ],
    },
    is_demo: true,
  },
  {
    id: 4,
    name: "Sentra Bawang Brebes (demo)",
    crop: "bawang_merah",
    planting_date: "2026-10-11",
    irrigation_method: "pompa",
    area_ha: 0.8,
    centroid: { lat: -6.9300, lng: 108.9850 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [108.9850, -6.9300],
          [108.9865, -6.9300],
          [108.9865, -6.9285],
          [108.9850, -6.9285],
          [108.9850, -6.9300],
        ],
      ],
    },
    is_demo: true,
  },
  {
    id: 5,
    name: "Kebun Tomat Pangalengan (demo)",
    crop: "cabai",
    planting_date: "2026-09-19",
    irrigation_method: "tetes",
    area_ha: 1.2,
    centroid: { lat: -7.1850, lng: 107.5650 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [107.5650, -7.1850],
          [107.5666, -7.1850],
          [107.5666, -7.1834],
          [107.5650, -7.1834],
          [107.5650, -7.1850],
        ],
      ],
    },
    is_demo: true,
  },
  {
    id: 6,
    name: "Lahan Kedelai Grobogan (demo)",
    crop: "jagung",
    planting_date: "2026-09-29",
    irrigation_method: "alur",
    area_ha: 2.0,
    centroid: { lat: -7.1200, lng: 110.9500 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.9500, -7.1200],
          [110.9520, -7.1200],
          [110.9520, -7.1180],
          [110.9500, -7.1180],
          [110.9500, -7.1200],
        ],
      ],
    },
    is_demo: true,
  },
  {
    id: 7,
    name: "Sawah Organik Subang (demo)",
    crop: "padi",
    planting_date: "2026-09-17",
    irrigation_method: "genangan",
    area_ha: 2.1,
    centroid: { lat: -6.4500, lng: 107.7850 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [107.7850, -6.4500],
          [107.7872, -6.4500],
          [107.7872, -6.4478],
          [107.7850, -6.4478],
          [107.7850, -6.4500],
        ],
      ],
    },
    is_demo: true,
  },
  {
    id: 8,
    name: "Sentra Jagung Hibrida Malang (demo)",
    crop: "jagung",
    planting_date: "2026-10-01",
    irrigation_method: "alur",
    area_ha: 1.8,
    centroid: { lat: -8.1200, lng: 112.5800 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [112.5800, -8.1200],
          [112.5820, -8.1200],
          [112.5820, -8.1180],
          [112.5800, -8.1180],
          [112.5800, -8.1200],
        ],
      ],
    },
    is_demo: true,
  },
  {
    id: 9,
    name: "Sentra Bawang Merah Nganjuk (demo)",
    crop: "bawang_merah",
    planting_date: "2026-10-05",
    irrigation_method: "pompa",
    area_ha: 0.9,
    centroid: { lat: -7.5800, lng: 111.9400 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [111.9400, -7.5800],
          [111.9415, -7.5800],
          [111.9415, -7.5785],
          [111.9400, -7.5785],
          [111.9400, -7.5800],
        ],
      ],
    },
    is_demo: true,
  },
  {
    id: 10,
    name: "Kebun Cabai Rawit Magelang (demo)",
    crop: "cabai",
    planting_date: "2026-09-25",
    irrigation_method: "tetes",
    area_ha: 0.7,
    centroid: { lat: -7.5400, lng: 110.3200 },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.3200, -7.5400],
          [110.3213, -7.5400],
          [110.3213, -7.5387],
          [110.3200, -7.5387],
          [110.3200, -7.5400],
        ],
      ],
    },
    is_demo: true,
  },
];

// Peta Cuaca Mikroiklim Per Wilayah Pertanian
const PLOT_WEATHER_MAP: Record<number, {
  location: string;
  temp: number;
  condition: string;
  windKm: number;
  humidity: number;
  tMin: number;
  tMax: number;
}> = {
  1: {
    location: "Karawang, Jawa Barat",
    temp: 31,
    condition: "Cerah Berawan",
    windKm: 14,
    humidity: 62,
    tMin: 25,
    tMax: 33,
  },
  2: {
    location: "Lembang, Bandung Barat",
    temp: 22,
    condition: "Sejuk Berkabut",
    windKm: 9,
    humidity: 82,
    tMin: 16,
    tMax: 24,
  },
  3: {
    location: "Gunungkidul, DI Yogyakarta",
    temp: 32,
    condition: "Cerah Terik",
    windKm: 18,
    humidity: 52,
    tMin: 23,
    tMax: 34,
  },
  4: {
    location: "Brebes, Jawa Tengah",
    temp: 34,
    condition: "Panas Terik",
    windKm: 16,
    humidity: 58,
    tMin: 26,
    tMax: 36,
  },
  5: {
    location: "Pangalengan, Jawa Barat",
    temp: 20,
    condition: "Hujan Ringan",
    windKm: 11,
    humidity: 86,
    tMin: 15,
    tMax: 22,
  },
  6: {
    location: "Grobogan, Jawa Tengah",
    temp: 33,
    condition: "Cerah Berawan",
    windKm: 15,
    humidity: 56,
    tMin: 24,
    tMax: 35,
  },
  7: {
    location: "Subang, Jawa Barat",
    temp: 30,
    condition: "Cerah Berawan",
    windKm: 13,
    humidity: 66,
    tMin: 24,
    tMax: 32,
  },
  8: {
    location: "Malang, Jawa Timur",
    temp: 24,
    condition: "Sejuk Berawan",
    windKm: 10,
    humidity: 74,
    tMin: 18,
    tMax: 26,
  },
  9: {
    location: "Nganjuk, Jawa Timur",
    temp: 33,
    condition: "Cerah Terik",
    windKm: 17,
    humidity: 55,
    tMin: 24,
    tMax: 35,
  },
  10: {
    location: "Magelang, Jawa Tengah",
    temp: 26,
    condition: "Cerah Sejuk",
    windKm: 12,
    humidity: 70,
    tMin: 20,
    tMax: 28,
  },
};

function resolvePlotWeather(plot?: Plot) {
  if (!plot) return PLOT_WEATHER_MAP[1];
  if (PLOT_WEATHER_MAP[plot.id]) return PLOT_WEATHER_MAP[plot.id];

  const name = plot.name.toLowerCase();
  const lat = plot.centroid?.lat ?? -6.2;
  const lng = plot.centroid?.lng ?? 107.3;

  if (name.includes("lembang") || name.includes("pangalengan") || (-7.25 <= lat && lat <= -6.75 && 107.5 <= lng && lng <= 107.7)) {
    return {
      location: plot.name.replace(/ \(demo\)/i, "").trim(),
      temp: 22,
      condition: "Sejuk Berkabut",
      windKm: 9,
      humidity: 82,
      tMin: 16,
      tMax: 24,
    };
  }
  if (name.includes("gunung") || name.includes("kidul") || (-8.1 <= lat && lat <= -7.8 && 110.4 <= lng && lng <= 110.8)) {
    return {
      location: plot.name.replace(/ \(demo\)/i, "").trim(),
      temp: 32,
      condition: "Cerah Terik",
      windKm: 18,
      humidity: 52,
      tMin: 23,
      tMax: 34,
    };
  }
  if (name.includes("jakarta") || (106.6 <= lng && lng <= 107.0 && -6.4 <= lat && lat <= -6.1)) {
    return {
      location: "DKI Jakarta",
      temp: 33,
      condition: "Panas Berawan",
      windKm: 13,
      humidity: 72,
      tMin: 26,
      tMax: 34,
    };
  }

  return {
    location: plot.name.replace(/ \(demo\)/i, "").trim(),
    temp: 30,
    condition: "Cerah Berawan",
    windKm: 14,
    humidity: 62,
    tMin: 25,
    tMax: 33,
  };
}

export default function HomePage() {
  const [plots, setPlots] = useState<Plot[]>(FALLBACK_PLOTS);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [rec, setRec] = useState<Recommendation>(DEFAULT_REC);
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [weatherData, setWeatherData] = useState(() => PLOT_WEATHER_MAP[1]);

  useEffect(() => {
    if (!selectedId) return;
    const fallbackW = resolvePlotWeather(plots.find((p) => p.id === selectedId));
    setWeatherData(fallbackW);

    let cancelled = false;
    api<{
      plot_id: number;
      location: string;
      temp: number;
      condition: string;
      wind_kmh: number;
      humidity: number;
      t_min: number;
      t_max: number;
    }>(`/plots/${selectedId}/weather`)
      .then((w) => {
        if (!cancelled && w) {
          setWeatherData({
            location: fallbackW.location || w.location,
            temp: w.temp,
            condition: w.condition,
            windKm: w.wind_kmh,
            humidity: w.humidity,
            tMin: w.t_min,
            tMax: w.t_max,
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [selectedId, plots]);

  useEffect(() => {
    let cancelled = false;
    api<Plot[]>("/plots")
      .then((data) => {
        if (!cancelled && data.length > 0) {
          setPlots(data);
          setSelectedId(data[0].id);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    let cancelled = false;
    api<Recommendation>(`/plots/${selectedId}/recommendation`)
      .then((r) => !cancelled && setRec(r))
      .catch(() => {
        if (!cancelled && REC_MAP[selectedId]) {
          setRec(REC_MAP[selectedId]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Active filter count
  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (cropFilter !== "all" ? 1 : 0);

  // Filtered plots based on search query AND filters
  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      const q = searchVal.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.crop.toLowerCase().includes(q);

      const pStatus = (REC_MAP[p.id]?.status ?? "aman").toLowerCase();
      const matchesStatus =
        statusFilter === "all" || pStatus === statusFilter.toLowerCase();

      const matchesCrop =
        cropFilter === "all" || p.crop.toLowerCase() === cropFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCrop;
    });
  }, [plots, searchVal, statusFilter, cropFilter]);

  function handleSelectPlot(id: number) {
    setSelectedId(id);
    if (REC_MAP[id]) setRec(REC_MAP[id]);
    setIsSearchOpen(false);
  }

  function handleResetFilter() {
    setStatusFilter("all");
    setCropFilter("all");
    setSearchVal("");
    setIsSearchOpen(false);
  }

  const selectedPlot = plots.find((p) => p.id === selectedId) || plots[0];
  const totalArea = plots.reduce((acc, p) => acc + p.area_ha, 0);
  const safePlotsCount = plots.filter((p) => (REC_MAP[p.id]?.status ?? "aman") === "aman").length;
  const needWaterPlotsCount = plots.filter((p) => (REC_MAP[p.id]?.status ?? "aman") !== "aman").length;

  return (
    <AppShell title="Lahan Saya" fullHeight={true}>
      {/* Top Header Bar Inside White Dashboard Card (Matching Reference Image) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-line-200/60 select-none shrink-0">
        {/* Left: Title + Parcel Selector */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-medium text-stone-900 tracking-tight">
            Lahan Saya
          </h1>

          {/* Parcel Dropdown Selector (Supports all Demo Parcels) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs border border-stone-200/80 transition-colors shadow-2xs cursor-pointer"
              >
                <span className="max-w-[170px] truncate">{selectedPlot.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0 font-medium text-stone-800 text-xs">
                  Pilih Petak Lahan
                </DropdownMenuLabel>
                {(activeFilterCount > 0 || searchVal) && (
                  <span className="text-[10px] text-emerald-700 font-normal">
                    {filteredPlots.length} dari {plots.length}
                  </span>
                )}
              </div>
              <DropdownMenuSeparator />
              {(filteredPlots.length > 0 ? filteredPlots : plots).map((p) => {
                const isSelected = p.id === selectedId;
                const plotRec = REC_MAP[p.id] || DEFAULT_REC;
                return (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => handleSelectPlot(p.id)}
                    className={`flex items-center justify-between py-2 cursor-pointer ${
                      isSelected ? "bg-emerald-700 text-white font-medium" : "text-stone-700"
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate">{p.name}</span>
                      <span className="text-[10px] opacity-75 capitalize">
                        {p.crop} · {p.area_ha.toFixed(2)} ha · {plotRec.status}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 ml-2 text-white shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Search, Filter, Settings, Notifications, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Search Pill with Live Autosuggest */}
          <div className="relative">
            <div className="flex items-center w-48 sm:w-60 h-10 px-3.5 rounded-full bg-surface-100 border border-line-200/80 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all shadow-2xs">
              <Search className="w-4 h-4 text-ink-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchVal.trim().length > 0) setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredPlots.length > 0) {
                    handleSelectPlot(filteredPlots[0].id);
                  }
                  if (e.key === "Escape") {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder="Cari petak lahan..."
                className="w-full bg-transparent text-xs text-ink-900 placeholder:text-ink-400 outline-none"
              />
              {searchVal && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal("");
                    setIsSearchOpen(false);
                  }}
                  className="w-4 h-4 text-stone-400 hover:text-stone-700 shrink-0 ml-1 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autosuggest Dropdown Overlay */}
            {isSearchOpen && searchVal.trim().length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSearchOpen(false)}
                />
                <div className="absolute top-full mt-2 left-0 w-72 sm:w-80 bg-white border border-stone-200/90 rounded-2xl shadow-xl p-2 z-50">
                  <div className="px-2 py-1 text-[11px] font-medium text-stone-500 flex items-center justify-between border-b border-stone-100 pb-1.5 mb-1.5">
                    <span>Hasil Pencarian ({filteredPlots.length})</span>
                    <span className="text-[10px] text-stone-400">Tekan Enter / klik</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                    {filteredPlots.length > 0 ? (
                      filteredPlots.map((p) => {
                        const pRec = REC_MAP[p.id] || DEFAULT_REC;
                        const isSelected = p.id === selectedId;
                        const isKritis = pRec.status === "kritis";
                        const isWaspada = pRec.status === "waspada";

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPlot(p.id)}
                            className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-50 text-emerald-950 border border-emerald-200"
                                : "hover:bg-stone-50 text-stone-800"
                            }`}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="text-xs font-medium truncate">{p.name}</span>
                              <span className="text-[10px] text-stone-500 capitalize">
                                {p.crop} · {p.area_ha.toFixed(2)} ha
                              </span>
                            </div>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-medium shrink-0 uppercase ${
                                isKritis
                                  ? "bg-rose-100 text-rose-700"
                                  : isWaspada
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {pRec.status}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-4 text-center text-xs text-stone-500">
                        Tidak ada petak bernama &ldquo;{searchVal}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Filter Popover Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`relative w-10 h-10 rounded-full border transition-colors shadow-2xs flex items-center justify-center cursor-pointer ${
                  activeFilterCount > 0
                    ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                    : "bg-surface-100 hover:bg-surface-200 border-line-200/80 text-ink-700"
                }`}
                title="Filter Petak Lahan"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-medium flex items-center justify-center shadow-xs">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                <span className="text-xs font-medium text-stone-900">Filter Petak</span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className="text-[10px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Section 1: Status Irigasi */}
              <div className="mb-2.5">
                <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1.5">
                  Status Irigasi
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: "all", label: "Semua" },
                    { id: "aman", label: "Aman" },
                    { id: "waspada", label: "Waspada" },
                    { id: "kritis", label: "Kritis" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatusFilter(s.id)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-normal transition-colors cursor-pointer text-left flex items-center justify-between ${
                        statusFilter === s.id
                          ? "bg-emerald-700 text-white font-medium"
                          : "bg-stone-50 hover:bg-stone-100 text-stone-700"
                      }`}
                    >
                      <span>{s.label}</span>
                      {statusFilter === s.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator className="my-2" />

              {/* Section 2: Komoditas */}
              <div>
                <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block mb-1.5">
                  Komoditas Tanaman
                </span>
                <div className="flex flex-col gap-1">
                  {[
                    { id: "all", label: "Semua Komoditas" },
                    { id: "padi", label: "Padi Sawah" },
                    { id: "cabai", label: "Cabai Rawit / Merah" },
                    { id: "jagung", label: "Jagung Hibrida" },
                    { id: "bawang_merah", label: "Bawang Merah" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCropFilter(c.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-normal transition-colors cursor-pointer text-left flex items-center justify-between ${
                        cropFilter === c.id
                          ? "bg-emerald-700 text-white font-medium"
                          : "hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <span>{c.label}</span>
                      {cropFilter === c.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings button */}
          <Link
            href="/pengaturan"
            className="w-10 h-10 rounded-full bg-surface-100 hover:bg-surface-200 border border-line-200/80 flex items-center justify-center text-ink-700 transition-colors shadow-2xs"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Notifications bell */}
          <Link
            href="/peringatan"
            className="w-10 h-10 rounded-full bg-surface-100 hover:bg-surface-200 border border-line-200/80 flex items-center justify-center text-ink-700 transition-colors shadow-2xs relative"
            title="Peringatan Dini"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </Link>

          {/* User Profile Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#1E3926] text-white font-medium text-xs flex items-center justify-center shadow-xs cursor-pointer">
            PU
          </div>
        </div>
      </div>

      {/* Main Split Grid (55% Left Column / 45% Right Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5 flex-1 min-h-0 items-stretch overflow-hidden">
        {/* Left Column (55% = 7 of 12 cols): Analytics & Operations */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 overflow-y-auto pr-1 h-full">
          {/* Row 1: Status Action Pills (Clean Designer Touch) */}
          <div className="flex flex-wrap items-center justify-between gap-3 select-none">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-xs font-medium text-stone-700">Lengas Optimal</span>
                <span className="px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 text-[11px] font-medium font-mono">
                  {safePlotsCount}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-amber-900">Butuh Pengairan</span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium font-mono">
                  {needWaterPlotsCount}
                </span>
              </div>

              {/* Active Filter Pill */}
              {(activeFilterCount > 0 || searchVal) && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs">
                  <span>
                    Filter: {filteredPlots.length} dari {plots.length} petak
                  </span>
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className="ml-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-medium underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            <Link href="/lahan/baru">
              <Button
                type="button"
                className="h-9 px-4 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-medium shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Lahan</span>
              </Button>
            </Link>
          </div>

          {/* Row 2: 2x2 KPI Grid + Weather Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* 2x2 KPI Cards (7 cols) */}
            <div className="md:col-span-7 grid grid-cols-2 gap-3">
              {/* Card 1: Total Petak */}
              <div className="rounded-2xl bg-white p-4 border border-line-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-[11px] font-medium">Total Petak</span>
                  <span className="text-xs text-stone-400">••</span>
                </div>
                <div>
                  <div className="text-2xl font-medium text-stone-900 tracking-tight tabular-nums">
                    {plots.length}{" "}
                    <span className="text-xs font-normal text-stone-500">Petak</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                    100% Terpantau Satelit
                  </span>
                </div>
              </div>

              {/* Card 2: Komoditas */}
              <div className="rounded-2xl bg-white p-4 border border-line-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-[11px] font-medium">Komoditas</span>
                  <span className="text-xs text-stone-400">••</span>
                </div>
                <div>
                  <div className="text-2xl font-medium text-stone-900 tracking-tight tabular-nums">
                    5 <span className="text-xs font-normal text-stone-500">Jenis</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                    Padi, Cabai, Jagung, Bawang, Kedelai
                  </span>
                </div>
              </div>

              {/* Card 3: Total Luas */}
              <div className="rounded-2xl bg-white p-4 border border-line-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-[11px] font-medium">Total Luas</span>
                  <span className="text-xs text-stone-400">••</span>
                </div>
                <div>
                  <div className="text-2xl font-medium text-stone-900 tracking-tight tabular-nums">
                    {totalArea.toFixed(1)}{" "}
                    <span className="text-xs font-normal text-stone-500">Hektar</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
                    Sentinel-2 10m Resolusi
                  </span>
                </div>
              </div>

              {/* Card 4: Kebutuhan Air Petak Terpilih */}
              <div className="rounded-2xl bg-white p-4 border border-line-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-[11px] font-medium">Kebutuhan Air</span>
                  <span className="text-xs text-stone-400">••</span>
                </div>
                <div>
                  <div className="text-2xl font-medium text-blue-700 tracking-tight tabular-nums">
                    {rec.irrigation_volume_m3.toFixed(0)}{" "}
                    <span className="text-xs font-normal text-stone-500">m³</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium block mt-0.5">
                    Pompa {rec.pump_minutes} menit (debit 8 L/s)
                  </span>
                </div>
              </div>
            </div>

            {/* Weather Card (5 cols) */}
            <div className="md:col-span-5">
              <WeatherStripedCard
                location={weatherData.location}
                temp={weatherData.temp}
                condition={weatherData.condition}
                windKm={weatherData.windKm}
                humidity={weatherData.humidity}
                tMin={weatherData.tMin}
                tMax={weatherData.tMax}
              />
            </div>
          </div>

          {/* Row 3: Soil & Water Health Card + Farm Performance Donut Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SoilHealthCard
              deficitMm={rec.deficit_mm}
              etcMm={rec.etc_mm}
              peffMm={rec.effective_rain_mm}
              volumeM3={rec.irrigation_volume_m3}
              onLogIrrigation={(vol) => {
                setRec((prev) => ({
                  ...prev,
                  irrigation_volume_m3: Math.max(0, prev.irrigation_volume_m3 - vol),
                  deficit_mm: 0,
                  status: "aman",
                }));
                if (selectedId) {
                  api(`/plots/${selectedId}/irrigation-log`, {
                    method: "POST",
                    body: JSON.stringify({
                      log_date: new Date().toISOString().slice(0, 10),
                      volume_m3: vol,
                      note: `Realisasi irigasi ${vol} m³ via dashboard LahanSense`,
                    }),
                  }).catch(() => {});
                }
              }}
            />

            <FarmPerformanceDonut
              score={72}
              utilization={61}
              health={36}
              onTrack={79}
            />
          </div>

          {/* Row 4: 3 Bottom Activity Cards */}
          <div>
            <FarmTaskCards />
          </div>
        </div>

        {/* Right Column (45% = 5 of 12 cols): Full-Height MapView Satellite Canvas */}
        <div className="lg:col-span-5 h-[440px] sm:h-[500px] lg:h-full min-h-[380px] lg:min-h-0 flex flex-col">
          <MapView
            plots={filteredPlots.length > 0 ? filteredPlots : plots}
            selectedId={selectedId}
            onSelect={handleSelectPlot}
          />
        </div>
      </div>
    </AppShell>
  );
}
