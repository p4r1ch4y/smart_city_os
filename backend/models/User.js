const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 50]
    }
  },
  role: {
    type: DataTypes.ENUM,
    values: ['admin', 'traffic_officer', 'sanitation_officer', 'environmental_officer', 'citizen'],
    defaultValue: 'citizen',
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.refreshToken;
  return values;
};

// Class methods
User.getRolePermissions = (role) => {
  const permissions = {
    admin: [
      'user:read', 'user:write', 'user:delete',
      'sensor:read', 'sensor:write', 'sensor:delete',
      'alert:read', 'alert:write', 'alert:delete',
      'analytics:read', 'analytics:write',
      'blockchain:read', 'blockchain:write'
    ],
    traffic_officer: [
      'sensor:read', 'sensor:write',
      'alert:read', 'alert:write',
      'analytics:read'
    ],
    sanitation_officer: [
      'sensor:read', 'sensor:write',
      'alert:read', 'alert:write',
      'analytics:read'
    ],
    environmental_officer: [
      'sensor:read', 'sensor:write',
      'alert:read', 'alert:write',
      'analytics:read'
    ],
    citizen: [
      'sensor:read',
      'alert:read',
      'analytics:read'
    ]
  };
  
  return permissions[role] || permissions.citizen;
};

User.hasPermission = (userRole, requiredPermission) => {
  const userPermissions = User.getRolePermissions(userRole);
  return userPermissions.includes(requiredPermission);
};

module.exports = User;
