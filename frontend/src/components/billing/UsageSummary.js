import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UsageSummary = ({ period = null }) => {
  const { user } = useAuth();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsageData();
  }, [period]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const params = period ? `?period=${period}` : '';
      const response = await fetch(`/api/emergency-services/billing/usage${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsage(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Error loading usage data: {error}</span>
        </div>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No usage data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Usage Summary - {usage.period}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Billing Cycle: {usage.usage.billing_cycle}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Services Used */}
          <div className="text-center">
            <div className="bg-blue-50 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {usage.usage.count}
            </div>
            <div className="text-sm text-gray-500">
              {usage.usage.unit}s used
            </div>
          </div>

          {/* Estimated Amount */}
          <div className="text-center">
            <div className="bg-green-50 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(usage.estimated_amount.estimated_total)}
            </div>
            <div className="text-sm text-gray-500">
              Estimated bill
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center">
            <div className="bg-purple-50 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formatDate(usage.last_updated)}
            </div>
            <div className="text-sm text-gray-500">
              Last updated
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Base rate per {usage.usage.unit}:</span>
            <span className="font-medium">
              {formatCurrency(usage.estimated_amount.per_unit_price)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Currency:</span>
            <span className="font-medium">{usage.estimated_amount.currency}</span>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      {usage.events && usage.events.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Service Usage
          </h4>
          <div className="space-y-3">
            {usage.events.slice(0, 5).map((event, index) => (
              <div key={event.event_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    event.urgency === 'high' ? 'bg-red-500' :
                    event.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {event.service_type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(event.timestamp)} • {event.urgency} priority
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {event.quantity} {usage.usage.unit}
                  </div>
                  <div className="text-sm text-gray-500">
                    Booking #{event.booking_id.slice(-6)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {usage.events.length > 5 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all {usage.events.length} events
              </button>
            </div>
          )}
        </div>
      )}

      {/* Billing Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900">Postpaid Billing</h5>
            <p className="text-sm text-blue-700 mt-1">
              You'll be billed at the end of each {usage.usage.billing_cycle} cycle. 
              Your next bill will be generated automatically and sent to your registered email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageSummary;