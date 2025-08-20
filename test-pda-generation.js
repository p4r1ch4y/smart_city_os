/**
 * Test PDA Generation for Smart City OS
 * This tests that PDAs are correctly "not on curve"
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');

// Test PDA generation
function testPDAGeneration() {
    console.log('🧪 Testing PDA Generation for Smart City OS\n');

    // Use the same program ID as your blockchain service
    const programId = new PublicKey('7jGiTQRkU66HczW2rSBDYbvnvMPxtsVYR72vpa9a7qF2');
    const authority = Keypair.generate();

    console.log(`📋 Program ID: ${programId.toString()}`);
    console.log(`👤 Authority: ${authority.publicKey.toString()}\n`);

    // Test data
    const testCases = [
        { location: 'Downtown', sensorId: 'AQ001' },
        { location: 'Park Area', sensorId: 'AQ002' },
        { location: 'Industrial Zone', sensorId: 'AQ003' },
    ];

    testCases.forEach((testCase, index) => {
        console.log(`🧪 Test Case ${index + 1}: ${testCase.location} - ${testCase.sensorId}`);

        try {
            // Generate Air Quality PDA (same as smart contract)
            const [airQualityPDA, airQualityBump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('air_quality'),
                    Buffer.from(testCase.location),
                    Buffer.from(testCase.sensorId)
                ],
                programId
            );

            // Generate Contract PDA
            const [contractPDA, contractBump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('contract'),
                    Buffer.from('IoT Service Agreement'),
                    authority.publicKey.toBuffer()
                ],
                programId
            );

            // Check if PDAs are on curve (they should NOT be)
            const airQualityOnCurve = PublicKey.isOnCurve(airQualityPDA.toBytes());
            const contractOnCurve = PublicKey.isOnCurve(contractPDA.toBytes());

            console.log(`   📍 Air Quality PDA: ${airQualityPDA.toString()}`);
            console.log(`   📊 Bump: ${airQualityBump}`);
            console.log(`   🔄 On Curve: ${airQualityOnCurve ? '❌ YES (ERROR!)' : '✅ NO (CORRECT!)'}`);
            
            console.log(`   📋 Contract PDA: ${contractPDA.toString()}`);
            console.log(`   📊 Bump: ${contractBump}`);
            console.log(`   🔄 On Curve: ${contractOnCurve ? '❌ YES (ERROR!)' : '✅ NO (CORRECT!)'}`);
            
            if (!airQualityOnCurve && !contractOnCurve) {
                console.log(`   ✅ SUCCESS: Both PDAs correctly NOT on curve\n`);
            } else {
                console.log(`   ❌ ERROR: One or both PDAs are on curve\n`);
            }

        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}\n`);
        }
    });

    console.log('🎯 PDA Generation Test Summary:');
    console.log('   📝 PDAs being "not on curve" is EXPECTED and CORRECT behavior');
    console.log('   🔐 This is a security feature that prevents PDAs from signing transactions');
    console.log('   ⚡ Only the program can "sign" for PDAs during instruction execution');
    console.log('   📋 If you see "not on curve" errors, check how you\'re using the PDAs');
}

// Test seed length limits
function testSeedLengths() {
    console.log('\n🧪 Testing Seed Length Limits\n');

    const programId = new PublicKey('7jGiTQRkU66HczW2rSBDYbvnvMPxtsVYR72vpa9a7qF2');
    const authority = Keypair.generate();

    const testSeeds = [
        { name: 'Short location', location: 'NYC', sensorId: 'S1' },
        { name: 'Medium location', location: 'Downtown Manhattan', sensorId: 'AQ001' },
        { name: 'Long location', location: 'A'.repeat(32), sensorId: 'B'.repeat(32) },
        { name: 'Too long location', location: 'A'.repeat(50), sensorId: 'B'.repeat(50) }
    ];

    testSeeds.forEach((test, index) => {
        console.log(`🧪 ${test.name}: ${test.location.length + test.sensorId.length} total chars`);
        
        try {
            const [pda, bump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('air_quality'),
                    Buffer.from(test.location),
                    Buffer.from(test.sensorId)
                ],
                programId
            );

            console.log(`   ✅ SUCCESS: PDA ${pda.toString().slice(0, 20)}... (bump: ${bump})`);
        } catch (error) {
            console.log(`   ❌ FAILED: ${error.message}`);
        }
    });
}

// Run tests
if (require.main === module) {
    testPDAGeneration();
    testSeedLengths();
}

module.exports = { testPDAGeneration, testSeedLengths };
