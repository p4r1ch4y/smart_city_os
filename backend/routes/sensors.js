const express = require('express');
const Joi = require('joi');
const { Op } = require('sequelize');
const Sensor = require('../models/Sensor');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const sensorSchema = Joi.object({
  sensorId: Joi.string().required(),
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('traffic', 'waste', 'air_quality', 'noise', 'water_quality', 'energy', 'parking').required(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    address: Joi.string().optional()
  }).required(),
  address: Joi.string().max(200).optional(),
  metadata: Joi.object().optional(),
  thresholds: Joi.object().optional()
});

const sensorDataSchema = Joi.object({
  sensorId: Joi.string().required(),
  data: Joi.object().required(),
  timestamp: Joi.date().optional(),
  quality: Joi.string().valid('good', 'fair', 'poor', 'invalid').optional()
});

// Get all sensors
router.get('/', requirePermission('sensor:read'), async (req, res) => {
  try {
    const { type, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    
    const sensors = await Sensor.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: SensorData,
        as: 'readings',
        limit: 1,
        order: [['timestamp', 'DESC']]
      }]
    });
    
    // Add online status to each sensor
    const sensorsWithStatus = sensors.rows.map(sensor => ({
      ...sensor.toJSON(),
      isOnline: sensor.isOnline()
    }));
    
    res.json({
      sensors: sensorsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sensors.count,
        pages: Math.ceil(sensors.count / limit)
      }
    });
  } catch (error) {
    console.error('Get sensors error:', error);
    res.status(500).json({
      error: 'Failed to fetch sensors',
      message: error.message
    });
  }
});

// Get sensor by ID
router.get('/:id', requirePermission('sensor:read'), async (req, res) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id, {
      include: [
        {
          model: SensorData,
          as: 'readings',
          limit: 100,
          order: [['timestamp', 'DESC']]
        },
        {
          model: Alert,
          as: 'alerts',
          where: { status: 'active' },
          required: false
        }
      ]
    });
    
    if (!sensor) {
      return res.status(404).json({
        error: 'Sensor not found'
      });
    }
    
    res.json({
      ...sensor.toJSON(),
      isOnline: sensor.isOnline()
    });
  } catch (error) {
    console.error('Get sensor error:', error);
    res.status(500).json({
      error: 'Failed to fetch sensor',
      message: error.message
    });
  }
});

// Create new sensor
router.post('/', requirePermission('sensor:write'), async (req, res) => {
  try {
    const { error, value } = sensorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Check if sensor with same sensorId already exists
    const existingSensor = await Sensor.findOne({
      where: { sensorId: value.sensorId }
    });
    
    if (existingSensor) {
      return res.status(409).json({
        error: 'Sensor already exists',
        message: 'A sensor with this ID already exists'
      });
    }
    
    // Set default thresholds if not provided
    if (!value.thresholds) {
      value.thresholds = Sensor.getDefaultThresholds(value.type);
    }
    
    const sensor = await Sensor.create(value);
    
    res.status(201).json({
      message: 'Sensor created successfully',
      sensor: sensor.toJSON()
    });
  } catch (error) {
    console.error('Create sensor error:', error);
    res.status(500).json({
      error: 'Failed to create sensor',
      message: error.message
    });
  }
});

// Update sensor
router.put('/:id', requirePermission('sensor:write'), async (req, res) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) {
      return res.status(404).json({
        error: 'Sensor not found'
      });
    }
    
    const { error, value } = sensorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    await sensor.update(value);
    
    res.json({
      message: 'Sensor updated successfully',
      sensor: sensor.toJSON()
    });
  } catch (error) {
    console.error('Update sensor error:', error);
    res.status(500).json({
      error: 'Failed to update sensor',
      message: error.message
    });
  }
});

// Delete sensor
router.delete('/:id', requirePermission('sensor:delete'), async (req, res) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) {
      return res.status(404).json({
        error: 'Sensor not found'
      });
    }
    
    await sensor.destroy();
    
    res.json({
      message: 'Sensor deleted successfully'
    });
  } catch (error) {
    console.error('Delete sensor error:', error);
    res.status(500).json({
      error: 'Failed to delete sensor',
      message: error.message
    });
  }
});

// Submit sensor data
router.post('/data', async (req, res) => {
  try {
    const { error, value } = sensorDataSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Find sensor by sensorId
    const sensor = await Sensor.findOne({
      where: { sensorId: value.sensorId }
    });
    
    if (!sensor) {
      return res.status(404).json({
        error: 'Sensor not found',
        message: `No sensor found with ID: ${value.sensorId}`
      });
    }
    
    // Create sensor data record
    const sensorData = await SensorData.create({
      sensorId: sensor.id,
      data: value.data,
      timestamp: value.timestamp || new Date(),
      quality: value.quality || 'good'
    });
    
    // Update sensor heartbeat
    await sensor.updateHeartbeat();
    
    // Check for threshold violations and create alerts
    const alerts = await sensorData.checkThresholds();
    
    // Emit real-time data via WebSocket
    if (req.io) {
      req.io.emit('sensor-data', {
        sensorId: sensor.sensorId,
        data: sensorData.toJSON(),
        alerts: alerts
      });
    }
    
    // Create alert records if any violations found
    for (const alertData of alerts) {
      await Alert.createFromSensorData(sensor.id, {
        type: alertData.type,
        severity: alertData.severity,
        title: `${alertData.condition.replace('_', ' ').toUpperCase()} - ${sensor.name}`,
        description: `${alertData.metric} value ${alertData.value} ${alertData.condition.replace('_', ' ')} threshold ${alertData.threshold}`,
        data: alertData
      });
    }
    
    res.status(201).json({
      message: 'Sensor data recorded successfully',
      data: sensorData.toJSON(),
      alerts: alerts.length
    });
  } catch (error) {
    console.error('Submit sensor data error:', error);
    res.status(500).json({
      error: 'Failed to record sensor data',
      message: error.message
    });
  }
});

module.exports = router;
