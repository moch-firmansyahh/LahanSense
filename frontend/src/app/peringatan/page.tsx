"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import {
  CloudRain,
  Flame,
  AlertTriangle,
  BellRing,
  ShieldCheck,
  Calendar,
  Send,
  MessageSquare,
  Thermometer,
  Wind,
  Sun,
  Droplets,
  Printer,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface WeatherDay {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  et0: number;
  solarRad: number;
  windKmH: number;
  rhPercent: number;
  rainMm: number;
  rainProb: number;
  riskLevel: "kritis" | "waspada" | "aman";
  riskNote: string;
}

const FORECAST_7_DAYS: WeatherDay[] = [
  {
    day: "Hari Ini",
    date: "08 Nov",
    tempMax: 33.2,
    tempMin: 23.5,
    et0: 4.8,
    solarRad: 21.4,
    windKmH: 12,
    rhPercent: 62,
    rainMm: 0.0,
    rainProb: 10,
    riskLevel: "waspada",
    riskNote: "Terik siang, laju evaporasi tinggi",
  },
  {
    day: "Senin",
    date: "09 Nov",
    tempMax: 34.0,
    tempMin: 24.0,
    et0: 5.2,
    solarRad: 22.8,
    windKmH: 15,
    rhPercent: 58,
    rainMm: 0.0,
    rainProb: 5,
    riskLevel: "kritis",
    riskNote: "Gelombang panas mikro, defisit melonjak",
  },
  {
    day: "Selasa",
    date: "10 Nov",
    tempMax: 34.5,
    tempMin: 24.2,
    et0: 5.4,
    solarRad: 23.1,
    windKmH: 14,
    rhPercent: 55,
    rainMm: 0.0,
    rainProb: 15,
    riskLevel: "kritis",
    riskNote: "Puncak cekaman evaporatif tajuk",
  },
  {
    day: "Rabu",
    date: "11 Nov",
    tempMax: 33.8,
    tempMin: 23.8,
    et0: 4.9,
    solarRad: 20.6,
    windKmH: 11,
    rhPercent: 64,
    rainMm: 1.2,
    rainProb: 35,
    riskLevel: "waspada",
    riskNote: "Gerimis lokal sore hari, tidak mencukupi",
  },
  {
    day: "Kamis",
    date: "12 Nov",
    tempMax: 32.5,
    tempMin: 23.4,
    et0: 4.4,
    solarRad: 18.2,
    windKmH: 9,
    rhPercent: 70,
    rainMm: 2.8,
    rainProb: 45,
    riskLevel: "aman",
    riskNote: "Awan konvektif, defisit tertahan",
  },
  {
    day: "Jumat",
    date: "13 Nov",
    tempMax: 32.0,
    tempMin: 23.0,
    et0: 4.1,
    solarRad: 17.5,
    windKmH: 8,
    rhPercent: 74,
    rainMm: 0.2,
    rainProb: 20,
    riskLevel: "aman",
    riskNote: "Kondisi sejuk, lengas perakaran stabil",
  },
  {
    day: "Sabtu",
    date: "14 Nov",
    tempMax: 33.0,
    tempMin: 23.6,
    et0: 4.6,
    solarRad: 19.8,
    windKmH: 10,
    rhPercent: 66,
    rainMm: 0.0,
    rainProb: 10,
    riskLevel: "waspada",
    riskNote: "Potensi peningkatan suhu menjelang siang",
  },
];

interface AlertProtocol {
  id: number;
  plotId: number;
  plotName: string;
  crop: "padi" | "cabai" | "jagung" | "bawang_merah";
  growthStage: string;
  severity: "kritis" | "waspada";
  hazardTitle: string;
  deficitMm: number;
  volumeM3: number;
  rootRisk: string;
  fieldAction: string;
  targetDeadline: string;
  isResolved?: boolean;
}

const ACTIVE_PROTOCOLS: AlertProtocol[] = [
  {
    id: 1,
    plotId: 1,
    plotName: "Sawah Karawang",
    crop: "padi",
    growthStage: "Hari ke-47 · Fase Primordia Bunting",
    severity: "kritis",
    hazardTitle: "Cekaman Kekeringan Fase Pembungaan (Akumulasi Defisit 3 Hari)",
    deficitMm: 4.2,
    volumeM3: 28.0,
    rootRisk: "Tanah berisiko retak (cracking). Jika air terputus > 48 jam, bunga padi menjadi steril dan bulir hampa.",
    fieldAction: "Buka pintu tersier P3A pukul 05:00 - 08:00 WIB. Lakukan genangan 3-5 cm (Intermittent AWD). Jangan lakukan pemupukan urea saat tanah kering.",
    targetDeadline: "Sebelum Selasa, 10 Nov 2026 (12:00 WIB)",
  },
  {
    id: 2,
    plotId: 4,
    plotName: "Sentra Bawang Brebes",
    crop: "bawang_merah",
    growthStage: "Hari ke-28 · Pembesaran Umbi (Bulbing)",
    severity: "kritis",
    hazardTitle: "Defisit Air 3.8 mm Mengancam Pembentukan Diameter Umbi",
    deficitMm: 3.8,
    volumeM3: 24.8,
    rootRisk: "Perakaran serabut dangkal mengering. Memicu umbi kerdil dan serangan ulat grayak (Spodoptera exigua).",
    fieldAction: "Nyalakan sprinkler irigasi kabut 48 menit pagi hari. Siram ringan tanah sekitar rumpun untuk menjaga kelembapan 60-70%.",
    targetDeadline: "Hari Ini, 08 Nov 2026 (Sore)",
  },
  {
    id: 3,
    plotId: 6,
    plotName: "Lahan Kedelai Grobogan",
    crop: "jagung",
    growthStage: "Hari ke-40 · Fase Pembungaan Silking-Tasseling",
    severity: "waspada",
    hazardTitle: "Peningkatan Gelombang Panas Mikro 34°C & Lonjakan ET₀ 5.8 mm",
    deficitMm: 3.1,
    volumeM3: 35.0,
    rootRisk: "Serbuk sari (pollen) mengering sebelum pembuahan tongkol jagung sempurna.",
    fieldAction: "Alirkan air pada alur antar bedengan (furrow irrigation) selama 40 menit sebelum tengah hari untuk meredam suhu perakaran.",
    targetDeadline: "Senin, 09 Nov 2026",
  },
  {
    id: 4,
    plotId: 2,
    plotName: "Kebun Cabai Lembang",
    crop: "cabai",
    growthStage: "Hari ke-61 · Pembungaan & Bakal Buah",
    severity: "waspada",
    hazardTitle: "Fluktuasi Suhu Ekstrem Siang Terik (32°C) vs Malam Dingin (17°C)",
    deficitMm: 2.2,
    volumeM3: 16.5,
    rootRisk: "Cekaman termal menyebabkan kerontokan kuncup bunga cabai merah.",
    fieldAction: "Jalankan fertirigasi tetes 25 menit saat fajar. Tambahkan mulsa jerami pada bedengan yang terbuka untuk menahan penguapan.",
    targetDeadline: "Selasa, 10 Nov 2026",
  },
];

export default function PeringatanPage() {
  const [protocols, setProtocols] = useState<AlertProtocol[]>(ACTIVE_PROTOCOLS);
  const [filterSeverity, setFilterSeverity] = useState<"semua" | "kritis" | "waspada">("semua");
  const [waPhone, setWaPhone] = useState("08112222136");
  const [sentWaId, setSentWaId] = useState<number | null>(null);

  function handleMarkResolved(id: number) {
    setProtocols((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isResolved: true } : p))
    );
  }

  function handlePrintProtocol() {
    window.print();
  }

  function sendWaAlert(item: AlertProtocol) {
    const message =
      `🚨 *PERINGATAN DINI OTOMATIS LAHANSENSE*\n` +
      `Sistem Otomatisasi EWS Satelit Sentinel-2 & BMKG\n\n` +
      `📍 *Petak Lahan:* ${item.plotName}\n` +
      `🌱 *Komoditas:* ${item.crop.toUpperCase()} (${item.growthStage})\n` +
      `⚠️ *Status Bahaya:* ${item.severity === "kritis" ? "🔴 KRITIS" : "🟡 WASPADA"}\n` +
      `📋 *Peringatan:* ${item.hazardTitle}\n` +
      `💧 *Kebutuhan Air:* ${item.volumeM3} m³ (Defisit ${item.deficitMm} mm)\n\n` +
      `⚡ *Risiko Agronomi:* ${item.rootRisk}\n\n` +
      `🛠️ *TINDAKAN LAPANGAN SEGERA:*\n${item.fieldAction}\n\n` +
      `⏰ *Batas Waktu:* ${item.targetDeadline}\n\n` +
      `_Notifikasi Otomatis Terkirim ke 08112222136_`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = waPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encoded}`;

    setSentWaId(item.id);
    window.open(waUrl, "_blank");
    setTimeout(() => setSentWaId(null), 3000);
  }

  const filtered = protocols.filter((p) =>
    filterSeverity === "semua" ? true : p.severity === filterSeverity
  );

  const criticalCount = protocols.filter((p) => p.severity === "kritis" && !p.isResolved).length;
  const warningCount = protocols.filter((p) => p.severity === "waspada" && !p.isResolved).length;

  return (
    <AppShell title="Pusat Peringatan Dini Agrometeorologi">
      <div className="space-y-6 font-sans">
        {/* OFFICIAL PRINT HEADER (Only visible when printing to PDF / Paper) */}
        <div className="hidden print:block mb-5 pb-3 border-b-2 border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="LahanSense" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-base font-medium tracking-tight text-stone-900 m-0">
                  BERITA ACARA PERINGATAN DINI KEKERINGAN & CEKAMAN AIR
                </h1>
                <p className="text-[11px] text-stone-600 m-0">
                  Sistem Intelijen Irigasi Presisi LahanSense · BMKG Agrometeorologi & Sentinel-2 10m
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-stone-600">
              <p className="font-mono m-0 font-medium text-stone-800">No: EWS-LHS-20261108</p>
              <p className="m-0">Tanggal: 08 November 2026</p>
              <p className="m-0">Penerima Siaga: 08112222136</p>
            </div>
          </div>
        </div>

        {/* OFFICIAL PRINT HEADER (Only visible when printing to PDF / Paper) */}
        <div className="hidden print:block mb-5 pb-3 border-b-2 border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="LahanSense" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-base font-medium tracking-tight text-stone-900 m-0">
                  BERITA ACARA PERINGATAN DINI KEKERINGAN & CEKAMAN AIR
                </h1>
                <p className="text-[11px] text-stone-600 m-0">
                  Sistem Intelijen Irigasi Presisi LahanSense · BMKG Agrometeorologi & Sentinel-2 10m
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-stone-600">
              <p className="font-mono m-0 font-medium text-stone-800">No: EWS-LHS-20261108</p>
              <p className="m-0">Tanggal: 08 November 2026</p>
              <p className="m-0">Penerima Siaga: 08112222136</p>
            </div>
          </div>
        </div>

        {/* Header Terminal Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-200/80 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h1 className="text-lg sm:text-xl font-medium text-stone-800 tracking-tight">
                Pusat Peringatan Dini Agrometeorologi & Cekaman Air
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-normal">
              Deteksi dini defisit hidrologis, anomali suhu tajuk, dan mitigasi kekeringan berbasis FAO-56 & Satelit Sentinel-2
            </p>
          </div>

          {/* Clean Modern Date Indicator (No AI Slop) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs text-xs text-stone-600 font-normal">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-700 font-medium">08 – 14 November 2026</span>
            <span className="text-stone-300">·</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Prakiraan 7 Hari
            </span>
          </div>
        </div>

        {/* 4 Summary Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-3 sm:gap-4 print:gap-2.5 print-break-avoid">
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Bahaya Kritis
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-medium text-rose-700 font-mono">
                {criticalCount}
              </span>
              <span className="text-xs text-stone-500 ml-1.5">Petak Lahan</span>
            </div>
            <p className="text-[11px] font-normal text-rose-600">Tindakan darurat &lt; 24 jam</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Siaga Waspada
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-medium text-amber-700 font-mono">
                {warningCount}
              </span>
              <span className="text-xs text-stone-500 ml-1.5">Petak Lahan</span>
            </div>
            <p className="text-[11px] font-normal text-amber-600">Jadwalkan giliran pompa</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Suhu Maksimum
              </span>
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                <Thermometer className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-medium text-stone-800 font-mono">
                34.5°C
              </span>
              <span className="text-xs text-stone-500 ml-1.5">Rabu, 10 Nov</span>
            </div>
            <p className="text-[11px] font-normal text-stone-500">Gelombang panas terik mikro</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Curah Hujan 7 Hari
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CloudRain className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-medium text-blue-700 font-mono">
                4.2 mm
              </span>
              <span className="text-xs text-stone-500 ml-1.5">Sangat Rendah</span>
            </div>
            <p className="text-[11px] font-normal text-blue-600">Defisit kumulatif tinggi</p>
          </div>
        </div>

        {/* SECTION 1: MATRIKS PRAKIRAAN AGROMETEOROLOGI 7 HARI */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200/60">
            <div>
              <h2 className="text-sm font-medium text-stone-800 tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Matriks Prakiraan Agrometeorologi & Neraca Evaporasi (7 Hari Kedepan)</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 font-normal">
                Model numerik cuaca resolusi tinggi Open-Meteo terkalibrasi elevasi hamparan pertanian
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium text-stone-500">
              Basis Hitung: FAO-56 Penman-Monteith
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/80 text-stone-500 font-medium uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Hari & Tanggal</th>
                  <th className="py-2.5 px-3 text-right">Suhu Max / Min</th>
                  <th className="py-2.5 px-3 text-right">Laju ET₀</th>
                  <th className="py-2.5 px-3 text-right">Radiasi Surya</th>
                  <th className="py-2.5 px-3 text-right">Kecepatan Angin</th>
                  <th className="py-2.5 px-3 text-right">Kelembapan RH</th>
                  <th className="py-2.5 px-3 text-right">Prakiraan Hujan</th>
                  <th className="py-2.5 px-3 text-center">Status Risiko</th>
                  <th className="py-2.5 px-3">Catatan Lapangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {FORECAST_7_DAYS.map((row, i) => (
                  <tr key={i} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-stone-800">{row.day}</span>
                      <span className="text-[10px] text-stone-500 block">{row.date} 2026</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-stone-800">
                      {row.tempMax}° / {row.tempMin}°C
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-blue-700">
                      {row.et0} mm/hari
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                      {row.solarRad} MJ/m²
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                      {row.windKmH} km/jam
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                      {row.rhPercent}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className="font-medium text-stone-800">{row.rainMm} mm</span>
                      <span className="text-[10px] text-stone-400 block font-sans">({row.rainProb}%)</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          row.riskLevel === "kritis"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : row.riskLevel === "waspada"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {row.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 text-[11px]">{row.riskNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: PROTOKOL PERINGATAN DARURAT PER PETAK */}
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-stone-800 tracking-tight">
                Daftar Protokol Tanggap Cekaman Air per Petak
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 font-normal">
                Rekomendasi teknis spesifik komoditas & panduan operasional pintu air kelompok tani
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              {/* Filter */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200/80">
                {(["semua", "kritis", "waspada"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFilterSeverity(lvl)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                      filterSeverity === lvl
                        ? "bg-white text-stone-800 shadow-2xs"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Print Document Button */}
              <Button
                variant="secondary"
                onClick={handlePrintProtocol}
                className="text-xs font-medium"
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Cetak Berita Acara
              </Button>
            </div>
          </div>

          {/* Alert Protocol Cards */}
          <div className="space-y-3">
            {filtered.map((item) => {
              const cropEmoji =
                item.crop === "padi" ? "🌾" : item.crop === "cabai" ? "🌶️" : item.crop === "bawang_merah" ? "🧅" : "🌽";

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all print-break-avoid print:p-3 print:border-stone-300 ${
                    item.isResolved
                      ? "bg-stone-50/70 border-stone-200 opacity-60"
                      : item.severity === "kritis"
                      ? "bg-white border-rose-200 shadow-2xs"
                      : "bg-white border-amber-200 shadow-2xs"
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-3.5">
                    {/* Left: Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base leading-none">{cropEmoji}</span>
                        <h3 className="text-sm font-medium text-stone-800">{item.plotName}</h3>
                        <span className="text-stone-300">·</span>
                        <span className="text-xs text-stone-600 font-medium">{item.growthStage}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                            item.severity === "kritis"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>

                      <h4 className="text-xs font-medium text-stone-700">{item.hazardTitle}</h4>

                      {/* Water Deficit Metric Pill */}
                      <div className="flex items-center gap-2.5 text-xs text-stone-600 py-0.5">
                        <span className="text-blue-700 font-medium">
                          💧 Defisit Air: {item.deficitMm} mm (~{item.volumeM3} m³)
                        </span>
                        <span className="text-stone-300">·</span>
                        <span>
                          Target Aksi: <span className="text-stone-800 font-medium">{item.targetDeadline}</span>
                        </span>
                      </div>

                      {/* Impact Warning */}
                      <div className="p-3 rounded-lg bg-stone-50/80 border border-stone-200/60 text-xs text-stone-600 space-y-1 font-normal">
                        <p>
                          <span className="text-stone-800 font-medium">Ancaman Biofisik: </span>
                          {item.rootRisk}
                        </p>
                        <p className="text-emerald-900 pt-1 border-t border-stone-200/60">
                          <span className="text-emerald-800 font-medium">Protokol Mitigasi Lapangan: </span>
                          {item.fieldAction}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0 self-end md:self-start print:hidden">
                      <button
                        type="button"
                        onClick={() => sendWaAlert(item)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="Kirim notifikasi otomatis ke 08112222136"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{sentWaId === item.id ? "Terkirim ke 08112222136!" : "Kirim Notifikasi WA"}</span>
                      </button>

                      {!item.isResolved && (
                        <button
                          type="button"
                          onClick={() => handleMarkResolved(item.id)}
                          className="px-2.5 py-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
                          <span>Tandai Selesai</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: OTOMATISASI NOTIFIKASI WHATSAPP KE 08112222136 */}
        <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-medium text-xs shadow-2xs shrink-0">
              WA
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-medium text-stone-800">Otomatisasi Peringatan Dini WhatsApp</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Otomatis Aktif
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 font-normal">
                Peringatan dini otomatis diteruskan langsung ke nomor pengelola <b className="text-stone-800 font-medium">08112222136</b> saat defisit air melewati ambang batas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs font-mono font-medium text-stone-700 flex items-center gap-2">
              <span className="text-stone-400 font-normal">Penerima Otomatis:</span>
              <span className="text-emerald-800 font-medium">08112222136</span>
            </div>
            <Button
              variant="primary"
              className="bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-medium cursor-pointer"
              onClick={() => sendWaAlert(ACTIVE_PROTOCOLS[0])}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Uji Notifikasi WA
            </Button>
          </div>
        </div>

        {/* OFFICIAL PRINT SIGNATURE (Only visible when printing to PDF / Paper) */}
        <div className="hidden print:grid print:grid-cols-2 gap-8 mt-8 pt-6 border-t border-stone-300 print-break-avoid">
          <div className="text-center">
            <p className="text-xs text-stone-600 mb-14">Petugas Pengamat Wilayah / P3A</p>
            <p className="text-xs font-medium text-stone-900 border-t border-stone-400 pt-1 inline-block px-10">( ............................................. )</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-600 mb-14">Ketua Kelompok Tani / Petani Utama</p>
            <p className="text-xs font-medium text-stone-900 border-t border-stone-400 pt-1 inline-block px-10">( ............................................. )</p>
          </div>
        </div>

        {/* OFFICIAL PRINT SIGNATURE (Only visible when printing to PDF / Paper) */}
        <div className="hidden print:grid print:grid-cols-2 gap-8 mt-8 pt-6 border-t border-stone-300 print-break-avoid">
          <div className="text-center">
            <p className="text-xs text-stone-600 mb-14">Petugas Pengamat Wilayah / P3A</p>
            <p className="text-xs font-medium text-stone-900 border-t border-stone-400 pt-1 inline-block px-10">( ............................................. )</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-600 mb-14">Ketua Kelompok Tani / Petani Utama</p>
            <p className="text-xs font-medium text-stone-900 border-t border-stone-400 pt-1 inline-block px-10">( ............................................. )</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
