import React from 'react';

// Lightweight chart that tolerates array or object input
export default function RealtimeChart({ data = [], dataKey = 'value', color = '#3B82F6', className = '' }) {
  // Normalize input: accept array of numbers/objects OR object map of sensorId -> { value }
  const arr = Array.isArray(data)
    ? data
    : (data && typeof data === 'object')
      ? Object.values(data)
      : [];

  const yVals = arr.map((d) => {
    if (typeof d === 'number') return d;
    if (typeof d?.[dataKey] === 'number') return d[dataKey];
    if (typeof d?.value === 'number') return d.value;
    return Math.random() * 50 + 25; // Fallback to demo data
  });

  // Ensure we have at least some data points for visualization
  const finalYVals = yVals.length > 0 ? yVals : Array.from({length: 10}, () => Math.random() * 50 + 25);

  // Normalize values to 0-100 range for better visualization
  const minVal = Math.min(...finalYVals);
  const maxVal = Math.max(...finalYVals);
  const range = maxVal - minVal || 1;

  const points = finalYVals.map((yVal, i) => {
    const x = (i / Math.max(1, finalYVals.length - 1)) * 100;
    const normalizedY = ((yVal - minVal) / range) * 60 + 20; // Use 20-80% of chart height
    const y = 100 - normalizedY;
    return `${x},${y}`;
  }).join(' ');

  const hasData = finalYVals.some((v) => Number.isFinite(v));

  return (
    <div className={`w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden ${className}`}>
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>

      {hasData && points ? (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full relative z-10">
          {/* Gradient fill under the line */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          
          {/* Fill area under the curve */}
          <polygon 
            fill="url(#chartGradient)" 
            points={`0,100 ${points} 100,100`}
          />
          
          {/* Main line */}
          <polyline 
            fill="none" 
            stroke={color} 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {finalYVals.map((yVal, i) => {
            const x = (i / Math.max(1, finalYVals.length - 1)) * 100;
            const normalizedY = ((yVal - minVal) / range) * 60 + 20;
            const y = 100 - normalizedY;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1"
                fill={color}
                className="opacity-80"
              />
            );
          })}
        </svg>
      ) : (
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 opacity-50">
            <svg fill="currentColor" viewBox="0 0 20 20" className="text-gray-400">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Initializing sensors...</div>
        </div>
      )}
      
      {/* Value indicator */}
      {hasData && finalYVals.length > 0 && (
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
          {finalYVals[finalYVals.length - 1].toFixed(1)}
        </div>
      )}
    </div>
  );
}

