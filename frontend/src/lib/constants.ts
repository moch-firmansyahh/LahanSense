import type { Crop, Method } from "@/types/api";

export const CROPS: { value: Crop; label: string; icon: string }[] = [
  { value: "padi", label: "Padi", icon: "🌾" },
  { value: "jagung", label: "Jagung", icon: "🌽" },
  { value: "cabai", label: "Cabai", icon: "🌶️" },
  { value: "bawang_merah", label: "Bawang Merah", icon: "🧅" },
];

export const METHODS: { value: Method; label: string; efficiency: string }[] = [
  { value: "genangan", label: "Genangan", efficiency: "45%" },
  { value: "alur", label: "Alur", efficiency: "60%" },
  { value: "pompa", label: "Pompa", efficiency: "65%" },
  { value: "tetes", label: "Tetes", efficiency: "90%" },
];

export const CROP_LABELS: Record<Crop, string> = {
  padi: "Padi",
  jagung: "Jagung",
  cabai: "Cabai",
  bawang_merah: "Bawang Merah",
};

export const METHOD_LABELS: Record<Method, string> = {
  genangan: "Genangan",
  alur: "Alur",
  pompa: "Pompa",
  tetes: "Tetes",
};

