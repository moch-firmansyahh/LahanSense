# Kontrak API LahanSense

> Versi: 0.2.0  
> Base URL: `/api/v1`

## Daftar Endpoint

| Method | Endpoint | Deskripsi | Status |
|--------|----------|-----------|--------|
| GET | `/health` | Cek ketersediaan API | Siap |
| GET | `/health/db` | Cek koneksi ke Supabase dan PostGIS | Siap |
| GET | `/plots` | Ambil daftar seluruh poligon lahan | Siap |
| POST | `/plots` | Daftarkan poligon lahan baru | Siap |
| GET | `/plots/{id}` | Detail poligon lahan berdasarkan ID | Siap |
| DELETE | `/plots/{id}` | Hapus poligon lahan berdasarkan ID | Siap |
| GET | `/plots/{id}/recommendation` | Rekomendasi irigasi harian (opsional `?date=YYYY-MM-DD`) | Siap (dengan NDVI Sentinel-2) |
| GET | `/plots/{id}/forecast` | Prakiraan kebutuhan irigasi 7 hari | Siap |
| GET | `/plots/{id}/alerts` | Peringatan dini bencana (kekeringan / hujan ekstrem) | Siap |
| GET | `/plots/{id}/ndvi` | Data NDVI terbaru & riwayat observasi satelit | Siap |
| POST | `/plots/{id}/irrigation-log` | Log aktual penyiraman | Siap |
| GET | `/plots/{id}/irrigation-logs` | Ambil daftar riwayat log penyiraman | Siap |
| DELETE | `/plots/{id}/irrigation-logs/{log_id}` | Hapus catatan log penyiraman | Siap |
| GET | `/plots/{id}/efficiency` | Audit skor efisiensi irigasi (0-100) | Siap |
| POST | `/demo/load` | Muat 3 lahan demo secara idempoten | Siap |

## Payload & Responses

### `POST /plots`
**Request Body:**
```json
{
  "name": "Sawah Pak Ujang",
  "crop": "padi",
  "planting_date": "2026-10-20",
  "irrigation_method": "genangan",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[107.60, -6.91], [107.61, -6.91], [107.61, -6.92], [107.60, -6.92], [107.60, -6.91]]]
  }
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Sawah Pak Ujang",
  "crop": "padi",
  "planting_date": "2026-10-20",
  "irrigation_method": "genangan",
  "area_ha": 1.2345,
  "centroid": { "lat": -6.915, "lng": 107.605 },
  "geometry": { ... },
  "is_demo": false
}
```

### `POST /plots/{id}/irrigation-log`
**Request Body:**
```json
{
  "log_date": "2026-11-08",
  "volume_m3": 45.0,
  "note": "Penggenangan macak-macak pagi hari"
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "plot_id": 1,
  "log_date": "2026-11-08",
  "volume_m3": 45.0,
  "note": "Penggenangan macak-macak pagi hari"
}
```

### `GET /plots/{id}/efficiency?days=7`
**Response (200 OK):**
```json
{
  "plot_id": 1,
  "period_days": 7,
  "total_actual_volume_m3": 95.0,
  "total_recommended_volume_m3": 98.4,
  "water_savings_m3": 3.4,
  "efficiency_score": 96.5,
  "status": "optimal",
  "insight": "Irigasi optimal (96%). Volume aktual (95.0 m³) sangat selaras dengan kebutuhan evapotranspirasi (98.4 m³).",
  "daily_breakdown": [
    {
      "date": "2026-11-02",
      "actual_m3": 0.0,
      "recommended_m3": 14.1,
      "deficit_mm": 2.1,
      "difference_m3": -14.1
    }
  ]
}
```

### `GET /plots/{id}/ndvi`
**Response (200 OK):**
```json
{
  "plot_id": 1,
  "latest_ndvi": 0.68,
  "latest_date": "2026-11-07",
  "confidence": "tinggi",
  "vegetation_status": "Kanopi Sehat / Rimbun",
  "observations": [
    {
      "id": 1,
      "plot_id": 1,
      "obs_date": "2026-11-07",
      "ndvi_mean": 0.68,
      "cloud_cover": 12.0,
      "source": "sentinel-2-l2a"
    }
  ]
}
```

### Standar Format Error
```json
{
  "detail": "Pesan error yang bisa dibaca manusia"
}
```
