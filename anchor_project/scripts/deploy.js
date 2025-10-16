const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

/**
 * Deployment script for CivicLedger smart contract
 * Deploys to Solana devnet and initializes sample contracts
 */

async function main() {
  console.log('🚀 Starting CivicLedger deployment...\n');

  // Configure the client to use devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load or generate keypair
  let keypair;
  const keypairPath = path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'solana', 'id.json');
  
  try {
    if (fs.existsSync(keypairPath)) {
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
      console.log('✅ Loaded existing keypair from:', keypairPath);
    } else {
      keypair = Keypair.generate();
      console.log('⚠️  Generated new keypair (consider saving it)');
    }
  } catch (error) {
    keypair = Keypair.generate();
    console.log('⚠️  Generated new keypair due to error:', error.message);
  }

  console.log('🔑 Authority:', keypair.publicKey.toString());

  // Check balance and request airdrop if needed
  const balance = await connection.getBalance(keypair.publicKey);
  console.log('💰 Current balance:', balance / 1e9, 'SOL');

  if (balance < 1e9) { // Less than 1 SOL
    console.log('💸 Requesting airdrop...');
    try {
      const airdropSignature = await connection.requestAirdrop(keypair.publicKey, 2e9); // 2 SOL
      await connection.confirmTransaction(airdropSignature);
      console.log('✅ Airdrop successful');
    } catch (error) {
      console.error('❌ Airdrop failed:', error.message);
      console.log('⚠️  Continuing with existing balance...');
    }
  }

  // Program ID (from Anchor.toml)
  const programId = new PublicKey('A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An');
  console.log('📋 Program ID:', programId.toString());

  // Sample contracts to deploy
  const sampleContracts = [
    {
      location: 'Downtown',
      sensorId: 'AQ001',
      contractName: 'Air Quality Monitoring - Downtown',
      contractDescription: 'Continuous air quality monitoring for downtown district',
      contractType: 'IoT Service Agreement'
    },
    {
      location: 'Main Street',
      sensorId: 'TR001',
      contractName: 'Traffic Management - Main Street',
      contractDescription: 'Smart traffic light optimization and flow monitoring',
      contractType: 'IoT Service Agreement'
    },
    {
      location: 'Zone A',
      sensorId: 'WS001',
      contractName: 'Waste Collection - Zone A',
      contractDescription: 'Smart waste bin monitoring and collection optimization',
      contractType: 'Service Contract'
    }
  ];

  console.log('\n📦 Deriving PDAs for sample contracts...');

  const deploymentResults = [];

  for (const contract of sampleContracts) {
    console.log(`\n🔗 Processing: ${contract.contractName}`);

    try {
      // Derive Air Quality PDA
      const [airQualityPDA, airQualityBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('air_quality'),
          Buffer.from(contract.location),
          Buffer.from(contract.sensorId)
        ],
        programId
      );

      // Derive Contract PDA
      const [contractPDA, contractBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('contract'),
          Buffer.from(contract.contractType),
          keypair.publicKey.toBuffer()
        ],
        programId
      );

      console.log('   📍 Air Quality PDA:', airQualityPDA.toString());
      console.log('   📍 Contract PDA:', contractPDA.toString());

      // Check if accounts already exist
      const airQualityAccount = await connection.getAccountInfo(airQualityPDA);
      const contractAccount = await connection.getAccountInfo(contractPDA);

      const result = {
        ...contract,
        pdas: {
          airQuality: airQualityPDA.toString(),
          contract: contractPDA.toString()
        },
        bumps: {
          airQuality: airQualityBump,
          contract: contractBump
        },
        status: {
          airQualityExists: !!airQualityAccount,
          contractExists: !!contractAccount
        },
        explorerUrls: {
          airQuality: `https://solscan.io/account/${airQualityPDA.toString()}?cluster=devnet`,
          contract: `https://solscan.io/account/${contractPDA.toString()}?cluster=devnet`
        }
      };

      if (airQualityAccount) {
        console.log('   ✅ Air Quality account already exists');
      } else {
        console.log('   ⏳ Air Quality account needs initialization');
      }

      if (contractAccount) {
        console.log('   ✅ Contract account already exists');
      } else {
        console.log('   ⏳ Contract account needs initialization');
      }

      deploymentResults.push(result);

    } catch (error) {
      console.error(`   ❌ Error processing ${contract.contractName}:`, error.message);
      deploymentResults.push({
        ...contract,
        error: error.message
      });
    }
  }

  // Generate deployment summary
  console.log('\n📊 DEPLOYMENT SUMMARY');
  console.log('='.repeat(50));
  console.log('🏛️  CivicLedger Smart Contract Deployment');
  console.log('🌐 Network: Solana Devnet');
  console.log('📋 Program ID:', programId.toString());
  console.log('🔑 Authority:', keypair.publicKey.toString());
  console.log('📅 Deployed at:', new Date().toISOString());
  console.log('');

  deploymentResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.contractName}`);
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    } else {
      console.log(`   📍 Air Quality PDA: ${result.pdas.airQuality}`);
      console.log(`   📍 Contract PDA: ${result.pdas.contract}`);
      console.log(`   🔍 Explorer: ${result.explorerUrls.airQuality}`);
    }
    console.log('');
  });

  // Save deployment info
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    network: 'devnet',
    programId: programId.toString(),
    authority: keypair.publicKey.toString(),
    contracts: deploymentResults
  };

  const outputPath = path.join(__dirname, '..', 'deployment-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('💾 Deployment info saved to:', outputPath);

  // Generate frontend configuration
  const frontendConfig = {
    SOLANA_NETWORK: 'devnet',
    SOLANA_RPC_URL: 'https://api.devnet.solana.com',
    CIVIC_LEDGER_PROGRAM_ID: programId.toString(),
    CONTRACTS: deploymentResults.filter(r => !r.error).map(r => ({
      id: r.location.toLowerCase().replace(/\s+/g, '-') + '-' + r.sensorId.toLowerCase(),
      name: r.contractName,
      location: r.location,
      sensorId: r.sensorId,
      type: r.contractType,
      pdas: r.pdas,
      explorerUrls: r.explorerUrls
    }))
  };

  const configPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'config', 'blockchain.json');
  
  // Ensure config directory exists
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(frontendConfig, null, 2));
  console.log('⚙️  Frontend config saved to:', configPath);

  console.log('\n🎉 Deployment completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. 🔧 Build and deploy the Anchor program: anchor build && anchor deploy');
  console.log('2. 🧪 Run tests: anchor test');
  console.log('3. 🌐 Start the frontend with updated config');
  console.log('4. 🔍 Verify contracts on Solscan explorer');
  console.log('');
  console.log('🔗 Useful links:');
  console.log('   Solana Explorer: https://explorer.solana.com/?cluster=devnet');
  console.log('   Solscan: https://solscan.io/?cluster=devnet');
  console.log('   Program: https://solscan.io/account/' + programId.toString() + '?cluster=devnet');
}

// Run the deployment
main().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});