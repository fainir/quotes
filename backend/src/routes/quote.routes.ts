import { Router } from 'express';
import { QuoteController } from '../controllers/quote.controller';
import { QuoteService } from '../services/quote.service';
import { query } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();
const quoteService = new QuoteService();
const quoteController = new QuoteController(quoteService);

// Validation middleware
const validateQuoteRequest = [
  query('count')
    .exists()
    .withMessage('Count parameter is required')
    .isInt({ min: 1, max: 50 })
    .withMessage('Count must be between 1 and 50'),
  query('tags')
    .optional()
    .isString()
    .trim()
    .custom((value) => {
      if (value) {
        const tags = value.split(',').filter(Boolean);
        if (tags.length === 0) {
          throw new Error('Tags must not be empty');
        }
        if (tags.length > 5) {
          throw new Error('Maximum 5 tags allowed');
        }
      }
      return true;
    }),
  query('matchAll')
    .optional()
    .isBoolean()
    .withMessage('matchAll must be a boolean'),
  validateRequest,
];

// Routes
router.get('/tags', quoteController.getTypeaheadData);
router.get('/', validateQuoteRequest, quoteController.getRandomQuotes);

export default router; 