/**
 * Format utility sesuai aturan DESIGN.md (Bahasa Indonesia)
 * Koma desimal ('2,8'), titik ribuan ('1.200')
 */

export function formatNumber(value: number, minFraction = 0, maxFraction = 2): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
  }).format(value);
}

export function formatVolume(m3: number): string {
  return `${formatNumber(m3, 0, 1)} m³`;
}

export function formatDeficit(mm: number): string {
  return `${formatNumber(mm, 1, 1)} mm`;
}

export function formatArea(ha: number): string {
  return `${formatNumber(ha, 1, 2)} ha`;
}

export function formatDateIndo(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDayInitial(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  return days[d.getDay()] || "Sen";
}

