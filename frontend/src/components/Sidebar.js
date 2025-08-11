import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Icon } from './icons';
import './Sidebar.css';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', section: 'dashboard' },
  { name: 'Analytics', href: '/analytics', icon: 'analytics', section: 'analytics' },
  { name: 'IoT Sensors', href: '/sensors', icon: 'sensors', section: 'sensors' },
  { name: 'Alerts', href: '/alerts', icon: 'alerts', section: 'alerts' },
  { name: 'City Services', href: '/services', icon: 'services', section: 'services' },
  { name: 'Settings', href: '/settings', icon: 'settings', section: 'settings' },
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
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon"></div>
          <span>SmartCity</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`connection-status ${!isConnected ? 'disconnected' : ''}`}>
        <div className={`connection-indicator ${!isConnected ? 'pulse' : ''}`} />
        <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
      </div>

      <ul className="nav-menu">
        {navigation.map((item) => {
          const showAlertBadge = item.name === 'Alerts' && criticalAlerts > 0;

          return (
            <li key={item.name} className="nav-item">
              <NavLink
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                data-section={item.section}
              >
                <Icon name={item.icon} size={20} className="nav-icon" />
                <span>{item.name}</span>
                {showAlertBadge && (
                  <span className="alert-badge">{criticalAlerts}</span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <Icon name="profile" size={20} />
          </div>
          <div className="user-details">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <Icon name="logout" size={16} />
          Sign out
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;
