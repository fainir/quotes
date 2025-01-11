import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { apiRoutes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { testConnection, initializeDatabase } from './config/database';

const app = express();
const port = process.env.PORT || 8000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to database. Server will start without database functionality.');
    } else {
      // Initialize database (sync models)
      await initializeDatabase();
    }

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 