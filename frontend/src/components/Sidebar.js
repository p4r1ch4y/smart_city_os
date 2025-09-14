import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChartBarIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  LinkIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, section: 'dashboard' },
  { name: 'City Services', href: '/services', icon: BuildingOfficeIcon, section: 'services' },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, section: 'analytics' },
  { name: 'City Notices', href: '/announcements', icon: ExclamationTriangleIcon, section: 'announcements' },

  { name: 'IoT Sensors', href: '/sensors', icon: CpuChipIcon, section: 'sensors' },
  { name: 'Alerts', href: '/alerts', icon: ExclamationTriangleIcon, section: 'alerts' },
  { name: '3D City Twin', href: '/city-twin', icon: CubeIcon, section: 'city-twin' },
  { name: 'Blockchain', href: '/blockchain', icon: LinkIcon, section: 'blockchain' },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, section: 'settings' },
];

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const { isConnected, getActiveAlerts } = useSocket();
  const navigate = useNavigate();

  const activeAlerts = getActiveAlerts();
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <BuildingOfficeIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            SmartCity
          </span>
        </div>

        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Connection Status */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'
          }`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const showAlertBadge = item.name === 'Alerts' && criticalAlerts > 0;
          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {showAlertBadge && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {criticalAlerts > 9 ? '9+' : criticalAlerts}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.role || user?.user_metadata?.role || 'Citizen'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
