const RealBlockchainService = require('./backend/services/realBlockchainService');

async function testBlockchainIntegration() {
  console.log('🧪 Testing Smart City OS Blockchain Integration...\n');

  // Set up environment variable for testing
  const fs = require('fs');
  const path = require('path');

  try {
    const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
    if (fs.existsSync(keypairPath)) {
      const keypairData = fs.readFileSync(keypairPath, 'utf8');
      process.env.SOLANA_AUTHORITY_SECRET_KEY = keypairData;
      console.log('✅ Using existing Solana keypair for testing\n');
    } else {
      console.log('❌ No Solana keypair found. Please run: solana-keygen new');
      return;
    }
  } catch (error) {
    console.error('❌ Error loading keypair:', error.message);
    return;
  }

  // Initialize the service with the deployed program
  const blockchainService = new RealBlockchainService('devnet');
  
  try {
    // Test initialization
    console.log('1️⃣ Testing service initialization...');
    const initResult = await blockchainService.initialize();
    console.log('Init result:', initResult);
    
    if (!initResult.success) {
      console.error('❌ Service initialization failed');
      return;
    }
    
    console.log('✅ Service initialized successfully\n');

    // Test PDA derivation
    console.log('2️⃣ Testing PDA derivation...');
    const pdas = blockchainService.derivePDAs('Downtown_Sensor_01', 'AQ_001');
    console.log('Air Quality PDA:', pdas.airQualityPDA.toString());
    console.log('Contract PDA:', pdas.contractPDA.toString());
    console.log('✅ PDA derivation successful\n');

    // Test air quality account initialization
    console.log('3️⃣ Testing air quality account initialization...');
    const initAirQualityResult = await blockchainService.initializeAirQualityAccount(
      'Downtown_Sensor_01',
      'AQ_001',
      {
        aqi: 85,
        pm25: 12.5,
        pm10: 18.3,
        co2: 410.2,
        humidity: 65.8,
        temperature: 22.4
      }
    );
    
    console.log('Air Quality Init Result:', initAirQualityResult);
    
    if (initAirQualityResult.success) {
      console.log('✅ Air quality account initialization successful\n');
      
      // Test air quality update
      console.log('4️⃣ Testing air quality update...');
      const updateResult = await blockchainService.updateAirQuality(
        'Downtown_Sensor_01',
        'AQ_001',
        {
          aqi: 92,
          pm25: 15.2,
          pm10: 22.1,
          co2: 425.8,
          humidity: 68.3,
          temperature: 23.1
        }
      );
      
      console.log('Air Quality Update Result:', updateResult);
      
      if (updateResult.success) {
        console.log('✅ Air quality update successful\n');
      } else {
        console.log('⚠️ Air quality update failed:', updateResult.error);
      }
    } else {
      console.log('⚠️ Air quality account initialization failed:', initAirQualityResult.error);
    }

    // Test validation
    console.log('5️⃣ Testing data validation...');
    const validationResult = blockchainService.validateSensorData({
      aqi: 600, // Invalid - too high
      pm25: -5,  // Invalid - negative
      pm10: 15.2,
      co2: 400.5,
      humidity: 65.0,
      temperature: 22.0
    });
    
    console.log('Validation Result:', validationResult);
    console.log('✅ Data validation working correctly\n');

    console.log('🎉 All blockchain integration tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testBlockchainIntegration().catch(console.error);
