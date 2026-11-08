# Kontrak API LahanSense

> Versi: 0.1.0  
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
| GET | `/plots/{id}/recommendation` | Rekomendasi irigasi harian (opsional `?date=YYYY-MM-DD`) | Siap (tanpa NDVI) |
| GET | `/plots/{id}/forecast` | Prakiraan kebutuhan irigasi 7 hari | Siap |
| GET | `/plots/{id}/alerts` | Peringatan dini bencana (kekeringan / hujan ekstrem) | Siap |
| GET | `/plots/{id}/ndvi` | Data NDVI terbaru & historis | Stub |
| POST | `/plots/{id}/irrigation-log` | Log aktual penyiraman | Belum ada |
| GET | `/plots/{id}/efficiency` | Skor efisiensi irigasi (0-100) | Belum ada |
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

### Standar Format Error
```json
{
  "detail": "Pesan error yang bisa dibaca manusia"
}
```

