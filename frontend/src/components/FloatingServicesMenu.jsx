import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './icons';

function FloatingServicesMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const ActionButton = ({ icon, label, onClick, color = 'primary' }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg bg-${color}-600 text-white hover:bg-${color}-700 transition`}
    >
      <Icon name={icon} size={18} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl space-y-2">
          <ActionButton
            icon="heart"
            label="Book Emergency"
            color="red"
            onClick={() => navigate('/services/emergency')}
          />
          <ActionButton
            icon="clock"
            label="My Bookings"
            onClick={() => navigate('/services/emergency?tab=history')}
          />
          <div className="h-px bg-gray-200 dark:bg-gray-700" />
          <ActionButton
            icon="layers"
            label="All Services"
            onClick={() => navigate('/services')}
          />
        </div>
      )}

      <button
        aria-label="City Services Menu"
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition text-white ${
          open ? 'bg-gray-700 hover:bg-gray-800' : 'bg-primary-600 hover:bg-primary-700'
        }`}
      >
        <Icon name={open ? 'x' : 'menu'} size={24} />
      </button>
    </div>
  );
}

export default FloatingServicesMenu;

