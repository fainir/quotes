import { Router } from 'express';
import { getSearchHistory, clearSearchHistory } from '../models/searchHistory';

const router = Router();

// Get search history with pagination
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const history = await getSearchHistory(page, limit);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Clear search history
router.delete('/', async (req, res, next) => {
  try {
    await clearSearchHistory();
    res.json({ message: 'Search history cleared successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;