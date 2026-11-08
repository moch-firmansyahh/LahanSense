"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import AlertList from "@/components/alerts/AlertList";
import ForecastChart from "@/components/charts/ForecastChart";
import PlotForm from "@/components/plot/PlotForm";
import RecommendationCard from "@/components/plot/RecommendationCard";
import { api } from "@/lib/api";
import type { ForecastDay, HazardAlert, Plot, PlotCreate, Recommendation } from "@/types/api";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function DashboardPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [draft, setDraft] = useState<{ geometry: GeoJSON.Polygon; areaHa: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rec, setRec] = useState<Recommendation | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<HazardAlert[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const loadPlots = useCallback(async () => {
    try {
      setPlots(await api<Plot[]>("/plots"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api<Plot[]>("/plots")
      .then((data) => {
        if (!cancelled) setPlots(data);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        setLoadingAnalytics(true);
        setError(null);
      }
    });
    Promise.all([
      api<Recommendation>(`/plots/${selectedId}/recommendation`),
      api<ForecastDay[]>(`/plots/${selectedId}/forecast`),
      api<HazardAlert[]>(`/plots/${selectedId}/alerts`),
    ])
      .then(([r, f, a]) => {
        if (cancelled) return;
        setRec(r);
        setForecast(f);
        setAlerts(a);
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoadingAnalytics(false));
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleSave(v: Omit<PlotCreate, "geometry">) {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const created = await api<Plot>("/plots", {
        method: "POST",
        body: JSON.stringify({ ...v, geometry: draft.geometry }),
      });
      setDraft(null);
      setDrawing(false);
      setResetKey((k) => k + 1);
      await loadPlots();
      setSelectedId(created.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function cancelDraft() {
    setDraft(null);
    setDrawing(false);
    setResetKey((k) => k + 1);
  }

  async function loadDemo() {
    setError(null);
    try {
      const demo = await api<Plot[]>("/demo/load", { method: "POST" });
      await loadPlots();
      if (demo[0]) setSelectedId(demo[0].id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main className="flex h-screen flex-col md:flex-row">
      <aside className="max-h-[55vh] w-full shrink-0 space-y-4 overflow-y-auto border-b bg-gray-50 p-4 md:max-h-none md:w-[400px] md:border-b-0 md:border-r">
        <header>
          <h1 className="text-xl font-normal text-green-700">LahanSense</h1>
          <p className="text-xs text-gray-500">Intelijen irigasi tanpa sensor</p>
        </header>

        {error && <p className="rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">{error}</p>}

        {!draft && (
          <div className="flex gap-2">
            <button
              onClick={() => setDrawing((d) => !d)}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium text-white ${drawing ? "bg-orange-500" : "bg-green-600"}`}
            >
              {drawing ? "Klik titik sudut, klik ulang titik awal untuk selesai" : "Gambar lahan"}
            </button>
            <button onClick={loadDemo} className="rounded border bg-white px-3 py-2 text-sm">
              Mode demo
            </button>
          </div>
        )}

        {draft && (
          <PlotForm areaHa={draft.areaHa} submitting={saving} onSubmit={handleSave} onCancel={cancelDraft} />
        )}

        {plots.length > 0 && !draft && (
          <div>
            <h3 className="mb-1 text-sm font-medium">Lahan Anda</h3>
            <ul className="space-y-1">
              {plots.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full rounded border px-3 py-2 text-left text-sm ${
                      p.id === selectedId ? "border-green-600 bg-green-50" : "bg-white"
                    }`}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="block text-xs text-gray-500">
                      {p.crop} | {p.area_ha.toFixed(2)} ha
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loadingAnalytics && <p className="text-sm text-gray-500">Menghitung rekomendasi...</p>}
        {!loadingAnalytics && rec && selectedId !== null && !draft && (
          <>
            <RecommendationCard rec={rec} />
            <ForecastChart data={forecast} />
            <AlertList alerts={alerts} />
          </>
        )}
      </aside>

      <section className="min-h-[45vh] flex-1">
        <MapView
          plots={plots}
          selectedId={selectedId}
          drawing={drawing}
          resetKey={resetKey}
          onSelect={setSelectedId}
          onDrawn={(geometry, areaHa) => {
            setDraft({ geometry, areaHa });
            setDrawing(false);
          }}
        />
      </section>
    </main>
  );
}
