"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";
import { Box, Layers, Droplets } from "lucide-react";
import type { Plot } from "@/types/api";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full min-h-[440px]" />,
});

interface Diorama3DViewProps {
  plots: Plot[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function Diorama3DView({
  plots,
  selectedId,
  onSelect,
}: Diorama3DViewProps) {
  const [viewMode, setViewMode] = useState<"diorama" | "satellite">("diorama");
  const selectedPlot = plots.find((p) => p.id === selectedId) || plots[0];

  return (
    <div className="h-[380px] sm:h-[440px] lg:h-[480px] w-full rounded-2xl overflow-hidden relative shadow-xs bg-[#F4F7F4] border border-line-200 select-none flex items-center justify-center">
      {/* View Switcher Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-white border border-line-200 shadow-xs">
        <button
          type="button"
          onClick={() => setViewMode("diorama")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-normal transition-all ${
            viewMode === "diorama"
              ? "bg-forest-900 text-lime-400 shadow-xs"
              : "text-ink-600 hover:text-ink-900"
          }`}
          aria-label="Tampilan Isometrik 3D"
        >
          <Box className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Isometrik 3D</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("satellite")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-normal transition-all ${
            viewMode === "satellite"
              ? "bg-forest-900 text-lime-400 shadow-xs"
              : "text-ink-600 hover:text-ink-900"
          }`}
          aria-label="Citra Satelit Sentinel-2"
        >
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Citra Satelit</span>
        </button>
      </div>

      {/* Mode 1: 3D Isometric Agricultural Plot View */}
      {viewMode === "diorama" ? (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-6">
          {/* Central Isometric Farmland Illustration */}
          <div className="relative w-[340px] sm:w-[420px] lg:w-[460px] h-[300px] sm:h-[340px] flex items-center justify-center animate-in fade-in duration-300">
            <svg
              viewBox="0 0 500 400"
              className="w-full h-full drop-shadow-[0_20px_30px_rgba(15,45,25,0.18)]"
              aria-label="Ilustrasi isometrik blok lahan dan perakaran"
            >
              <defs>
                {/* Grass Surface Gradient */}
                <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="35%" stopColor="#22C55E" />
                  <stop offset="80%" stopColor="#15803D" />
                  <stop offset="100%" stopColor="#166534" />
                </linearGradient>

                {/* Soil Left Face (Organic topsoil to bedrock) */}
                <linearGradient id="soilLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6E4423" />
                  <stop offset="45%" stopColor="#4A2D16" />
                  <stop offset="100%" stopColor="#301C0D" />
                </linearGradient>

                {/* Soil Right Face (Shaded depth) */}
                <linearGradient id="soilRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A2D16" />
                  <stop offset="55%" stopColor="#301C0D" />
                  <stop offset="100%" stopColor="#1F1107" />
                </linearGradient>
              </defs>

              {/* 3D Isometric Soil Base Block */}
              {/* Left face */}
              <polygon
                points="100,200 250,285 250,335 100,250"
                fill="url(#soilLeft)"
              />
              {/* Right face */}
              <polygon
                points="250,285 400,200 400,250 250,335"
                fill="url(#soilRight)"
              />
              {/* Top Isometric Farmland Surface */}
              <polygon
                points="250,115 400,200 250,285 100,200"
                fill="url(#grassGrad)"
              />

              {/* Soil Strata Texture Lines */}
              <path
                d="M 100,225 Q 175,260 250,310"
                stroke="#301C0D"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
              />
              <path
                d="M 250,310 Q 325,260 400,225"
                stroke="#1F1107"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
              />

              {/* Crop Rows on Top Face */}
              <g opacity="0.65" stroke="#14532D" strokeWidth="2.5">
                <line x1="160" y1="185" x2="310" y2="270" />
                <line x1="180" y1="175" x2="330" y2="260" />
                <line x1="200" y1="165" x2="350" y2="250" />
                <line x1="220" y1="155" x2="370" y2="240" />
              </g>

              {/* Stylized Foliage / Crop Tuft Canopies */}
              <circle cx="210" cy="140" r="16" fill="#15803D" />
              <circle cx="205" cy="135" r="13" fill="#22C55E" />
              <circle cx="235" cy="130" r="20" fill="#14532D" />
              <circle cx="230" cy="125" r="16" fill="#16A34A" />
              <circle cx="265" cy="125" r="24" fill="#166534" />
              <circle cx="260" cy="120" r="19" fill="#22C55E" />
              <circle cx="295" cy="135" r="18" fill="#15803D" />
              <circle cx="290" cy="130" r="14" fill="#4ADE80" />
              <circle cx="320" cy="145" r="15" fill="#14532D" />
              <circle cx="315" cy="140" r="12" fill="#22C55E" />

              {/* Front Border Canopy */}
              <circle cx="130" cy="195" r="12" fill="#15803D" />
              <circle cx="125" cy="190" r="9" fill="#4ADE80" />
              <circle cx="370" cy="195" r="14" fill="#14532D" />
              <circle cx="365" cy="190" r="10" fill="#22C55E" />

              {/* Wireframe Bounding Box for Selected Parcel */}
              <g>
                <polygon
                  points="250,150 340,200 250,250 160,200"
                  fill="rgba(163, 230, 53, 0.15)"
                  stroke="#A3E635"
                  strokeWidth="2.5"
                />
                <line x1="160" y1="200" x2="160" y2="160" stroke="#A3E635" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="340" y1="200" x2="340" y2="160" stroke="#A3E635" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="250" y1="250" x2="250" y2="210" stroke="#A3E635" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="250" y1="150" x2="250" y2="110" stroke="#A3E635" strokeWidth="2" strokeDasharray="3 3" />

                <polygon
                  points="250,110 340,160 250,210 160,160"
                  fill="none"
                  stroke="#A3E635"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </g>

              {/* Central Parcel Marker */}
              <circle cx="250" cy="200" r="5" fill="#A3E635" />
              <circle cx="250" cy="200" r="9" fill="none" stroke="#A3E635" strokeWidth="1.5" opacity="0.8" />
            </svg>

            {/* Label for Selected Parcel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1 px-3 py-1.5 rounded-xl bg-forest-900/95 border border-white/20 text-white text-[11px] font-normal flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-lime-400" aria-hidden="true" />
              <span>Petak Aktif: {selectedPlot.name}</span>
            </div>
          </div>

          {/* Bottom Left Satellite Moisture Overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 border border-line-200 px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-normal text-ink-600 block uppercase">Estimasi Neraca Air</span>
              <span className="text-xs font-normal text-ink-900">Kelembapan 68% (Kapasitas Lapang Aman)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Live MapLibre Satellite View */
        <div className="w-full h-full">
          <MapView
            plots={plots}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  );
}
