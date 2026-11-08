"use client";

import { useState } from "react";
import type { Crop, Method } from "@/types/api";

interface Props {
  areaHa: number;
  submitting: boolean;
  onSubmit: (v: { name: string; crop: Crop; planting_date: string; irrigation_method: Method }) => void;
  onCancel: () => void;
}

export default function PlotForm({ areaHa, submitting, onSubmit, onCancel }: Props) {
  const [name, setName] = useState("");
  const [crop, setCrop] = useState<Crop>("padi");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<Method>("genangan");

  const field = "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-600">
        Luas terdeteksi: <b>{areaHa.toFixed(2)} ha</b>
      </p>
      <label className="block text-sm">
        Nama lahan
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sawah Pak Ujang" />
      </label>
      <label className="block text-sm">
        Komoditas
        <select className={field} value={crop} onChange={(e) => setCrop(e.target.value as Crop)}>
          <option value="padi">Padi</option>
          <option value="jagung">Jagung</option>
          <option value="cabai">Cabai</option>
          <option value="bawang_merah">Bawang merah</option>
        </select>
      </label>
      <label className="block text-sm">
        Tanggal tanam
        <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className="block text-sm">
        Metode irigasi
        <select className={field} value={method} onChange={(e) => setMethod(e.target.value as Method)}>
          <option value="genangan">Genangan</option>
          <option value="alur">Alur</option>
          <option value="tetes">Tetes</option>
          <option value="pompa">Pompa</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button
          disabled={!name.trim() || submitting}
          onClick={() => onSubmit({ name: name.trim(), crop, planting_date: date, irrigation_method: method })}
          className="flex-1 rounded bg-green-600 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Simpan lahan"}
        </button>
        <button onClick={onCancel} className="rounded border px-3 py-2 text-sm">
          Batal
        </button>
      </div>
    </div>
  );
}

