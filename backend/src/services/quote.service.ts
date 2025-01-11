import axios from 'axios';
import NodeCache from 'node-cache';
import { IQuote, FavQsApiResponse, TypeaheadResponse } from '../types/quote.types';
import { AppError, ErrorCode } from '../types/error.types';

export class QuoteService {
  private readonly baseUrl = 'https://favqs.com/api';
  private readonly apiKey = process.env.FAVQS_API_KEY;
  private readonly cache: NodeCache;

  constructor() {
    if (!this.apiKey) {
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'FAVQS_API_KEY is required but not set in environment variables',
        500
      );
    }
    // Initialize cache with 1 hour TTL
    this.cache = new NodeCache({ 
      stdTTL: 3600,
      checkperiod: 120,
      useClones: false
    });
  }

  private getHeaders() {
    return {
      'Authorization': `Token token="${this.apiKey}"`,
      'Content-Type': 'application/json'
    };
  }

  async getTypeaheadData(): Promise<TypeaheadResponse> {
    const cacheKey = 'typeahead:data';
    const cachedData = this.cache.get<TypeaheadResponse>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/typeahead`, {
        headers: this.getHeaders()
      });

      const data = response.data as TypeaheadResponse;
      
      // Cache the results
      this.cache.set(cacheKey, data);

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || 'Failed to fetch typeahead data';
        
        if (statusCode === 429) {
          throw new AppError(
            ErrorCode.RATE_LIMIT_ERROR,
            'Rate limit exceeded for FavQs API',
            429
          );
        }

        throw new AppError(
          ErrorCode.EXTERNAL_API_ERROR,
          errorMessage,
          statusCode,
          { originalError: error.message }
        );
      }
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch typeahead data',
        500,
        { originalError: error }
      );
    }
  }

  private async fetchQuotesForTag(tag: string): Promise<IQuote[]> {
    const cacheKey = `tag:${tag}`;
    const cachedQuotes = this.cache.get<IQuote[]>(cacheKey);
    
    if (cachedQuotes) {
      return cachedQuotes;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/quotes`, {
        headers: this.getHeaders(),
        params: {
          filter: tag,
          type: 'tag'
        }
      });

      const data = response.data as FavQsApiResponse;
      
      if (data.error_code) {
        throw new AppError(
          ErrorCode.EXTERNAL_API_ERROR,
          data.message || 'Error fetching quotes from FavQs API',
          502,
          { error_code: data.error_code, tag }
        );
      }

      const quotes = data.quotes.map(quote => ({
        id: quote.id,
        author: quote.author,
        body: quote.body,
        tags: quote.tags || [],
      }));

      // Cache the results
      this.cache.set(cacheKey, quotes);

      return quotes;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        
        if (statusCode === 429) {
          throw new AppError(
            ErrorCode.RATE_LIMIT_ERROR,
            'Rate limit exceeded for FavQs API',
            429
          );
        }

        throw new AppError(
          ErrorCode.EXTERNAL_API_ERROR,
          `Failed to fetch quotes for tag: ${tag}`,
          statusCode,
          { originalError: error.message, tag }
        );
      }
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Failed to fetch quotes for tag: ${tag}`,
        500,
        { originalError: error, tag }
      );
    }
  }

  private async fetchQuotes(count: number, tags?: string[], matchAll: boolean = false): Promise<IQuote[]> {
    try {
      if (tags && tags.length > 0) {
        const quotesPerTag = await Promise.all(
          tags.map(tag => this.fetchQuotesForTag(tag))
        );

        let combinedQuotes: IQuote[];

        if (matchAll) {
          combinedQuotes = quotesPerTag.reduce((acc, tagQuotes, index) => {
            if (index === 0) return tagQuotes;
            return acc.filter(quote =>
              tagQuotes.some(tq => tq.id === quote.id)
            );
          }, [] as IQuote[]);
        } else {
          const uniqueQuotes = new Map<number, IQuote>();
          quotesPerTag.flat().forEach(quote => {
            if (!uniqueQuotes.has(quote.id)) {
              uniqueQuotes.set(quote.id, quote);
            }
          });
          combinedQuotes = Array.from(uniqueQuotes.values());
        }

        if (combinedQuotes.length === 0) {
          throw new AppError(
            ErrorCode.NOT_FOUND,
            `No quotes found for the specified tags: ${tags.join(', ')}`,
            404,
            { tags, matchAll }
          );
        }

        return combinedQuotes.slice(0, count);
      } else {
        const quotes: IQuote[] = [];
        const errors: Error[] = [];
        
        for (let i = 0; i < count; i++) {
          try {
            const response = await axios.get(`${this.baseUrl}/qotd`, {
              headers: this.getHeaders()
            });
            
            if (response.data && response.data.quote) {
              quotes.push({
                id: response.data.quote.id,
                author: response.data.quote.author,
                body: response.data.quote.body,
                tags: response.data.quote.tags || [],
              });
            }
          } catch (error) {
            errors.push(error as Error);
          }
        }

        if (quotes.length === 0 && errors.length > 0) {
          throw new AppError(
            ErrorCode.EXTERNAL_API_ERROR,
            'Failed to fetch any quotes from FavQs API',
            502,
            { errors: errors.map(e => e.message) }
          );
        }

        return quotes;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || 'Failed to fetch quotes from FavQs API';
        
        if (statusCode === 429) {
          throw new AppError(
            ErrorCode.RATE_LIMIT_ERROR,
            'Rate limit exceeded for FavQs API',
            429
          );
        }

        throw new AppError(
          ErrorCode.EXTERNAL_API_ERROR,
          errorMessage,
          statusCode,
          { originalError: error.message }
        );
      }
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Failed to fetch quotes',
        500,
        { originalError: error }
      );
    }
  }

  async getRandomQuotes(count: number, tags?: string[], matchAll: boolean = false): Promise<IQuote[]> {
    if (count < 1 || count > 50) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Number of quotes must be between 1 and 50',
        400,
        { count }
      );
    }

    return this.fetchQuotes(count, tags, matchAll);
  }
} 