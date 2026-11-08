import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LahanSense - Intelijen Irigasi Tanpa Sensor",
  description: "Intelijen irigasi tanpa sensor: NDVI Sentinel-2 + FAO-56",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-ink-900 bg-[#E8ECE8] selection:bg-emerald-200">
        {children}
      </body>
    </html>
  );
}
