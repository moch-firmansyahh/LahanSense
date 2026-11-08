"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Droplets,
  BellRing,
  Sprout,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/peta", label: "Peta", icon: Map },
  { href: "/rekomendasi", label: "Irigasi", icon: Droplets },
  { href: "/peringatan", label: "Peringatan", icon: BellRing },
  { href: "/lahan", label: "Lahan", icon: Sprout },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 h-16 rounded-full bg-forest-900 text-white shadow-float px-3 flex items-center justify-around select-none border border-white/10"
      aria-label="Navigasi Utama Mobile"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            aria-label={item.label}
            className={`relative flex items-center justify-center transition-all duration-200 ${
              isActive
                ? "w-12 h-12 rounded-full bg-primary-600 text-white shadow-md scale-105"
                : "w-10 h-10 text-white/70 hover:text-white"
            }`}
          >
            <IconComponent className="w-5 h-5 stroke-[2]" />
          </Link>
        );
      })}
    </nav>
  );
}

