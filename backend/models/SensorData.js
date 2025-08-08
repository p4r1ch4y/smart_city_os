const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Sensor = require('./Sensor');

const SensorData = sequelize.define('SensorData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sensorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Sensor,
      key: 'id'
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  quality: {
    type: DataTypes.ENUM,
    values: ['good', 'fair', 'poor', 'invalid'],
    defaultValue: 'good'
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  alerts: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  indexes: [
    {
      fields: ['sensorId', 'timestamp']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['processed']
    }
  ]
});

// Define associations
SensorData.belongsTo(Sensor, { foreignKey: 'sensorId', as: 'sensor' });
Sensor.hasMany(SensorData, { foreignKey: 'sensorId', as: 'readings' });

// Instance methods
SensorData.prototype.checkThresholds = async function() {
  const sensor = await this.getSensor();
  if (!sensor || !sensor.thresholds) return [];
  
  const alerts = [];
  const thresholds = sensor.thresholds;
  
  for (const [key, value] of Object.entries(this.data)) {
    if (thresholds[key]) {
      const threshold = thresholds[key];
      
      // Check for min/max thresholds
      if (threshold.min !== undefined && value < threshold.min) {
        alerts.push({
          type: 'threshold_violation',
          severity: 'critical',
          metric: key,
          value: value,
          threshold: threshold.min,
          condition: 'below_minimum',
          timestamp: new Date()
        });
      }
      
      if (threshold.max !== undefined && value > threshold.max) {
        alerts.push({
          type: 'threshold_violation',
          severity: 'critical',
          metric: key,
          value: value,
          threshold: threshold.max,
          condition: 'above_maximum',
          timestamp: new Date()
        });
      }
      
      // Check for warning/critical thresholds
      if (threshold.critical !== undefined && value >= threshold.critical) {
        alerts.push({
          type: 'threshold_violation',
          severity: 'critical',
          metric: key,
          value: value,
          threshold: threshold.critical,
          condition: 'critical_level',
          timestamp: new Date()
        });
      } else if (threshold.warning !== undefined && value >= threshold.warning) {
        alerts.push({
          type: 'threshold_violation',
          severity: 'warning',
          metric: key,
          value: value,
          threshold: threshold.warning,
          condition: 'warning_level',
          timestamp: new Date()
        });
      }
    }
  }
  
  if (alerts.length > 0) {
    await this.update({ alerts });
  }
  
  return alerts;
};

// Class methods
SensorData.getLatestBySensor = async function(sensorId, limit = 100) {
  return await this.findAll({
    where: { sensorId },
    order: [['timestamp', 'DESC']],
    limit,
    include: [{
      model: Sensor,
      as: 'sensor'
    }]
  });
};

SensorData.getByTimeRange = async function(sensorId, startTime, endTime) {
  return await this.findAll({
    where: {
      sensorId,
      timestamp: {
        [sequelize.Sequelize.Op.between]: [startTime, endTime]
      }
    },
    order: [['timestamp', 'ASC']],
    include: [{
      model: Sensor,
      as: 'sensor'
    }]
  });
};

SensorData.getAggregatedData = async function(sensorId, interval = 'hour', startTime, endTime) {
  const intervalMap = {
    'minute': 'YYYY-MM-DD HH24:MI',
    'hour': 'YYYY-MM-DD HH24',
    'day': 'YYYY-MM-DD',
    'week': 'YYYY-WW',
    'month': 'YYYY-MM'
  };
  
  const dateFormat = intervalMap[interval] || intervalMap.hour;
  
  const query = `
    SELECT 
      TO_CHAR(timestamp, '${dateFormat}') as period,
      COUNT(*) as count,
      AVG((data->>'value')::numeric) as avg_value,
      MIN((data->>'value')::numeric) as min_value,
      MAX((data->>'value')::numeric) as max_value
    FROM "SensorData" 
    WHERE "sensorId" = :sensorId
    ${startTime && endTime ? 'AND timestamp BETWEEN :startTime AND :endTime' : ''}
    GROUP BY period
    ORDER BY period
  `;
  
  return await sequelize.query(query, {
    replacements: { sensorId, startTime, endTime },
    type: sequelize.QueryTypes.SELECT
  });
};

module.exports = SensorData;
