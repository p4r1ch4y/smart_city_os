import React from 'react';
import BlockchainVerification from '../components/blockchain/BlockchainVerification';

const Blockchain = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Blockchain Integration</h1>
          <p className="text-gray-600">
            Verify IoT sensor data on Solana blockchain using School of Solana CivicLedger smart contracts
          </p>
        </div>
        
        <BlockchainVerification />
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">About CivicLedger Smart Contract</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">🏛️ Air Quality Tracking</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time AQI monitoring</li>
                <li>• PM2.5 and PM10 particle tracking</li>
                <li>• CO2 level measurement</li>
                <li>• Temperature and humidity data</li>
                <li>• Location-based sensor identification</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">📋 Smart Contracts</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• IoT service agreements</li>
                <li>• Contract status management</li>
                <li>• Authority-based access control</li>
                <li>• Event emission for data updates</li>
                <li>• PDA-based account derivation</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🎓 School of Solana Integration</h3>
            <p className="text-blue-700 text-sm">
              This implementation demonstrates production-ready Solana development including:
              PDAs for deterministic addressing, comprehensive input validation, 
              event emissions for transparency, and extensive TypeScript testing with fuzzing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blockchain;