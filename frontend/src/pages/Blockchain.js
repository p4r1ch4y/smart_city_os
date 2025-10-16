import { useState } from 'react';
import WalletContextProvider from '../contexts/WalletContext';
import BlockchainDApp from '../components/blockchain/BlockchainDApp';
import BlockchainVerification from '../components/blockchain/BlockchainVerification';
import { Eye, Wallet } from 'lucide-react';

/**
 * Blockchain Page - Modernized dApp Experience
 * Provides civic transparency, wallet connectivity, and community feedback
 */
const Blockchain = () => {
  const [viewMode, setViewMode] = useState('dapp'); // 'dapp' or 'legacy'

  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Mode Toggle */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Blockchain Integration</h1>
                <p className="text-gray-600">
                  Civic transparency and verification on Solana blockchain
                </p>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('dapp')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'dapp'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  <span>Civic dApp</span>
                </button>
                <button
                  onClick={() => setViewMode('legacy')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'legacy'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>Legacy Verification</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="py-8">
          {viewMode === 'dapp' ? (
            <BlockchainDApp />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <BlockchainVerification />
              
              <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About CivicLedger Smart Contract</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Air Quality Tracking</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Real-time AQI monitoring</li>
                      <li>• PM2.5 and PM10 particle tracking</li>
                      <li>• CO2 level measurement</li>
                      <li>• Temperature and humidity data</li>
                      <li>• Location-based sensor identification</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Smart Contracts</h3>
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
                  <h3 className="font-semibold text-blue-800 mb-2">School of Solana Integration</h3>
                  <p className="text-blue-700 text-sm">
                    This implementation demonstrates production-ready Solana development including:
                    PDAs for deterministic addressing, comprehensive input validation, 
                    event emissions for transparency, and extensive TypeScript testing with fuzzing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WalletContextProvider>
  );
};

export default Blockchain;