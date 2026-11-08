"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Map,
  Droplets,
  BellRing,
  Gauge,
  Sprout,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  User,
  Database,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Beranda", icon: LayoutGrid },
  { href: "/peta", label: "Peta Interaktif", icon: Map },
  { href: "/rekomendasi", label: "Rekomendasi Air", icon: Droplets },
  { href: "/peringatan", label: "Peringatan Dini", icon: BellRing },
  { href: "/audit", label: "Audit Efisiensi", icon: Gauge },
  { href: "/lahan", label: "Lahan Saya", icon: Sprout },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  isOpen = false,
  onToggle,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full w-full select-none text-stone-800 py-3.5 px-2 bg-[#FAF8F5] overflow-hidden">
      {/* Top Header: Logo (Stable structure - No Jump) */}
      <div className="flex items-center justify-between px-1 shrink-0 pb-3 border-b border-stone-200/60 overflow-hidden">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center group focus:outline-hidden min-w-0"
          title="Beranda LahanSense"
          aria-label="Beranda LahanSense"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-2xs group-hover:scale-105 transition-transform shrink-0 border border-stone-200/90 flex items-center justify-center p-0.5">
            <Image
              src="/logo.png"
              alt="Logo LahanSense"
              width={40}
              height={40}
              className="w-full h-full object-contain rounded-lg"
              priority
            />
          </div>

          <div
            className={`flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-out ${
              isOpen ? "opacity-100 max-w-[160px] ml-2.5" : "opacity-0 max-w-0 ml-0 pointer-events-none"
            }`}
          >
            <span className="text-base font-medium text-stone-900 tracking-tight leading-tight whitespace-nowrap">
              LahanSense
            </span>
            <span className="text-[10px] text-emerald-700 font-medium tracking-wide whitespace-nowrap">
              Irigasi Presisi Satelit
            </span>
          </div>
        </Link>

        {/* Mobile close button only */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0"
          title="Tutup Menu"
          aria-label="Tutup Menu"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Middle Navigation (Stable, smooth gliding labels - No Jump) */}
      <div className="flex-1 my-3 flex flex-col justify-between overflow-y-auto overflow-x-hidden">
        <nav className="flex flex-col gap-1 px-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={onCloseMobile}
                title={item.label}
                className={`flex items-center h-10 px-2 rounded-xl text-xs font-medium transition-colors duration-150 overflow-hidden ${
                  isActive
                    ? "bg-emerald-950 text-white shadow-2xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/90"
                }`}
                aria-label={item.label}
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <IconComponent
                    className={`w-4 h-4 stroke-[2] ${
                      isActive ? "text-emerald-400" : "text-stone-500"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${
                    isOpen ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0 pointer-events-none"
                  }`}
                >
                  <span className="truncate whitespace-nowrap text-xs font-medium">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Center Toggle Button in Middle Area (Pindah ke Tengah) */}
        <div className="pt-2 px-0.5">
          <button
            type="button"
            onClick={onToggle}
            className="hidden md:flex items-center h-10 w-full px-2 rounded-xl bg-stone-100 hover:bg-stone-200/90 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer border border-stone-200/70 overflow-hidden"
            title={isOpen ? "Ciutkan Sidebar" : "Perluas Sidebar"}
            aria-label={isOpen ? "Ciutkan Sidebar" : "Perluas Sidebar"}
          >
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              {isOpen ? (
                <PanelLeftClose className="w-4 h-4 text-stone-500" aria-hidden="true" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-stone-500" aria-hidden="true" />
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${
                isOpen ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0 pointer-events-none"
              }`}
            >
              <span className="truncate whitespace-nowrap text-xs font-medium">
                Ciutkan Menu
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Section: Settings & User Profile (Stable - No Jump) */}
      <div className="shrink-0 flex flex-col gap-1.5 pt-3 border-t border-stone-200/60 px-0.5 overflow-hidden">
        <Link
          href="/pengaturan"
          prefetch={false}
          onClick={onCloseMobile}
          title="Pengaturan"
          className={`flex items-center h-10 px-2 rounded-xl text-xs font-medium transition-colors duration-150 overflow-hidden ${
            pathname === "/pengaturan"
              ? "bg-emerald-950 text-white shadow-2xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/90"
          }`}
          aria-label="Pengaturan"
        >
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 stroke-[2] text-stone-500" aria-hidden="true" />
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${
              isOpen ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0 pointer-events-none"
            }`}
          >
            <span className="truncate whitespace-nowrap text-xs font-medium">
              Pengaturan
            </span>
          </div>
        </Link>

        {/* User Dropdown (Stable avatar + smooth text) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center h-10 px-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 transition-colors text-left w-full cursor-pointer overflow-hidden"
              title="Profil Petani Utama"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 font-medium text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                PU
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out flex flex-col justify-center min-w-0 ${
                  isOpen ? "opacity-100 max-w-[160px] ml-2.5" : "opacity-0 max-w-0 ml-0 pointer-events-none"
                }`}
              >
                <span className="text-xs font-medium text-stone-900 block truncate whitespace-nowrap">
                  Petani Utama
                </span>
                <span className="text-[10px] text-stone-500 block truncate whitespace-nowrap">
                  Sawah Karawang
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
            <DropdownMenuLabel>Akun Pengguna</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs font-normal">
              <User className="w-3.5 h-3.5 mr-2 text-stone-600" />
              Profil Petani
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-normal">
              <Database className="w-3.5 h-3.5 mr-2 text-emerald-700" />
              Supabase PostGIS: Terhubung
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/pengaturan" className="text-xs font-medium text-emerald-700">
                Konfigurasi Sistem
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Light Botanical Integrated Rail with Centered Border Toggle */}
      <div className="relative hidden md:flex h-full shrink-0 print:hidden no-print">
        <aside
          className={`flex flex-col h-full border-r border-stone-200/80 select-none shrink-0 transition-all duration-300 ease-out will-change-[width] overflow-hidden ${
            isOpen ? "w-60" : "w-[68px]"
          }`}
        >
          {sidebarContent}
        </aside>

        {/* Floating Centered Edge Toggle Button (Tepat di Tengah Garis Pembatas Sidebar) */}
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 -translate-y-1/2 -right-3 z-40 w-6 h-6 rounded-full bg-white border border-stone-300 shadow-md hover:bg-stone-50 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-transform duration-200 cursor-pointer hover:scale-110"
          title={isOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          aria-label={isOpen ? "Tutup Sidebar" : "Buka Sidebar"}
        >
          {isOpen ? (
            <PanelLeftClose className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <PanelLeftOpen className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex print:hidden no-print">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-[#FAF8F5] border-r border-stone-200 z-10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
