import type { Plot } from "@/types/api";

export interface PlotAgronomy {
  status: "aman" | "waspada" | "kritis";
  deficitMm: number;
  volumeM3: number;
  pumpMinutes: number;
  et0: number;
  kc: number;
  etc: number;
  ndvi: number;
  moisturePercent: number;
  growthStage: string;
  recommendationText: string;
  hst: number;
}

export function computePlotAgronomy(plot?: Partial<Plot> | null): PlotAgronomy {
  const areaHa = Math.max(0.1, plot?.area_ha || 1.0);
  const crop = (plot?.crop || "padi").toLowerCase();

  // Hitung Hari Setelah Tanam (HST)
  let hst = 45;
  if (plot?.planting_date) {
    try {
      const pDate = new Date(plot.planting_date).getTime();
      const now = new Date("2026-11-08").getTime();
      const diff = Math.floor((now - pDate) / (1000 * 3600 * 24));
      if (diff >= 0 && diff <= 160) hst = diff;
    } catch {}
  }

  // Standar ET0 Tropis Dataran Rendah Indonesia (FAO-56 Penman-Monteith)
  const et0 = 4.6;

  let kc = 1.05;
  let growthStage = "";
  let recommendationText = "";
  let ndvi = 0.65;
  let baseDeficitMm = 2.8;

  if (crop === "cabai") {
    if (hst <= 25) {
      kc = 0.60;
      growthStage = `Hari ke-${hst} · Vegetatif & Percabangan`;
      recommendationText = "Pertumbuhan tunas dan cabang sekunder. Irigasi tetes berkala menjaga perakaran tetap lembap.";
      ndvi = 0.45;
      baseDeficitMm = 1.8;
    } else if (hst <= 55) {
      kc = 0.95;
      growthStage = `Hari ke-${hst} · Pembungaan & Bakal Buah`;
      recommendationText = "Fase kritis pembungaan cabai. Irigasi tetes presisi tanpa membasahi tajuk mencegah rontok bunga & antraknosa.";
      ndvi = 0.68;
      baseDeficitMm = 3.2;
    } else if (hst <= 85) {
      kc = 1.05;
      growthStage = `Hari ke-${hst} · Pembesaran Buah & Pematangan`;
      recommendationText = "Kebutuhan air tinggi untuk pembesaran cabai. Pasokan air stabil mencegah buah pecah atau keriput.";
      ndvi = 0.76;
      baseDeficitMm = 3.6;
    } else {
      kc = 0.80;
      growthStage = `Hari ke-${hst} · Pemetikan & Panen Berkala`;
      recommendationText = "Kurangi frekuensi siram 2 hari sebelum panen petik untuk mempertahankan daya simpan buah.";
      ndvi = 0.62;
      baseDeficitMm = 2.2;
    }
  } else if (crop === "bawang_merah") {
    if (hst <= 20) {
      kc = 0.55;
      growthStage = `Hari ke-${hst} · Pertunasan & Daun Awal`;
      recommendationText = "Siraman kabut rutin menjaga kelembapan tanah gembur tanpa mengikis perakaran dangkal.";
      ndvi = 0.38;
      baseDeficitMm = 1.5;
    } else if (hst <= 45) {
      kc = 1.05;
      growthStage = `Hari ke-${hst} · Pembentukan & Pengisian Umbi (Bulbing)`;
      recommendationText = "Fase kritis pembesaran umbi bawang. Defisit air berisiko menyebabkan umbi kerdil.";
      ndvi = 0.60;
      baseDeficitMm = 3.8;
    } else {
      kc = 0.70;
      growthStage = `Hari ke-${hst} · Pematangan & Panen`;
      recommendationText = "Hentikan pengairan 7-10 hari sebelum panen cabut agar kulit umbi mengering sempurna.";
      ndvi = 0.48;
      baseDeficitMm = 1.6;
    }
  } else if (crop === "jagung") {
    if (hst <= 30) {
      kc = 0.45;
      growthStage = `Hari ke-${hst} · Vegetatif Cepat (V6-V10)`;
      recommendationText = "Pertumbuhan vegetatif aktif. Alirkan air antar bedengan sesuai jadwal giliran.";
      ndvi = 0.42;
      baseDeficitMm = 2.0;
    } else if (hst <= 60) {
      kc = 1.20;
      growthStage = `Hari ke-${hst} · Pembungaan (Silking-Tasseling)`;
      recommendationText = "Fase paling peka kekeringan. Pastikan kelembapan optimal agar butir tongkol jagung terisi penuh.";
      ndvi = 0.82;
      baseDeficitMm = 4.4;
    } else {
      kc = 0.85;
      growthStage = `Hari ke-${hst} · Pengisian Biji & Pematangan`;
      recommendationText = "Pengisian biji padat. Kurangi pasokan air bertahap menjelang kelobot jagung mengering cokelat.";
      ndvi = 0.64;
      baseDeficitMm = 2.5;
    }
  } else {
    // Padi (Oryza sativa)
    if (hst <= 25) {
      kc = 1.05;
      growthStage = `Hari ke-${hst} · Vegetatif Awal & Anakan`;
      recommendationText = "Ketinggian air macak-macak 1-2 cm untuk merangsang pertumbuhan anakan produktif.";
      ndvi = 0.48;
      baseDeficitMm = 2.2;
    } else if (hst <= 50) {
      kc = 1.15;
      growthStage = `Hari ke-${hst} · Vegetatif Maksimum`;
      recommendationText = "Metode AWD (Alternate Wetting and Drying): genangi 3 cm lalu biarkan surut untuk aerasi perakaran.";
      ndvi = 0.65;
      baseDeficitMm = 2.8;
    } else if (hst <= 75) {
      kc = 1.20;
      growthStage = `Hari ke-${hst} · Fase Bunting & Pembungaan`;
      recommendationText = "Fase sangat peka kekurangan air! Jaga genangan 3-5 cm agar malai padi tidak hampa.";
      ndvi = 0.80;
      baseDeficitMm = 4.2;
    } else {
      kc = 0.90;
      growthStage = `Hari ke-${hst} · Pengisian Bulir & Pematangan`;
      recommendationText = "Genangan dangkal 2 cm hingga bulir mulai menguning merata, lalu tiriskan jelang panen raya.";
      ndvi = 0.62;
      baseDeficitMm = 2.0;
    }
  }

  const etc = Math.round(et0 * kc * 10) / 10;

  // Efisiensi irigasi berdasarkan metode
  const method = (plot?.irrigation_method || "genangan").toLowerCase();
  const efficiency =
    method === "tetes" ? 0.90 : method === "alur" ? 0.60 : method === "pompa" ? 0.65 : 0.45;

  // Volume m3 = (deficit_mm * 10 * area_ha) / efficiency
  const volumeM3 = Math.max(1, Math.round(((baseDeficitMm * 10 * areaHa) / efficiency) * 10) / 10);

  // Waktu pompa pada debit 8 L/dtk (= 28.8 m3/jam)
  const pumpMinutes = Math.max(15, Math.round((volumeM3 / 28.8) * 60));

  const status: "aman" | "waspada" | "kritis" =
    baseDeficitMm > 3.8 ? "kritis" : baseDeficitMm > 2.4 ? "waspada" : "aman";

  const moisturePercent = status === "kritis" ? 38 : status === "waspada" ? 58 : 78;

  return {
    status,
    deficitMm: baseDeficitMm,
    volumeM3,
    pumpMinutes,
    et0,
    kc,
    etc,
    ndvi,
    moisturePercent,
    growthStage,
    recommendationText,
    hst,
  };
}

