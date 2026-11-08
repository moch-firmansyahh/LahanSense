"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { computePlotAgronomy } from "@/lib/agronomy";
import type { Plot } from "@/types/api";
import { polygon, area, polygonToLine, length } from "@turf/turf";
import {
  Layers,
  MapPin,
  Ruler,
  Compass,
  Download,
  Search,
  Filter,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Sprout,
  Droplets,
  Activity,
  Maximize2,
  Calendar,
  Satellite,
  Gauge,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full min-h-[500px]" />,
});

function makePolygon(lng: number, lat: number, size = 0.0018): GeoJSON.Polygon {
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng, lat],
        [lng + size, lat],
        [lng + size, lat + size],
        [lng, lat + size],
        [lng, lat],
      ],
    ],
  };
}

// 10 Petak Lahan Autentik Berbasis Kawasan Pertanian Asli Indonesia
const DEMO_PLOTS: (Plot & { region: string })[] = [
  {
    id: 1,
    name: "Sawah Karawang",
    crop: "padi",
    region: "Rawamerta, Karawang (Jawa Barat)",
    planting_date: "2026-09-22",
    irrigation_method: "genangan",
    area_ha: 2.75,
    centroid: { lat: -6.2450, lng: 107.3850 },
    geometry: makePolygon(107.3850, -6.2450, 0.0022),
    is_demo: true,
  },
  {
    id: 2,
    name: "Kebun Cabai Lembang",
    crop: "cabai",
    region: "Cikole, Lembang (Jawa Barat)",
    planting_date: "2026-09-08",
    irrigation_method: "tetes",
    area_ha: 1.50,
    centroid: { lat: -6.7850, lng: 107.6450 },
    geometry: makePolygon(107.6450, -6.7850, 0.0016),
    is_demo: true,
  },
  {
    id: 3,
    name: "Lahan Jagung Gunungkidul",
    crop: "jagung",
    region: "Playen, Gunungkidul (D.I. Yogyakarta)",
    planting_date: "2026-10-04",
    irrigation_method: "alur",
    area_ha: 1.85,
    centroid: { lat: -7.9400, lng: 110.5500 },
    geometry: makePolygon(110.5500, -7.9400, 0.0018),
    is_demo: true,
  },
  {
    id: 4,
    name: "Sentra Bawang Brebes",
    crop: "bawang_merah",
    region: "Larangan, Brebes (Jawa Tengah)",
    planting_date: "2026-10-11",
    irrigation_method: "pompa",
    area_ha: 1.20,
    centroid: { lat: -6.9300, lng: 108.9850 },
    geometry: makePolygon(108.9850, -6.9300, 0.0015),
    is_demo: true,
  },
  {
    id: 5,
    name: "Kebun Tomat Pangalengan",
    crop: "cabai",
    region: "Banjarsari, Pangalengan (Jawa Barat)",
    planting_date: "2026-09-19",
    irrigation_method: "tetes",
    area_ha: 1.40,
    centroid: { lat: -7.1850, lng: 107.5650 },
    geometry: makePolygon(107.5650, -7.1850, 0.0016),
    is_demo: true,
  },
  {
    id: 6,
    name: "Lahan Kedelai Grobogan",
    crop: "jagung",
    region: "Toroh, Grobogan (Jawa Tengah)",
    planting_date: "2026-09-29",
    irrigation_method: "alur",
    area_ha: 2.10,
    centroid: { lat: -7.1200, lng: 110.9500 },
    geometry: makePolygon(110.9500, -7.1200, 0.0020),
    is_demo: true,
  },
  {
    id: 7,
    name: "Sawah Organik Subang",
    crop: "padi",
    region: "Binong, Subang (Jawa Barat)",
    planting_date: "2026-09-17",
    irrigation_method: "genangan",
    area_ha: 3.20,
    centroid: { lat: -6.4500, lng: 107.7850 },
    geometry: makePolygon(107.7850, -6.4500, 0.0025),
    is_demo: true,
  },
  {
    id: 8,
    name: "Sentra Jagung Malang",
    crop: "jagung",
    region: "Kepanjen, Malang (Jawa Timur)",
    planting_date: "2026-10-01",
    irrigation_method: "alur",
    area_ha: 2.40,
    centroid: { lat: -8.1200, lng: 112.5800 },
    geometry: makePolygon(112.5800, -8.1200, 0.0020),
    is_demo: true,
  },
  {
    id: 9,
    name: "Sentra Bawang Merah Nganjuk",
    crop: "bawang_merah",
    region: "Bagor, Nganjuk (Jawa Timur)",
    planting_date: "2026-10-05",
    irrigation_method: "pompa",
    area_ha: 1.10,
    centroid: { lat: -7.5800, lng: 111.9400 },
    geometry: makePolygon(111.9400, -7.5800, 0.0014),
    is_demo: true,
  },
  {
    id: 10,
    name: "Kebun Cabai Magelang",
    crop: "cabai",
    region: "Sawangan, Magelang (Jawa Tengah)",
    planting_date: "2026-09-25",
    irrigation_method: "tetes",
    area_ha: 0.95,
    centroid: { lat: -7.5400, lng: 110.3200 },
    geometry: makePolygon(110.3200, -7.5400, 0.0013),
    is_demo: true,
  },
];

export default function PetaFullPage() {
  const [plots, setPlots] = useState<Plot[]>(DEMO_PLOTS);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"parcels" | "spectral" | "tools">("parcels");
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportNotice, setExportNotice] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<Plot[]>("/plots")
      .then((data) => {
        if (!cancelled && data.length > 0) {
          setPlots(data);
          if (data[0]) setSelectedId(data[0].id);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlot = plots.find((p) => p.id === selectedId) || plots[0];
  const agro = useMemo(() => computePlotAgronomy(selectedPlot), [selectedPlot]);

  // Hitung metrik spasial real Turf.js
  const spatialMetrics = useMemo(() => {
    if (!selectedPlot?.geometry?.coordinates?.length) {
      return { areaHa: selectedPlot?.area_ha || 0, perimeterM: 0 };
    }
    try {
      const poly = polygon(selectedPlot.geometry.coordinates);
      const calculatedArea = area(poly) / 10_000;
      const line = polygonToLine(poly);
      const perimeter = !Array.isArray(line) && line.type === "Feature"
        ? length(line, { units: "kilometers" }) * 1000
        : 0;
      return {
        areaHa: Math.round(calculatedArea * 100) / 100,
        perimeterM: Math.round(perimeter),
      };
    } catch {
      return {
        areaHa: selectedPlot.area_ha || 1.0,
        perimeterM: Math.round(Math.sqrt((selectedPlot.area_ha || 1) * 10_000) * 4),
      };
    }
  }, [selectedPlot]);

  // Unduh GeoJSON Batas Lahan
  function handleExportGeoJSON() {
    if (!selectedPlot) return;
    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: selectedPlot.id,
            name: selectedPlot.name,
            crop: selectedPlot.crop,
            area_ha: selectedPlot.area_ha,
            ndvi: agro.ndvi,
            rekomendasi_m3: agro.volumeM3,
            fase_tumbuh: agro.growthStage,
          },
          geometry: selectedPlot.geometry,
        },
      ],
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `Batas_Lahan_${selectedPlot.name.replace(/\s+/g, "_")}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  }

  // Filter petak lahan
  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      const matchCrop = cropFilter === "all" || p.crop === cropFilter;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.crop.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCrop && matchSearch;
    });
  }, [plots, cropFilter, searchQuery]);

  return (
    <AppShell title="Stasiun Kerja GIS Citra Satelit" fullHeight>
      <div className="relative w-full h-[calc(100vh-5.5rem)] flex overflow-hidden rounded-[24px] border border-stone-200/90 shadow-md bg-stone-900 font-sans">
        {/* Map Canvas as the central stage */}
        <div className="relative flex-1 h-full min-w-0">
          <MapView plots={plots} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* Floating Toggle Drawer Button: Vertically Centered on Left Edge (No Collision with Top HUD) */}
        {!drawerOpen && (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="absolute top-1/2 -translate-y-1/2 left-0 z-30 flex items-center gap-1.5 pl-2.5 pr-3 py-2.5 rounded-r-xl bg-white/95 hover:bg-white text-stone-800 shadow-xl border-y border-r border-stone-300/90 backdrop-blur-md transition-all cursor-pointer hover:translate-x-1 group"
            title="Buka Panel GIS Hamparan"
          >
            <PanelLeftOpen className="w-4 h-4 text-emerald-800 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-stone-700 hidden sm:inline">
              Panel GIS
            </span>
          </button>
        )}

        {/* LEFT COLLAPSIBLE GIS INTELLIGENCE DRAWER */}
        <div
          className={`absolute top-0 bottom-0 left-0 z-30 w-80 sm:w-92 bg-white/95 backdrop-blur-md border-r border-stone-200/90 shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/80 bg-stone-50/70 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1E3926] text-[#A3E635] flex items-center justify-center text-xs font-normal">
                GIS
              </div>
              <div>
                <h2 className="text-xs font-medium text-stone-900 tracking-tight">Konsol Spasial Satelit</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-normal mt-0.5">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                  </span>
                  <span className="text-emerald-700 font-medium">Sentinel-2B</span>
                  <span>·</span>
                  <span>10m Orbit 124</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup Panel"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* 3 GIS Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-stone-100/80 border-b border-stone-200/60 text-xs font-normal shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("parcels")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "parcels"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              <span>Petak</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("spectral")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "spectral"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-lime-600" />
              <span>Spektral</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tools")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "tools"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Ruler className="w-3.5 h-3.5 text-blue-600" />
              <span>Toolbox</span>
            </button>
          </div>

          {/* TAB 1: PARCELS FLEET & QUICK TELEMETRY */}
          {activeTab === "parcels" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Search & Filter Bar */}
              <div className="p-3 border-b border-stone-200/60 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari petak atau lokasi..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 bg-stone-50/70 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {(["all", "padi", "cabai", "jagung", "bawang_merah"] as const).map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => setCropFilter(crop)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-normal capitalize whitespace-nowrap transition-colors cursor-pointer ${
                        cropFilter === crop
                          ? "bg-[#1E3926] text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {crop === "all" ? "Semua" : crop.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parcels List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredPlots.map((p) => {
                  const isSelected = p.id === selectedId;
                  const plotAgro = computePlotAgronomy(p);
                  const cropEmoji =
                    p.crop === "padi" ? "🌾" : p.crop === "cabai" ? "🌶️" : p.crop === "bawang_merah" ? "🧅" : "🌽";

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-400/90 shadow-2xs ring-1 ring-emerald-500/30"
                          : "bg-white border-stone-200/80 hover:bg-stone-50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-sm shrink-0">
                        {cropEmoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-normal text-stone-900 truncate">
                            {p.name.replace(" (demo)", "")}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[9px] font-normal uppercase ${
                              plotAgro.status === "kritis"
                                ? "bg-rose-100 text-rose-800"
                                : plotAgro.status === "waspada"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {plotAgro.status}
                          </span>
                        </div>

                        <p className="text-[10px] text-stone-500 truncate mt-0.5">
                          {p.crop.toUpperCase()} · Luas {p.area_ha.toFixed(2)} ha
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-normal">
                          <span className="text-blue-700">💧 {plotAgro.volumeM3.toFixed(0)} m³</span>
                          <span className="text-stone-300">•</span>
                          <span className="text-emerald-700">NDVI {plotAgro.ndvi.toFixed(2)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MULTISPECTRAL REMOTE SENSING ANALYSIS */}
          {activeTab === "spectral" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-xs font-normal text-stone-900 uppercase tracking-wider">
                  Analisis Spektral Sentinel-2
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Reflektansi kanopi gelombang elektromagnetik petak aktif: <b>{selectedPlot.name}</b>
                </p>
              </div>

              {/* Spectral Bands Breakdown Card */}
              <div className="space-y-2 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-normal uppercase tracking-wider text-stone-400">
                  Respon Spektral Kanopi
                </span>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-700">Band 2 (Biru 490nm)</span>
                    <span className="font-mono font-normal text-stone-900">0.04 (Serapan Tinggi)</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "12%" }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-stone-700">Band 4 (Merah 665nm)</span>
                    <span className="font-mono font-normal text-stone-900">0.08 (Serapan Klorofil)</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: "20%" }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-stone-700">Band 8 (NIR 842nm)</span>
                    <span className="font-mono font-normal text-emerald-800">
                      {(agro.ndvi * 0.75 + 0.1).toFixed(2)} (Refleksi Mesofil)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.round(agro.ndvi * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium text-stone-700">Band 11 (SWIR 1610nm)</span>
                    <span className="font-mono font-normal text-amber-700">0.19 (Kadar Air Sel)</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "35%" }} />
                  </div>
                </div>
              </div>

              {/* Crop Water Stress Index Card */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-normal uppercase tracking-wider text-emerald-800">
                    Indeks Cekaman Air (CWSI)
                  </span>
                  <span className="text-xs font-normal text-emerald-900">
                    {agro.status === "kritis" ? "0.68 (Tinggi)" : agro.status === "waspada" ? "0.38 (Sedang)" : "0.14 (Rendah)"}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                  Berdasarkan selisih suhu kanopi satelit dan laju transpirasi aktual FAO-56.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SPATIAL TOOLBOX & EXPORT */}
          {activeTab === "tools" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-xs font-normal text-stone-900 uppercase tracking-wider">
                  Toolbox Geospasial
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Pengukuran topografi, keliling, dan ekspor poligon batas petak
                </p>
              </div>

              {/* Spatial Calculations */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">Luas Hamparan:</span>
                  <span className="font-normal text-stone-900">{spatialMetrics.areaHa} ha ({Math.round(spatialMetrics.areaHa * 10000)} m²)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">Keliling Batas Petak:</span>
                  <span className="font-normal text-stone-900">~{spatialMetrics.perimeterM} meter</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">Koordinat Centroid:</span>
                  <span className="font-mono text-[11px] font-normal text-emerald-800">
                    {selectedPlot.centroid.lat.toFixed(4)}, {selectedPlot.centroid.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleExportGeoJSON}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1E3926] hover:bg-[#274d33] text-white text-xs font-normal flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exportNotice ? "GeoJSON Berhasil Diunduh!" : "Ekspor Batas Petak (GeoJSON)"}</span>
                </button>

                <Link
                  href="/lahan/baru"
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-normal flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Digitasi / Gambar Petak Baru</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </Link>
              </div>
            </div>
          )}

          {/* Drawer Footer Status */}
          <div className="p-3 border-t border-stone-200/80 bg-stone-50/70 text-[10px] text-stone-500 flex items-center justify-between shrink-0">
            <span>Sistem Koordinat: WGS 84 (EPSG:4326)</span>
            <span className="text-emerald-700 font-normal">100% Spasial Valid</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
