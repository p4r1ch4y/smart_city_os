import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { emergencyServicesAPI } from '../../services/api';
import { Icon } from '../icons';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

import { formatCurrency } from '../../utils/currency';

function BookServiceForm({ service, onSubmit, onBack, isLoading }) {
  const [formData, setFormData] = useState({
    urgency: 'medium',
    location: '',
    description: '',
    contactInfo: {
      phone: '',
      email: '',
      alternateContact: ''
    },
    additionalServices: []
  });
  const [feeCalculation, setFeeCalculation] = useState(null);
  const [calculatingFee, setCalculatingFee] = useState(false);

  // Calculate fee when form data changes
  useEffect(() => {
    if (formData.urgency && formData.location && service) {
      calculateFee();
    }
  }, [formData.urgency, formData.location, formData.additionalServices, service]);

  const calculateFee = async () => {
    try {
      setCalculatingFee(true);
      const response = await emergencyServicesAPI.calculateFee({
        serviceType: service.id,
        urgency: formData.urgency,
        location: formData.location,
        additionalServices: formData.additionalServices
      });
      setFeeCalculation(response.data);
    } catch (error) {
      console.error('Error calculating fee:', error);
      toast.error('Failed to calculate service fee');
    } finally {
      setCalculatingFee(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAdditionalServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(serviceId)
        ? prev.additionalServices.filter(id => id !== serviceId)
        : [...prev.additionalServices, serviceId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.location.trim()) {
      toast.error('Please provide a location');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please provide a description of the emergency');
      return;
    }
    if (!formData.contactInfo.phone.trim()) {
      toast.error('Please provide a contact phone number');
      return;
    }

    onSubmit(formData);
  };

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', description: 'Non-urgent situation', color: 'green' },
    { value: 'medium', label: 'Medium Priority', description: 'Moderate urgency', color: 'yellow' },
    { value: 'high', label: 'High Priority', description: 'Urgent situation', color: 'orange' },
    { value: 'critical', label: 'Critical', description: 'Life-threatening emergency', color: 'red' }
  ];

  const getUrgencyColor = (urgency) => {
    const option = urgencyOptions.find(opt => opt.value === urgency);
    return option?.color || 'gray';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <Icon name="arrowLeft" size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Book {service.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {service.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Urgency Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {urgencyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 transition-all ${
                      formData.urgency === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={formData.urgency === option.value}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${option.color}-500`} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter the emergency location (address, landmarks, etc.)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Emergency Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the emergency situation in detail..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alternate Contact
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.alternateContact}
                  onChange={(e) => handleInputChange('contactInfo.alternateContact', e.target.value)}
                  placeholder="Emergency contact name and phone"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Additional Services */}
            {service.additionalServices && service.additionalServices.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Additional Services
                </h3>
                <div className="space-y-3">
                  {service.additionalServices.map((additionalService) => (
                    <label
                      key={additionalService.id}
                      className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.additionalServices.includes(additionalService.id)}
                        onChange={() => handleAdditionalServiceToggle(additionalService.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {additionalService.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          +{formatCurrency(additionalService.fee, feeCalculation?.currency || 'INR')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || calculatingFee}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading && <Icon name="loader" size={16} className="animate-spin" />}
                <span>{isLoading ? 'Booking...' : 'Proceed to Payment'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Fee Calculation */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Service Cost
              </h3>

              {calculatingFee ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" text="Calculating..." />
                </div>
              ) : feeCalculation ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Base Fee:</span>
                    <span className="font-medium">{formatCurrency(feeCalculation.baseFee, feeCalculation.currency || 'INR')}</span>
                  </div>

                  {feeCalculation.urgencyMultiplier > 1 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Urgency ({formData.urgency}):
                      </span>
                      <span className="font-medium">
                        {((feeCalculation.urgencyMultiplier - 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}

                  {feeCalculation.additionalServicesCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Additional Services:</span>
                      <span className="font-medium">{formatCurrency(feeCalculation.additionalServicesCost, feeCalculation.currency || 'INR')}</span>
                    </div>
                  )}

                  {feeCalculation.locationSurcharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Location Surcharge:</span>
                      <span className="font-medium">{formatCurrency(feeCalculation.locationSurcharge, feeCalculation.currency || 'INR')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                    <span className="font-medium">{formatCurrency(feeCalculation.tax, feeCalculation.currency || 'INR')}</span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-lg font-bold text-red-600">{formatCurrency(feeCalculation.totalAmount, feeCalculation.currency || 'INR')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Fill in the form to see cost calculation
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default BookServiceForm;
