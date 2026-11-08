import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-line-200/60 rounded-card ${className}`}
    />
  );
}

