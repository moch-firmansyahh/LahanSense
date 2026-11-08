import type { HazardAlert } from "@/types/api";

const BORDER = {
  info: "border-blue-300 bg-blue-50",
  waspada: "border-yellow-300 bg-yellow-50",
  kritis: "border-red-300 bg-red-50",
} as const;

export default function AlertList({ alerts }: { alerts: HazardAlert[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Peringatan dini 7 hari</h3>
      {alerts.length === 0 && (
        <p className="rounded border bg-white p-3 text-sm text-gray-600">Tidak ada risiko terdeteksi.</p>
      )}
      {alerts.map((a, i) => (
        <div key={i} className={`rounded border p-3 text-sm ${BORDER[a.severity]}`}>
          <p className="font-medium">{a.message}</p>
          <p className="mt-1 text-xs text-gray-700">Saran: {a.suggested_action}</p>
        </div>
      ))}
    </div>
  );
}

