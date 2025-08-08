const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Sensor = require('./Sensor');
const User = require('./User');

const Alert = sequelize.define('Alert', {
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
  type: {
    type: DataTypes.ENUM,
    values: ['threshold_violation', 'sensor_offline', 'data_anomaly', 'maintenance_required', 'system_error'],
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM,
    values: ['low', 'medium', 'high', 'critical'],
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'acknowledged', 'resolved', 'dismissed'],
    defaultValue: 'active'
  },
  acknowledgedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  acknowledgedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notificationsSent: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 10
    }
  }
}, {
  indexes: [
    {
      fields: ['sensorId', 'status']
    },
    {
      fields: ['severity', 'status']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['type', 'status']
    }
  ]
});

// Define associations
Alert.belongsTo(Sensor, { foreignKey: 'sensorId', as: 'sensor' });
Alert.belongsTo(User, { foreignKey: 'acknowledgedBy', as: 'acknowledgedByUser' });
Alert.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolvedByUser' });

Sensor.hasMany(Alert, { foreignKey: 'sensorId', as: 'alerts' });
User.hasMany(Alert, { foreignKey: 'acknowledgedBy', as: 'acknowledgedAlerts' });
User.hasMany(Alert, { foreignKey: 'resolvedBy', as: 'resolvedAlerts' });

// Instance methods
Alert.prototype.acknowledge = async function(userId, notes = null) {
  return await this.update({
    status: 'acknowledged',
    acknowledgedBy: userId,
    acknowledgedAt: new Date(),
    resolutionNotes: notes
  });
};

Alert.prototype.resolve = async function(userId, notes = null) {
  return await this.update({
    status: 'resolved',
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolutionNotes: notes
  });
};

Alert.prototype.dismiss = async function(userId, notes = null) {
  return await this.update({
    status: 'dismissed',
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolutionNotes: notes
  });
};

// Class methods
Alert.createFromSensorData = async function(sensorId, alertData) {
  const sensor = await Sensor.findByPk(sensorId);
  if (!sensor) throw new Error('Sensor not found');
  
  const alert = await this.create({
    sensorId,
    type: alertData.type,
    severity: alertData.severity,
    title: alertData.title || `${alertData.type} - ${sensor.name}`,
    description: alertData.description,
    data: alertData.data || {},
    priority: Alert.calculatePriority(alertData.severity, alertData.type)
  });
  
  return alert;
};

Alert.calculatePriority = function(severity, type) {
  const severityWeights = {
    'critical': 10,
    'high': 7,
    'medium': 4,
    'low': 1
  };
  
  const typeWeights = {
    'sensor_offline': 2,
    'threshold_violation': 1,
    'system_error': 3,
    'maintenance_required': 0.5,
    'data_anomaly': 1
  };
  
  return Math.min(10, (severityWeights[severity] || 1) * (typeWeights[type] || 1));
};

Alert.getActiveAlerts = async function(filters = {}) {
  const where = { status: 'active' };
  
  if (filters.severity) {
    where.severity = filters.severity;
  }
  
  if (filters.type) {
    where.type = filters.type;
  }
  
  if (filters.sensorId) {
    where.sensorId = filters.sensorId;
  }
  
  return await this.findAll({
    where,
    order: [['priority', 'DESC'], ['createdAt', 'DESC']],
    include: [
      {
        model: Sensor,
        as: 'sensor'
      },
      {
        model: User,
        as: 'acknowledgedByUser',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }
    ]
  });
};

Alert.getAlertStats = async function(timeRange = '24h') {
  const timeMap = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30
  };
  
  const hours = timeMap[timeRange] || 24;
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const stats = await this.findAll({
    where: {
      createdAt: {
        [sequelize.Sequelize.Op.gte]: startTime
      }
    },
    attributes: [
      'severity',
      'status',
      [sequelize.fn('COUNT', '*'), 'count']
    ],
    group: ['severity', 'status'],
    raw: true
  });
  
  return stats;
};

module.exports = Alert;
