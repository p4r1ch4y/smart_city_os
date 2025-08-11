import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CityContext = createContext(null);

// City definitions
export const CITIES = {
  Kolkata: {
    key: 'Kolkata',
    center: [22.5726, 88.3639],
    bounds: { north: 22.75, south: 22.45, east: 88.5, west: 88.2 },
    theme: {
      gradientFrom: '#8A2387', // purple
      gradientVia: '#E94057', // pink
      gradientTo: '#F27121',   // orange
    },
  },
  Kharagpur: {
    key: 'Kharagpur',
    center: [22.3392, 87.3250],
    bounds: { north: 22.39, south: 22.29, east: 87.37, west: 87.27 },
    theme: {
      gradientFrom: '#00C6FF', // cyan
      gradientVia: '#0072FF', // blue
      gradientTo: '#4A00E0',  // deep blue
    },
  },
  'New York': {
    key: 'New York',
    center: [40.7589, -73.9851],
    bounds: { north: 40.9176, south: 40.4774, east: -73.7004, west: -74.2591 },
    theme: {
      gradientFrom: '#0ea5e9',
      gradientVia: '#6366f1',
      gradientTo: '#22c55e',
    },
  },
};

const STORAGE_KEY = 'smartcity.selectedCity';

export function CityProvider({ children }) {
  const [cityKey, setCityKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'Kolkata';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, cityKey);
  }, [cityKey]);

  const city = useMemo(() => CITIES[cityKey] || CITIES['Kolkata'], [cityKey]);

  const value = useMemo(() => ({
    cityKey,
    city,
    setCity: setCityKey,
    cities: Object.keys(CITIES),
  }), [cityKey, city]);

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within CityProvider');
  return ctx;
}

