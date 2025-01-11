import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'quotes_db',
};

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate({ logging: false });
    console.log('Database connection established successfully.');
    return true;
  } catch {
    return false;
  }
};

// Initialize all models and relationships
export const initializeDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

export default sequelize;
