"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  User,
  Bell,
  Lock,
  CheckCircle2,
  Gauge,
  Satellite,
  MessageSquare,
} from "lucide-react";

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<"profil" | "pompa" | "notifikasi" | "integrasi">("profil");
  const [name, setName] = useState("Pak Ujang");
  const [location, setLocation] = useState("Karawang, Jawa Barat");
  const [pumpFlow, setPumpFlow] = useState("8");
  const [pumpPower, setPumpPower] = useState("solar");
  const [saved, setSaved] = useState(false);
  const [waEnabled, setWaEnabled] = useState(true);
  const [waTestSent, setWaTestSent] = useState(false);
  const targetWaNumber = "08112222136";

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleTestSendWhatsApp() {
    const message =
      `🚨 *PERINGATAN DINI OTOMATIS LAHANSENSE*\n` +
      `Sistem Otomatisasi EWS Satelit Sentinel-2 & BMKG\n\n` +
      `📍 *Petak Lahan:* Blok A1 - Sawah Utama (Padi Ciherang)\n` +
      `⚠️ *Status Bahaya:* 🔴 KRITIS (Defisit Kumulatif 14.5 mm)\n` +
      `💧 *Kebutuhan Air:* 48.0 m³\n` +
      `🛠️ *TINDAKAN LAPANGAN SEGERA:*\n` +
      `Nyalakan pompa irigasi selama 60 menit debit 8 L/detik untuk membasahi perakaran padi fase vegetatif aktif.\n\n` +
      `⏰ *Batas Waktu:* Hari Ini pukul 17.00 WIB\n\n` +
      `_Notifikasi Otomatis Terkirim ke ${targetWaNumber}_`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/628112222136?text=${encoded}`;
    setWaTestSent(true);
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
    setTimeout(() => setWaTestSent(false), 4000);
  }

  return (
    <AppShell title="Pengaturan & Profil">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-ink-900 tracking-tight">
            Pengaturan Sistem & Profil
          </h1>
          <p className="text-xs sm:text-sm text-ink-400 mt-1 font-medium">
            Konfigurasi profil petani, kalibrasi spesifikasi pompa, dan preferensi notifikasi
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-line-200/80 shadow-xs overflow-x-auto">
          {[
            { id: "profil", label: "Profil Petani", icon: User },
            { id: "pompa", label: "Spesifikasi Pompa", icon: Gauge },
            { id: "notifikasi", label: "Notifikasi", icon: Bell },
            { id: "integrasi", label: "Status Integrasi Data", icon: Satellite },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurr = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-normal whitespace-nowrap transition-all ${
                  isCurr
                    ? "bg-forest-900 text-lime-400 shadow-xs"
                    : "text-ink-600 hover:text-ink-900 hover:bg-surface-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profil */}
        {activeTab === "profil" && (
          <div className="rounded-2xl bg-white p-6 border border-line-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-line-200/80">
              <div className="w-16 h-16 rounded-2xl bg-forest-900 text-lime-400 font-normal flex items-center justify-center text-xl shadow-xs">
                PU
              </div>
              <div>
                <h4 className="font-normal text-lg text-ink-900">{name}</h4>
                <p className="text-xs text-ink-400 font-medium">Manajer Lahan / Petani Utama · {location}</p>
                <span className="inline-block mt-1 text-[10px] font-normal text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Akun Terverifikasi
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Input label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Wilayah Operasional" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Input label="Organisasi / Kelompok Tani" defaultValue="Kelompok Tani Harapan Makmur Karawang" />
            </div>

            {saved && (
              <p className="text-xs text-emerald-600 font-normal flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Pengaturan berhasil disimpan!
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleSave}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Pompa */}
        {activeTab === "pompa" && (
          <div className="rounded-2xl bg-white p-6 border border-line-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="font-normal text-base text-ink-900">Kalibrasi Pompa Irigasi</h3>
              <p className="text-xs text-ink-400 font-medium mt-0.5">
                Nilai debit digunakan oleh rumus FAO-56 untuk mengonversi defisit volume (m³) menjadi durasi menyalakan pompa (menit).
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Debit Aliran Pompa Default (Liter/detik)"
                type="number"
                value={pumpFlow}
                onChange={(e) => setPumpFlow(e.target.value)}
                placeholder="Contoh: 8"
              />

              <div className="space-y-1.5">
                <label className="text-xs font-normal text-ink-900">Sumber Energi Pompa</label>
                <select
                  value={pumpPower}
                  onChange={(e) => setPumpPower(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-line-200 bg-white text-xs font-medium text-ink-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20"
                >
                  <option value="solar">Mesin Diesel / Solar Bersubsidi</option>
                  <option value="pln">Listrik PLN Pertanian</option>
                  <option value="surya">Pompa Tenaga Surya (PLTS)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-50 border border-line-200/60 text-xs text-ink-600">
                <p className="font-normal text-ink-900 mb-0.5">Rumus Konversi Durasi Pompa:</p>
                <p className="font-mono text-[11px] text-primary-700">
                  Durasi (Menit) = (Volume Defisit m³ × 1.000) / (Debit L/dtk × 60)
                </p>
              </div>
            </div>

            {saved && (
              <p className="text-xs text-emerald-600 font-normal flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Kalibrasi pompa berhasil disimpan!
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleSave}>
                Simpan Kalibrasi
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Notifikasi */}
        {activeTab === "notifikasi" && (
          <div className="rounded-2xl bg-white p-6 border border-line-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="font-normal text-base text-ink-900">Preferensi Notifikasi & Peringatan</h3>
              <p className="text-xs text-ink-400 font-medium mt-0.5">
                Tentukan bagaimana dan kapan Anda menerima rekomendasi irigasi harian
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 border border-line-200/70">
                <div>
                  <h4 className="text-xs font-normal text-ink-900">Pemberitahuan Peramban Web (Push)</h4>
                  <p className="text-[11px] text-ink-400 font-medium">
                    Peringatan instan saat terdeteksi cuaca ekstrem atau defisit air tinggi
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-primary-600 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Active WhatsApp Automation Card */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-medium text-ink-900">Peringatan Otomatis WhatsApp</h4>
                      <span className="text-[10px] font-normal bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" /> Aktif 24/7
                      </span>
                      <span className="text-[10px] font-normal text-emerald-900 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                        08112222136
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-600 font-normal leading-relaxed">
                      Peringatan dini defisit air kritis dan prakiraan cuaca ekstrem dikirimkan otomatis langsung ke nomor WhatsApp siaga pengelola lahan (<span className="font-medium text-emerald-950">08112222136</span>) setiap pagi pukul 06.00 WIB atau saat anomali terdeteksi.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={waEnabled}
                    onChange={(e) => setWaEnabled(e.target.checked)}
                    className="accent-primary-600 w-4 h-4 cursor-pointer mt-0.5 shrink-0"
                    title="Aktifkan / nonaktifkan notifikasi WhatsApp otomatis"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 flex-wrap gap-2">
                  <div className="text-[11px] text-emerald-800 font-normal flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Nomor Penerima Siaga: <span className="font-medium">08112222136</span></span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-normal text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Notifikasi berjalan otomatis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Integrasi */}
        {activeTab === "integrasi" && (
          <div className="rounded-2xl bg-white p-6 border border-line-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="font-normal text-base text-ink-900">Status Sumber Data Satelit & Cuaca</h3>
              <p className="text-xs text-ink-400 font-medium mt-0.5">
                LahanSense beroperasi 100% tanpa sensor fisik di lapangan dengan memanfaatkan pipeline reanalisis global
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-50 border border-line-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-normal">
                    🛰️
                  </div>
                  <div>
                    <h4 className="text-xs font-normal text-ink-900">Citra Satelit Sentinel-2 MSI</h4>
                    <p className="text-[11px] text-ink-400 font-medium">
                      Resolusi spasial 10 meter · Band B04 (Merah) & B08 (NIR)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Tersambung (Normal)
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-50 border border-line-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-normal">
                    ☁️
                  </div>
                  <div>
                    <h4 className="text-xs font-normal text-ink-900">Reanalisis Cuaca Open-Meteo FAO-56</h4>
                    <p className="text-[11px] text-ink-400 font-medium">
                      Model ECMWF ERA5 & GFS · Radiasi, angin, kelembapan, suhu
                    </p>
                  </div>
                </div>
                <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Tersambung (Normal)
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-50 border border-line-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-normal">
                    📡
                  </div>
                  <div>
                    <h4 className="text-xs font-normal text-ink-900">BMKG Radar & AWS API</h4>
                    <p className="text-[11px] text-ink-400 font-medium">
                      Validasi curah hujan lokal & peringatan dini cuaca ekstrem
                    </p>
                  </div>
                </div>
                <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Tersambung (Normal)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
