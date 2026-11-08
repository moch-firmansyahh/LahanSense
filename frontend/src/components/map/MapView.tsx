"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import { setWorkerUrl, config as maplibreConfig } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Configure MapLibre Web Worker for Next.js / Turbopack
if (typeof window !== "undefined") {
  try {
    const workerUrl = `${window.location.origin}/maplibre-gl-worker.mjs`;
    setWorkerUrl(workerUrl);
    if (maplibreConfig) {
      maplibreConfig.WORKER_URL = workerUrl;
    }
  } catch {}
}

import { TerraDraw, TerraDrawPolygonMode, TerraDrawSelectMode } from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { area, bbox } from "@turf/turf";
import Image from "next/image";
import {
  Layers,
  Plus,
  Minus,
  Navigation,
  Maximize2,
  Droplets,
  Sprout,
  X,
  ExternalLink,
  Check,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { computePlotAgronomy, type PlotAgronomy } from "@/lib/agronomy";
import type { Plot } from "@/types/api";

type PlotMetadata = PlotAgronomy;

interface Props {
  plots: Plot[];
  selectedId: number | null;
  drawing?: boolean;
  resetKey?: number;
  onSelect: (id: number) => void;
  onDrawn?: (geometry: GeoJSON.Polygon, areaHa: number) => void;
  showNdviLayer?: boolean;
}

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
    esri: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    { id: "esri", type: "raster", source: "esri" },
    { id: "osm", type: "raster", source: "osm", layout: { visibility: "none" } },
  ],
};

// Metadata agronomis per petak sesuai Proposal LahanSense (AgriWatch & WaterCast)
export default function MapView({
  plots,
  selectedId,
  drawing = false,
  resetKey = 0,
  onSelect,
  onDrawn,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const drawRef = useRef<TerraDraw | null>(null);
  const prevPlotsKeyRef = useRef<string>("");
  const prevActiveIdRef = useRef<number | null>(null);
  const initialCenteredRef = useRef<boolean>(false);
  const [ready, setReady] = useState(false);
  const [activeLayerMode, setActiveLayerMode] = useState<"satelit" | "ndvi" | "osm">("satelit");
  const [showInspector, setShowInspector] = useState(true);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [soilFeel, setSoilFeel] = useState<"kering" | "cukup" | "basah">("cukup");
  const [irrigationLogged, setIrrigationLogged] = useState(false);

  const onDrawnRef = useRef(onDrawn);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onDrawnRef.current = onDrawn;
    onSelectRef.current = onSelect;
  }, [onDrawn, onSelect]);

  const activeId = selectedId || (plots[0]?.id ?? 1);
  const selectedPlot = plots.find((p) => p.id === activeId) || plots[0];
  const baseMeta = computePlotAgronomy(selectedPlot);

  // Hitung proyeksi neraca air dinamis saat time slider digeser (Skenario Waktu Section 5.5 PDF)
  const currentMeta: PlotMetadata = {
    ...baseMeta,
    deficitMm: Math.max(0, Math.round((baseMeta.deficitMm + dayOffset * 0.7 - (soilFeel === "basah" ? 1.5 : soilFeel === "kering" ? -0.8 : 0)) * 10) / 10),
    volumeM3: Math.max(0, Math.round((baseMeta.volumeM3 + dayOffset * 6.5 - (soilFeel === "basah" ? 12 : soilFeel === "kering" ? -8 : 0)) * 10) / 10),
    pumpMinutes: Math.max(0, Math.round(baseMeta.pumpMinutes + dayOffset * 12 - (soilFeel === "basah" ? 20 : soilFeel === "kering" ? -15 : 0))),
    status:
      baseMeta.deficitMm + dayOffset * 0.7 > 3.8
        ? "kritis"
        : baseMeta.deficitMm + dayOffset * 0.7 > 1.8
        ? "waspada"
        : "aman",
  };

  // Inisialisasi peta MapLibre GL
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    if (typeof window !== "undefined") {
      try {
        const workerUrl = `${window.location.origin}/maplibre-gl-worker.mjs`;
        setWorkerUrl(workerUrl);
        if (maplibreConfig) {
          maplibreConfig.WORKER_URL = workerUrl;
        }
      } catch {}
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [107.3850, -6.2450],
      zoom: 14.8,
      pitch: 32,
      bearing: -6,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Source poligon lahan
      map.addSource("plots", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Layer 1: Fill Poligon Normal
      map.addLayer({
        id: "plots-fill",
        type: "fill",
        source: "plots",
        paint: {
          "fill-color": [
            "case",
            ["==", ["get", "selected"], 1],
            "#4ADE80", // Soft green highlight
            ["==", ["get", "status"], "kritis"],
            "#EF4444", // Red
            ["==", ["get", "status"], "waspada"],
            "#F59E0B", // Amber
            "#10B981", // Emerald
          ],
          "fill-opacity": 0.35,
        },
      });

      // Layer 2: Fill NDVI Heatmap (AgriWatch Modul)
      map.addLayer({
        id: "plots-ndvi-heatmap",
        type: "fill",
        source: "plots",
        layout: { visibility: "none" },
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "ndvi"],
            0.0, "#991B1B",
            0.3, "#F59E0B",
            0.5, "#A3E635",
            0.7, "#16A34A",
            0.9, "#14532D",
          ],
          "fill-opacity": 0.75,
        },
      });

      // Layer 3: Outline Putih Tegas
      map.addLayer({
        id: "plots-line-white",
        type: "line",
        source: "plots",
        paint: {
          "line-color": "#ffffff",
          "line-width": 3,
        },
      });

      // Layer 4: Outline Status & Glow
      map.addLayer({
        id: "plots-line-status",
        type: "line",
        source: "plots",
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "selected"], 1],
            "#A3E635",
            ["==", ["get", "status"], "kritis"],
            "#EF4444",
            ["==", ["get", "status"], "waspada"],
            "#F59E0B",
            "#10B981",
          ],
          "line-width": ["case", ["==", ["get", "selected"], 1], 4.5, 2.5],
        },
      });

      // Klik Poligon
      map.on("click", "plots-fill", (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (id !== undefined && onSelectRef.current) {
          onSelectRef.current(Number(id));
          setShowInspector(true);
        }
      });

      map.on("mouseenter", "plots-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "plots-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      // TerraDraw Geofencing - Only initialize if drawing mode is active or onDrawn handler is provided
      if (drawing || onDrawnRef.current) {
        const draw = new TerraDraw({
          adapter: new TerraDrawMapLibreGLAdapter({ map }),
          modes: [new TerraDrawPolygonMode(), new TerraDrawSelectMode()],
        });
        draw.start();
        draw.setMode(drawing ? "polygon" : "select");

        draw.on("finish", (id, context) => {
          if (context.action !== "draw") return;
          const feature = draw.getSnapshot().find((f) => f.id === id);
          if (feature && feature.geometry.type === "Polygon") {
            const areaHa = area(feature as GeoJSON.Feature) / 10_000;
            if (onDrawnRef.current) {
              onDrawnRef.current(feature.geometry as GeoJSON.Polygon, areaHa);
            }
          }
        });

        drawRef.current = draw;
      }
      setReady(true);
    });

    return () => {
      drawRef.current?.stop();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // Sync Plots & Geospatial Markers (Anchored to true coordinates)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const source = map.getSource("plots") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const features: GeoJSON.Feature<GeoJSON.Polygon>[] = plots.map((p) => {
      const meta = computePlotAgronomy(p);
      return {
        type: "Feature",
        properties: {
          id: p.id,
          name: p.name,
          crop: p.crop,
          status: meta.status,
          ndvi: meta.ndvi,
          selected: p.id === activeId ? 1 : 0,
        },
        geometry: p.geometry,
      };
    });

    source.setData({
      type: "FeatureCollection",
      features,
    });

    const plotsKey = plots.map((p) => `${p.id}:${p.centroid?.lat},${p.centroid?.lng}`).join("|");
    const plotsChanged = prevPlotsKeyRef.current !== plotsKey;

    if (plotsChanged) {
      prevPlotsKeyRef.current = plotsKey;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      plots.forEach((p) => {
        const meta = computePlotAgronomy(p);
        const isSelected = p.id === activeId;

        const cropEmoji =
          p.crop === "padi" ? "🌾" : p.crop === "cabai" ? "🌶️" : p.crop === "bawang_merah" ? "🧅" : "🌽";

        const statusColor =
          meta.status === "kritis"
            ? "#EF4444"
            : meta.status === "waspada"
            ? "#F59E0B"
            : "#10B981";

        const el = document.createElement("div");
        el.className = "cursor-pointer group select-none flex flex-col items-center";
        el.setAttribute("data-plot-id", String(p.id));
        el.style.transformOrigin = "bottom center";
        el.innerHTML = `
          <div class="marker-pill flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-lg border transition-all duration-200 transform group-hover:scale-105 ${
            isSelected
              ? "bg-[#1E3926] text-white border-lime-400 ring-2 ring-lime-400/40"
              : "bg-white text-stone-900 border-stone-300/80 hover:border-stone-400"
          }">
            <span class="text-xs leading-none">${cropEmoji}</span>
            <span class="text-[11px] font-normal tracking-tight whitespace-nowrap">${p.name.replace(" (demo)", "")}</span>
            <span class="text-[10px] font-normal px-1.5 py-0.2 rounded-md ${
              isSelected ? "bg-white/20 text-[#A3E635]" : "bg-stone-100 text-stone-700"
            }">${meta.volumeM3.toFixed(0)} m³</span>
            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${statusColor};"></span>
          </div>
          <div class="marker-arrow w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
            isSelected ? "border-t-[#1E3926]" : "border-t-white"
          } -mt-[1px]"></div>
        `;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (onSelectRef.current) {
            onSelectRef.current(p.id);
            setShowInspector(true);
          }
          map.flyTo({
            center: [p.centroid.lng, p.centroid.lat],
            zoom: 15.0,
            duration: 500,
          });
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([p.centroid.lng, p.centroid.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    } else {
      // Re-use existing markers: update selected classes without DOM recreation
      markersRef.current.forEach((marker) => {
        const el = marker.getElement();
        const pId = Number(el.getAttribute("data-plot-id"));
        const isSelected = pId === activeId;
        const pill = el.querySelector(".marker-pill");
        const arrow = el.querySelector(".marker-arrow");
        if (pill && arrow) {
          if (isSelected) {
            pill.className = "marker-pill flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-lg border transition-all duration-200 transform group-hover:scale-105 bg-[#1E3926] text-white border-lime-400 ring-2 ring-lime-400/40";
            arrow.className = "marker-arrow w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#1E3926] -mt-[1px]";
          } else {
            pill.className = "marker-pill flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-lg border transition-all duration-200 transform group-hover:scale-105 bg-white text-stone-900 border-stone-300/80 hover:border-stone-400";
            arrow.className = "marker-arrow w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white -mt-[1px]";
          }
        }
      });
    }

    // Only animate camera if activeId actually changed or on initial mount (prevents stutter)
    const activeIdChanged = prevActiveIdRef.current !== activeId;
    prevActiveIdRef.current = activeId;

    if (activeIdChanged || !initialCenteredRef.current) {
      initialCenteredRef.current = true;
      const activePlot = plots.find((p) => p.id === activeId);
      if (activePlot) {
        if (
          activePlot.geometry &&
          activePlot.geometry.coordinates &&
          activePlot.geometry.coordinates.length > 0 &&
          activePlot.geometry.coordinates[0].length > 0
        ) {
          try {
            const b = bbox(activePlot.geometry);
            map.fitBounds(
              [
                [b[0], b[1]],
                [b[2], b[3]],
              ],
              { padding: { top: 90, bottom: 220, left: 60, right: 60 }, maxZoom: 15.5, duration: 600 }
            );
          } catch {
            if (activePlot.centroid) {
              map.flyTo({ center: [activePlot.centroid.lng, activePlot.centroid.lat], zoom: 15.2, duration: 600 });
            }
          }
        } else if (activePlot.centroid) {
          map.flyTo({ center: [activePlot.centroid.lng, activePlot.centroid.lat], zoom: 15.2, duration: 600 });
        }
      }
    }
  }, [plots, activeId, ready]);

  // Handle Layer Toggle (Satelit vs NDVI vs Peta Jalan)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (map.getLayer("esri") && map.getLayer("osm") && map.getLayer("plots-ndvi-heatmap")) {
      if (activeLayerMode === "satelit") {
        map.setLayoutProperty("esri", "visibility", "visible");
        map.setLayoutProperty("osm", "visibility", "none");
        map.setLayoutProperty("plots-ndvi-heatmap", "visibility", "none");
      } else if (activeLayerMode === "ndvi") {
        map.setLayoutProperty("esri", "visibility", "visible");
        map.setLayoutProperty("osm", "visibility", "none");
        map.setLayoutProperty("plots-ndvi-heatmap", "visibility", "visible");
      } else {
        map.setLayoutProperty("esri", "visibility", "none");
        map.setLayoutProperty("osm", "visibility", "visible");
        map.setLayoutProperty("plots-ndvi-heatmap", "visibility", "none");
      }
    }
  }, [activeLayerMode, ready]);

  // Mode Menggambar
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw || !ready) return;
    if (drawing) {
      draw.setMode("polygon");
    } else {
      draw.setMode("select");
    }
  }, [drawing, ready]);

  // Reset Drawing
  useEffect(() => {
    if (!drawRef.current || !ready || resetKey === 0) return;
    try {
      const snapshot = drawRef.current.getSnapshot();
      const ids = snapshot.map((f) => f.id).filter(Boolean) as string[];
      if (ids.length > 0) {
        drawRef.current.removeFeatures(ids);
      }
    } catch {}
  }, [resetKey, ready]);

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn({ duration: 300 }), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut({ duration: 300 }), []);

  const handleResetView = useCallback(() => {
    const activePlot = plots.find((p) => p.id === activeId);
    if (!mapRef.current || !activePlot) return;
    if (
      activePlot.geometry &&
      activePlot.geometry.coordinates &&
      activePlot.geometry.coordinates.length > 0 &&
      activePlot.geometry.coordinates[0].length > 0
    ) {
      try {
        const b = bbox(activePlot.geometry);
        mapRef.current.fitBounds(
          [
            [b[0], b[1]],
            [b[2], b[3]],
          ],
          { padding: { top: 90, bottom: 220, left: 60, right: 60 }, maxZoom: 15.5, duration: 600 }
        );
        return;
      } catch {}
    }
    if (activePlot.centroid) {
      mapRef.current.flyTo({ center: [activePlot.centroid.lng, activePlot.centroid.lat], zoom: 15.2, duration: 800 });
    }
  }, [plots, activeId]);

  function handleLogIrrigation() {
    setIrrigationLogged(true);
    api(`/plots/${activeId}/irrigation-log`, {
      method: "POST",
      body: JSON.stringify({
        log_date: new Date().toISOString().slice(0, 10),
        volume_m3: currentMeta.volumeM3,
        note: `Realisasi irigasi ${currentMeta.volumeM3} m³ via WaterCast Dashboard`,
      }),
    }).catch(() => {});
    setTimeout(() => setIrrigationLogged(false), 3000);
  }

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-0 rounded-[24px] overflow-hidden select-none shadow-md border border-stone-200/90 bg-[#162B1D]">
      {/* Map Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* TOP-RIGHT CONTROLS: Layer Mode Switcher + Reset View Docked Together */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 sm:gap-2 pointer-events-auto max-w-[calc(100%-1.5rem)]">
        {/* Layer Mode Switcher Pill */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-stone-200/90 overflow-hidden">
          <button
            type="button"
            onClick={() => setActiveLayerMode("satelit")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeLayerMode === "satelit"
                ? "bg-emerald-950 text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Satelit Sentinel-2</span>
            <span className="sm:hidden text-[11px]">Satelit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayerMode("ndvi")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeLayerMode === "ndvi"
                ? "bg-emerald-950 text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-lime-400 shrink-0" />
            <span className="hidden sm:inline">AgriWatch NDVI</span>
            <span className="sm:hidden text-[11px]">NDVI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLayerMode("osm")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeLayerMode === "osm"
                ? "bg-emerald-950 text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <span className="hidden sm:inline">Peta Jalan</span>
            <span className="sm:hidden text-[11px]">Jalan</span>
          </button>
        </div>

        {/* Top Right: Focus & Navigation */}
        <button
          type="button"
          onClick={handleResetView}
          className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-stone-700 shadow-md backdrop-blur-md border border-stone-200/90 flex items-center justify-center transition-all cursor-pointer hover:scale-105 shrink-0"
          title="Pusatkan ke Petak"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* NDVI COLOR RAMP LEGEND (When AgriWatch is toggled) */}
      {activeLayerMode === "ndvi" && (
        <div className="absolute top-16 right-16 z-20 pointer-events-auto animate-in fade-in duration-200">
          <div className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-stone-200/90 flex flex-col gap-1 w-52">
            <div className="flex items-center justify-between text-[10px] font-medium text-stone-800 uppercase tracking-wider">
              <span>Skala NDVI Vegetasi</span>
              <span className="text-emerald-700 font-medium">{currentMeta.ndvi}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#991B1B] via-[#F59E0B] via-[#A3E635] via-[#16A34A] to-[#14532D]" />
            <div className="flex justify-between text-[9px] font-medium text-stone-500">
              <span>0,0 Kering</span>
              <span>0,5 Subur</span>
              <span>1,0 Rimbun</span>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SIDE FLOATING CONTROLS: Zoom & Location */}
      <div className="absolute right-3.5 top-16 z-20 flex flex-col gap-2 items-center pointer-events-auto">
        <button
          type="button"
          onClick={handleResetView}
          className="w-9 h-9 rounded-full bg-white/95 hover:bg-white text-stone-800 shadow-md backdrop-blur-md border border-stone-200 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
          title="Fokus Lokasi"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-800" />
        </button>

        <div className="flex flex-col rounded-full bg-white/95 backdrop-blur-md shadow-md overflow-hidden border border-stone-200">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-8 flex items-center justify-center text-stone-800 hover:bg-stone-100 transition-colors border-b border-stone-200/60 cursor-pointer"
            title="Perbesar"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-8 flex items-center justify-center text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Perkecil"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BOTTOM FLOATING INSPECTOR: AgriWatch & WaterCast Intelligence Hub (Answering Proposal PDF) */}
      {showInspector && selectedPlot && (
        <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-30 pointer-events-auto animate-in slide-in-from-bottom-2 duration-300 max-h-[75%] flex flex-col">
          <div className="rounded-2xl bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-xl border border-stone-200/90 flex flex-col gap-2.5 sm:gap-3 overflow-hidden">
            {/* Row 1: Header + Status + Close */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white border border-stone-200/90 flex items-center justify-center shrink-0 shadow-2xs p-0.5">
                  <Image
                    src="/logo.png"
                    alt="Logo LahanSense"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-medium text-stone-900 tracking-tight truncate">
                      {selectedPlot.name.replace(" (demo)", "")}
                    </h3>
                    <span
                      className={`px-2 py-0.2 sm:px-2.5 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium uppercase tracking-wider shrink-0 ${
                        currentMeta.status === "kritis"
                          ? "bg-rose-100 text-rose-800"
                          : currentMeta.status === "waspada"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {currentMeta.status === "kritis"
                        ? "Kritis"
                        : currentMeta.status === "waspada"
                        ? "Waspada"
                        : "Aman"}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 font-normal truncate">
                    {selectedPlot.crop.toUpperCase()} · {selectedPlot.area_ha.toFixed(2)} ha
                    <span className="hidden sm:inline"> · {currentMeta.growthStage}</span>
                    <span className="sm:hidden font-medium text-blue-700 ml-1.5">
                      · {currentMeta.volumeM3.toFixed(0)} m³
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleLogIrrigation}
                  disabled={irrigationLogged}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    irrigationLogged
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-950 hover:bg-emerald-900 text-white"
                  }`}
                  title="Tandai Sudah Diairi"
                >
                  {irrigationLogged ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tercatat!</span>
                    </>
                  ) : (
                    <>
                      <Droplets className="w-3.5 h-3.5 text-blue-300" />
                      <span className="hidden sm:inline">Sudah Diairi</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/lahan/${selectedPlot.id}`}
                  className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium items-center gap-1.5 transition-colors"
                >
                  <span>Detail</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </Link>

                {/* Mobile Expand / Collapse Toggle Button */}
                <button
                  type="button"
                  onClick={() => setMobileExpanded((v) => !v)}
                  className="sm:hidden p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
                  title={mobileExpanded ? "Sembunyikan Rincian" : "Tampilkan Rincian"}
                  aria-label={mobileExpanded ? "Sembunyikan Rincian" : "Tampilkan Rincian"}
                >
                  {mobileExpanded ? (
                    <ChevronDown className="w-4 h-4 text-stone-600" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-stone-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowInspector(false)}
                  className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
                  title="Tutup Ringkasan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* EXPANDABLE BODY: Row 2, Row 3, Row 4 (Always visible on desktop sm:flex, toggled on mobile) */}
            <div className={`${mobileExpanded ? "flex flex-col gap-2.5 overflow-y-auto max-h-[50vh] pt-1" : "hidden sm:flex sm:flex-col sm:gap-3 pt-1"}`}>
              {/* Row 2: WaterCast Grid (Metode Baku FAO-56 sesuai Section 4.2 PDF) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-stone-200/60">
                <div className="p-2 rounded-xl bg-stone-50/80 border border-stone-200/60 flex flex-col">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-stone-400">
                    Rekomendasi Air
                  </span>
                  <span className="text-base sm:text-lg font-medium text-blue-700 tabular-nums">
                    {currentMeta.volumeM3.toFixed(0)} m³
                  </span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    ≈ {currentMeta.deficitMm.toFixed(1)} mm defisit
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-stone-50/80 border border-stone-200/60 flex flex-col">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-stone-400">
                    Durasi Pompa
                  </span>
                  <span className="text-base sm:text-lg font-medium text-stone-800 tabular-nums">
                    {currentMeta.pumpMinutes} Menit
                  </span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    Debit 8 Liter/detik
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-stone-50/80 border border-stone-200/60 flex flex-col">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-stone-400">
                    AgriWatch NDVI
                  </span>
                  <span className="text-base sm:text-lg font-medium text-emerald-800 tabular-nums">
                    {currentMeta.ndvi.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-normal">
                    Tajuk Sehat (Sentinel-2)
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-stone-50/80 border border-stone-200/60 flex flex-col">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-stone-400">
                    Kebutuhan ETc
                  </span>
                  <span className="text-base sm:text-lg font-medium text-stone-800 tabular-nums">
                    {currentMeta.etc.toFixed(1)} mm
                  </span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    Kc {currentMeta.kc.toFixed(2)} × ET₀ {currentMeta.et0.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Row 3: Ground Truth Kalibrasi Petani (Section 4.2 & 5.6 PDF - No Collision) */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/60">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-stone-600 shrink-0">
                    Kondisi Tanah:
                  </span>
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200/80">
                    {(["kering", "cukup", "basah"] as const).map((feel) => (
                      <button
                        key={feel}
                        type="button"
                        onClick={() => setSoilFeel(feel)}
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-medium capitalize transition-all ${
                          soilFeel === feel
                            ? "bg-white text-stone-900 shadow-2xs"
                            : "text-stone-500 hover:text-stone-900"
                        }`}
                      >
                        {feel}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">Kalibrasi Lapangan</span>
              </div>

              {/* Row 4: Skenario Waktu Simulator (Section 5.5 Poin 4 PDF Proposal) */}
              <div className="pt-2 border-t border-stone-200/60 flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-stone-500 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500">
                    Proyeksi Waktu:
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={7}
                  value={dayOffset}
                  onChange={(e) => setDayOffset(Number(e.target.value))}
                  className="flex-1 accent-emerald-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                />
                <span className="text-[11px] font-medium text-stone-800 tabular-nums shrink-0">
                  {dayOffset === 0 ? "Hari Ini (H-0)" : `+${dayOffset} Hari (H+${dayOffset})`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Pill (When Inspector is closed) */}
      {!showInspector && selectedPlot && (
        <button
          type="button"
          onClick={() => {
            setShowInspector(true);
            setMobileExpanded(false);
          }}
          className="absolute bottom-3 left-3 z-30 pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-stone-200/90 text-xs font-medium text-stone-800 hover:bg-white cursor-pointer hover:scale-105 transition-all"
        >
          <Sprout className="w-4 h-4 text-emerald-700" />
          <span>{selectedPlot.name.replace(" (demo)", "")}</span>
          <span className="text-blue-700 font-medium">{currentMeta.volumeM3.toFixed(0)} m³</span>
          <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
        </button>
      )}
    </div>
  );
}
