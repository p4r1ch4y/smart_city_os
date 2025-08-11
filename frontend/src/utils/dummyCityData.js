// Rich dummy data generator for city-specific patterns

export function generateCitySensors(cityKey) {
  const baseId = cityKey.toLowerCase().replace(/\s/g, '');
  const sensors = [];

  const addSensor = (type, name, lat, lng, status = 'active') => {
    sensors.push({
      id: `${baseId}_${type}_${name}`,
      sensorId: `${type}_${Math.random().toString(36).slice(2,8)}`,
      name: `${name} ${type.replace('_',' ').toUpperCase()}`,
      type,
      status,
      location: { latitude: lat, longitude: lng },
    });
  };

  if (cityKey === 'Kolkata') {
    addSensor('traffic', 'Howrah Bridge', 22.5850, 88.3468);
    addSensor('traffic', 'Park Street', 22.5536, 88.3520);
    addSensor('air_quality', 'Victoria Memorial', 22.5448, 88.3426);
    addSensor('waste', 'Esplanade', 22.5600, 88.3530);
    addSensor('energy', 'Salt Lake Sector V', 22.5744, 88.4330);
    addSensor('parking', 'New Market', 22.5637, 88.3510);
  } else if (cityKey === 'Kharagpur') {
    addSensor('traffic', 'NH16 Crossing', 22.3392, 87.3250);
    addSensor('air_quality', 'IIT KGP Main Gate', 22.3205, 87.3119);
    addSensor('waste', 'Hijli', 22.3150, 87.3070);
    addSensor('energy', 'Railway Colony', 22.3330, 87.3275);
  } else {
    addSensor('traffic', 'Times Square', 40.7589, -73.9851);
    addSensor('air_quality', 'Central Park', 40.7812, -73.9665);
  }

  return sensors;
}

export function generateRealtimePattern(sensor, timestamp = Date.now()) {
  const t = new Date(timestamp);
  const hour = t.getHours();
  const base = (min, max) => min + Math.random() * (max - min);

  switch (sensor.type) {
    case 'traffic': {
      // Rush hours in India: 9-11 AM, 6-9 PM
      const rush = (hour >= 9 && hour <= 11) || (hour >= 18 && hour <= 21);
      const congestion_level = rush ? base(70, 95) : base(15, 45);
      const average_speed = rush ? base(10, 25) : base(35, 60);
      return { congestion_level, average_speed, vehicle_count: Math.round(congestion_level * 10) };
    }
    case 'air_quality': {
      const aqi = base(60, 200) + (hour >= 6 && hour <= 9 ? 30 : 0);
      return { aqi: Math.round(aqi), pm25: Math.round(aqi * 0.6), pm10: Math.round(aqi * 0.8) };
    }
    case 'waste': {
      const fill_percentage = (t.getDay() % 2 === 0) ? base(10, 40) : base(40, 80);
      return { fill_percentage, temperature: base(25, 35) };
    }
    case 'energy': {
      const consumption = (hour >= 8 && hour <= 20) ? base(20, 60) : base(5, 20);
      return { consumption };
    }
    case 'parking': {
      const occupancy_rate = (hour >= 10 && hour <= 21) ? base(50, 95) : base(5, 40);
      return { occupancy_rate };
    }
    default:
      return {};
  }
}

