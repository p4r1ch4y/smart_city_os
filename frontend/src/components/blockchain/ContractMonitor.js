import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';

import { Activity, TrendingUp, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

/**
 * Contract Monitor Component
 * Real-time monitoring of contract performance and blockchain activity
 */
const ContractMonitor = () => {
  const { connection } = useConnection();
  const [monitoringData, setMonitoringData] = useState({
    contracts: [],
    networkStats: null,
    recentActivity: [],
    performance: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Program ID from Anchor.toml
  const PROGRAM_ID = 'A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An';

  useEffect(() => {
    fetchMonitoringData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connection]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);

      // Fetch network stats
      const networkStats = await fetchNetworkStats();
      
      // Fetch contract performance data
      const performance = await fetchPerformanceMetrics();
      
      // Fetch recent blockchain activity
      const recentActivity = await fetchRecentActivity();

      // Sample contract monitoring data
      const contracts = [
        {
          id: 'air-quality-downtown',
          name: 'Air Quality - Downtown',
          status: 'active',
          lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
          transactionCount: 1247,
          errorRate: 0.02,
          avgResponseTime: 1.2,
          healthScore: 98
        },
        {
          id: 'traffic-main-street',
          name: 'Traffic - Main Street',
          status: 'active',
          lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
          transactionCount: 892,
          errorRate: 0.01,
          avgResponseTime: 0.8,
          healthScore: 99
        },
        {
          id: 'waste-collection-zone-a',
          name: 'Waste - Zone A',
          status: 'warning',
          lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
          transactionCount: 456,
          errorRate: 0.05,
          avgResponseTime: 2.1,
          healthScore: 85
        }
      ];

      setMonitoringData({
        contracts,
        networkStats,
        recentActivity,
        performance
      });

    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworkStats = async () => {
    try {
      if (!connection) return null;

      const slot = await connection.getSlot();
      const blockTime = await connection.getBlockTime(slot);
      const version = await connection.getVersion();

      return {
        currentSlot: slot,
        blockTime: blockTime ? new Date(blockTime * 1000) : null,
        version: version['solana-core'],
        tps: Math.floor(Math.random() * 3000) + 1000, // Simulated TPS
        avgBlockTime: 400 // ms
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return null;
    }
  };

  const fetchPerformanceMetrics = async () => {
    // Simulate performance metrics
    return {
      totalTransactions: 15847,
      successRate: 99.2,
      avgGasCost: 0.000005, // SOL
      peakTPS: 2847,
      uptime: 99.8
    };
  };

  const fetchRecentActivity = async () => {
    // Simulate recent activity
    const activities = [
      {
        id: 1,
        type: 'contract_update',
        contract: 'Air Quality - Downtown',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        status: 'success',
        txHash: 'abc123...def456'
      },
      {
        id: 2,
        type: 'feedback_submitted',
        contract: 'Traffic - Main Street',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'success',
        txHash: 'ghi789...jkl012'
      },
      {
        id: 3,
        type: 'contract_deployed',
        contract: 'Energy Grid - Sector 5',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'success',
        txHash: 'mno345...pqr678'
      }
    ];

    return activities;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {monitoringData.networkStats?.currentSlot?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Current Slot</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {monitoringData.networkStats?.tps?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">TPS</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {monitoringData.performance?.uptime || 'N/A'}%
              </div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {monitoringData.contracts.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">Active Contracts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Health Status */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Contract Health Monitor</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {monitoringData.contracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(contract.status)}
                  <div>
                    <div className="font-medium text-gray-900">{contract.name}</div>
                    <div className="text-sm text-gray-500">
                      Last update: {contract.lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {contract.transactionCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Transactions</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {(contract.errorRate * 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">Error Rate</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {contract.avgResponseTime}s
                    </div>
                    <div className="text-xs text-gray-500">Avg Response</div>
                  </div>

                  <div className="text-center">
                    <div className={`text-sm font-bold ${getHealthScoreColor(contract.healthScore)}`}>
                      {contract.healthScore}
                    </div>
                    <div className="text-xs text-gray-500">Health Score</div>
                  </div>

                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Blockchain Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {monitoringData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">{activity.contract}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </div>
                  <a
                    href={`https://solscan.io/tx/${activity.txHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-mono"
                  >
                    {activity.txHash}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-medium">{monitoringData.performance?.totalTransactions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-medium text-green-600">{monitoringData.performance?.successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Gas Cost</span>
              <span className="font-medium">{monitoringData.performance?.avgGasCost} SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Peak TPS</span>
              <span className="font-medium">{monitoringData.performance?.peakTPS.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Network Info</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Network</span>
              <span className="font-medium">Solana Devnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Program ID</span>
              <span className="font-mono text-xs">{PROGRAM_ID}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Solana Version</span>
              <span className="font-medium">{monitoringData.networkStats?.version || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Block Time</span>
              <span className="font-medium">{monitoringData.networkStats?.avgBlockTime}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-gray-500">
        Auto-refreshing every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ContractMonitor;