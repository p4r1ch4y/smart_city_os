import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCity } from '../contexts/CityContext';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default coordinates for Indian cities
const DEFAULT_COORDINATES = {
  kolkata: { lat: 22.5726, lng: 88.3639 },
  kharagpur: { lat: 22.3149, lng: 87.3105 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.7041, lng: 77.1025 },
  bangalore: { lat: 12.9716, lng: 77.5946 }
};

// Helper function to extract coordinates from sensor data
const getCoordinates = (sensor) => {
  // Handle different coordinate formats
  if (sensor.latitude && sensor.longitude) {
    return { lat: parseFloat(sensor.latitude), lng: parseFloat(sensor.longitude) };
  }
  if (sensor.coordinates && sensor.coordinates.lat && sensor.coordinates.lng) {
    return { lat: parseFloat(sensor.coordinates.lat), lng: parseFloat(sensor.coordinates.lng) };
  }
  if (sensor.location && sensor.location.latitude && sensor.location.longitude) {
    return { lat: parseFloat(sensor.location.latitude), lng: parseFloat(sensor.location.longitude) };
  }

  // Fallback to default coordinates based on city or sensor type
  const city = sensor.city?.toLowerCase() || 'kolkata';
  return DEFAULT_COORDINATES[city] || DEFAULT_COORDINATES.kolkata;
};

// Helper function to validate coordinates
const isValidCoordinate = (coord) => {
  return coord &&
         typeof coord.lat === 'number' &&
         typeof coord.lng === 'number' &&
         !isNaN(coord.lat) &&
         !isNaN(coord.lng) &&
         coord.lat >= -90 && coord.lat <= 90 &&
         coord.lng >= -180 && coord.lng <= 180;
};

// Custom sensor icons
const createSensorIcon = (type, status = 'active') => {
  const colors = {
    traffic: '#3b82f6',
    waste: '#22c55e',
    air_quality: '#8b5cf6',
    noise: '#eab308',
    water_quality: '#06b6d4',
    energy: '#f97316',
    parking: '#ec4899'
  };

  const statusColors = {
    active: colors[type] || '#6b7280',
    offline: '#ef4444',
    maintenance: '#f59e0b',
    error: '#dc2626'
  };

  return L.divIcon({
    className: 'custom-sensor-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${statusColors[status]};
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      ">
        ${type.charAt(0).toUpperCase()}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};


// Component to fit map bounds to sensors
function MapBounds({ sensors }) {
  const map = useMap();
  
  const { city } = useCity();

  useEffect(() => {
    if (sensors.length > 0) {
      // Filter sensors with valid coordinates and create bounds
      const validSensors = sensors
        .map(sensor => getCoordinates(sensor))
        .filter(coord => isValidCoordinate(coord));

      if (validSensors.length > 0) {
        const bounds = L.latLngBounds(
          validSensors.map(coord => [coord.lat, coord.lng])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      } else {
        // Fallback to Kolkata if no valid sensors
        map.setView([DEFAULT_COORDINATES.kolkata.lat, DEFAULT_COORDINATES.kolkata.lng], 12);
      }
    } else {
      // Fit to city bounds if no sensors, or fallback to Kolkata
      try {
        const b = city.bounds;
        const bounds = L.latLngBounds([[b.south, b.west], [b.north, b.east]]);
        map.fitBounds(bounds, { padding: [20, 20] });
      } catch (error) {
        console.warn('City bounds not available, using default coordinates');
        map.setView([DEFAULT_COORDINATES.kolkata.lat, DEFAULT_COORDINATES.kolkata.lng], 12);
      }
    }
  }, [sensors, map, city]);
  
  return null;
}

function SensorMap({ sensors = [], realtimeData = {}, height = 400 }) {
  const mapRef = useRef();
  const { city } = useCity();

  // Use safe default center with fallback
  const defaultCenter = city?.center || [DEFAULT_COORDINATES.kolkata.lat, DEFAULT_COORDINATES.kolkata.lng];
  const defaultZoom = 12;

  const formatSensorData = (sensor, realtime) => {
    if (!realtime?.data) return 'No recent data';
    
    const data = realtime.data;
    switch (sensor.type) {
      case 'traffic':
        return `Vehicles: ${data.vehicle_count || 0}, Speed: ${data.average_speed || 0} km/h`;
      case 'waste':
        return `Fill: ${data.fill_percentage || 0}%, Temp: ${data.temperature || 0}°C`;
      case 'air_quality':
        return `PM2.5: ${data.pm25 || 0}, AQI: ${data.aqi || 'N/A'}`;
      case 'noise':
        return `Noise: ${data.decibel_level || 0} dB`;
      case 'water_quality':
        return `pH: ${data.ph || 0}, DO: ${data.dissolved_oxygen || 0} mg/L`;
      case 'energy':
        return `Power: ${data.consumption || 0} kW`;
      case 'parking':
        return `Occupancy: ${data.occupancy_rate || 0}%`;
      default:
        return 'Sensor data available';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-success-100 text-success-800', text: 'Active' },
      offline: { color: 'bg-danger-100 text-danger-800', text: 'Offline' },
      maintenance: { color: 'bg-warning-100 text-warning-800', text: 'Maintenance' },
      error: { color: 'bg-danger-100 text-danger-800', text: 'Error' }
    };
    
    const badge = badges[status] || badges.active;
    return `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}">${badge.text}</span>`;
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }} className="relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds sensors={sensors} />
        
        {sensors.map((sensor) => {
          const realtime = realtimeData[sensor.sensorId];
          const isOnline = sensor.status === 'active' && realtime;
          const coordinates = getCoordinates(sensor);

          // Skip sensors with invalid coordinates
          if (!isValidCoordinate(coordinates)) {
            console.warn(`Skipping sensor ${sensor.id} with invalid coordinates:`, sensor);
            return null;
          }

          return (
            <Marker
              key={sensor.id}
              position={[coordinates.lat, coordinates.lng]}
              icon={createSensorIcon(sensor.type, sensor.status)}
            >
              <Popup className="sensor-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{sensor.name}</h3>
                    <div dangerouslySetInnerHTML={{ __html: getStatusBadge(sensor.status) }} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <span className="ml-2 capitalize">{sensor.type.replace('_', ' ')}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Location:</span>
                      <span className="ml-2">{sensor.location.address || 'Unknown'}</span>
                    </div>
                    
                    {isOnline && (
                      <div>
                        <span className="font-medium text-gray-600">Data:</span>
                        <div className="ml-2 text-xs bg-gray-100 p-2 rounded mt-1">
                          {formatSensorData(sensor, realtime)}
                        </div>
                      </div>
                    )}
                    
                    {realtime?.timestamp && (
                      <div>
                        <span className="font-medium text-gray-600">Last Update:</span>
                        <span className="ml-2 text-xs">
                          {new Date(realtime.timestamp).toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          isOnline ? 'bg-success-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-gray-500">
                          {isOnline ? 'Receiving data' : 'No recent data'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sensor Types</h4>
        <div className="space-y-1">
          {[
            { type: 'traffic', label: 'Traffic', color: '#3b82f6' },
            { type: 'waste', label: 'Waste', color: '#22c55e' },
            { type: 'air_quality', label: 'Air Quality', color: '#8b5cf6' },
            { type: 'noise', label: 'Noise', color: '#eab308' },
            { type: 'water_quality', label: 'Water', color: '#06b6d4' },
            { type: 'energy', label: 'Energy', color: '#f97316' },
            { type: 'parking', label: 'Parking', color: '#ec4899' }
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-[1000]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {sensors.filter(s => s.status === 'active').length} active sensors
          </span>
        </div>
      </div>
    </div>
  );
}

export default SensorMap;
