import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCity } from '../contexts/CityContext';
import { Icon, StatusIcon } from './icons';
import './Header.css';

function PrototypeHeader({ onMenuClick }) {
  const { user } = useAuth();
  const { isConnected, getActiveAlerts } = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const { cityKey, cities } = useCity();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temperature: 24,
    condition: 'Partly Cloudy',
    humidity: 62,
    windSpeed: 12
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get city display name
  const getCityDisplayName = () => {
    const city = cities.find(c => c.key === cityKey);
    return city ? city.name : 'Smart City';
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get active alerts count
  const activeAlerts = getActiveAlerts();
  const alertCount = activeAlerts.length;

  return (
    <header className="header">
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Icon name="menu" size={24} />
      </button>

      <div className="header-left">
        <h1>{getCityDisplayName()}</h1>
        <p className="current-time">{formatTime(currentTime)}</p>
      </div>
      
      <div className="header-right">
        {/* Connection Status */}
        <div className={`header-connection-status ${!isConnected ? 'disconnected' : ''}`}>
          <StatusIcon
            status={isConnected ? 'success' : 'loading'}
            size={12}
            className="header-connection-indicator"
          />
          <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
        </div>

        {/* Weather Widget */}
        <div className="weather-widget">
          <div className="weather-info">
            <Icon name="thermometer" size={16} />
            <span className="temperature">{weather.temperature}°C</span>
            <span className="condition">{weather.condition}</span>
          </div>
          <div className="weather-details">
            <span>Humidity: {weather.humidity}%</span>
            <span>Wind: {weather.windSpeed} km/h</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="notifications-btn" title="Notifications">
          <Icon name="bell" size={18} />
          {alertCount > 0 && (
            <span className="notification-badge">{alertCount}</span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={18} />
        </button>

        {/* User Profile */}
        <div className="user-profile">
          <div className="avatar">
            <Icon name="profile" size={18} />
          </div>
          <span>{user?.firstName || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}

export default PrototypeHeader;
