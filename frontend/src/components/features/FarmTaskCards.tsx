"use client";

import React from "react";

export default function FarmTaskCards() {
  const tasks = [
    {
      id: 1,
      title: "Pemeliharaan Pompa Irigasi",
      badge: "Selesai",
      badgeClass: "bg-[#74D14E] text-[#123118]",
      bgImage:
        "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      title: "Uji Nutrisi & Defisit Tanah",
      badge: "Proses",
      badgeClass: "bg-[#F3BD38] text-[#332205]",
      bgImage:
        "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      title: "Persiapan Panen Petak 1",
      badge: "Antrean",
      badgeClass: "bg-white text-ink-900 border border-line-200",
      bgImage:
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 select-none">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="relative h-28 sm:h-32 rounded-2xl overflow-hidden shadow-xs border border-line-200/80 group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
        >
          {/* Background Photo */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${task.bgImage}')` }}
          />

          {/* Dark Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

          {/* Top Status Pill */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-normal uppercase tracking-wider shadow-xs ${task.badgeClass}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {task.badge}
            </span>
          </div>

          {/* Bottom Title */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
            <h5 className="text-xs font-normal text-white leading-tight drop-shadow-sm truncate">
              {task.title}
            </h5>
          </div>
        </div>
      ))}
    </div>
  );
}

