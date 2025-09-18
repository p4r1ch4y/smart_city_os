import React from 'react';

// Lightweight chart that tolerates array or object input
export default function RealtimeChart({ data = [], dataKey = 'value', color = 'currentColor', className = '' }) {
  // Normalize input: accept array of numbers/objects OR object map of sensorId -> { value }
  const arr = Array.isArray(data)
    ? data
    : (data && typeof data === 'object')
      ? Object.values(data)
      : [];

  const yVals = arr.map((d) => (typeof d === 'number' ? d : (typeof d?.[dataKey] === 'number' ? d[dataKey] : (typeof d?.value === 'number' ? d.value : 0))));

  const points = yVals.map((yVal, i) => {
    const x = (i / Math.max(1, yVals.length - 1)) * 100;
    const y = 100 - Math.max(0, Math.min(100, Number.isFinite(yVal) ? yVal : 0));
    return `${x},${y}`;
  }).join(' ');

  const hasData = yVals.some((v) => Number.isFinite(v));

  return (
    <div className={`w-full h-full bg-black/10 dark:bg-white/5 rounded-lg flex items-center justify-center ${className}`}>
      {hasData && points ? (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
        </svg>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">Awaiting data…</div>
      )}
    </div>
  );
}

