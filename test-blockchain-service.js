/**
 * Test Script for Smart City OS Blockchain Integration
 * This script tests the real blockchain service and fixes IDL issues
 */

const { Keypair } = require('@solana/web3.js');
const RealBlockchainService = require('./backend/services/realBlockchainService');
const path = require('path');
const fs = require('fs');

async function testBlockchainService() {
  console.log('🧪 Testing Smart City OS Blockchain Integration...\n');

  try {
    // Generate a test keypair for devnet
    console.log('📝 Generating test keypair for devnet...');
    const testKeypair = Keypair.generate();
    const secretKeyArray = Array.from(testKeypair.secretKey);
    
    // Set environment variable for the service
    process.env.SOLANA_AUTHORITY_SECRET_KEY = JSON.stringify(secretKeyArray);
    process.env.SOLANA_NETWORK = 'devnet';
    process.env.SOLANA_RPC_URL = 'https://api.devnet.solana.com';
    
    console.log(`   Authority Pubkey: ${testKeypair.publicKey.toString()}`);
    
    // Test service initialization
    console.log('\n🔧 Initializing Real Blockchain Service...');
    const blockchainService = new RealBlockchainService();
    const initResult = await blockchainService.initialize();
    
    if (!initResult.success) {
      throw new Error(`Service initialization failed: ${initResult.error}`);
    }
    
    console.log('✅ Service initialized successfully');
    
    // Test PDA derivation
    console.log('\n📍 Testing PDA derivation...');
    const testLocation = 'TestDowntown';
    const testSensorId = 'TEST_AQ001';
    
    const pdas = blockchainService.derivePDAs(testLocation, testSensorId);
    console.log(`   Air Quality PDA: ${pdas.airQualityPDA.toString()}`);
    console.log(`   Contract PDA: ${pdas.contractPDA.toString()}`);
    
    // Test air quality data update (should work even with IDL issues)
    console.log('\n🌬️ Testing air quality data update...');
    const testAirQualityData = {
      aqi: 75,
      pm25: 12.5,
      pm10: 18.2,
      co2: 410.0,
      humidity: 65.5,
      temperature: 22.8
    };
    
    const updateResult = await blockchainService.updateAirQuality(
      testLocation,
      testSensorId,
      testAirQualityData
    );
    
    console.log('Update Result:', updateResult);
    
    // Test account info retrieval
    console.log('\n📊 Testing account info retrieval...');
    const accountInfo = await blockchainService.getAccountInfo(testLocation, testSensorId);
    console.log('Account Info:', accountInfo);
    
    // Test service status
    console.log('\n📈 Testing service status...');
    const status = blockchainService.getServiceStatus();
    console.log('Service Status:', status);
    
    console.log('\n🎉 Blockchain service test completed successfully!');
    
  } catch (error) {
    console.error('❌ Blockchain service test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testBlockchainService().catch(console.error);
}

module.exports = { testBlockchainService };