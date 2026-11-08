from datetime import date


def get_latest_ndvi(geometry: dict, around: date) -> dict | None:
    """TODO (feature/data-ndvi-pipeline).

    Langkah: query STAC Sentinel-2 L2A (Planetary Computer) untuk bbox poligon,
    filter eo:cloud_cover, baca band B04 (red) dan B08 (NIR), mask dengan SCL,
    hitung NDVI = (B08 - B04) / (B08 + B04), lalu rata-rata zonal di dalam poligon.

    Return contoh: {"obs_date": date, "ndvi_mean": 0.62, "cloud_cover": 12.0}
    atau None bila tidak ada citra yang valid.
    """
    return None
