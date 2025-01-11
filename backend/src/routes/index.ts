import { Router } from 'express';
import healthRouter from './health.routes';
import quoteRouter from './quote.routes';
import searchHistoryRouter from './searchHistory.routes';

export const apiRoutes = Router();

// Health check route
apiRoutes.use('/health', healthRouter);

// Quotes routes
apiRoutes.use('/quotes', quoteRouter);

// Search history routes
apiRoutes.use('/search-history', searchHistoryRouter); 