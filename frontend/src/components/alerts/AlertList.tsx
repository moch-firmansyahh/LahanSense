import type { HazardAlert } from "@/types/api";

const BORDER = {
  info: "border-water-600/30 bg-water-50 text-water-600",
  waspada: "border-warn-500/30 bg-warn-50 text-amber-800",
  kritis: "border-danger-600/30 bg-danger-50 text-danger-600",
} as const;

export default function AlertList({ alerts }: { alerts: HazardAlert[] }) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-normal text-ink-900">Peringatan Dini 7 Hari</h3>
      {alerts.length === 0 && (
        <p className="rounded-card border border-line-200 bg-white p-4 text-xs text-ink-600 shadow-2xs">
          Tidak ada risiko ekstrem terdeteksi dalam 7 hari ke depan.
        </p>
      )}
      {alerts.map((a, i) => (
        <div key={i} className={`rounded-card border p-3.5 text-xs ${BORDER[a.severity]} shadow-2xs`}>
          <p className="font-normal text-ink-900">{a.message}</p>
          <p className="mt-1 text-ink-600 font-medium">Saran tindakan: {a.suggested_action}</p>
        </div>
      ))}
    </div>
  );
}

