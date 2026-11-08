"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Droplets } from "lucide-react";
import { formatDateIndo } from "@/lib/format";

interface DemoSliderProps {
  currentDayOffset: number;
  onChangeOffset: (offset: number) => void;
  rainDays?: number[]; // indices where rain occurs
}

export default function DemoSlider({
  currentDayOffset,
  onChangeOffset,
  rainDays = [3, 4],
}: DemoSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onChangeOffset((currentDayOffset + 1 > 7 ? -7 : currentDayOffset + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying, currentDayOffset, onChangeOffset]);

  // Keyboard shortcut listener: Left/Right arrows
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        onChangeOffset(Math.max(-7, currentDayOffset - 1));
      } else if (e.key === "ArrowRight") {
        onChangeOffset(Math.min(7, currentDayOffset + 1));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentDayOffset, onChangeOffset]);

  const baseDate = new Date("2026-11-08T00:00:00Z");
  const targetDate = new Date(baseDate.getTime() + currentDayOffset * 86400000);

  return (
    <div className="w-full max-w-[540px] glass-pill px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-float border border-white/60 flex items-center gap-2 sm:gap-3 select-none">
      {/* Play / Pause Toggle */}
      <button
        type="button"
        onClick={() => setIsPlaying((p) => !p)}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-forest-900 text-lime-400 flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-xs"
        title={isPlaying ? "Jeda Simulasi" : "Putar Simulasi Hari"}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-lime-400" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-lime-400 ml-0.5" />}
      </button>

      {/* Reset button */}
      <button
        type="button"
        onClick={() => {
          setIsPlaying(false);
          onChangeOffset(0);
        }}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-50 text-ink-600 hover:text-ink-900 flex items-center justify-center shrink-0 border border-line-200"
        title="Kembali ke Hari Ini"
      >
        <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>

      {/* Slider Track */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-normal text-ink-600 mb-1">
          <span className="text-primary-700 font-normal flex items-center gap-1 truncate">
            {currentDayOffset === 0
              ? "Hari Ini"
              : currentDayOffset > 0
              ? `+${currentDayOffset} Hari (${formatDateIndo(targetDate)})`
              : `${currentDayOffset} Hari (${formatDateIndo(targetDate)})`}
          </span>
          <span className="text-ink-400 font-normal hidden md:inline shrink-0">Tombol ← / →</span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={-7}
            max={7}
            step={1}
            value={currentDayOffset}
            onChange={(e) => {
              setIsPlaying(false);
              onChangeOffset(Number(e.target.value));
            }}
            className="w-full h-2 bg-line-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />

          {/* Rain icons on rain days */}
          {rainDays.map((r) => (
            <div
              key={r}
              className="absolute pointer-events-none -top-3.5"
              style={{ left: `${((r + 7) / 14) * 94}%` }}
              title="Prakiraan Hujan"
            >
              <Droplets className="w-3 h-3 text-water-600 fill-water-600 animate-bounce" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

