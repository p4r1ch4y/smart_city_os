import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import { useAuth } from '../../contexts/AuthContext';
import ContractsList from './ContractsList';
import CommunityFeedback from './CommunityFeedback';
import AdminPanel from './AdminPanel';
import ContractMonitor from './ContractMonitor';
import { ExternalLink, Shield, Users, Settings, Activity } from 'lucide-react';

/**
 * Main Blockchain dApp Component
 * Provides civic transparency, contract verification, and community feedback
 */
const BlockchainDApp = () => {
  const { user } = useAuth();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [activeTab, setActiveTab] = useState('contracts');
  const [networkInfo, setNetworkInfo] = useState(null);

  // Fetch network information
  useEffect(() => {
    const fetchNetworkInfo = async () => {
      if (connection) {
        try {
          const version = await connection.getVersion();
          const slot = await connection.getSlot();
          setNetworkInfo({ version, slot });
        } catch (error) {
          console.error('Failed to fetch network info:', error);
        }
      }
    };

    fetchNetworkInfo();
  }, [connection]);

  const tabs = [
    {
      id: 'contracts',
      name: 'Smart Contracts',
      icon: Shield,
      description: 'View and verify civic contracts on-chain'
    },
    {
      id: 'monitor',
      name: 'Contract Monitor',
      icon: Activity,
      description: 'Real-time contract performance and blockchain activity'
    },
    {
      id: 'feedback',
      name: 'Community Feedback',
      icon: Users,
      description: 'Public comments and transparency reports'
    }
  ];

  // Add admin tab for authorized users
  if (user?.isAdmin || user?.role === 'admin') {
    tabs.push({
      id: 'admin',
      name: 'Admin Panel',
      icon: Settings,
      description: 'Deploy contracts and manage civic data'
    });
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contracts':
        return <ContractsList />;
      case 'monitor':
        return <ContractMonitor />;
      case 'feedback':
        return <CommunityFeedback />;
      case 'admin':
        return user?.isAdmin ? <AdminPanel /> : null;
      default:
        return <ContractsList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Civic Transparency dApp
              </h1>
              <p className="mt-2 text-gray-600">
                Blockchain-powered transparency for smart city governance
              </p>
            </div>
            
            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {networkInfo && (
                <div className="text-sm text-gray-500">
                  <div>Solana Devnet</div>
                  <div>Slot: {networkInfo.slot}</div>
                </div>
              )}
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
            </div>
          </div>
        </div>  
      {/* Connection Status */}
        {user && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    connected ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium">
                    {connected ? 'Wallet Connected' : 'Wallet Disconnected'}
                  </span>
                </div>
                
                {connected && publicKey && (
                  <div className="text-sm text-gray-600">
                    <span className="font-mono">
                      {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Logged in as: {user.email}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {user.role || 'citizen'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {renderTabContent()}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Blockchain Transparency
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                All civic contracts and community feedback are stored on Solana blockchain 
                for complete transparency. View transaction details on Solscan explorer.
              </p>
              <div className="mt-3 space-x-4">
                <a
                  href="https://explorer.solana.com/?cluster=devnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Solana Explorer →
                </a>
                <a
                  href="https://solscan.io/?cluster=devnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Solscan →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainDApp;