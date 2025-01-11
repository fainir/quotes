import { Quote, TypeaheadTag } from '../types/models';
import { AppError, ErrorCode, ApiError } from '../types/error.types';

const BASE_URL = 'http://localhost:8000/api/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
      // Convert backend error to frontend AppError
      throw new AppError(
        errorData.code as ErrorCode,
        errorData.message || 'An error occurred',
        errorData.details
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // If we couldn't parse the error response
      throw new AppError(
        ErrorCode.NETWORK_ERROR,
        'Failed to process server response',
        { status: response.status }
      );
    }
  }

  try {
    return await response.json();
  } catch (error) {
    throw new AppError(
      ErrorCode.NETWORK_ERROR,
      'Failed to parse server response',
      { error }
    );
  }
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    const response = await fetch(url, options);
    return await handleResponse<T>(response);
  } catch (error) {
    if (retries > 0 && error instanceof AppError && error.code === ErrorCode.RATE_LIMIT_ERROR) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry<T>(url, options, retries - 1);
    }
    throw error;
  }
}

export const quotesApi = {
  async getQuotes(count: number, tags: string[], matchAll = false): Promise<Quote[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('count', count.toString());
    if (tags.length > 0) {
      queryParams.append('tags', tags.join(','));
    }
    if (matchAll) {
      queryParams.append('matchAll', 'true');
    }
    
    try {
      return await fetchWithRetry<Quote[]>(
        `${BASE_URL}/quotes?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(
          ErrorCode.NETWORK_ERROR,
          'Failed to connect to the server',
          { originalError: error.message }
        );
      }
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred while fetching quotes'
      );
    }
  },

  async getTags(): Promise<TypeaheadTag[]> {
    try {
      const data = await fetchWithRetry<{ tags: TypeaheadTag[] }>(
        `${BASE_URL}/quotes/tags`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      return data.tags || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AppError(
          ErrorCode.NETWORK_ERROR,
          'Failed to connect to the server',
          { originalError: error.message }
        );
      }
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred while fetching tags'
      );
    }
  }
}; 