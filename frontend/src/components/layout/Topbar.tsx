"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Bell,
  Clock,
  Satellite,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  title?: string;
  onSearch?: (q: string) => void;
  isDemoMode?: boolean;
  onToggleDemo?: () => void;
  alertCount?: number;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function Topbar({
  title = "LahanSense Monitoring",
  onSearch,
  alertCount = 1,
  isSidebarOpen = true,
  onToggleSidebar,
}: TopbarProps) {
  const [searchVal, setSearchVal] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (onSearch) onSearch(searchVal);
  }

  return (
    <header className="sticky top-0 z-30 w-full h-[64px] sm:h-[70px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 bg-[#E8ECE8]/95 backdrop-blur-md select-none border-b border-line-200/50">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden md:inline-flex bg-white hover:bg-surface-50 border-line-200 text-ink-700 hover:text-ink-900 shadow-2xs"
            title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
            aria-label={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
            )}
          </Button>
        )}

        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Beranda LahanSense">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-xs group-hover:scale-105 transition-transform shrink-0 border border-stone-200/90 flex items-center justify-center p-0.5">
            <Image
              src="/logo.png"
              alt="Logo LahanSense"
              width={40}
              height={40}
              className="w-full h-full object-contain rounded-lg"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-normal text-ink-900 tracking-tight leading-tight">
              LahanSense
            </span>
            <span className="text-[11px] text-ink-600 font-medium hidden sm:inline">
              Irigasi Presisi Satelit Sentinel-2
            </span>
          </div>
        </Link>
        <span className="sr-only">{title}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex items-center w-[180px] lg:w-[240px] h-10 px-3 rounded-xl bg-white border border-line-200 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-600/20 transition-all shadow-2xs"
        >
          <Search className="w-4 h-4 text-ink-400 mr-2 shrink-0" aria-hidden="true" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Cari petak atau lokasi..."
            className="w-full bg-transparent text-xs text-ink-900 placeholder:text-ink-400 outline-none"
            aria-label="Cari petak atau lokasi"
          />
        </form>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-line-200 text-xs font-medium text-ink-900 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-ink-400" aria-hidden="true" />
          <span className="tabular-nums">09.00 WIB</span>
        </div>

        <Badge variant="secondary" className="hidden lg:flex items-center gap-1.5 py-1 px-3 bg-white border-line-200 text-ink-700 shadow-2xs font-medium">
          <Satellite className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
          <span>Sentinel-2 L2A</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="relative h-10 px-3 rounded-xl bg-white border-line-200 text-xs font-medium text-ink-900 shadow-2xs hover:bg-surface-50"
            >
              <Bell className="w-4 h-4 text-ink-600 mr-1.5" aria-hidden="true" />
              <span>Notifikasi</span>
              {alertCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-danger-600 text-white text-[10px] font-normal">
                  {alertCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Peringatan Lahan Terkini</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/peringatan" className="flex flex-col items-start gap-1 p-2">
                <div className="flex items-center justify-between w-full">
                  <span className="font-normal text-xs text-ink-900">Defisit Air 3 Hari</span>
                  <Badge variant="waspada">Waspada</Badge>
                </div>
                <p className="text-[11px] text-ink-600 font-normal">
                  Sawah Karawang memerlukan pengairan dalam 24 jam ke depan.
                </p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/peringatan" className="text-center justify-center font-normal text-primary-600 text-xs py-1.5">
                Lihat Semua Peringatan
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
