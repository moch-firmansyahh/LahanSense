import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LahanSense - Intelijen Irigasi Tanpa Sensor",
  description: "Intelijen irigasi tanpa sensor: NDVI Sentinel-2 + FAO-56",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
