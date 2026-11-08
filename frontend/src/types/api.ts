export type Crop = "padi" | "jagung" | "cabai" | "bawang_merah";
export type Method = "genangan" | "alur" | "tetes" | "pompa";
export type Status = "aman" | "waspada" | "kritis";

export interface Plot {
  id: number;
  name: string;
  crop: Crop;
  planting_date: string;
  irrigation_method: Method;
  area_ha: number;
  centroid: { lat: number; lng: number };
  geometry: GeoJSON.Polygon;
  is_demo: boolean;
}

export interface PlotCreate {
  name: string;
  crop: Crop;
  planting_date: string;
  irrigation_method: Method;
  geometry: GeoJSON.Polygon;
}

export interface Recommendation {
  plot_id: number;
  date: string;
  et0_mm: number;
  kc: number;
  etc_mm: number;
  effective_rain_mm: number;
  deficit_mm: number;
  irrigation_volume_m3: number;
  pump_minutes: number | null;
  status: Status;
  reason: string;
  confidence: "rendah" | "sedang" | "tinggi";
}

export interface ForecastDay {
  date: string;
  et0_mm: number;
  rain_mm: number;
  deficit_mm: number;
  irrigation_volume_m3: number;
  status: Status;
}

export interface HazardAlert {
  type: "kekeringan" | "hujan_ekstrem" | "anomali_ndvi";
  severity: "info" | "waspada" | "kritis";
  date: string;
  message: string;
  suggested_action: string;
}

