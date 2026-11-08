"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  fullHeight?: boolean;
}

export default function AppShell({ children, fullHeight = false }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  function handleToggleSidebar() {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileOpen((v) => !v);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  }

  return (
    <div className="h-screen w-screen flex flex-row overflow-hidden bg-white text-ink-900 antialiased selection:bg-lime-400/30 print:h-auto print:w-full print:overflow-visible print:block print:bg-white">
      {/* Full-Height Integrated Sidebar Rail (0px edge margin) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Edge-to-Edge Responsive Main App Area */}
      <div className="flex-1 min-w-0 h-screen flex flex-col bg-white overflow-hidden print:h-auto print:overflow-visible print:block print:w-full">
        <main
          className={`flex-1 w-full p-3 sm:p-5 lg:p-6 pb-20 md:pb-6 flex flex-col print:p-0 print:m-0 print:h-auto print:overflow-visible print:block ${
            fullHeight
              ? "h-full overflow-hidden print:h-auto print:overflow-visible"
              : "overflow-y-auto print:h-auto print:overflow-visible"
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
