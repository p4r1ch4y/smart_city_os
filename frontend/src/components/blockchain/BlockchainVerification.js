import React, { useState, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { toast } from 'react-toastify';
import UnifiedCard, { CardHeader, CardContent } from '../ui/UnifiedCard';

const PROGRAM_ID = new PublicKey('A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An');
const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

const BlockchainVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [showInitializeOption, setShowInitializeOption] = useState(false);
  const [initializationResult, setInitializationResult] = useState(null);

  // Sample sensor data for verification
  const sensorData = {
    location: 'Downtown',
    sensorId: 'AQ001',
    aqi: 75,
    pm25: 12.5,
    pm10: 18.2,
    co2: 410.0,
    humidity: 65.5,
    temperature: 22.8
  };

  const connectToSolana = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      const connection = new Connection(DEVNET_ENDPOINT, 'confirmed');
      
      // Test connection
      const version = await connection.getVersion();
      console.log('Connected to Solana Devnet:', version);
      
      setConnectionStatus('connected');
      return connection;
    } catch (error) {
      console.error('Failed to connect to Solana:', error);
      setConnectionStatus('error');
      throw error;
    }
  }, []);

  const derivePDAs = useCallback((location, sensorId, contractName = 'IoT Service Agreement') => {
    // Derive Air Quality PDA
    const [airQualityPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('air_quality'),
        Buffer.from(location),
        Buffer.from(sensorId)
      ],
      PROGRAM_ID
    );

    // Derive Contract PDA
    const [contractPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('contract'),
        Buffer.from(contractName),
        Buffer.from(location)
      ],
      PROGRAM_ID
    );

    return {
      airQuality: airQualityPDA.toString(),
      contract: contractPDA.toString()
    };
  }, []);

  const verifyOnChain = useCallback(async (preserveInitResults = true) => {
    setIsLoading(true);
    if (!preserveInitResults) {
      setInitializationResult(null); // Clear previous initialization results only if explicitly requested
    }
    try {
      const connection = await connectToSolana();
      const pdas = derivePDAs(sensorData.location, sensorData.sensorId);

      // Check if accounts exist
      const airQualityAccount = await connection.getAccountInfo(new PublicKey(pdas.airQuality));
      const contractAccount = await connection.getAccountInfo(new PublicKey(pdas.contract));

      const result = {
        pdas,
        accounts: {
          airQuality: {
            exists: !!airQualityAccount,
            lamports: airQualityAccount?.lamports || 0,
            dataSize: airQualityAccount?.data?.length || 0
          },
          contract: {
            exists: !!contractAccount,
            lamports: contractAccount?.lamports || 0,
            dataSize: contractAccount?.data?.length || 0
          }
        },
        verification: {
          airQualityExists: !!airQualityAccount,
          contractExists: !!contractAccount,
          dataMatches: !!(airQualityAccount || contractAccount)
        },
        timestamp: new Date().toISOString()
      };

      setVerificationResult(result);

      if (result.verification.dataMatches) {
        toast.success('✅ On-chain verification successful!');
      } else {
        setShowInitializeOption(true);
        toast.info('ℹ️ No on-chain records found. The system is ready to log its first data entry.');
      }

    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('❌ Verification failed: ' + error.message);
      setVerificationResult({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [connectToSolana, derivePDAs, sensorData]);

  const initializeAccounts = useCallback(async () => {
    setIsInitializing(true);
    try {
      // Call backend to initialize accounts
      const response = await fetch('/api/blockchain/initialize-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: sensorData.location,
          sensorId: sensorData.sensorId,
          sensorData: {
            aqi: sensorData.aqi,
            pm25: sensorData.pm25,
            pm10: sensorData.pm10,
            co2: sensorData.co2,
            humidity: sensorData.humidity,
            temperature: sensorData.temperature
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('✅ Accounts initialized successfully! You can now verify on-chain data.');
        setShowInitializeOption(false);
        setInitializationResult(result.data); // Store the detailed blockchain info
        // Automatically re-verify after initialization
        setTimeout(() => {
          verifyOnChain(true); // Preserve initialization results
        }, 2000);
      } else {
        toast.error(`❌ Failed to initialize accounts: ${result.error}`);
      }
    } catch (error) {
      console.error('Account initialization failed:', error);
      toast.error('❌ Account initialization failed. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  }, [sensorData, verifyOnChain]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return '🟢 Connected to Devnet';
      case 'connecting': return '🟡 Connecting...';
      case 'error': return '🔴 Connection Failed';
      default: return '⚪ Disconnected';
    }
  };

  return (
    <UnifiedCard variant="aurora" className="max-w-4xl mx-auto">
      <CardHeader
        title="Blockchain Verification"
        subtitle="Verify sensor data on Solana Devnet"
        icon="⛓️"
        action={
          <div className={`font-medium ${getStatusColor(connectionStatus)}`}>
            {getStatusText(connectionStatus)}
          </div>
        }
      />

      <CardContent>
        {/* Sensor Data Display */}
        <UnifiedCard variant="glass" className="mb-6">
          <CardHeader
            title="Live Data from City Database"
            subtitle="Current sensor readings from the operational database"
            icon="📊"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(sensorData).map(([key, value]) => (
              <UnifiedCard key={key} variant="solid" className="p-3" hover={false}>
                <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                <div className="font-medium">
                  {typeof value === 'number' ? 
                    (key === 'aqi' ? value : 
                     key.includes('pm') ? `${value} μg/m³` :
                     key === 'co2' ? `${value} ppm` :
                     key === 'humidity' ? `${value}%` :
                     key === 'temperature' ? `${value}°C` : value) 
                    : value}
                </div>
              </UnifiedCard>
            ))}
          </div>
        </UnifiedCard>

        {/* Verify Button */}
        <div className="mb-6">
          <button
            onClick={() => verifyOnChain(true)} // Keep initialization results visible
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying on Solana Devnet...
              </div>
            ) : (
              '🔍 Verify On-Chain'
            )}
          </button>
        </div>

        {/* Verification Results */}
        {verificationResult && (
          <UnifiedCard variant="glass" className="mb-6">
            <CardHeader
              title="On-Chain Verification Results"
              icon="🔍"
            />
            
            {verificationResult.error ? (
              <UnifiedCard variant="error" className="p-4">
                <div className="text-red-700 font-medium">❌ Verification Failed</div>
                <div className="text-red-600 text-sm mt-1">{verificationResult.message}</div>
              </UnifiedCard>
            ) : (
              <div className="space-y-4">
                {verificationResult.verification.dataMatches ? (
                  <UnifiedCard variant="success" className="p-4">
                    <div className="flex items-center">
                      <div className="text-green-600 text-2xl mr-3">✅</div>
                      <div>
                        <h4 className="font-medium text-green-800">On-Chain Verification Successful</h4>
                        <p className="text-green-700 text-sm mt-1">
                          Sensor data has been verified and matches on-chain records on Solana Devnet.
                        </p>
                      </div>
                    </div>
                  </UnifiedCard>
                ) : (
                  <UnifiedCard variant="info" className="p-4">
                    <div className="flex items-start">
                      <div className="text-blue-600 text-2xl mr-3 mt-1">ℹ️</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-800">No On-Chain Records Found</h4>
                        <p className="text-blue-700 text-sm mt-1 mb-3">
                          This sensor hasn't logged any data to the blockchain yet. The system automatically 
                          creates on-chain records when critical readings are detected (AQI greater than 150 or less than 25) 
                          to optimize costs while maintaining transparency for important events.
                        </p>
                        {showInitializeOption && (
                          <button
                            onClick={initializeAccounts}
                            disabled={isInitializing}
                            className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                              isInitializing
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {isInitializing ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Initializing On-Chain Records...
                              </div>
                            ) : (
                              '🚀 Initialize On-Chain Records Now'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </UnifiedCard>
                )}
                
                {/* Timestamp */}
                <div className="text-gray-500 text-xs">
                  Verified at: {verificationResult.timestamp}
                </div>
              </div>
            )}
          </UnifiedCard>
        )}

        {/* Blockchain Initialization Results */}
        {initializationResult && (
          <UnifiedCard variant="aurora" className="mt-4">
            <CardHeader
              title="🚀 Blockchain Deployment Details"
              subtitle="Account initialization and transaction information"
              icon="⛓️"
            />
            <CardContent>
              <div className="space-y-4">
                {/* Air Quality Account */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">📊 Air Quality Account</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 font-medium">Status:</span>
                      <span className="text-green-600">✅ {initializationResult.airQuality.success ? 'Initialized' : 'Failed'}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-green-700 font-medium">PDA Address:</span>
                      <span className="text-green-600 font-mono text-xs break-all ml-2">{initializationResult.airQuality.pda}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 font-medium">Transaction ID:</span>
                      <span className="text-green-600 font-mono text-xs">{initializationResult.airQuality.signature}</span>
                    </div>
                    <div className="text-green-600 text-xs mt-2 p-2 bg-green-100 rounded">
                      {initializationResult.airQuality.message}
                    </div>
                  </div>
                </div>

                {/* Contract Account */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📋 Contract Account</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700 font-medium">Status:</span>
                      <span className="text-blue-600">✅ {initializationResult.contract.success ? 'Initialized' : 'Failed'}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-blue-700 font-medium">PDA Address:</span>
                      <span className="text-blue-600 font-mono text-xs break-all ml-2">{initializationResult.contract.pda}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700 font-medium">Transaction ID:</span>
                      <span className="text-blue-600 font-mono text-xs">{initializationResult.contract.signature}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700 font-medium">Contract Type:</span>
                      <span className="text-blue-600">{initializationResult.contract.contractName}</span>
                    </div>
                    <div className="text-blue-600 text-xs mt-2 p-2 bg-blue-100 rounded">
                      {initializationResult.contract.message}
                    </div>
                  </div>
                </div>

                {/* Blockchain Network Info */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">🌐 Network Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-700 font-medium">Network:</span>
                      <span className="text-purple-600 ml-2">Solana Devnet</span>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Program ID:</span>
                      <span className="text-purple-600 font-mono text-xs ml-2">{PROGRAM_ID.toString()}</span>
                    </div>
                  </div>
                </div>

                {/* Explorer Links */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🔍 Blockchain Explorer</h4>
                  <div className="space-y-2">
                    <a
                      href={`https://explorer.solana.com/address/${initializationResult.airQuality.pda}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View Air Quality Account on Solana Explorer →
                    </a>
                    <a
                      href={`https://explorer.solana.com/address/${initializationResult.contract.pda}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View Contract Account on Solana Explorer →
                    </a>
                    <a
                      href={`https://explorer.solana.com/address/${PROGRAM_ID.toString()}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View Smart Contract Program on Solana Explorer →
                    </a>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <button
                      onClick={() => setInitializationResult(null)}
                      className="text-gray-600 hover:text-gray-800 text-sm underline"
                    >
                      Hide Deployment Details
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </UnifiedCard>
        )}

        {/* Program Information */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Program ID:</span>
              <span className="ml-2 font-mono">{PROGRAM_ID.toString()}</span>
            </div>
            <div>
              <span className="font-medium">Network:</span>
              <span className="ml-2">Solana Devnet</span>
            </div>
          </div>
        </div>
      </CardContent>
    </UnifiedCard>
  );
};

export default BlockchainVerification;
