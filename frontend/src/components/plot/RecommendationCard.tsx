import type { Recommendation, Status } from "@/types/api";

const COLOR: Record<Status, string> = {
  aman: "bg-green-100 text-green-800",
  waspada: "bg-yellow-100 text-yellow-800",
  kritis: "bg-red-100 text-red-800",
};

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Rekomendasi hari ini</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${COLOR[rec.status]}`}>
          {rec.status}
        </span>
      </div>

      {rec.irrigation_volume_m3 > 0 ? (
        <p className="text-sm">
          Berikan <b>{rec.irrigation_volume_m3} m³</b> ({rec.deficit_mm} mm defisit)
          {rec.pump_minutes ? <> | pompa sekitar <b>{rec.pump_minutes} menit</b> pada 8 L/detik</> : null}.
        </p>
      ) : (
        <p className="text-sm">Tidak perlu irigasi hari ini.</p>
      )}

      <dl className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded bg-gray-50 p-2"><dt className="text-gray-500">ET₀</dt><dd className="font-medium">{rec.et0_mm} mm</dd></div>
        <div className="rounded bg-gray-50 p-2"><dt className="text-gray-500">Kc</dt><dd className="font-medium">{rec.kc}</dd></div>
        <div className="rounded bg-gray-50 p-2"><dt className="text-gray-500">Hujan efektif</dt><dd className="font-medium">{rec.effective_rain_mm} mm</dd></div>
      </dl>

      <p className="text-xs text-gray-500">{rec.reason}</p>
      <p className="text-xs text-gray-500">
        Tingkat keyakinan: <b>{rec.confidence}</b>
        {rec.confidence === "rendah" && " (belum memakai data NDVI)"}
      </p>
    </div>
  );
}

