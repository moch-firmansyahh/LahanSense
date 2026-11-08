"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { TerraDraw, TerraDrawPolygonMode, TerraDrawSelectMode } from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import * as turf from "@turf/turf";
import type { Plot } from "@/types/api";

interface Props {
  plots: Plot[];
  selectedId: number | null;
  drawing: boolean;
  resetKey: number; // naikkan nilainya untuk menghapus gambar sementara
  onSelect: (id: number) => void;
  onDrawn: (geometry: GeoJSON.Polygon, areaHa: number) => void;
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

export default function MapView({ plots, selectedId, drawing, resetKey, onSelect, onDrawn }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<TerraDraw | null>(null);
  const [ready, setReady] = useState(false);
  const [satellite, setSatellite] = useState(true);

  // simpan callback di ref agar event handler tidak basi
  const onDrawnRef = useRef(onDrawn);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onDrawnRef.current = onDrawn;
    onSelectRef.current = onSelect;
  }, [onDrawn, onSelect]);

  // inisialisasi peta + Terra Draw
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [107.6098, -6.9147],
      zoom: 11,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }),
      "top-right",
    );
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("plots", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "plots-fill",
        type: "fill",
        source: "plots",
        paint: {
          "fill-color": ["case", ["==", ["get", "selected"], 1], "#16a34a", "#3b82f6"],
          "fill-opacity": 0.35,
        },
      });
      map.addLayer({
        id: "plots-line",
        type: "line",
        source: "plots",
        paint: { "line-color": "#ffffff", "line-width": 2 },
      });
      map.on("click", "plots-fill", (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (id !== undefined) onSelectRef.current(Number(id));
      });
      map.on("mouseenter", "plots-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "plots-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      const draw = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({ map }),
        modes: [new TerraDrawPolygonMode(), new TerraDrawSelectMode()],
      });
      draw.start();
      draw.setMode("select");
      draw.on("finish", (id, context) => {
        if (context.action !== "draw") return;
        const feature = draw.getSnapshot().find((f) => f.id === id);
        if (feature && feature.geometry.type === "Polygon") {
          const areaHa = turf.area(feature as GeoJSON.Feature) / 10_000;
          onDrawnRef.current(feature.geometry as GeoJSON.Polygon, areaHa);
        }
      });
      drawRef.current = draw;
      setReady(true);
    });

    return () => {
      drawRef.current?.stop();
      drawRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // sinkronkan poligon tersimpan ke peta
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const src = map.getSource("plots") as maplibregl.GeoJSONSource | undefined;
    src?.setData({
      type: "FeatureCollection",
      features: plots.map((p) => ({
        type: "Feature",
        properties: { id: p.id, selected: p.id === selectedId ? 1 : 0 },
        geometry: p.geometry,
      })),
    });
  }, [plots, selectedId, ready]);

  // zoom ke poligon terpilih
  useEffect(() => {
    const map = mapRef.current;
    const plot = plots.find((p) => p.id === selectedId);
    if (!ready || !map || !plot) return;
    const [minX, minY, maxX, maxY] = turf.bbox(plot.geometry);
    map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 80, maxZoom: 17, duration: 800 });
  }, [selectedId, ready, plots]);

  // mode gambar
  useEffect(() => {
    if (!ready) return;
    drawRef.current?.setMode(drawing ? "polygon" : "select");
  }, [drawing, ready]);

  // hapus gambar sementara
  useEffect(() => {
    if (ready) drawRef.current?.clear();
  }, [resetKey, ready]);

  // ganti basemap
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setLayoutProperty("esri", "visibility", satellite ? "visible" : "none");
    map.setLayoutProperty("osm", "visibility", satellite ? "none" : "visible");
  }, [satellite, ready]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <button
        onClick={() => setSatellite((s) => !s)}
        className="absolute bottom-6 left-3 rounded bg-white px-3 py-1.5 text-xs font-medium shadow"
      >
        {satellite ? "Peta jalan" : "Satelit"}
      </button>
    </div>
  );
}
