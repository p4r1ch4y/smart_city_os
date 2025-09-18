const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
let bcrypt;
try { bcrypt = require('bcryptjs'); } catch (e) { bcrypt = null; }

// Attach Sequelize class to the sequelize instance so existing code using
// User.sequelize.Sequelize.Op continues to work without edits.
try { sequelize.Sequelize = require('sequelize'); } catch (_) {}

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: { len: [3, 50] }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  firstName: { type: DataTypes.STRING(50), allowNull: false },
  lastName: { type: DataTypes.STRING(50), allowNull: false },
  role: {
    type: DataTypes.ENUM('admin','traffic_officer','sanitation_officer','environmental_officer','citizen'),
    defaultValue: 'citizen'
  },
  department: { type: DataTypes.STRING(100), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  refreshToken: { type: DataTypes.TEXT, allowNull: true },
  lastLogin: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'users',
  underscored: true
});

// Instance method to validate password. In fallback/no-DB dev scenarios, we allow
// plain-text compare if no bcrypt is available.
User.prototype.validatePassword = async function(candidate) {
  const stored = this.password || '';
  if (bcrypt && typeof stored === 'string' && stored.startsWith('$2')) {
    try { return await bcrypt.compare(candidate, stored); } catch (_) { return false; }
  }
  return candidate === stored;
};

// Role permissions helper similar to prior code expectations
const ROLE_PERMISSIONS = {
  admin: new Set(['manage_users','manage_alerts','view_dashboard','post_notices','manage_sensors','view_reports']),
  traffic_officer: new Set(['manage_alerts','view_dashboard','manage_sensors']),
  sanitation_officer: new Set(['manage_alerts','view_dashboard']),
  environmental_officer: new Set(['manage_alerts','view_dashboard','view_reports']),
  citizen: new Set(['view_dashboard'])
};

User.getRolePermissions = function(role) {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.citizen;
  return Array.from(perms);
};

User.hasPermission = function(role, permission) {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.citizen;
  return perms.has(permission);
};

// Hash password before save when bcrypt is available
if (bcrypt) {
  const hashIfChanged = async (user) => {
    if (user.changed('password') && user.password && !user.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  };
  User.beforeCreate(hashIfChanged);
  User.beforeUpdate(hashIfChanged);
}

module.exports = User;

