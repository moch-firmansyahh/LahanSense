"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ForecastDay } from "@/types/api";

export default function ForecastChart({ data }: { data: ForecastDay[] }) {
  const rows = data.map((d) => ({ ...d, label: d.date.slice(5) }));
  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="mb-2 font-medium">Defisit & hujan 7 hari</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={11} />
            <YAxis fontSize={11} unit=" mm" />
            <Tooltip />
            <Legend />
            <Bar dataKey="deficit_mm" name="Defisit" fill="#ef4444" />
            <Bar dataKey="rain_mm" name="Hujan" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

