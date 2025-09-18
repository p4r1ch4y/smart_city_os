import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function EmergencyPaymentStatus({ type = 'success' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');

  useEffect(() => {
    // If user is not authenticated (new window), prompt to go back to app
  }, []);

  const heading = type === 'success' ? 'Payment Successful' : 'Payment Cancelled';
  const sub = type === 'success'
    ? 'Your payment was completed. You can safely return to the application.'
    : 'Your payment was not completed. You can try again from the application.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
        <p className="text-gray-600">{sub}</p>
        {sessionId && (
          <p className="text-xs text-gray-400">Session: {sessionId}</p>
        )}
        <div className="flex justify-center gap-3 pt-2">
          <a href="/services/emergency?tab=history" className="btn btn-primary">Open My Bookings</a>
          <a href="/dashboard" className="btn">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
}

