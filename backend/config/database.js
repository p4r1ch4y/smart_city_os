const { Sequelize } = require('sequelize');
require('dotenv').config();

// Build sequelize options supporting both DATABASE_URL and discrete params, with optional SSL
const buildSequelize = () => {
  const {
    DATABASE_URL,
    DB_HOST = 'localhost',
    DB_PORT = 5432,
    DB_NAME = 'smart_city_os',
    DB_USER = 'postgres',
    DB_PASSWORD = 'password',
    DB_SSL,
    DB_SSL_REJECT_UNAUTHORIZED,
    NODE_ENV
  } = process.env;

  const baseOptions = {
    dialect: 'postgres',
    logging: NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { timestamps: true, underscored: true, freezeTableName: true }
  };

  // SSL handling: Neon typically requires SSL. Default to require SSL if DATABASE_URL includes neon.tech
  const needSSL = (DB_SSL === 'true') || (DATABASE_URL && /neon\.tech/.test(DATABASE_URL));
  const rejectUnauthorized = DB_SSL_REJECT_UNAUTHORIZED === 'true' ? true : false;

  if (needSSL) {
    baseOptions.dialectOptions = {
      ssl: {
        require: true,
        // For managed services like Neon, often a self-signed cert is used.
        // Make this configurable while defaulting to false to ease development.
        rejectUnauthorized
      }
    };
  }

  if (DATABASE_URL && DATABASE_URL.startsWith('postgres')) {
    return new Sequelize(DATABASE_URL, baseOptions);
  }

  return new Sequelize({
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    ...baseOptions
  });
};

const sequelize = buildSequelize();

// Connection test helper (returns boolean and error if any)
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return { ok: true };
  } catch (error) {
    console.error('Unable to connect to the database:', error.message || error);
    return { ok: false, error };
  }
};

module.exports = {
  sequelize,
  testConnection
};
