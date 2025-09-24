const express = require('express');
const Joi = require('joi');
const { Op } = require('sequelize');
const Alert = require('../models/Alert');
const Sensor = require('../models/Sensor');
const User = require('../models/User');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const alertActionSchema = Joi.object({
  notes: Joi.string().max(1000).optional()
});

// Get all alerts
router.get('/', requirePermission('alert:read'), async (req, res) => {
  try {
    const { 
      status = 'active', 
      severity, 
      type, 
      sensorId, 
      page = 1, 
      limit = 50,
      sortBy = 'priority',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};
    
    if (status !== 'all') where.status = status;
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (sensorId) where.sensorId = sensorId;
    
    const alerts = await Alert.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          model: Sensor,
          as: 'sensor',
          attributes: ['id', 'sensorId', 'name', 'type', 'location']
        },
        {
          model: User,
          as: 'acknowledgedByUser',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          required: false
        },
        {
          model: User,
          as: 'resolvedByUser',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          required: false
        }
      ]
    });
    
    res.json({
      alerts: alerts.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: alerts.count,
        pages: Math.ceil(alerts.count / limit)
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      message: error.message
    });
  }
});

// Get alert statistics
router.get('/stats', requirePermission('alert:read'), async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const stats = await Alert.getAlertStats(timeRange);
    
    // Get active alerts count by severity
    const activeAlerts = await Alert.findAll({
      where: { status: 'active' },
      attributes: [
        'severity',
        [Alert.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['severity'],
      raw: true
    });
    
    // Get alerts by sensor type
    const alertsBySensorType = await Alert.findAll({
      where: { status: 'active' },
      attributes: [
        [Alert.sequelize.col('sensor.type'), 'sensorType'],
        [Alert.sequelize.fn('COUNT', '*'), 'count']
      ],
      include: [{
        model: Sensor,
        as: 'sensor',
        attributes: []
      }],
      group: ['sensor.type'],
      raw: true
    });
    
    res.json({
      timeRange,
      stats,
      activeAlerts,
      alertsBySensorType
    });
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch alert statistics',
      message: error.message
    });
  }
});

// Get alert by ID
router.get('/:id', requirePermission('alert:read'), async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id, {
      include: [
        {
          model: Sensor,
          as: 'sensor'
        },
        {
          model: User,
          as: 'acknowledgedByUser',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'resolvedByUser',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }
    
    res.json(alert);
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      error: 'Failed to fetch alert',
      message: error.message
    });
  }
});

// Acknowledge alert
router.post('/:id/acknowledge', requirePermission('alert:write'), async (req, res) => {
  try {
    const { error, value } = alertActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }
    
    if (alert.status !== 'active') {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Only active alerts can be acknowledged'
      });
    }
    
    await alert.acknowledge(req.user.id, value.notes);
    
    // Emit real-time update
    if (req.io) {
      req.io.emit('alert-acknowledged', {
        alertId: alert.id,
        acknowledgedBy: req.user.username,
        timestamp: new Date()
      });
    }
    
    res.json({
      message: 'Alert acknowledged successfully',
      alert: await alert.reload({
        include: [
          { model: Sensor, as: 'sensor' },
          { model: User, as: 'acknowledgedByUser', attributes: ['id', 'username', 'firstName', 'lastName'] }
        ]
      })
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      error: 'Failed to acknowledge alert',
      message: error.message
    });
  }
});

// Resolve alert
router.post('/:id/resolve', requirePermission('alert:write'), async (req, res) => {
  try {
    const { error, value } = alertActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }
    
    if (!['active', 'acknowledged'].includes(alert.status)) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Only active or acknowledged alerts can be resolved'
      });
    }
    
    await alert.resolve(req.user.id, value.notes);
    
    // Emit real-time update
    if (req.io) {
      req.io.emit('alert-resolved', {
        alertId: alert.id,
        resolvedBy: req.user.username,
        timestamp: new Date()
      });
    }
    
    res.json({
      message: 'Alert resolved successfully',
      alert: await alert.reload({
        include: [
          { model: Sensor, as: 'sensor' },
          { model: User, as: 'resolvedByUser', attributes: ['id', 'username', 'firstName', 'lastName'] }
        ]
      })
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      error: 'Failed to resolve alert',
      message: error.message
    });
  }
});

// Dismiss alert
router.post('/:id/dismiss', requirePermission('alert:write'), async (req, res) => {
  try {
    const { error, value } = alertActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }
    
    if (!['active', 'acknowledged'].includes(alert.status)) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Only active or acknowledged alerts can be dismissed'
      });
    }
    
    await alert.dismiss(req.user.id, value.notes);
    
    // Emit real-time update
    if (req.io) {
      req.io.emit('alert-dismissed', {
        alertId: alert.id,
        dismissedBy: req.user.username,
        timestamp: new Date()
      });
    }
    
    res.json({
      message: 'Alert dismissed successfully',
      alert: await alert.reload({
        include: [
          { model: Sensor, as: 'sensor' },
          { model: User, as: 'resolvedByUser', attributes: ['id', 'username', 'firstName', 'lastName'] }
        ]
      })
    });
  } catch (error) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({
      error: 'Failed to dismiss alert',
      message: error.message
    });
  }
});

module.exports = router;