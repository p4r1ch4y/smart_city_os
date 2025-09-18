import React from 'react';

// Minimal stub to avoid build failure; renders a simple line via SVG if data provided
export default function RealtimeChart({ data = [] }) {
  const points = (Array.isArray(data) ? data : []).map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * 100;
    const yVal = typeof d === 'number' ? d : (typeof d?.value === 'number' ? d.value : 0);
    const y = 100 - Math.max(0, Math.min(100, yVal));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full bg-black/10 dark:bg-white/5 rounded-lg flex items-center justify-center">
      {points ? (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
        </svg>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">No data</div>
      )}
    </div>
  );
}

