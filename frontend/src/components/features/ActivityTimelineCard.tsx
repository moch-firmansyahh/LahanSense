"use client";

import React, { useState } from "react";
import { Droplets, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ActivityTimelineCardProps {
  onScheduleClick?: () => void;
}

export default function ActivityTimelineCard({
  onScheduleClick,
}: ActivityTimelineCardProps) {
  const [selectedDay, setSelectedDay] = useState<string>("KAM");
  const [confirmedSchedule, setConfirmedSchedule] = useState(false);

  const days = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

  function handleSchedule() {
    setConfirmedSchedule(true);
    if (onScheduleClick) onScheduleClick();
    setTimeout(() => setConfirmedSchedule(false), 2500);
  }

  return (
    <div className="rounded-2xl bg-[#EEF7EF] border border-[#D5E7D8] p-6 shadow-xs flex flex-col justify-between select-none">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-normal tracking-tight text-ink-900">Jadwal & Riwayat Pengairan</h3>
          <span className="text-[11px] font-normal text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
            Rotasi Mingguan
          </span>
        </div>
        <p className="text-xs text-ink-600 font-medium mb-4">
          Waktu operasional pompa dan pemantauan rotasi air petak
        </p>

        <div className="flex items-center justify-between gap-1 p-1 bg-white/80 rounded-xl border border-line-200/70 mb-5">
          {days.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-normal transition-all ${
                  isSelected
                    ? "bg-forest-900 text-lime-400 shadow-xs"
                    : "text-ink-600 hover:text-ink-900 hover:bg-white"
                }`}
                aria-label={`Pilih hari ${day}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="relative py-3 px-4 rounded-xl bg-white border border-line-200/80 shadow-2xs mb-4 overflow-hidden">
          <div className="flex justify-between text-[10px] font-normal text-ink-400 border-b border-line-200/60 pb-2 mb-3">
            <span>06:00</span>
            <span>07:00</span>
            <span>08:00</span>
            <span>09:00</span>
            <span>10:00</span>
          </div>

          <div className="relative h-14 w-full bg-surface-50 rounded-lg flex items-center px-3 border border-dashed border-emerald-300">
            <div
              className="absolute left-[12%] sm:left-[14%] w-36 h-11 bg-white rounded-lg shadow-xs border border-emerald-300 flex items-center gap-2 px-2.5 animate-in fade-in"
              title="Slot Pengairan Otomatis"
            >
              <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-normal text-ink-900 block truncate">Pengairan Aktif</span>
                <span className="text-[9px] font-medium text-emerald-700 block truncate">
                  06.30 : 07.25 WIB
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-line-200/70 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" aria-hidden="true" />
              <div>
                <h4 className="text-xs font-normal text-ink-900">Penyesuaian Jadwal Irigasi</h4>
                <p className="text-[11px] text-ink-600 font-medium">06.30 : 07.25 WIB (Sawah Karawang)</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSchedule}
              className="text-[11px] h-7 px-2.5 font-normal text-emerald-800 border-emerald-200 hover:bg-emerald-50"
            >
              Jadwalkan
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-line-200/70 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" aria-hidden="true" />
              <div>
                <h4 className="text-xs font-normal text-ink-900">Pemberian Nutrisi Pupuk</h4>
                <p className="text-[11px] text-ink-600 font-medium">16.00 : 17.00 WIB (Kebun Cabai)</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSchedule}
              className="text-[11px] h-7 px-2.5 font-normal text-ink-700 border-line-200 hover:bg-surface-50"
            >
              Jadwalkan
            </Button>
          </div>
        </div>
      </div>

      {confirmedSchedule && (
        <div className="mt-4 p-2.5 bg-emerald-100/80 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-normal flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Pengingat kalender berhasil disinkronkan!</span>
        </div>
      )}
    </div>
  );
}
