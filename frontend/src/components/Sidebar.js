import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  SignalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, permission: null },
  { name: 'Sensors', href: '/sensors', icon: CpuChipIcon, permission: 'sensor:read' },
  { name: 'Alerts', href: '/alerts', icon: ExclamationTriangleIcon, permission: 'alert:read' },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, permission: 'analytics:read' },
  { name: 'Settings', href: '/settings', icon: CogIcon, permission: null },
  { name: 'Profile', href: '/profile', icon: UserIcon, permission: null },
];

function Sidebar({ onClose }) {
  const { user, hasPermission, logout } = useAuth();
  const { isConnected, getActiveAlerts } = useSocket();
  const location = useLocation();
  
  const activeAlerts = getActiveAlerts();
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <CpuChipIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Smart City OS
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-danger-500'}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Check permissions
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }

          const isActive = location.pathname === item.href;
          const alertCount = item.name === 'Alerts' ? criticalAlerts : 0;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 border-r-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              <span className="flex-1">{item.name}</span>
              
              {/* Alert badge */}
              {alertCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-danger-500 rounded-full"
                >
                  {alertCount > 99 ? '99+' : alertCount}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System status */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">System Status</span>
            <span className={`font-medium ${isConnected ? 'text-success-600' : 'text-danger-600'}`}>
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {activeAlerts.length > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Active Alerts</span>
              <span className="font-medium text-warning-600">
                {activeAlerts.length}
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 pt-2">
            <SignalIcon className={`w-4 h-4 ${isConnected ? 'text-success-500' : 'text-gray-400'}`} />
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <motion.div
                className={`h-1 rounded-full ${isConnected ? 'bg-success-500' : 'bg-gray-400'}`}
                initial={{ width: 0 }}
                animate={{ width: isConnected ? '100%' : '20%' }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <svg
            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
