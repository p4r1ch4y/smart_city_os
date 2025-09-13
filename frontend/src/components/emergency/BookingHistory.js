import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../icons';
import LoadingSpinner from '../LoadingSpinner';

import { formatCurrency } from '../../utils/currency';

function BookingHistory({ bookings, isLoading, pagination }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'green';
      case 'pending_payment':
        return 'yellow';
      case 'payment_failed':
      case 'cancelled':
        return 'red';
      case 'in_progress':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'checkCircle';
      case 'pending_payment':
        return 'clock';
      case 'payment_failed':
      case 'cancelled':
        return 'xCircle';
      case 'in_progress':
        return 'activity';
      default:
        return 'circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'pending_payment':
        return 'Pending Payment';
      case 'payment_failed':
        return 'Payment Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Unknown';
    }
  };

  const getServiceIcon = (serviceType) => {
    const iconMap = {
      ambulance: 'heart',
      fire: 'flame',
      police: 'shield',
      rescue: 'lifeBuoy'
    };
    return iconMap[serviceType] || 'alertTriangle';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedBooking(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner text="Loading booking history..." />
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="calendar" size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Bookings Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          You haven't made any emergency service bookings yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Icon
                    name={getServiceIcon(booking.serviceType)}
                    size={24}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {booking.feeCalculation?.serviceType || booking.serviceType}
                    </h3>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(booking.status)}-100 text-${getStatusColor(booking.status)}-800 dark:bg-${getStatusColor(booking.status)}-900/20 dark:text-${getStatusColor(booking.status)}-200`}>
                      <Icon
                        name={getStatusIcon(booking.status)}
                        size={12}
                        className="mr-1"
                      />
                      {getStatusText(booking.status)}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <Icon name="mapPin" size={14} className="inline mr-1" />
                      {booking.location}
                    </p>
                    <p>
                      <Icon name="calendar" size={14} className="inline mr-1" />
                      {formatDate(booking.createdAt)}
                    </p>
                    <p>
                      <Icon name="alertTriangle" size={14} className="inline mr-1" />
                      {booking.urgency} priority
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {formatCurrency(booking.feeCalculation?.totalAmount || 0, booking.feeCalculation?.currency || 'INR')}
                </div>
                <button
                  onClick={() => handleViewDetails(booking)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.page <= 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>

            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Booking Details
                </h2>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Icon name="x" size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Service Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Booking ID
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">
                        {selectedBooking.id}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Service Type
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedBooking.feeCalculation?.serviceType || selectedBooking.serviceType}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </label>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(selectedBooking.status)}-100 text-${getStatusColor(selectedBooking.status)}-800 dark:bg-${getStatusColor(selectedBooking.status)}-900/20 dark:text-${getStatusColor(selectedBooking.status)}-200`}>
                        <Icon
                          name={getStatusIcon(selectedBooking.status)}
                          size={12}
                          className="mr-1"
                        />
                        {getStatusText(selectedBooking.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(selectedBooking.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location & Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Emergency Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Location
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedBooking.location}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedBooking.description}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Urgency Level
                      </label>
                      <p className="text-gray-900 dark:text-white capitalize">
                        {selectedBooking.urgency}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedBooking.contactInfo?.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedBooking.contactInfo?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {selectedBooking.feeCalculation && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Payment Details
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Base Fee:</span>
                          <span>{formatCurrency(selectedBooking.feeCalculation.baseFee || 0, selectedBooking.feeCalculation.currency || 'INR')}</span>
                        </div>
                        {selectedBooking.feeCalculation.additionalServicesCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Additional Services:</span>
                            <span>{formatCurrency(selectedBooking.feeCalculation.additionalServicesCost || 0, selectedBooking.feeCalculation.currency || 'INR')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                          <span>{formatCurrency(selectedBooking.feeCalculation.tax || 0, selectedBooking.feeCalculation.currency || 'INR')}</span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatCurrency(selectedBooking.feeCalculation.totalAmount || 0, selectedBooking.feeCalculation.currency || 'INR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeDetails}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Icon name="printer" size={16} />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default BookingHistory;
