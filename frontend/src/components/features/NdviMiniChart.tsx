"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Leaf } from "lucide-react";

interface NdviMiniChartProps {
  currentNdvi?: number;
  delta?: number;
}

// 14-day mock trend data based on proposal specifications
const MOCK_DATA = [
  { day: "1", ndvi: 0.52 },
  { day: "2", ndvi: 0.53 },
  { day: "3", ndvi: 0.54 },
  { day: "4", ndvi: 0.53 },
  { day: "5", ndvi: 0.55 },
  { day: "6", ndvi: 0.56 },
  { day: "7", ndvi: 0.58 },
  { day: "8", ndvi: 0.59 },
  { day: "9", ndvi: 0.58 },
  { day: "10", ndvi: 0.60 },
  { day: "11", ndvi: 0.61 },
  { day: "12", ndvi: 0.60 },
  { day: "13", ndvi: 0.61 },
  { day: "14", ndvi: 0.62 },
];

export default function NdviMiniChart({
  currentNdvi = 0.62,
  delta = 0.03,
}: NdviMiniChartProps) {
  return (
    <div className="rounded-card bg-white p-4 md:p-5 border border-line-200 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Leaf className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-normal text-ink-900">Tren NDVI Satelit</h3>
        </div>
        <span className="text-[11px] font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          +{delta.toFixed(2)}
        </span>
      </div>

      <div className="flex items-baseline gap-2 my-1">
        <span className="text-3xl font-normal text-ink-900 tabular-nums">
          {currentNdvi.toFixed(2)}
        </span>
        <span className="text-xs font-medium text-ink-600">
          Tajuk Subur (Sentinel-2)
        </span>
      </div>

      {/* Mini sparkline chart */}
      <div className="h-14 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_DATA}>
            <defs>
              <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="ndvi"
              stroke="#16A34A"
              strokeWidth={2}
              fill="url(#ndviGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

