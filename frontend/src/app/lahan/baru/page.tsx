"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SegmentedChips from "@/components/ui/SegmentedChips";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { CROPS, METHODS } from "@/lib/constants";
import {
  MapPin,
  Pentagon,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { Crop, Method, Plot, PlotCreate } from "@/types/api";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full min-h-[500px]" />,
});

export default function LahanBaruPage() {
  const router = useRouter();

  // Wizard Step: 1 = Lokasi, 2 = Gambar, 3 = Detail Tanaman
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchLoc, setSearchLoc] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Form State
  const [draftGeom, setDraftGeom] = useState<GeoJSON.Polygon | null>(null);
  const [areaHa, setAreaHa] = useState<number>(0);
  const [name, setName] = useState("");
  const [crop, setCrop] = useState<Crop>("padi");
  const [plantingDate, setPlantingDate] = useState("2026-11-08");
  const [method, setMethod] = useState<Method>("genangan");
  const [pumpFlow, setPumpFlow] = useState<string>("8");

  // Submission & Progress animation
  const [submitting, setSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);

  function handleDrawn(geometry: GeoJSON.Polygon, calculatedHa: number) {
    setDraftGeom(geometry);
    setAreaHa(calculatedHa);
    setDrawing(false);
    setStep(3); // Proceed to step 3 once polygon is drawn
  }

  async function handleSaveAndAnalyze() {
    if (!draftGeom || !name.trim()) return;

    setSubmitting(true);
    setProgressStep(1);

    try {
      // Step 1: Sentinel-2 query simulation
      await new Promise((r) => setTimeout(r, 600));
      setProgressStep(2);

      // Step 2: Weather & API
      await new Promise((r) => setTimeout(r, 600));
      setProgressStep(3);

      const payload: PlotCreate = {
        name: name.trim(),
        crop,
        planting_date: plantingDate,
        irrigation_method: method,
        geometry: draftGeom,
      };

      const created = await api<Plot>("/plots", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      await new Promise((r) => setTimeout(r, 400));
      router.push(`/lahan/${created.id}`);
    } catch {
      // Offline fallback: redirect to dashboard
      await new Promise((r) => setTimeout(r, 800));
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Gambar Lahan Baru">
      <div className="relative h-full flex flex-col lg:flex-row gap-5">
        {/* Map Canvas */}
        <div className="flex-1 min-h-[420px] sm:min-h-[480px] lg:min-h-[640px] xl:min-h-[720px] rounded-card overflow-hidden relative shadow-card border border-line-200">
          <MapView
            plots={[]}
            selectedId={null}
            drawing={drawing}
            resetKey={resetKey}
            onSelect={() => {}}
            onDrawn={handleDrawn}
          />

          {/* Floating Drawing Instructions & Toolbar overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 glass-pill px-4 py-2 rounded-full shadow-float text-xs font-medium text-ink-900">
            <Pentagon className="w-4 h-4 text-primary-600" />
            <span>
              {drawing
                ? "Ketuk titik sudut petak. Ketuk titik awal untuk selesai."
                : "Tekan tombol 'Mulai Gambar' di panel kanan."}
            </span>
          </div>

          {/* Quick Clear / Undo Toolbar */}
          {draftGeom && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 glass-pill p-1.5 rounded-full shadow-md">
              <button
                type="button"
                onClick={() => {
                  setDraftGeom(null);
                  setAreaHa(0);
                  setResetKey((k) => k + 1);
                  setDrawing(true);
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-danger-600 hover:bg-danger-50 rounded-full"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Gambar Ulang</span>
              </button>
            </div>
          )}
        </div>

        {/* Wizard Form Panel (400px Desktop) */}
        <div className="w-full lg:w-[400px] shrink-0 rounded-card bg-white p-5 md:p-6 border border-line-200 shadow-card flex flex-col justify-between">
          <div>
            {/* Stepper Header (3 Steps) */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-line-200">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-normal flex items-center justify-center ${
                    step >= 1 ? "bg-forest-900 text-lime-400" : "bg-line-200 text-ink-400"
                  }`}
                >
                  1
                </span>
                <span className="text-xs font-medium text-ink-900">Cari Lokasi</span>
              </div>
              <div className="w-6 h-[2px] bg-line-200" />
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-normal flex items-center justify-center ${
                    step >= 2 ? "bg-forest-900 text-lime-400" : "bg-line-200 text-ink-400"
                  }`}
                >
                  2
                </span>
                <span className="text-xs font-medium text-ink-900">Batas Petak</span>
              </div>
              <div className="w-6 h-[2px] bg-line-200" />
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-normal flex items-center justify-center ${
                    step === 3 ? "bg-forest-900 text-lime-400" : "bg-line-200 text-ink-400"
                  }`}
                >
                  3
                </span>
                <span className="text-xs font-medium text-ink-900">Detail</span>
              </div>
            </div>

            {/* Step 1: Cari Lokasi */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-normal text-ink-900">1. Tentukan Lokasi Lahan</h2>
                <p className="text-xs text-ink-600">
                  Cari nama desa, kecamatan, atau gunakan titik GPS perangkat Anda.
                </p>

                <Input
                  label="Cari Daerah / Desa"
                  placeholder="Contoh: Telukjambe, Karawang"
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                />

                <Button
                  variant="secondary"
                  className="w-full"
                  icon={<MapPin className="w-4 h-4 text-primary-600" />}
                  onClick={() => {
                    setStep(2);
                    setDrawing(true);
                  }}
                >
                  Gunakan Lokasi Saat Ini (GPS)
                </Button>
              </div>
            )}

            {/* Step 2: Gambar Batas Petak */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-normal text-ink-900">2. Gambar Batas Petak</h2>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Gunakan kursor atau sentuhan layar untuk mengetuk tiap sudut lahan di peta.
                  Hubungkan kembali ke titik pertama untuk mengunci poligon.
                </p>

                <div className="p-4 rounded-input bg-surface-50 border border-line-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-ink-900">
                    <span>Luas Terdeteksi:</span>
                    <span className="text-sm font-normal text-primary-700">
                      {areaHa > 0 ? `${areaHa.toFixed(2)} ha` : "Menunggu gambar..."}
                    </span>
                  </div>
                  {areaHa > 0 && areaHa < 0.1 && (
                    <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-warn-50 p-2 rounded-sm border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Petak sangat kecil (&lt; 0,1 ha). Resolusi satelit 10m mungkin kurang akurat.</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setDrawing(true)}
                  icon={<Pentagon className="w-4 h-4" />}
                >
                  {drawing ? "Mode Menggambar Aktif..." : "Mulai Gambar Batas"}
                </Button>
              </div>
            )}

            {/* Step 3: Detail Tanaman */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-normal text-ink-900">3. Detail & Tanaman</h2>

                <div className="p-2.5 rounded-input bg-primary-50 text-[#166534] text-xs font-medium flex items-center justify-between">
                  <span>Luas Terpilih:</span>
                  <span className="font-normal text-sm">{areaHa.toFixed(2)} ha</span>
                </div>

                <Input
                  label="Nama Petak Lahan"
                  placeholder="Misal: Sawah Blok Barat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <SegmentedChips
                  label="Komoditas"
                  value={crop}
                  onChange={(val) => setCrop(val)}
                  options={CROPS.map((c) => ({ value: c.value, label: c.label, icon: c.icon }))}
                />

                <Input
                  label="Tanggal Tanam"
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                />

                <SegmentedChips
                  label="Metode Irigasi"
                  value={method}
                  onChange={(val) => setMethod(val)}
                  options={METHODS.map((m) => ({ value: m.value, label: m.label, hint: m.efficiency }))}
                />

                {method === "pompa" && (
                  <Input
                    label="Debit Pompa (L/detik)"
                    type="number"
                    value={pumpFlow}
                    onChange={(e) => setPumpFlow(e.target.value)}
                    helper="Standar pompa diesel petani: 8 L/detik"
                  />
                )}
              </div>
            )}
          </div>

          {/* Bottom Step Actions */}
          <div className="pt-4 mt-4 border-t border-line-200 flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Kembali
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  if (step === 1) {
                    setStep(2);
                    setDrawing(true);
                  } else if (step === 2 && draftGeom) {
                    setStep(3);
                  }
                }}
                disabled={step === 2 && !draftGeom}
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                className="flex-1"
                disabled={!name.trim() || submitting}
                onClick={handleSaveAndAnalyze}
                loading={submitting}
              >
                {submitting ? "Menganalisis..." : "Simpan & Analisis"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overlay Simulation after submission */}
      {submitting && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-float border border-line-200 space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
              <h3 className="font-normal text-ink-900">Menganalisis Petak Lahan...</h3>
            </div>

            <div className="space-y-2 text-xs font-medium">
              <div className={`flex items-center gap-2 ${progressStep >= 1 ? "text-primary-700" : "text-ink-400"}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mengambil Citra Satelit Sentinel-2</span>
              </div>
              <div className={`flex items-center gap-2 ${progressStep >= 2 ? "text-primary-700" : "text-ink-400"}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Sinkronisasi Data Cuaca Open-Meteo</span>
              </div>
              <div className={`flex items-center gap-2 ${progressStep >= 3 ? "text-primary-700" : "text-ink-400"}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Menghitung Neraca Air FAO-56</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

