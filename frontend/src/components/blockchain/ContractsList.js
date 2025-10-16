import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { ExternalLink, Eye, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { createCivicLedgerClient } from '../../lib/solana/civicLedgerClient';

/**
 * Contracts List Component
 * Displays all civic contracts with Solscan links and verification status
 */
const ContractsList = () => {
  const { connection } = useConnection();
  const { wallet } = useWallet();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [civicClient, setCivicClient] = useState(null);

  // Program ID from Anchor.toml
  const PROGRAM_ID = 'A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An';

  // Sample contract data (in production, fetch from backend or derive from on-chain data)
  const contractTemplates = [
    {
      id: 'air-quality-downtown',
      name: 'Air Quality Monitoring - Downtown',
      type: 'IoT Service Agreement',
      location: 'Downtown',
      sensorId: 'AQ001',
      description: 'Continuous air quality monitoring for downtown district',
      category: 'Environmental'
    },
    {
      id: 'traffic-main-street',
      name: 'Traffic Management - Main Street',
      type: 'IoT Service Agreement', 
      location: 'Main Street',
      sensorId: 'TR001',
      description: 'Smart traffic light optimization and flow monitoring',
      category: 'Transportation'
    },
    {
      id: 'waste-collection-zone-a',
      name: 'Waste Collection - Zone A',
      type: 'Service Contract',
      location: 'Zone A',
      sensorId: 'WS001',
      description: 'Smart waste bin monitoring and collection optimization',
      category: 'Waste Management'
    },
    {
      id: 'energy-grid-sector-5',
      name: 'Smart Grid - Sector 5',
      type: 'Infrastructure Contract',
      location: 'Sector 5',
      sensorId: 'EN001',
      description: 'Smart energy grid monitoring and load balancing',
      category: 'Energy'
    }
  ];

  useEffect(() => {
    if (connection && wallet) {
      const client = createCivicLedgerClient(connection, wallet);
      setCivicClient(client);
    }
  }, [connection, wallet]);

  useEffect(() => {
    fetchContractData();
  }, [connection, civicClient]);

  const fetchContractData = async () => {
    setLoading(true);
    try {
      const contractsWithStatus = await Promise.all(
        contractTemplates.map(async (template) => {
          // Derive PDAs for each contract
          const pdas = derivePDAs(template.location, template.sensorId, template.type);
          
          // Check if accounts exist on-chain
          let status = 'not_deployed';
          let accountInfo = null;
          
          try {
            if (civicClient) {
              const airQualityInfo = await civicClient.getAccountInfo(pdas.airQuality);
              const contractInfo = await civicClient.getAccountInfo(pdas.contract);
              
              if (airQualityInfo.exists || contractInfo.exists) {
                status = 'deployed';
                accountInfo = {
                  airQuality: airQualityInfo.exists,
                  contract: contractInfo.exists,
                  airQualityData: airQualityInfo.exists ? airQualityInfo : null,
                  contractData: contractInfo.exists ? contractInfo : null,
                  lastUpdated: new Date().toISOString()
                };
              }
            } else if (connection) {
              // Fallback to direct connection check
              const airQualityAccount = await connection.getAccountInfo(new PublicKey(pdas.airQuality));
              const contractAccount = await connection.getAccountInfo(new PublicKey(pdas.contract));
              
              if (airQualityAccount || contractAccount) {
                status = 'deployed';
                accountInfo = {
                  airQuality: !!airQualityAccount,
                  contract: !!contractAccount,
                  lastUpdated: new Date().toISOString()
                };
              }
            }
          } catch (error) {
            console.error(`Error checking contract ${template.id}:`, error);
            status = 'error';
          }

          return {
            ...template,
            pdas,
            status,
            accountInfo,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          };
        })
      );

      setContracts(contractsWithStatus);
    } catch (error) {
      console.error('Error fetching contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContractData();
    setRefreshing(false);
  };

  // Derive Program Derived Addresses (PDAs)
  const derivePDAs = (location, sensorId, contractType = 'IoT Service Agreement') => {
    try {
      const programId = new PublicKey(PROGRAM_ID);
      
      // Air Quality PDA
      const [airQualityPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('air_quality'),
          Buffer.from(location),
          Buffer.from(sensorId)
        ],
        programId
      );

      // Contract PDA  
      const [contractPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('contract'),
          Buffer.from(contractType),
          Buffer.from(location)
        ],
        programId
      );

      return {
        airQuality: airQualityPDA.toString(),
        contract: contractPDA.toString()
      };
    } catch (error) {
      console.error('Error deriving PDAs:', error);
      return {
        airQuality: 'Error deriving PDA',
        contract: 'Error deriving PDA'
      };
    }
  }; 
 const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'not_deployed':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'deployed':
        return 'Deployed';
      case 'not_deployed':
        return 'Not Deployed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Environmental': 'bg-green-100 text-green-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Waste Management': 'bg-yellow-100 text-yellow-800',
      'Energy': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Smart Contracts Overview</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            refreshing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {contracts.filter(c => c.status === 'deployed').length}
              </div>
              <div className="text-sm text-gray-500">Deployed Contracts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {contracts.filter(c => c.status === 'not_deployed').length}
              </div>
              <div className="text-sm text-gray-500">Pending Deployment</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {contracts.length}
              </div>
              <div className="text-sm text-gray-500">Total Contracts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contract.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(contract.category)}`}>
                    {contract.category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{contract.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600">{contract.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{contract.location}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sensor ID:</span>
                    <span className="ml-2 font-mono text-gray-600">{contract.sensorId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                {getStatusIcon(contract.status)}
                <span className="text-sm font-medium">
                  {getStatusText(contract.status)}
                </span>
              </div>
            </div>

            {/* Contract Addresses */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Contract Addresses</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Air Quality PDA</div>
                    <div className="text-xs font-mono text-gray-600 break-all">
                      {contract.pdas.airQuality}
                    </div>
                  </div>
                  <a
                    href={`https://solscan.io/account/${contract.pdas.airQuality}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Solscan</span>
                  </a>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Contract PDA</div>
                    <div className="text-xs font-mono text-gray-600 break-all">
                      {contract.pdas.contract}
                    </div>
                  </div>
                  <a
                    href={`https://solscan.io/account/${contract.pdas.contract}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Solscan</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Account Status */}
            {contract.accountInfo && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">
                      Air Quality: {contract.accountInfo.airQuality ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700">
                      Contract: {contract.accountInfo.contract ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Program Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Smart Contract Program</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">Program ID:</span>
            <span className="font-mono text-blue-600">{PROGRAM_ID}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">Network:</span>
            <span className="text-blue-600">Solana Devnet</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">Framework:</span>
            <span className="text-blue-600">Anchor v0.29.0</span>
          </div>
        </div>
        <div className="mt-4">
          <a
            href={`https://solscan.io/account/${PROGRAM_ID}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Program on Solscan</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContractsList;