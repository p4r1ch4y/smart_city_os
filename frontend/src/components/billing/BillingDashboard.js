import { useState } from 'react';
import {
  CreditCard,
  FileText,
  BarChart3,
  Info
} from 'lucide-react';
import UsageSummary from './UsageSummary';
import InvoicesList from './InvoicesList';
import AdminBillingOverview from './AdminBillingOverview';
import { useAuth } from '../../contexts/AuthContext';

const BillingDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('usage');

  const tabs = [
    {
      id: 'usage',
      name: 'Usage Summary',
      icon: CreditCard,
      description: 'View your current billing period usage'
    },
    {
      id: 'invoices',
      name: 'Billing History',
      icon: FileText,
      description: 'View and manage your invoices'
    }
  ];

  // Add admin tab if user is admin
  if (user?.isAdmin) {
    tabs.push({
      id: 'admin',
      name: 'Admin Overview',
      icon: BarChart3,
      description: 'System-wide billing analytics'
    });
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'usage':
        return <UsageSummary />;
      case 'invoices':
        return <InvoicesList />;
      case 'admin':
        return user?.isAdmin ? <AdminBillingOverview /> : null;
      default:
        return <UsageSummary />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
          <p className="mt-2 text-gray-600">
            Manage your emergency services billing and view usage analytics
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Postpaid Billing System
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Smart City OS uses a postpaid billing model for emergency services.
                You'll be charged at the end of each monthly billing cycle based on your actual usage.
                Each emergency service booking counts as 1 billing unit.
              </p>
            </div>
          </div>
        </div>

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
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
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
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Billing Cycle</h4>
              <p className="text-gray-600">
                Monthly billing cycles run from the 1st to the last day of each month.
                Invoices are generated on the 1st of the following month.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Payment Terms</h4>
              <p className="text-gray-600">
                Payment is due within 30 days of invoice generation.
                Late payments may result in service restrictions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Support</h4>
              <p className="text-gray-600">
                For billing questions or disputes, contact our support team at
                <a href="mailto:billing@smartcityos.gov" className="text-blue-600 hover:text-blue-800 ml-1">
                  billing@smartcityos.gov
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;