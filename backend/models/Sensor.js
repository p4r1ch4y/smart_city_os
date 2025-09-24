const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sensor = sequelize.define('Sensor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sensorId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 50]
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  type: {
    type: DataTypes.ENUM,
    values: ['traffic', 'waste', 'air_quality', 'noise', 'water_quality', 'energy', 'parking'],
    allowNull: false
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidLocation(value) {
        if (!value.latitude || !value.longitude) {
          throw new Error('Location must include latitude and longitude');
        }
        if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
          throw new Error('Latitude and longitude must be numbers');
        }
        if (value.latitude < -90 || value.latitude > 90) {
          throw new Error('Latitude must be between -90 and 90');
        }
        if (value.longitude < -180 || value.longitude > 180) {
          throw new Error('Longitude must be between -180 and 180');
        }
      }
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'inactive', 'maintenance', 'error'],
    defaultValue: 'active'
  },
  lastHeartbeat: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true
  },
  thresholds: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true
  }
});

// Instance methods
Sensor.prototype.isOnline = function() {
  if (!this.lastHeartbeat) return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastHeartbeat > fiveMinutesAgo;
};

Sensor.prototype.updateHeartbeat = function() {
  return this.update({ lastHeartbeat: new Date() });
};

// Class methods
Sensor.getDefaultThresholds = (sensorType) => {
  const thresholds = {
    traffic: {
      congestion_level: { warning: 70, critical: 85 },
      vehicle_count: { warning: 100, critical: 150 }
    },
    waste: {
      fill_level: { warning: 75, critical: 90 },
      temperature: { warning: 40, critical: 50 }
    },
    air_quality: {
      pm25: { warning: 35, critical: 55 },
      pm10: { warning: 50, critical: 100 },
      co2: { warning: 1000, critical: 2000 }
    },
    noise: {
      decibel_level: { warning: 65, critical: 80 }
    },
    water_quality: {
      ph: { min: 6.5, max: 8.5 },
      turbidity: { warning: 4, critical: 10 }
    },
    energy: {
      consumption: { warning: 1000, critical: 1500 },
      voltage: { min: 220, max: 240 }
    },
    parking: {
      occupancy_rate: { warning: 85, critical: 95 }
    }
  };
  
  return thresholds[sensorType] || {};
};

module.exports = Sensor;
