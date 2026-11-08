import { test, expect } from "@playwright/test";

test.describe("LahanSense Full Feature End-to-End Suite", () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultNavigationTimeout(15000);
  });

  test("1. Beranda / Dashboard: Header, Search, Filter, KPI & Cuaca", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/LahanSense/i);

    // 1.1 Header & Title
    const heading = page.locator("h1").first();
    await expect(heading).toContainText("Lahan Saya");

    // 1.2 Parcel Selector is visible with initial plot
    const parcelBtn = page.locator("button").filter({ hasText: "Sawah Karawang" }).first();
    await expect(parcelBtn).toBeVisible();

    // 1.3 Live Search with Autosuggest
    const searchInput = page.locator("input[placeholder='Cari petak lahan...']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Cabai");
    await expect(page.locator("text=Hasil Pencarian").first()).toBeVisible();

    // Select search result
    const searchResult = page.locator("button:has-text('Kebun Cabai')").first();
    if (await searchResult.isVisible()) {
      await searchResult.click();
    }

    // 1.4 Filter Popover (SlidersHorizontal)
    const filterBtn = page.locator("button[title='Filter Petak Lahan']");
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    await expect(page.locator("text=Filter Petak").first()).toBeVisible();
    await expect(page.locator("text=Status Irigasi").first()).toBeVisible();

    // Reset filter
    const resetBtn = page.locator("button:has-text('Reset Filter')").first();
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
    }

    // 1.5 KPI Cards
    await expect(page.locator("text=Total Petak").first()).toBeVisible();
    await expect(page.locator("text=Komoditas").first()).toBeVisible();
    await expect(page.locator("text=Total Luas").first()).toBeVisible();
    await expect(page.locator("text=Kebutuhan Air").first()).toBeVisible();

    // 1.6 Weather Card & Soil Health
    await expect(page.locator("text=Cerah Berawan").first()).toBeVisible();
    await expect(page.locator("text=Kesehatan Tanah & Air").first()).toBeVisible();
  });

  test("2. Peta Interaktif Spasial GIS (/peta): Layer Switcher, Telemetry & Inspector", async ({ page }) => {
    await page.goto("/peta");
    await expect(page).toHaveTitle(/LahanSense/i);

    // 2.1 Layer Switcher buttons
    const satelitBtn = page.locator("button:has-text('Satelit')").first();
    const ndviBtn = page.locator("button:has-text('NDVI')").first();
    const jalanBtn = page.locator("button:has-text('Jalan')").first();
    await expect(satelitBtn).toBeVisible();
    await expect(ndviBtn).toBeVisible();
    await expect(jalanBtn).toBeVisible();

    // Switch to NDVI layer
    await ndviBtn.click();
    // Switch to Jalan layer
    await jalanBtn.click();
    // Switch back to Satelit
    await satelitBtn.click();

    // 2.2 Telemetry & Inspector
    await expect(page.locator("text=Sentinel-2B").first()).toBeVisible();
    await expect(page.locator("text=Sudah Diairi").first()).toBeVisible();
  });

  test("3. Rekomendasi Irigasi Presisi (/rekomendasi): Volume, Pompa, & Transparansi FAO-56", async ({ page }) => {
    await page.goto("/rekomendasi");
    await expect(page).toHaveTitle(/LahanSense/i);

    // 3.1 Header & KPI Summary
    await expect(page.locator("h1:has-text('Rekomendasi Irigasi Presisi')").first()).toBeVisible();
    await expect(page.locator("text=Total Kebutuhan Air").first()).toBeVisible();
    await expect(page.locator("text=Total Waktu Pompa").first()).toBeVisible();

    // 3.2 Action Button Diairi & Info FAO-56
    const diairiBtn = page.locator("button:has-text('Diairi')").first();
    await expect(diairiBtn).toBeVisible();

    const infoBtn = page.locator("button[title='Lihat Rumus FAO-56']").first();
    await expect(infoBtn).toBeVisible();
    await infoBtn.click();
    await expect(page.locator("text=Transparansi Perhitungan Irigasi FAO-56").first()).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("4. Pusat Peringatan Dini (/peringatan): Status Otomatis & Log Notifikasi", async ({ page }) => {
    await page.goto("/peringatan");
    await expect(page).toHaveTitle(/LahanSense/i);

    // 4.1 WhatsApp Otomatis ke nomor target 08112222136
    await expect(page.locator("text=WhatsApp Otomatis Aktif").first()).toBeVisible();
    await expect(page.locator("text=08112222136").first()).toBeVisible();

    // 4.2 Early Warning Sections & Cetak Berita Acara
    await expect(page.locator("text=Pusat Peringatan Dini").first()).toBeVisible();
    await expect(page.locator("text=Daftar Protokol Tanggap Cekaman Air").first()).toBeVisible();
    await expect(page.locator("button:has-text('Cetak Berita Acara')").first()).toBeVisible();
  });

  test("5. Audit Efisiensi Air & Biaya (/audit): Skor Efisiensi & Cetak Laporan PDF", async ({ page }) => {
    await page.goto("/audit");
    await expect(page).toHaveTitle(/LahanSense/i);

    // 5.1 Efficiency Metrics
    await expect(page.locator("h1:has-text('Audit Efisiensi Air & Biaya')").first()).toBeVisible();
    await expect(page.locator("text=Skor Efisiensi Keseluruhan").first()).toBeVisible();
    await expect(page.locator("text=Air Berhasil Dihemat").first()).toBeVisible();
    await expect(page.locator("text=Penghematan Biaya Pompa").first()).toBeVisible();
    await expect(page.locator("text=Kepatuhan Rekomendasi").first()).toBeVisible();

    // 5.2 Cetak Laporan PDF Button
    await expect(page.locator("button:has-text('Cetak Laporan PDF')").first()).toBeVisible();
  });

  test("6. Katalog Lahan Pertanian (/lahan): View Toggle & Filter", async ({ page }) => {
    await page.goto("/lahan");
    await expect(page).toHaveTitle(/LahanSense/i);

    // 6.1 View Mode Switcher
    const galeriBtn = page.locator("button[title='Tampilan Kartu Satelit']").first();
    const tabelBtn = page.locator("button[title='Tampilan Tabel GIS']").first();
    await expect(galeriBtn).toBeVisible();
    await expect(tabelBtn).toBeVisible();

    // Switch to table view
    await tabelBtn.click();
    await expect(page.locator("th:has-text('Petak Lahan')").first()).toBeVisible();
    // Switch back to grid view
    await galeriBtn.click();

    // 6.2 Filter Komoditas
    await expect(page.locator("button:has-text('Semua')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Padi')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Cabai')").first()).toBeVisible();
  });

  test("7. Pendaftaran Lahan Baru (/lahan/baru): Multi-step Form & GPS", async ({ page }) => {
    await page.goto("/lahan/baru");
    await expect(page).toHaveTitle(/LahanSense/i);

    // 7.1 Step 1: Tentukan Lokasi Lahan
    await expect(page.locator("text=1. Tentukan Lokasi Lahan").first()).toBeVisible();
    const gpsBtn = page.locator("button:has-text('Gunakan Lokasi Saat Ini (GPS)')").first();
    await expect(gpsBtn).toBeVisible();

    // Advance to Step 2
    await gpsBtn.click();
    await expect(page.locator("text=2. Gambar Batas Petak").first()).toBeVisible();
  });

  test("8. Pengaturan & Pompa (/pengaturan): Profil, Kalibrasi Pompa & Otomasi WA 08112222136", async ({ page }) => {
    await page.goto("/pengaturan");
    await expect(page).toHaveTitle(/LahanSense/i);

    // 8.1 Header
    await expect(page.locator("h1:has-text('Pengaturan Sistem & Profil')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Profil Petani')").first()).toBeVisible();

    // 8.2 Switch to Spesifikasi Pompa tab
    const pompaTab = page.locator("button:has-text('Spesifikasi Pompa')").first();
    await expect(pompaTab).toBeVisible();
    await pompaTab.click();
    await expect(page.locator("text=Kalibrasi Pompa Irigasi").first()).toBeVisible();

    // 8.3 Switch to Notifikasi tab
    const notifTab = page.locator("button:has-text('Notifikasi')").first();
    await expect(notifTab).toBeVisible();
    await notifTab.click();
    await expect(page.locator("text=Preferensi Notifikasi & Peringatan").first()).toBeVisible();

    // 8.4 WhatsApp Automation is Active & Running Automatically to 08112222136
    await expect(page.locator("text=Peringatan Otomatis WhatsApp").first()).toBeVisible();
    await expect(page.locator("text=Aktif 24/7").first()).toBeVisible();
    await expect(page.locator("text=08112222136").first()).toBeVisible();
    await expect(page.locator("text=Notifikasi berjalan otomatis").first()).toBeVisible();
  });

  test("9. Sidebar Alignment & State Persistence: Logo Sejajar & Tidak Menutup Saat Navigasi", async ({ page }) => {
    await page.goto("/");

    // 9.1 Logo is visible and centered/aligned
    const logoLink = page.locator("a[title='Beranda LahanSense']").first();
    await expect(logoLink).toBeVisible();

    // 9.2 Toggle sidebar open
    const edgeToggleBtn = page.locator("button[title='Buka Sidebar']").first();
    if (await edgeToggleBtn.isVisible()) {
      await edgeToggleBtn.click();
    }

    // Check sidebar expanded text
    const aside = page.locator("aside").first();
    await expect(aside.locator("text=Peta Interaktif").first()).toBeVisible();

    // 9.3 Navigate to Peta Interaktif - verify sidebar STAYS OPEN
    await aside.locator("text=Peta Interaktif").first().click();
    await page.waitForURL("**/peta");
    await expect(aside.locator("text=Rekomendasi Air").first()).toBeVisible();

    // 9.4 Navigate to Lahan Saya - verify sidebar STAYS OPEN
    await aside.locator("text=Lahan Saya").first().click();
    await page.waitForURL("**/lahan");
    await expect(aside.locator("text=Audit Efisiensi").first()).toBeVisible();
  });
});
