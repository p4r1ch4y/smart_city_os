#!/usr/bin/env node

/**
 * Smart City OS System Status Test
 * Comprehensive test of all system components
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:3001';

class SystemStatusTester {
  constructor() {
    this.results = {
      backend: { status: 'unknown', details: {} },
      frontend: { status: 'unknown', details: {} },
      database: { status: 'unknown', details: {} },
      iot: { status: 'unknown', details: {} },
      alerts: { status: 'unknown', details: {} }
    };
  }

  async testBackendHealth() {
    try {
      const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
      this.results.backend = {
        status: 'healthy',
        details: {
          uptime: response.data.uptime,
          sensors: response.data.sensors,
          alerts: response.data.alerts,
          message: response.data.message
        }
      };
      return true;
    } catch (error) {
      this.results.backend = {
        status: 'error',
        details: { error: error.message }
      };
      return false;
    }
  }

  async testFrontendAccess() {
    try {
      const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
      const isValid = response.data.includes('Smart City OS') || response.data.includes('root');
      this.results.frontend = {
        status: isValid ? 'healthy' : 'warning',
        details: {
          accessible: true,
          contentValid: isValid,
          status: response.status
        }
      };
      return isValid;
    } catch (error) {
      this.results.frontend = {
        status: 'error',
        details: { error: error.message }
      };
      return false;
    }
  }

  async testSensorData() {
    try {
      const response = await axios.get(`${API_BASE}/api/sensors`, { timeout: 5000 });
      const sensors = response.data.sensors || [];
      
      // Check sensor types distribution
      const sensorTypes = sensors.reduce((acc, sensor) => {
        acc[sensor.type] = (acc[sensor.type] || 0) + 1;
        return acc;
      }, {});

      this.results.database = {
        status: sensors.length > 0 ? 'healthy' : 'warning',
        details: {
          totalSensors: sensors.length,
          sensorTypes: sensorTypes,
          activeSensors: sensors.filter(s => s.status === 'active').length,
          offlineSensors: sensors.filter(s => s.status === 'offline').length
        }
      };
      return sensors.length > 0;
    } catch (error) {
      this.results.database = {
        status: 'error',
        details: { error: error.message }
      };
      return false;
    }
  }

  async testAlertSystem() {
    try {
      const response = await axios.get(`${API_BASE}/api/alerts/stats`, { timeout: 5000 });
      const stats = response.data;
      
      this.results.alerts = {
        status: 'healthy',
        details: {
          totalAlerts: stats.total,
          criticalAlerts: stats.critical,
          highAlerts: stats.high,
          mediumAlerts: stats.medium,
          lowAlerts: stats.low,
          activeAlerts: stats.active
        }
      };
      return true;
    } catch (error) {
      this.results.alerts = {
        status: 'error',
        details: { error: error.message }
      };
      return false;
    }
  }

  async testAuthentication() {
    try {
      // Test login with auto-created admin user
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'admin@test.com',
        password: 'test123'
      }, { timeout: 5000 });

      if (loginResponse.status === 200 && loginResponse.data.tokens) {
        // Test profile access
        const token = loginResponse.data.tokens.accessToken;
        const profileResponse = await axios.get(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });

        this.results.iot = {
          status: 'healthy',
          details: {
            authWorking: true,
            userCreated: true,
            tokenValid: profileResponse.status === 200,
            userRole: profileResponse.data.user?.role
          }
        };
        return true;
      }
      return false;
    } catch (error) {
      this.results.iot = {
        status: 'error',
        details: { error: error.message }
      };
      return false;
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60).cyan);
    console.log('🏙️  SMART CITY OS - SYSTEM STATUS REPORT'.cyan.bold);
    console.log('='.repeat(60).cyan);

    const components = [
      { name: 'Backend API', key: 'backend', icon: '🚀' },
      { name: 'Frontend Dashboard', key: 'frontend', icon: '🎨' },
      { name: 'Database & Sensors', key: 'database', icon: '📊' },
      { name: 'Alert System', key: 'alerts', icon: '🚨' },
      { name: 'Authentication', key: 'iot', icon: '🔐' }
    ];

    components.forEach(component => {
      const result = this.results[component.key];
      const statusColor = result.status === 'healthy' ? 'green' : 
                         result.status === 'warning' ? 'yellow' : 'red';
      const statusIcon = result.status === 'healthy' ? '✅' : 
                        result.status === 'warning' ? '⚠️' : '❌';

      console.log(`\n${component.icon} ${component.name}:`);
      console.log(`   Status: ${statusIcon} ${result.status.toUpperCase()}`[statusColor]);
      
      if (result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          if (typeof value === 'object') {
            console.log(`   ${key}:`.gray);
            Object.entries(value).forEach(([subKey, subValue]) => {
              console.log(`     ${subKey}: ${subValue}`.gray);
            });
          } else {
            console.log(`   ${key}: ${value}`.gray);
          }
        });
      }
    });

    // Overall system health
    const healthyCount = Object.values(this.results).filter(r => r.status === 'healthy').length;
    const totalCount = Object.keys(this.results).length;
    const overallHealth = healthyCount / totalCount;

    console.log('\n' + '='.repeat(60).cyan);
    console.log('📈 OVERALL SYSTEM HEALTH'.cyan.bold);
    console.log('='.repeat(60).cyan);
    
    if (overallHealth >= 0.8) {
      console.log(`🎉 EXCELLENT: ${healthyCount}/${totalCount} components healthy (${(overallHealth * 100).toFixed(0)}%)`.green.bold);
    } else if (overallHealth >= 0.6) {
      console.log(`⚠️  GOOD: ${healthyCount}/${totalCount} components healthy (${(overallHealth * 100).toFixed(0)}%)`.yellow.bold);
    } else {
      console.log(`❌ NEEDS ATTENTION: ${healthyCount}/${totalCount} components healthy (${(overallHealth * 100).toFixed(0)}%)`.red.bold);
    }

    // Access URLs
    console.log('\n🌐 ACCESS POINTS:'.cyan.bold);
    console.log(`   Frontend Dashboard: ${FRONTEND_URL}`.white);
    console.log(`   Backend API: ${API_BASE}`.white);
    console.log(`   Health Check: ${API_BASE}/health`.white);
    console.log(`   API Documentation: ${API_BASE}/api`.white);

    console.log('\n' + '='.repeat(60).cyan);
  }

  async run() {
    console.log('🔍 Running Smart City OS System Status Check...\n');

    const tests = [
      { name: 'Backend Health', fn: () => this.testBackendHealth() },
      { name: 'Frontend Access', fn: () => this.testFrontendAccess() },
      { name: 'Sensor Data', fn: () => this.testSensorData() },
      { name: 'Alert System', fn: () => this.testAlertSystem() },
      { name: 'Authentication', fn: () => this.testAuthentication() }
    ];

    for (const test of tests) {
      process.stdout.write(`Testing ${test.name}... `);
      try {
        const result = await test.fn();
        console.log(result ? '✅ PASS'.green : '⚠️  WARN'.yellow);
      } catch (error) {
        console.log('❌ FAIL'.red);
      }
    }

    this.printResults();
  }
}

// Run the system status check
if (require.main === module) {
  const tester = new SystemStatusTester();
  tester.run().catch(error => {
    console.error('❌ System status check failed:'.red, error.message);
    process.exit(1);
  });
}

module.exports = SystemStatusTester;
