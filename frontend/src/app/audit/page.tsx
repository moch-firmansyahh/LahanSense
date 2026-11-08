"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import KpiCard from "@/components/features/KpiCard";
import {
  FileDown,
  TrendingUp,
  Droplets,
  Coins,
  Gauge,
  CheckCircle2,
  Calendar,
  Printer,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const WEEKLY_DATA = [
  { week: "Mgg 1", disarankan: 140, aktual: 155 },
  { week: "Mgg 2", disarankan: 130, aktual: 132 },
  { week: "Mgg 3", disarankan: 160, aktual: 190 },
  { week: "Mgg 4", disarankan: 150, aktual: 165 },
];

const LOG_HISTORY = [
  { date: "07 Nov 2026", plot: "Sawah Karawang", advised: 28, actual: 30, diff: +2, status: "cukup" },
  { date: "06 Nov 2026", plot: "Sawah Organik Subang", advised: 12, actual: 12, diff: 0, status: "efisien" },
  { date: "05 Nov 2026", plot: "Kebun Cabai Lembang", advised: 35, actual: 45, diff: +10, status: "boros" },
  { date: "04 Nov 2026", plot: "Sentra Bawang Merah Nganjuk", advised: 41, actual: 38, diff: -3, status: "efisien" },
  { date: "03 Nov 2026", plot: "Sawah Karawang", advised: 25, actual: 25, diff: 0, status: "efisien" },
  { date: "02 Nov 2026", plot: "Sentra Jagung Malang", advised: 31, actual: 35, diff: +4, status: "cukup" },
  { date: "01 Nov 2026", plot: "Lahan Jagung Gunungkidul", advised: 20, actual: 18, diff: -2, status: "efisien" },
  { date: "30 Okt 2026", plot: "Kebun Tomat Pangalengan", advised: 11, actual: 11, diff: 0, status: "efisien" },
];

export default function AuditPage() {
  const [score] = useState<number>(82); // 82 out of 100
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleDownloadReport() {
    setDownloading(true);
    const headers = ["Tanggal", "Petak Lahan", "Rekomendasi (m3)", "Aktual (m3)", "Selisih (m3)", "Status", "Skor Efisiensi"];
    const rows = LOG_HISTORY.map((r) => [
      `"${r.date}"`,
      `"${r.plot}"`,
      r.advised,
      r.actual,
      r.diff,
      `"${r.status.toUpperCase()}"`,
      r.status === "efisien" ? "98%" : r.status === "cukup" ? "85%" : "62%",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(",")].concat(rows.map((e) => e.join(","))).join("\r\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Audit_Efisiensi_Irigasi_LahanSense_Nov2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 2000);
  }

  function handlePrintReport() {
    window.print();
  }

  return (
    <AppShell title="Audit Efisiensi Air">
      <div className="space-y-6">
        {/* OFFICIAL PRINT HEADER (Only visible when printing to PDF / Paper) */}
        <div className="hidden print:block mb-5 pb-3 border-b-2 border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="LahanSense" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-base font-medium tracking-tight text-stone-900 m-0">
                  BERITA ACARA AUDIT EFISIENSI AIR & PENGHEMATAN BIAYA ENERGI
                </h1>
                <p className="text-[11px] text-stone-600 m-0">
                  Sistem Intelijen Irigasi Presisi LahanSense · Evaluasi Kepatuhan & Realisasi Pompa
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-stone-600">
              <p className="font-mono m-0 font-medium text-stone-800">No: AUD-LHS-20261108</p>
              <p className="m-0">Periode: 01 Okt – 08 Nov 2026</p>
              <p className="m-0">Status: Audit Terverifikasi (Skor 82/100)</p>
            </div>
          </div>
        </div>

        {/* Header Title & Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80 print:hidden">
          <div>
            <h1 className="text-lg sm:text-xl font-medium text-stone-800 tracking-tight">
              Audit Efisiensi Air & Biaya
            </h1>
            <p className="text-xs text-stone-500 mt-0.5 font-normal">
              Evaluasi kepatuhan irigasi satelit, rasio penghematan air tanah, dan efisiensi biaya pompa
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs text-xs text-stone-600 font-normal">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-700 font-medium">Periode: 01 Okt – 08 Nov 2026</span>
            <span className="text-stone-300">·</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Audit Terverifikasi
            </span>
          </div>
        </div>

        {/* 4 Summary Metric Cards (Matches reference UI style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Skor Efisiensi Keseluruhan"
            value="82/100"
            subtext="Kategori: Sangat Efisien"
            subtextColor="text-emerald-600 font-normal"
            icon={<Gauge className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
          />
          <KpiCard
            label="Air Berhasil Dihemat"
            value="142"
            unit="m³"
            subtext="~22% vs konvensional"
            subtextColor="text-blue-600 font-normal"
            icon={<Droplets className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <KpiCard
            label="Penghematan Biaya Pompa"
            value="Rp 480rb"
            subtext="Penghematan solar & listrik"
            subtextColor="text-emerald-600 font-normal"
            icon={<Coins className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
          />
          <KpiCard
            label="Kepatuhan Rekomendasi"
            value="91%"
            subtext="Akurasi pengairan tinggi"
            subtextColor="text-emerald-600 font-normal"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
          />
        </div>

        {/* Middle Section: Score Gauge & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Half-circle gauge card (4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-forest-900 text-white p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden border border-forest-800/60">
            <span className="text-xs font-normal uppercase tracking-wider text-lime-400 mb-2">
              Indeks Kinerja Air Petani
            </span>

            {/* Circular Score Highlight */}
            <div className="relative w-40 h-24 flex items-end justify-center mb-2">
              <div className="text-5xl font-medium tabular-nums tracking-tight text-white">
                {score}
              </div>
              <span className="text-lg font-medium text-lime-400 ml-1">/100</span>
            </div>

            <div className="inline-flex items-center gap-1 text-xs font-medium bg-primary-700/60 text-lime-400 px-3 py-1 rounded-full border border-lime-400/20 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sangat Efisien (+6 poin)</span>
            </div>

            <p className="text-xs text-white/70 mt-3 max-w-xs leading-relaxed font-normal">
              Pengairan terukur berhasil menghemat solar pompa hingga <span className="text-white font-medium">~40 liter</span> dalam sebulan terakhir.
            </p>

            <div className="mt-5 w-full pt-4 border-t border-white/10 flex justify-between text-xs text-white/80">
              <span>Target Musim: <span className="font-medium text-white">85 Poin</span></span>
              <span>Peringkat: <span className="font-medium text-white">Top 5%</span></span>
            </div>
          </div>

          {/* Weekly Comparison Bar Chart (8 Cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-white p-5 sm:p-6 border border-line-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-medium text-stone-800">
                  Perbandingan Volume: Disarankan vs Aktual Mingguan
                </h3>
                <p className="text-xs text-stone-500 font-normal">Satuan meter kubik (m³)</p>
              </div>

              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded bg-forest-900" /> Disarankan (Satelit)
                </span>
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-2.5 h-2.5 rounded bg-water-600" /> Realisasi Pompa
                </span>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#8A988F" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#8A988F" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="disarankan" fill="#14532D" radius={[6, 6, 0, 0]} name="Disarankan" />
                    <Bar dataKey="aktual" fill="#2563EB" radius={[6, 6, 0, 0]} name="Realisasi Aktual" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* History Table & PDF Download Banner */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-line-200/80 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-200/80">
            <div>
              <h3 className="text-sm font-medium text-stone-800">Riwayat Pencatatan Air Terakhir</h3>
              <p className="text-xs text-stone-500 font-normal">
                Log realisasi pengairan yang diinput petani untuk audit efisiensi air
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <Button
                variant="secondary"
                className="text-xs font-medium cursor-pointer"
                icon={<Printer className="w-3.5 h-3.5" />}
                onClick={handlePrintReport}
              >
                Cetak Laporan PDF
              </Button>
              <Button
                variant="primary"
                className="bg-emerald-800 hover:bg-emerald-900 text-white cursor-pointer"
                icon={<FileDown className="w-4 h-4" />}
                onClick={handleDownloadReport}
              >
                {downloading ? "Mengunduh Laporan..." : "Unduh Laporan Audit (CSV)"}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line-200/60 text-ink-400 font-normal uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Petak Lahan</th>
                  <th className="py-2.5 px-3 text-right">Rekomendasi</th>
                  <th className="py-2.5 px-3 text-right">Aktual</th>
                  <th className="py-2.5 px-3 text-right">Selisih</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200/40">
                {LOG_HISTORY.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-ink-600">{row.date}</td>
                    <td className="py-3 px-3 font-normal text-ink-900">{row.plot}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{row.advised} m³</td>
                    <td className="py-3 px-3 text-right tabular-nums font-normal text-water-600">
                      {row.actual} m³
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-normal">
                      {row.diff > 0 ? `+${row.diff} m³` : row.diff === 0 ? "0 m³" : `${row.diff} m³`}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-normal uppercase ${
                          row.status === "efisien"
                            ? "bg-primary-100 text-primary-700"
                            : row.status === "cukup"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-danger-50 text-danger-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OFFICIAL PRINT SIGNATURE (Only visible when printing to PDF / Paper) */}
        <div className="hidden print:grid print:grid-cols-2 gap-8 mt-8 pt-6 border-t border-stone-300 print-break-avoid">
          <div className="text-center">
            <p className="text-xs text-stone-600 mb-14">Auditor Teknis Irigasi / P3A</p>
            <p className="text-xs font-medium text-stone-900 border-t border-stone-400 pt-1 inline-block px-10">( ............................................. )</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-600 mb-14">Petani Utama / Penanggung Jawab Lahan</p>
            <p className="text-xs font-medium text-stone-900 border-t border-stone-400 pt-1 inline-block px-10">( ............................................. )</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
