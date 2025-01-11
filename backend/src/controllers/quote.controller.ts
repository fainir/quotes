import { Request, Response, NextFunction } from 'express';
import { QuoteService } from '../services/quote.service';
import { AppError } from '../middlewares/errorHandler';

export class QuoteController {
  constructor(private quoteService: QuoteService) {}

  getRandomQuotes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const count = parseInt(req.query.count as string);
      const tags = req.query.tags ? (req.query.tags as string).split(',').filter(Boolean) : undefined;
      const matchAll = req.query.matchAll === 'true';

      if (isNaN(count)) {
        throw new AppError('Count parameter must be a number', 400);
      }

      const quotes = await this.quoteService.getRandomQuotes(count, tags, matchAll);
      res.status(200).json(quotes);
    } catch (error) {
      next(error);
    }
  };

  getTypeaheadData = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.quoteService.getTypeaheadData();
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };
} 