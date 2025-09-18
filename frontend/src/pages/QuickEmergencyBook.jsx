import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { emergencyServicesAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function QuickEmergencyBook() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const service = params.get('service') || 'ambulance';
    const urgency = params.get('urgency') || 'high';

    async function run() {
      try {
        const contactInfo = {
          name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Citizen',
          phone: user?.phone || 'NA',
          email: user?.email || 'NA'
        };
        const payload = {
          serviceType: service,
          urgency,
          location: { address: 'Quick booking', lat: null, lng: null },
          description: 'Quick booking initiated from header',
          additionalServices: [],
          contactInfo
        };
        const res = await emergencyServicesAPI.bookService(payload);
        const data = res?.data?.data || res?.data;
        const url = data?.paymentSession?.url;
        if (url) {
          window.location.href = url;
          return;
        }
        toast.error('Payment URL unavailable');
        navigate('/services/emergency');
      } catch (e) {
        toast.error(e?.response?.data?.error || 'Failed to create quick booking');
        navigate('/services/emergency');
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center text-gray-600">
        <div className="loading-spinner mx-auto mb-4" />
        <p>Creating your emergency booking…</p>
      </div>
    </div>
  );
}

