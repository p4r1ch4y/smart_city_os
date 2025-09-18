const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * Advanced Analytics Routes for Smart City OS
 * Integrates with the enhanced analytics service for AI-powered predictions
 */

// Advanced prediction endpoint
router.get('/predict/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { hours = 24, method = 'advanced' } = req.query;

    // Validate prediction type
    const validTypes = ['traffic', 'energy', 'air_quality', 'waste', 'water'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid prediction type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Get historical data (mock for now, would come from database)
    const historicalData = generateMockHistoricalData(type, 168); // 7 days of hourly data

    // Call analytics service with advanced method
    const analyticsResponse = await axios.post('http://localhost:5000/predict', {
      data: historicalData,
      type: type,
      hours: parseInt(hours),
      method: method // 'simple', 'advanced', or 'arima'
    });

    if (analyticsResponse.data.success) {
      res.json({
        success: true,
        data: {
          type: type,
          method: method,
          predictions: analyticsResponse.data.predictions,
          confidence: analyticsResponse.data.confidence || 0.85,
          historical_data: historicalData.slice(-24), // Last 24 hours
          metadata: {
            prediction_horizon: `${hours} hours`,
            model_used: method,
            data_points_used: historicalData.length,
            generated_at: new Date().toISOString()
          }
        }
      });
    } else {
      throw new Error(analyticsResponse.data.error || 'Prediction failed');
    }
  } catch (error) {
    console.error('Advanced prediction error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate advanced predictions',
      details: error.message
    });
  }
});

// Multi-sensor correlation analysis
router.get('/correlations', async (req, res) => {
  try {
    const { sensors = 'all', timeframe = '24h' } = req.query;

    // Generate correlation data
    const correlationData = generateCorrelationMatrix(sensors, timeframe);

    res.json({
      success: true,
      data: {
        correlations: correlationData,
        insights: generateCorrelationInsights(correlationData),
        timeframe: timeframe,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Correlation analysis error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate correlation analysis'
    });
  }
});

// Anomaly detection endpoint
router.get('/anomalies/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { threshold = 2.0, window = '1h' } = req.query;

    // Get recent data for anomaly detection
    const recentData = generateMockHistoricalData(type, 48); // 48 hours

    // Simple anomaly detection using statistical methods
    const anomalies = detectAnomalies(recentData, parseFloat(threshold));

    res.json({
      success: true,
      data: {
        type: type,
        anomalies: anomalies,
        threshold: parseFloat(threshold),
        window: window,
        total_anomalies: anomalies.length,
        severity_breakdown: {
          critical: anomalies.filter(a => a.severity === 'critical').length,
          warning: anomalies.filter(a => a.severity === 'warning').length,
          info: anomalies.filter(a => a.severity === 'info').length
        },
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Anomaly detection error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to detect anomalies'
    });
  }
});

// City-wide optimization recommendations
router.get('/optimize', async (req, res) => {
  try {
    const { focus = 'all' } = req.query;

    // Generate optimization recommendations
    const recommendations = generateOptimizationRecommendations(focus);

    res.json({
      success: true,
      data: {
        recommendations: recommendations,
        focus_area: focus,
        potential_savings: calculatePotentialSavings(recommendations),
        implementation_priority: rankRecommendations(recommendations),
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Optimization error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate optimization recommendations'
    });
  }
});

// Helper functions
function generateMockHistoricalData(type, hours) {
  const data = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
    let value;
    
    switch (type) {
      case 'traffic':
        // Traffic patterns with rush hour peaks
        const hour = timestamp.getHours();
        const baseTraffic = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 80 : 40;
        value = baseTraffic + Math.random() * 20 - 10;
        break;
      case 'energy':
        // Energy consumption patterns
        const energyHour = timestamp.getHours();
        const baseEnergy = energyHour >= 18 && energyHour <= 22 ? 150 : 100;
        value = baseEnergy + Math.random() * 30 - 15;
        break;
      case 'air_quality':
        // Air quality (AQI)
        value = 45 + Math.random() * 30 + (Math.sin(i / 12) * 10);
        break;
      default:
        value = 50 + Math.random() * 40;
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.max(0, value),
      hour: timestamp.getHours()
    });
  }
  
  return data.map(d => d.value);
}

function generateCorrelationMatrix(sensors, timeframe) {
  const sensorTypes = ['traffic', 'energy', 'air_quality', 'noise', 'waste'];
  const correlations = {};
  
  sensorTypes.forEach(sensor1 => {
    correlations[sensor1] = {};
    sensorTypes.forEach(sensor2 => {
      if (sensor1 === sensor2) {
        correlations[sensor1][sensor2] = 1.0;
      } else {
        // Generate realistic correlations
        let correlation = Math.random() * 0.8 - 0.4;
        
        // Some known correlations
        if ((sensor1 === 'traffic' && sensor2 === 'air_quality') ||
            (sensor1 === 'air_quality' && sensor2 === 'traffic')) {
          correlation = 0.65 + Math.random() * 0.2;
        }
        if ((sensor1 === 'energy' && sensor2 === 'traffic') ||
            (sensor1 === 'traffic' && sensor2 === 'energy')) {
          correlation = 0.45 + Math.random() * 0.2;
        }
        
        correlations[sensor1][sensor2] = Math.round(correlation * 100) / 100;
      }
    });
  });
  
  return correlations;
}

function generateCorrelationInsights(correlations) {
  const insights = [];
  
  Object.keys(correlations).forEach(sensor1 => {
    Object.keys(correlations[sensor1]).forEach(sensor2 => {
      if (sensor1 !== sensor2) {
        const correlation = correlations[sensor1][sensor2];
        if (Math.abs(correlation) > 0.6) {
          insights.push({
            sensors: [sensor1, sensor2],
            correlation: correlation,
            strength: Math.abs(correlation) > 0.8 ? 'strong' : 'moderate',
            type: correlation > 0 ? 'positive' : 'negative',
            insight: `${sensor1} and ${sensor2} show ${correlation > 0 ? 'positive' : 'negative'} correlation (${correlation})`
          });
        }
      }
    });
  });
  
  return insights;
}

function detectAnomalies(data, threshold) {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  const anomalies = [];
  
  data.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > threshold) {
      const severity = zScore > 3 ? 'critical' : zScore > 2.5 ? 'warning' : 'info';
      anomalies.push({
        index: index,
        value: value,
        z_score: Math.round(zScore * 100) / 100,
        deviation: Math.round((value - mean) * 100) / 100,
        severity: severity,
        timestamp: new Date(Date.now() - (data.length - index) * 60 * 60 * 1000).toISOString()
      });
    }
  });
  
  return anomalies;
}

function generateOptimizationRecommendations(focus) {
  const recommendations = [
    {
      id: 'traffic_optimization',
      category: 'traffic',
      title: 'Optimize Traffic Signal Timing',
      description: 'Adjust traffic light timing based on real-time flow data',
      impact: 'high',
      effort: 'medium',
      savings: { type: 'time', value: '15%', unit: 'travel_time_reduction' }
    },
    {
      id: 'energy_efficiency',
      category: 'energy',
      title: 'Smart Street Lighting',
      description: 'Implement adaptive lighting based on pedestrian and vehicle presence',
      impact: 'medium',
      effort: 'low',
      savings: { type: 'cost', value: '25%', unit: 'energy_cost_reduction' }
    },
    {
      id: 'waste_route_optimization',
      category: 'waste',
      title: 'Optimize Waste Collection Routes',
      description: 'Use AI to plan efficient collection routes based on bin fill levels',
      impact: 'medium',
      effort: 'medium',
      savings: { type: 'cost', value: '20%', unit: 'operational_cost_reduction' }
    }
  ];
  
  return focus === 'all' ? recommendations : recommendations.filter(r => r.category === focus);
}

function calculatePotentialSavings(recommendations) {
  return {
    total_cost_savings: '30%',
    time_savings: '15%',
    energy_savings: '25%',
    environmental_impact: 'Reduced CO2 emissions by 18%'
  };
}

function rankRecommendations(recommendations) {
  return recommendations
    .map(r => ({
      ...r,
      priority_score: (r.impact === 'high' ? 3 : r.impact === 'medium' ? 2 : 1) +
                     (r.effort === 'low' ? 3 : r.effort === 'medium' ? 2 : 1)
    }))
    .sort((a, b) => b.priority_score - a.priority_score)
    .map(r => ({ id: r.id, title: r.title, priority_score: r.priority_score }));
}

module.exports = router;
