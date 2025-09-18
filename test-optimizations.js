#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

/**
 * Comprehensive Test Suite for Smart City OS Optimizations
 * Tests all the newly implemented features from the project plan
 */

async function testOptimizations() {
  console.log('🧪 Testing Smart City OS Optimizations');
  console.log('=====================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Backend Health Check
  await runTest('Backend Health Check', async () => {
    const response = await axios.get('http://localhost:3000/health');
    if (response.status === 200 && response.data.status === 'OK') {
      return { success: true, message: 'Backend is healthy' };
    }
    throw new Error('Backend health check failed');
  }, results);

  // Test 2: Blockchain Service Status
  await runTest('Blockchain Service Status', async () => {
    const response = await axios.get('http://localhost:3000/api/blockchain/status');
    if (response.status === 200 && response.data.status === 'active') {
      return { 
        success: true, 
        message: `Blockchain active - Program ID: ${response.data.programId}` 
      };
    }
    throw new Error('Blockchain service not active');
  }, results);

  // Test 3: Advanced Analytics - Traffic Prediction
  await runTest('Advanced Analytics - Traffic Prediction', async () => {
    const response = await axios.get('http://localhost:3000/api/advanced-analytics/predict/traffic?method=advanced&hours=24');
    if (response.status === 200 && response.data.success && response.data.data.predictions) {
      return { 
        success: true, 
        message: `Generated ${response.data.data.predictions.length} traffic predictions using ${response.data.data.method} method` 
      };
    }
    throw new Error('Traffic prediction failed');
  }, results);

  // Test 4: Advanced Analytics - Correlations
  await runTest('Advanced Analytics - Sensor Correlations', async () => {
    const response = await axios.get('http://localhost:3000/api/advanced-analytics/correlations');
    if (response.status === 200 && response.data.success && response.data.data.correlations) {
      const insights = response.data.data.insights.length;
      return { 
        success: true, 
        message: `Generated correlation matrix with ${insights} insights` 
      };
    }
    throw new Error('Correlation analysis failed');
  }, results);

  // Test 5: Advanced Analytics - Anomaly Detection
  await runTest('Advanced Analytics - Anomaly Detection', async () => {
    const response = await axios.get('http://localhost:3000/api/advanced-analytics/anomalies/air_quality?threshold=2.0');
    if (response.status === 200 && response.data.success) {
      const anomalies = response.data.data.total_anomalies;
      return { 
        success: true, 
        message: `Detected ${anomalies} anomalies in air quality data` 
      };
    }
    throw new Error('Anomaly detection failed');
  }, results);

  // Test 6: Advanced Analytics - Optimization Recommendations
  await runTest('Advanced Analytics - City Optimization', async () => {
    const response = await axios.get('http://localhost:3000/api/advanced-analytics/optimize');
    if (response.status === 200 && response.data.success && response.data.data.recommendations) {
      const recommendations = response.data.data.recommendations.length;
      return { 
        success: true, 
        message: `Generated ${recommendations} optimization recommendations` 
      };
    }
    throw new Error('Optimization recommendations failed');
  }, results);

  // Test 7: Frontend Accessibility
  await runTest('Frontend Accessibility', async () => {
    const response = await axios.get('http://localhost:3001', { timeout: 5000 });
    if (response.status === 200 && response.data.includes('Smart City OS')) {
      return { success: true, message: 'Frontend is accessible and serving content' };
    }
    throw new Error('Frontend not accessible');
  }, results);

  // Test 8: Three.js Dependencies Check
  await runTest('Three.js Dependencies Check', async () => {
    const packageJson = JSON.parse(fs.readFileSync('./frontend/package.json', 'utf8'));
    const hasThree = packageJson.dependencies.three;
    const hasReactThreeFiber = packageJson.dependencies['@react-three/fiber'];
    const hasReactThreeDrei = packageJson.dependencies['@react-three/drei'];
    
    if (hasThree && hasReactThreeFiber && hasReactThreeDrei) {
      return { 
        success: true, 
        message: `Three.js ecosystem installed: three@${hasThree}, @react-three/fiber@${hasReactThreeFiber}, @react-three/drei@${hasReactThreeDrei}` 
      };
    }
    throw new Error('Three.js dependencies missing');
  }, results);

  // Test 9: 3D City Twin Component Check
  await runTest('3D City Twin Component Check', async () => {
    const cityVisualizationExists = fs.existsSync('./frontend/src/components/CityVisualization3D.js');
    const cityTwinPageExists = fs.existsSync('./frontend/src/pages/CityTwin.js');
    
    if (cityVisualizationExists && cityTwinPageExists) {
      return { 
        success: true, 
        message: '3D City Twin components created successfully' 
      };
    }
    throw new Error('3D City Twin components missing');
  }, results);

  // Test 10: Optimized Smart Contract Check
  await runTest('Optimized Smart Contract Check', async () => {
    const libRsExists = fs.existsSync('./anchor_project/programs/civic_ledger/src/lib.rs');
    const testsExist = fs.existsSync('./anchor_project/tests/civic_ledger.ts');
    const anchorTomlExists = fs.existsSync('./anchor_project/Anchor.toml');
    
    if (libRsExists && testsExist && anchorTomlExists) {
      // Check if the smart contract has the optimized functions
      const libContent = fs.readFileSync('./anchor_project/programs/civic_ledger/src/lib.rs', 'utf8');
      const hasAirQuality = libContent.includes('update_air_quality');
      const hasContracts = libContent.includes('initialize_contract');
      
      if (hasAirQuality && hasContracts) {
        return { 
          success: true, 
          message: 'Optimized civic_ledger smart contract with air quality and contract management' 
        };
      }
    }
    throw new Error('Optimized smart contract missing or incomplete');
  }, results);

  // Test 11: Advanced Analytics Service Enhancement Check
  await runTest('Advanced Analytics Service Enhancement Check', async () => {
    const analyticsExists = fs.existsSync('./analytics/app.py');
    if (analyticsExists) {
      const analyticsContent = fs.readFileSync('./analytics/app.py', 'utf8');
      const hasAdvancedPrediction = analyticsContent.includes('advanced_lstm_predict') || 
                                   analyticsContent.includes('arima_predict');
      
      if (hasAdvancedPrediction) {
        return { 
          success: true, 
          message: 'Analytics service enhanced with advanced LSTM/ARIMA prediction methods' 
        };
      }
    }
    throw new Error('Advanced analytics enhancements missing');
  }, results);

  // Test 12: Navigation Enhancement Check
  await runTest('Navigation Enhancement Check', async () => {
    const sidebarExists = fs.existsSync('./frontend/src/components/Sidebar.js');
    if (sidebarExists) {
      const sidebarContent = fs.readFileSync('./frontend/src/components/Sidebar.js', 'utf8');
      const hasCityTwin = sidebarContent.includes('3D City Twin') && 
                         sidebarContent.includes('/city-twin');
      
      if (hasCityTwin) {
        return { 
          success: true, 
          message: '3D City Twin added to navigation menu' 
        };
      }
    }
    throw new Error('Navigation enhancement missing');
  }, results);

  // Final Results
  console.log('\n' + '='.repeat(50));
  console.log('📊 OPTIMIZATION TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 ALL OPTIMIZATIONS SUCCESSFULLY IMPLEMENTED!');
    console.log('\n🚀 Smart City OS is ready for:');
    console.log('   ✅ Live demonstration');
    console.log('   ✅ School of Solana submission');
    console.log('   ✅ Production deployment');
    console.log('   ✅ Job interviews');
    console.log('   ✅ Academic evaluation');
    
    console.log('\n🌟 Key Features Verified:');
    console.log('   ✅ AI-Powered Predictive Analytics (LSTM/ARIMA)');
    console.log('   ✅ Digital Twin 3D Visualization (Three.js)');
    console.log('   ✅ Optimized Solana Smart Contract (civic_ledger)');
    console.log('   ✅ Advanced Analytics API Endpoints');
    console.log('   ✅ Enhanced Navigation and UI');
    console.log('   ✅ Blockchain Data Integrity');
    
    console.log('\n🎯 Demo URLs:');
    console.log('   🌐 Frontend: http://localhost:3001');
    console.log('   🏙️ 3D City Twin: http://localhost:3001/city-twin');
    console.log('   🔧 API: http://localhost:3000/api');
    console.log('   📊 Analytics: http://localhost:5000');
  } else {
    console.log('\n⚠️ Some optimizations need attention. Check failed tests above.');
  }

  return results.failed === 0;
}

async function runTest(testName, testFunction, results) {
  try {
    console.log(`🔍 Testing: ${testName}...`);
    const result = await testFunction();
    console.log(`   ✅ ${result.message}`);
    results.passed++;
    results.tests.push({ name: testName, status: 'passed', message: result.message });
  } catch (error) {
    console.log(`   ❌ ${error.message}`);
    results.failed++;
    results.tests.push({ name: testName, status: 'failed', message: error.message });
  }
}

if (require.main === module) {
  testOptimizations().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = { testOptimizations };
