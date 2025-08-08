#!/usr/bin/env node

/**
 * Comprehensive Smart City OS System Test
 * Tests the complete system including backend, frontend, and IoT simulation
 */

const axios = require('axios');
const colors = require('colors');
const { spawn } = require('child_process');

const API_BASE = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:3001';

class SystemTester {
  constructor() {
    this.processes = [];
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

  async startBackend() {
    console.log('🚀 Starting backend server...'.yellow);
    return new Promise((resolve, reject) => {
      const backend = spawn('npm', ['run', 'dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let output = '';
      backend.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Smart City OS Server running')) {
          console.log('✅ Backend server started'.green);
          resolve(backend);
        }
      });

      backend.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE')) {
          console.log('⚠️  Backend already running on port 3000'.yellow);
          resolve(null);
        } else if (!error.includes('warning')) {
          console.error('Backend error:', error);
        }
      });

      setTimeout(() => {
        reject(new Error('Backend startup timeout'));
      }, 30000);

      this.processes.push(backend);
    });
  }

  async startFrontend() {
    console.log('🎨 Starting frontend server...'.yellow);
    return new Promise((resolve, reject) => {
      const frontend = spawn('npm', ['start'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: './frontend',
        env: { ...process.env, BROWSER: 'none' }
      });

      let output = '';
      frontend.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('webpack compiled') || output.includes('Local:')) {
          console.log('✅ Frontend server started'.green);
          resolve(frontend);
        }
      });

      frontend.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE')) {
          console.log('⚠️  Frontend already running on port 3001'.yellow);
          resolve(null);
        }
      });

      setTimeout(() => {
        reject(new Error('Frontend startup timeout'));
      }, 60000);

      this.processes.push(frontend);
    });
  }

  async startIoTSimulation() {
    console.log('📡 Starting IoT simulation...'.yellow);
    return new Promise((resolve, reject) => {
      const iot = spawn('python3', ['main.py', '--duration', '5'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: './iot-simulation'
      });

      let output = '';
      iot.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Simulation started')) {
          console.log('✅ IoT simulation started'.green);
          resolve(iot);
        }
      });

      iot.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('warning')) {
          console.error('IoT simulation error:', error);
        }
      });

      setTimeout(() => {
        resolve(iot); // Don't fail if IoT sim takes time
      }, 10000);

      this.processes.push(iot);
    });
  }

  async testBackendHealth() {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
  }

  async testFrontendAccess() {
    const response = await axios.get(FRONTEND_URL);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.includes('Smart City OS')) {
      throw new Error('Frontend does not contain expected content');
    }
  }

  async testUserRegistration() {
    const testUser = {
      username: 'testuser',
      email: 'test@smartcity.local',
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
      role: 'citizen'
    };

    const response = await axios.post(`${API_BASE}/api/auth/register`, testUser);
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }
    
    this.authToken = response.data.tokens.accessToken;
  }

  async testSensorCreation() {
    const testSensor = {
      sensorId: 'test_sensor_001',
      name: 'Test Sensor',
      type: 'traffic',
      location: {
        latitude: 40.7589,
        longitude: -73.9851,
        address: 'Test Location'
      }
    };

    const response = await axios.post(`${API_BASE}/api/sensors`, testSensor, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });
    
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }
  }

  async testSensorDataSubmission() {
    const sensorData = {
      sensorId: 'test_sensor_001',
      data: {
        vehicle_count: 42,
        average_speed: 35.5,
        congestion_level: 25.0
      },
      quality: 'good'
    };

    const response = await axios.post(`${API_BASE}/api/sensors/data`, sensorData);
    if (response.status !== 201) {
      throw new Error(`Expected status 201, got ${response.status}`);
    }
  }

  async testRealtimeConnection() {
    // Test WebSocket connection (simplified)
    const io = require('socket.io-client');
    const socket = io(`ws://localhost:3000`);
    
    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('   WebSocket connected'.gray);
        socket.disconnect();
        resolve();
      });
      
      socket.on('connect_error', (error) => {
        reject(new Error(`WebSocket connection failed: ${error.message}`));
      });
      
      setTimeout(() => {
        socket.disconnect();
        reject(new Error('WebSocket connection timeout'));
      }, 5000);
    });
  }

  async waitForServices() {
    console.log('⏳ Waiting for services to be ready...'.yellow);
    
    // Wait for backend
    for (let i = 0; i < 30; i++) {
      try {
        await axios.get(`${API_BASE}/health`, { timeout: 1000 });
        break;
      } catch (error) {
        if (i === 29) throw new Error('Backend not ready after 30 seconds');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Wait for frontend
    for (let i = 0; i < 30; i++) {
      try {
        await axios.get(FRONTEND_URL, { timeout: 1000 });
        break;
      } catch (error) {
        if (i === 29) throw new Error('Frontend not ready after 30 seconds');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  cleanup() {
    console.log('\n🧹 Cleaning up processes...'.yellow);
    this.processes.forEach(proc => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM');
      }
    });
  }

  printResults() {
    console.log('\n' + '='.repeat(60).cyan);
    console.log('📊 SMART CITY OS SYSTEM TEST RESULTS'.cyan.bold);
    console.log('='.repeat(60).cyan);
    
    console.log(`✅ Passed: ${this.testResults.passed}`.green);
    console.log(`❌ Failed: ${this.testResults.failed}`.red);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:'.red.bold);
      this.testResults.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => console.log(`   • ${t.name}: ${t.error}`.red));
    }
    
    console.log('\n' + '='.repeat(60).cyan);
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Your Smart City OS is fully functional!'.green.bold);
      console.log('\n🌐 Access your application:'.cyan);
      console.log(`   • Frontend: ${FRONTEND_URL}`.white);
      console.log(`   • Backend API: ${API_BASE}`.white);
      console.log(`   • Health Check: ${API_BASE}/health`.white);
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.'.yellow.bold);
    }
  }

  async run() {
    console.log('🏙️  SMART CITY OS COMPREHENSIVE SYSTEM TEST'.cyan.bold);
    console.log('Testing complete end-to-end functionality...\n');

    try {
      // Start services
      await this.startBackend();
      await this.startFrontend();
      
      // Wait for services to be ready
      await this.waitForServices();
      
      // Run tests
      await this.runTest('Backend Health Check', () => this.testBackendHealth());
      await this.runTest('Frontend Access', () => this.testFrontendAccess());
      await this.runTest('User Registration', () => this.testUserRegistration());
      await this.runTest('Sensor Creation', () => this.testSensorCreation());
      await this.runTest('Sensor Data Submission', () => this.testSensorDataSubmission());
      await this.runTest('Real-time Connection', () => this.testRealtimeConnection());
      
      // Start IoT simulation for demo
      await this.startIoTSimulation();
      
      this.printResults();
      
      if (this.testResults.failed === 0) {
        console.log('\n🚀 System is running! Press Ctrl+C to stop all services.'.green.bold);
        
        // Keep running until interrupted
        process.on('SIGINT', () => {
          console.log('\n\n👋 Shutting down Smart City OS...'.yellow);
          this.cleanup();
          process.exit(0);
        });
        
        // Keep the process alive
        setInterval(() => {}, 1000);
      } else {
        this.cleanup();
        process.exit(1);
      }
      
    } catch (error) {
      console.error('\n💥 System test failed:'.red.bold, error.message);
      this.cleanup();
      process.exit(1);
    }
  }
}

// Run the system test
if (require.main === module) {
  const tester = new SystemTester();
  tester.run().catch(error => {
    console.error('💥 Test runner failed:'.red, error.message);
    process.exit(1);
  });
}

module.exports = SystemTester;
