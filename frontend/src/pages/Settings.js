import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useCity } from '../contexts/CityContext';
import { Icon, StatusIcon } from '../components/icons';
import { toast } from 'react-hot-toast';

function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { cityKey, setCityKey, cities } = useCity();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    critical: true
  });

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    toast.success('Notification settings updated');
  };

  const handleCityChange = (newCityKey) => {
    setCityKey(newCityKey);
    toast.success(`Switched to ${cities.find(c => c.key === newCityKey)?.name}`);
  };

  const settingSections = [
    {
      title: 'Appearance',
      icon: 'sun',
      settings: [
        {
          label: 'Dark Mode',
          description: 'Toggle between light and dark themes',
          type: 'toggle',
          value: isDark,
          onChange: toggleTheme
        }
      ]
    },
    {
      title: 'City Configuration',
      icon: 'globe',
      settings: [
        {
          label: 'Active City',
          description: 'Select the city to monitor',
          type: 'select',
          value: cityKey,
          options: cities.map(city => ({ value: city.key, label: city.name })),
          onChange: handleCityChange
        }
      ]
    },
    {
      title: 'Notifications',
      icon: 'bell',
      settings: [
        {
          label: 'Email Notifications',
          description: 'Receive alerts via email',
          type: 'toggle',
          value: notifications.email,
          onChange: () => handleNotificationChange('email')
        },
        {
          label: 'Push Notifications',
          description: 'Browser push notifications',
          type: 'toggle',
          value: notifications.push,
          onChange: () => handleNotificationChange('push')
        },
        {
          label: 'SMS Alerts',
          description: 'Critical alerts via SMS',
          type: 'toggle',
          value: notifications.sms,
          onChange: () => handleNotificationChange('sms')
        }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure system preferences and manage your Smart City OS experience
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Icon name={section.icon} size={24} className="text-primary-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {section.settings.map((setting, settingIndex) => (
                <div key={settingIndex} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {setting.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {setting.description}
                    </p>
                  </div>

                  <div className="ml-6">
                    {setting.type === 'toggle' ? (
                      <button
                        onClick={setting.onChange}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          setting.value ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            setting.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : setting.type === 'select' ? (
                      <select
                        value={setting.value}
                        onChange={(e) => setting.onChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {setting.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default Settings;
