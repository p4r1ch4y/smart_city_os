import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Settings, Plus, Upload, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Admin Panel Component
 * Allows authorized users to deploy contracts and manage civic data
 */
const AdminPanel = () => {
  const { publicKey } = useWallet();
  const [activeSection, setActiveSection] = useState('deploy');
  const [deploying, setDeploying] = useState(false);
  const [deployForm, setDeployForm] = useState({
    contractType: 'IoT Service Agreement',
    location: '',
    sensorId: '',
    description: '',
    category: 'Environmental'
  });

  const sections = [
    { id: 'deploy', name: 'Deploy Contract', icon: Plus },
    { id: 'manage', name: 'Manage Data', icon: Database },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const contractTypes = [
    'IoT Service Agreement',
    'Service Contract', 
    'Infrastructure Contract',
    'Maintenance Agreement'
  ];

  const categories = [
    'Environmental',
    'Transportation',
    'Waste Management',
    'Energy',
    'Public Safety',
    'Infrastructure'
  ];

  const handleDeployContract = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!deployForm.location || !deployForm.sensorId || !deployForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setDeploying(true);

    try {
      // Call backend to deploy contract
      const response = await fetch('/api/blockchain/deploy-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contractType: deployForm.contractType,
          location: deployForm.location,
          sensorId: deployForm.sensorId,
          description: deployForm.description,
          category: deployForm.category,
          deployerWallet: publicKey.toString()
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Contract deployed successfully!');
        
        // Reset form
        setDeployForm({
          contractType: 'IoT Service Agreement',
          location: '',
          sensorId: '',
          description: '',
          category: 'Environmental'
        });

        // Show deployment details
        console.log('Deployment result:', result.data);
        
      } else {
        toast.error(`Deployment failed: ${result.error}`);
      }

    } catch (error) {
      console.error('Error deploying contract:', error);
      toast.error('Failed to deploy contract: ' + error.message);
    } finally {
      setDeploying(false);
    }
  };

  const renderDeploySection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Deploy New Civic Contract
        </h3>

        {!publicKey ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Admin Wallet Required
            </h4>
            <p className="text-gray-600">
              Connect your authorized admin wallet to deploy new civic contracts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Contract Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Type *
              </label>
              <select
                value={deployForm.contractType}
                onChange={(e) => setDeployForm(prev => ({ ...prev, contractType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {contractTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={deployForm.location}
                onChange={(e) => setDeployForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Downtown, Main Street, Zone A"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sensor ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sensor/Service ID *
              </label>
              <input
                type="text"
                value={deployForm.sensorId}
                onChange={(e) => setDeployForm(prev => ({ ...prev, sensorId: e.target.value }))}
                placeholder="e.g., AQ001, TR001, WS001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={deployForm.category}
                onChange={(e) => setDeployForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={deployForm.description}
                onChange={(e) => setDeployForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and scope of this civic contract..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Deploy Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleDeployContract}
                disabled={deploying}
                className={`flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-colors ${
                  deploying
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {deploying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deploying to Blockchain...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Deploy Contract</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deployment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Deployment Process</h4>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Contract PDAs will be derived deterministically</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Air Quality and Contract accounts will be initialized</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Transaction will be recorded on Solana blockchain</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Contract will be publicly verifiable on Solscan</span>
          </div>
        </div>
      </div>
    </div>
  ); 
 const renderManageSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Manage Civic Data
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Update Sensor Data */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Update Sensor Data</h4>
            <p className="text-sm text-gray-600 mb-4">
              Push new sensor readings to blockchain contracts
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Update All Sensors
            </button>
          </div>

          {/* Batch Operations */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Batch Operations</h4>
            <p className="text-sm text-gray-600 mb-4">
              Perform bulk updates across multiple contracts
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Run Batch Update
            </button>
          </div>

          {/* Contract Status */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Contract Status</h4>
            <p className="text-sm text-gray-600 mb-4">
              Monitor and manage contract health
            </p>
            <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
              Check All Status
            </button>
          </div>

          {/* Emergency Actions */}
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h4 className="font-medium text-red-900 mb-2">Emergency Actions</h4>
            <p className="text-sm text-red-700 mb-4">
              Pause or emergency stop contracts if needed
            </p>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Emergency Controls
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Admin Settings
        </h3>
        
        <div className="space-y-6">
          {/* Network Configuration */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Network Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Current Network</div>
                <div className="text-gray-600">Solana Devnet</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Program ID</div>
                <div className="font-mono text-xs text-gray-600">A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">RPC Endpoint</div>
                <div className="text-gray-600">https://api.devnet.solana.com</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700">Commitment Level</div>
                <div className="text-gray-600">Confirmed</div>
              </div>
            </div>
          </div>

          {/* Admin Permissions */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Admin Permissions</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">Deploy Contracts</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">Update Contract Data</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">Emergency Controls</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">View All Feedback</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Connected Wallet Info */}
          {publicKey && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Connected Admin Wallet</h4>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-blue-900 mb-1">Wallet Address</div>
                  <div className="font-mono text-blue-700 break-all">{publicKey.toString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeSection === section.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {section.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Section Content */}
      {activeSection === 'deploy' && renderDeploySection()}
      {activeSection === 'manage' && renderManageSection()}
      {activeSection === 'settings' && renderSettingsSection()}

      {/* Admin Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-900">
              Admin Access Required
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              These administrative functions require proper authorization and wallet connectivity. 
              All actions are recorded on the blockchain for transparency and audit purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;