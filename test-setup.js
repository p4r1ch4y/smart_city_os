#!/usr/bin/env node

/**
 * Smart City OS Setup Test Script
 * Tests the basic functionality of the backend API
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE = 'http://localhost:3000';
const TEST_USER = {
  username: 'testadmin',
  email: 'admin@smartcity.test',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'Admin',
  role: 'admin'
};

const TEST_SENSOR = {
  sensorId: 'test_001',
  name: 'Test Traffic Sensor',
  type: 'traffic',
  location: {
    latitude: 40.7589,
    longitude: -73.9851,
    address: 'Times Square, NYC'
  },
  metadata: {
    test: true
  }
};

class SetupTester {
  constructor() {
    this.authToken = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`.cyan);
    try {
      await testFn();
      console.log(`✅ PASS: ${name}`.green);
      this.testResults.passed++;
      this.testResults.tests.push({ name, status: 'PASS' });
    } catch (error) {
      console.log(`❌ FAIL: ${name}`.red);
      console.log(`   Error: ${error.message}`.red);
      this.testResults.failed++;
      this.testResults.tests.push({ name, status: 'FAIL', error: error.message });
    }
  }

  async testHealthCheck() {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.status || response.data.status !== 'OK') {
      throw new Error('Health check did not return OK status');
    }
  }

  async testUserRegistration() {
    const response = await axios.post(`${API_BASE}/api/auth/register`, TEST_USER);
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.tokens || !response.data.tokens.accessToken) {
      throw new Error('Registration did not return access token');
    }
    this.authToken = response.data.tokens.accessToken;
  }

  async testUserLogin() {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.tokens || !response.data.tokens.accessToken) {
      throw new Error('Login did not return access token');
    }
    this.authToken = response.data.tokens.accessToken;
  }

  async testUserProfile() {
    const response = await axios.get(`${API_BASE}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.user || response.data.user.email !== TEST_USER.email) {
      throw new Error('Profile data does not match registered user');
    }
  }

  async testSensorCreation() {
    const response = await axios.post(`${API_BASE}/api/sensors`, TEST_SENSOR, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.sensor || response.data.sensor.sensorId !== TEST_SENSOR.sensorId) {
      throw new Error('Sensor creation did not return correct sensor data');
    }
  }

  async testSensorDataSubmission() {
    const sensorData = {
      sensorId: TEST_SENSOR.sensorId,
      data: {
        vehicle_count: 45,
        average_speed: 35.5,
        congestion_level: 25.0
      },
      quality: 'good'
    };

    const response = await axios.post(`${API_BASE}/api/sensors/data`, sensorData);
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }
    if (!response.data.data) {
      throw new Error('Sensor data submission did not return data confirmation');
    }
  }

  async testSensorRetrieval() {
    const response = await axios.get(`${API_BASE}/api/sensors`, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.sensors || !Array.isArray(response.data.sensors)) {
      throw new Error('Sensor retrieval did not return sensors array');
    }
    
    const testSensor = response.data.sensors.find(s => s.sensorId === TEST_SENSOR.sensorId);
    if (!testSensor) {
      throw new Error('Test sensor not found in sensors list');
    }
  }

  async cleanup() {
    try {
      // Try to delete the test sensor (if endpoint exists)
      await axios.delete(`${API_BASE}/api/sensors/${TEST_SENSOR.sensorId}`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50).cyan);
    console.log('📊 TEST RESULTS'.cyan.bold);
    console.log('='.repeat(50).cyan);
    
    console.log(`✅ Passed: ${this.testResults.passed}`.green);
    console.log(`❌ Failed: ${this.testResults.failed}`.red);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:'.red.bold);
      this.testResults.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => console.log(`   • ${t.name}: ${t.error}`.red));
    }
    
    console.log('\n' + '='.repeat(50).cyan);
  }

  async run() {
    console.log('🚀 Smart City OS Setup Test'.cyan.bold);
    console.log('Testing backend API functionality...\n');

    await this.runTest('Health Check', () => this.testHealthCheck());
    await this.runTest('User Registration', () => this.testUserRegistration());
    await this.runTest('User Login', () => this.testUserLogin());
    await this.runTest('User Profile', () => this.testUserProfile());
    await this.runTest('Sensor Creation', () => this.testSensorCreation());
    await this.runTest('Sensor Data Submission', () => this.testSensorDataSubmission());
    await this.runTest('Sensor Retrieval', () => this.testSensorRetrieval());

    await this.cleanup();
    this.printResults();

    if (this.testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Your Smart City OS setup is working correctly.'.green.bold);
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please check your setup.'.yellow.bold);
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new SetupTester();
  tester.run().catch(error => {
    console.error('❌ Test runner failed:'.red, error.message);
    process.exit(1);
  });
}

module.exports = SetupTester;
