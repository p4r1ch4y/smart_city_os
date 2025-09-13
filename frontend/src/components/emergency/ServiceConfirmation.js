import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { emergencyServicesAPI } from '../../services/api';
import { Icon } from '../icons';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/currency';


function ServiceConfirmation({ booking, onBack }) {
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Poll payment status
  const { data: paymentStatusData, isLoading: statusLoading } = useQuery(
    ['payment-status', booking?.paymentSession?.id],
    () => emergencyServicesAPI.getPaymentStatus(booking.paymentSession.id),
    {
      enabled: !!booking?.paymentSession?.id,
      refetchInterval: 3000, // Poll every 3 seconds
      onSuccess: (data) => {
        if (data.data.payment_status !== paymentStatus) {
          setPaymentStatus(data.data.payment_status);

          if (data.data.payment_status === 'paid') {
            toast.success('Payment completed successfully!');
          } else if (data.data.payment_status === 'failed') {
            toast.error('Payment failed. Please try again.');
          }
        }
      },
      onError: (error) => {
        console.error('Error checking payment status:', error);
      }
    }
  );

  const handlePayNow = () => {
    if (booking?.paymentSession?.url) {
      // Open Dodo Payments checkout in new window
      const paymentWindow = window.open(
        booking.paymentSession.url,
        'dodo-payment',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Listen for payment completion
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          // Refresh payment status when window closes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }, 1000);
    } else {
      toast.error('Payment URL not available');
    }
  };

  const handleSimulatePayment = async () => {
    try {
      // For demo purposes - simulate payment completion
      toast.success('Payment simulation completed!');
      setPaymentStatus('paid');
    } catch (error) {
      toast.error('Payment simulation failed');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'checkCircle';
      case 'failed':
        return 'xCircle';
      case 'pending':
      default:
        return 'clock';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'pending':
      default:
        return 'yellow';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Payment Completed';
      case 'completed':
        return 'Service Confirmed';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
      default:
        return 'Awaiting Payment';
    }
  };

  if (!booking) {
    return (
      <div className="text-center py-12">
        <Icon name="alertTriangle" size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Booking Data
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Unable to load booking information
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${getStatusColor(paymentStatus)}-100 dark:bg-${getStatusColor(paymentStatus)}-900/20 mb-4`}>
          <Icon
            name={getStatusIcon(paymentStatus)}
            size={32}
            className={`text-${getStatusColor(paymentStatus)}-600 dark:text-${getStatusColor(paymentStatus)}-400`}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {getStatusText(paymentStatus)}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Booking ID: {booking.booking.id}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Details */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Service Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Service Type
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {booking.feeCalculation.serviceType}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Urgency Level
              </label>
              <p className="text-gray-900 dark:text-white font-medium capitalize">
                {booking.booking.urgency}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Location
              </label>
              <p className="text-gray-900 dark:text-white">
                {booking.booking.location}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </label>
              <p className="text-gray-900 dark:text-white">
                {booking.booking.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Contact Phone
              </label>
              <p className="text-gray-900 dark:text-white">
                {booking.booking.contactInfo.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Information
            </h3>
            <button
              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {showPaymentDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showPaymentDetails && (
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Base Fee:</span>
                <span>{formatCurrency(booking.feeCalculation.baseFee, booking.feeCalculation.currency || 'INR')}</span>
              </div>

              {booking.feeCalculation.additionalServicesCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Additional Services:</span>
                  <span>{formatCurrency(booking.feeCalculation.additionalServicesCost, booking.feeCalculation.currency || 'INR')}</span>
                </div>
              )}

              {booking.feeCalculation.locationSurcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Location Surcharge:</span>
                  <span>{formatCurrency(booking.feeCalculation.locationSurcharge, booking.feeCalculation.currency || 'INR')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span>{formatCurrency(booking.feeCalculation.tax, booking.feeCalculation.currency || 'INR')}</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-lg">{formatCurrency(booking.feeCalculation.totalAmount, booking.feeCalculation.currency || 'INR')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div className={`p-4 rounded-lg bg-${getStatusColor(paymentStatus)}-50 dark:bg-${getStatusColor(paymentStatus)}-900/20 border border-${getStatusColor(paymentStatus)}-200 dark:border-${getStatusColor(paymentStatus)}-800 mb-6`}>
            <div className="flex items-center space-x-3">
              <Icon
                name={getStatusIcon(paymentStatus)}
                size={20}
                className={`text-${getStatusColor(paymentStatus)}-600 dark:text-${getStatusColor(paymentStatus)}-400`}
              />
              <div>
                <p className={`font-medium text-${getStatusColor(paymentStatus)}-800 dark:text-${getStatusColor(paymentStatus)}-200`}>
                  {getStatusText(paymentStatus)}
                </p>
                {paymentStatus === 'pending' && (
                  <p className={`text-sm text-${getStatusColor(paymentStatus)}-600 dark:text-${getStatusColor(paymentStatus)}-400`}>
                    Complete payment to confirm your service booking
                  </p>
                )}
                {paymentStatus === 'paid' && (
                  <p className={`text-sm text-${getStatusColor(paymentStatus)}-600 dark:text-${getStatusColor(paymentStatus)}-400`}>
                    Your emergency service has been confirmed
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Actions */}
          {paymentStatus === 'pending' && (
            <div className="space-y-3">
              <button
                onClick={handlePayNow}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="creditCard" size={16} />
                <span>Pay with Dodo Payments</span>
              </button>

              {/* Demo simulation button */}
              <button
                onClick={handleSimulatePayment}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="play" size={16} />
                <span>Simulate Payment (Demo)</span>
              </button>
            </div>
          )}

          {paymentStatus === 'paid' && (
            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="printer" size={16} />
                <span>Print Receipt</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      {paymentStatus === 'paid' && (
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
            What happens next?
          </h3>
          <ul className="space-y-2 text-green-700 dark:text-green-300">
            <li className="flex items-center space-x-2">
              <Icon name="check" size={16} />
              <span>Emergency services have been notified</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="check" size={16} />
              <span>You will receive a confirmation call within 5 minutes</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="check" size={16} />
              <span>Service team will be dispatched to your location</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="check" size={16} />
              <span>You can track the status in your booking history</span>
            </li>
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back to Services
        </button>

        {paymentStatus === 'paid' && (
          <button
            onClick={() => window.location.href = '/services/emergency?tab=history'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Bookings
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default ServiceConfirmation;
