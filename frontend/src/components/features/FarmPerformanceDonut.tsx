"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface FarmPerformanceDonutProps {
  score?: number;
  utilization?: number;
  health?: number;
  onTrack?: number;
}

export default function FarmPerformanceDonut({
  score = 72,
  utilization = 61,
  health = 36,
  onTrack = 79,
}: FarmPerformanceDonutProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const data = [
    { name: "Pemanfaatan", value: utilization, color: "#2E5C38" },
    { name: "Kesehatan", value: health, color: "#549E63" },
    { name: "Sesuai Jadwal", value: onTrack, color: "#8ECA84" },
  ];

  return (
    <div className="rounded-2xl bg-white p-5 border border-line-200/80 shadow-2xs flex flex-col justify-between select-none">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-normal text-ink-900 tracking-tight">Performa Lahan</h4>
        <span className="text-ink-400 font-normal text-xs tracking-widest cursor-pointer hover:text-ink-900">••</span>
      </div>

      <div className="relative h-44 w-full flex items-center justify-center my-1">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={68}
                paddingAngle={5}
                dataKey="value"
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-28 h-28 rounded-full border-4 border-stone-200 border-t-emerald-600 animate-spin" />
        )}

        {/* Center Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-normal text-ink-400 uppercase tracking-wider">Skor Total</span>
          <span className="text-3xl font-normal text-ink-900 tracking-tight tabular-nums">{score}%</span>
        </div>
      </div>

      {/* Legend with Dots */}
      <div className="flex items-center justify-between text-[11px] font-normal text-ink-600 pt-2 border-t border-line-200/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2E5C38]" />
          <span>Air {utilization}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#549E63]" />
          <span>Tajuk {health}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8ECA84]" />
          <span>Jadwal {onTrack}%</span>
        </div>
      </div>
    </div>
  );
}

