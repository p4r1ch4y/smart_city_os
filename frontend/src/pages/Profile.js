import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Icon, StatusIcon } from '../components/icons';
import { toast } from 'react-hot-toast';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || '',
    department: user?.department || '',
    phone: user?.phone || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || '',
      department: user?.department || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const profileSections = [
    {
      title: 'Personal Information',
      icon: 'profile',
      fields: [
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'email', label: 'Email Address', type: 'email' },
        { key: 'phone', label: 'Phone Number', type: 'tel' }
      ]
    },
    {
      title: 'Professional Details',
      icon: 'building2',
      fields: [
        { key: 'role', label: 'Role', type: 'text', readonly: true },
        { key: 'department', label: 'Department', type: 'text' }
      ]
    }
  ];

  const activityLog = [
    { action: 'Dashboard accessed', timestamp: Date.now() - 300000, icon: 'dashboard' },
    { action: 'Alert acknowledged', timestamp: Date.now() - 1800000, icon: 'alerts' },
    { action: 'Settings updated', timestamp: Date.now() - 3600000, icon: 'settings' },
    { action: 'Sensor data reviewed', timestamp: Date.now() - 7200000, icon: 'sensors' },
    { action: 'Analytics report generated', timestamp: Date.now() - 14400000, icon: 'analytics' }
  ];

  const formatTimestamp = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account information and view activity history
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <StatusIcon status="success" size={16} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Account Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {profileSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon name={section.icon} size={24} className="text-primary-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  {sectionIndex === 0 && (
                    <button
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                    >
                      {isEditing ? 'Save' : 'Edit'}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.label}
                    </label>
                    {isEditing && !field.readonly ? (
                      <input
                        type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {formData[field.key] || 'Not specified'}
                      </p>
                    )}
                  </div>
                ))}

                {isEditing && sectionIndex === 0 && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Log */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Icon name="activity" size={24} className="text-primary-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {activityLog.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon name={activity.icon} size={16} className="text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Profile;
