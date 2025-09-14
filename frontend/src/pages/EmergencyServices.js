import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { emergencyServicesAPI } from '../services/api';
import { Icon } from '../components/icons';
import LoadingSpinner from '../components/LoadingSpinner';
import BookServiceForm from '../components/emergency/BookServiceForm';
import ServiceConfirmation from '../components/emergency/ServiceConfirmation';
import BookingHistory from '../components/emergency/BookingHistory';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/currency';


const DISPLAY_CURRENCY = process.env.REACT_APP_CURRENCY || 'INR';
const DISPLAY_LOCALE = process.env.REACT_APP_LOCALE || (DISPLAY_CURRENCY === 'INR' ? 'en-IN' : 'en-US');

const FALLBACK_SERVICE_TYPES = [
  { id: 'ambulance', name: 'Ambulance', description: 'Medical transport and first aid support', baseFee: 49.0 },
  { id: 'fire', name: 'Fire & Rescue', description: 'Firefighting and rescue services', baseFee: 59.0 },
  { id: 'police', name: 'Police Assistance', description: 'Law and order support', baseFee: 39.0 },
  { id: 'rescue', name: 'Disaster Response', description: 'Natural disaster and special rescue ops', baseFee: 69.0 },
];

function EmergencyServices() {
  const [activeTab, setActiveTab] = useState('book');
  const [selectedService, setSelectedService] = useState(null);
  const [bookingStep, setBookingStep] = useState('select'); // select, form, payment, confirmation
  const [currentBooking, setCurrentBooking] = useState(null);
  const queryClient = useQueryClient();

  // Fetch service types
  const location = useLocation();

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab === 'history') setActiveTab('history');
  }, [location.search]);

  const { data: serviceTypes, isLoading: servicesLoading } = useQuery(
    'emergency-service-types',
    emergencyServicesAPI.getServiceTypes,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.warn('Falling back to default emergency services. Error:', error?.message || error);
      }
    }
  );

  // Fetch user bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery(
    'user-emergency-bookings',
    () => emergencyServicesAPI.getUserBookings({ page: 1, limit: 10 }),
    {
      enabled: activeTab === 'history',
      refetchInterval: 30000, // Refresh every 30 seconds
      onError: (error) => {
        toast.error('Failed to load booking history');
        console.error('Error loading bookings:', error);
      }
    }
  );

  // Book service mutation
  const bookServiceMutation = useMutation(
    emergencyServicesAPI.bookService,
    {
      onSuccess: (data) => {
        setCurrentBooking(data.data);
        setBookingStep('payment');
        toast.success('Service booking created successfully!');
        queryClient.invalidateQueries('user-emergency-bookings');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to book service');
        console.error('Booking error:', error);
      }
    }
  );

  const tabs = [
    {
      id: 'book',
      name: 'Book Service',
      icon: 'plus',
      description: 'Request emergency services'
    },
    {
      id: 'history',
      name: 'My Bookings',
      icon: 'clock',
      description: 'View booking history'
    }
  ];

  const handleQuickBookAmbulance = () => {
    const list = (serviceTypes?.data?.length ? serviceTypes.data : FALLBACK_SERVICE_TYPES);
    const svc = list.find(s => s.id === 'ambulance') || list[0];
    if (svc) {
      setSelectedService(svc);
      setBookingStep('form');
    } else {
      toast.error('Ambulance service unavailable');
    }
  };
  // One-click booking via URL param e.g., /services/emergency?quick=ambulance
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quick = params.get('quick');
    if (quick === 'ambulance') {
      handleQuickBookAmbulance();
    }
  }, []);


  const getServiceIcon = (serviceType) => {
    const iconMap = {
      ambulance: 'heart',
      fire: 'flame',
      police: 'shield',
      rescue: 'lifeBuoy'
    };
    return iconMap[serviceType] || 'alertTriangle';
  };

  const getUrgencyColor = (urgency) => {
    const colorMap = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    };
    return colorMap[urgency] || 'gray';
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setBookingStep('form');
  };

  const handleBookingSubmit = (bookingData) => {
    const payload = {
      ...bookingData,
      serviceType: selectedService.id
    };
    bookServiceMutation.mutate(payload);
  };

  const handleBackToServices = () => {
    setBookingStep('select');
    setSelectedService(null);
    setCurrentBooking(null);
  };

  const renderBookingContent = () => {
    switch (bookingStep) {
      case 'select':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(serviceTypes?.data?.length ? serviceTypes.data : FALLBACK_SERVICE_TYPES).map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => handleServiceSelect(service)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <Icon
                      name={getServiceIcon(service.id)}
                      size={32}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Base Fee:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(service.baseFee, DISPLAY_CURRENCY, DISPLAY_LOCALE)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    * Final cost varies by urgency and additional services
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Available 24/7
                    </span>
                    <Icon name="arrowRight" size={16} className="text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'form':
        return (
          <BookServiceForm
            service={selectedService}
            onSubmit={handleBookingSubmit}
            onBack={handleBackToServices}
            isLoading={bookServiceMutation.isLoading}
          />
        );

      case 'payment':
      case 'confirmation':
        return (
          <ServiceConfirmation
            booking={currentBooking}
            onBack={handleBackToServices}
          />
        );

      default:
        return null;
    }
  };


  if (servicesLoading) {
    return <LoadingSpinner text="Loading emergency services..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emergency Services</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Request emergency services with secure payment processing</p>
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Icon name="alertTriangle" size={24} className="text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">
              Emergency Notice
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              For life-threatening emergencies, call 112 immediately. This service is for non-critical emergency assistance.

            </p>
          </div>
        </div>
      </div>
      {/* Indian Emergency Numbers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-3">Important Emergency Numbers (India)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Emergency (All-in-one)', num: '112' },
            { label: 'Police', num: '100' },
            { label: 'Fire', num: '101' },
            { label: 'Ambulance', num: '102' },
            { label: 'Ambulance (108)', num: '108' },
            { label: 'Women Helpline', num: '1091' },

            { label: 'Child Helpline', num: '1098' },
            { label: 'Disaster Mgmt', num: '108' },
          ].map((i) => (
            <a key={i.label} href={`tel:${i.num}`} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10">
              <span className="text-sm text-gray-700 dark:text-gray-300">{i.label}</span>
              <span className="text-base font-semibold text-red-600 dark:text-red-400">{i.num}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setActiveTab('book')} className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-left">
          <div className="flex items-center space-x-3">
            <Icon name="plus" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Book Emergency Service</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start a new request</p>
            </div>
          </div>
        </button>
        <button onClick={() => setActiveTab('history')} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-left">
          <div className="flex items-center space-x-3">
            <Icon name="clock" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">My Bookings</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">View recent requests</p>
            </div>
          </div>
        </button>
      </div>


      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name={tab.icon} size={16} />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'book' && (
          <div>
            {bookingStep === 'select' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select Emergency Service
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose the type of emergency service you need
                </p>
              </div>
            )}
            {renderBookingContent()}
          </div>
        )}

        {activeTab === 'history' && (
          <BookingHistory
            bookings={bookingsData?.data?.bookings || []}
            isLoading={bookingsLoading}
            pagination={bookingsData?.data?.pagination}
          />
        )}
      </div>
    </motion.div>
  );
}

export default EmergencyServices;
