import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/raksha',
  JWT_SECRET: process.env.JWT_SECRET || 'raksha_secure_jwt_token_secret_2026',
  ORS_API_KEY: process.env.ORS_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
