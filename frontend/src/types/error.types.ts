export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  stack?: string;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    switch (error.code) {
      case ErrorCode.VALIDATION_ERROR:
        return error.message;
      case ErrorCode.NOT_FOUND:
        if (error.message.includes('tags')) {
          return 'No quotes found with the selected tags. Try selecting different tags or fewer tags.';
        }
        return 'The requested quotes could not be found. Please try again.';
      case ErrorCode.EXTERNAL_API_ERROR:
        return 'The quotes service is currently experiencing issues. Please try again in a few moments.';
      case ErrorCode.RATE_LIMIT_ERROR:
        return 'You\'ve made too many requests. Please wait a moment before trying again.';
      case ErrorCode.NETWORK_ERROR:
        if (error.message.includes('connect')) {
          return 'Unable to connect to the server. Please check your internet connection.';
        }
        if (error.message.includes('parse')) {
          return 'There was a problem processing the server response. Please try again.';
        }
        return 'Network error. Please check your internet connection and try again.';
      case ErrorCode.INTERNAL_SERVER_ERROR:
        return 'The server encountered an error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
  return 'An unexpected error occurred. Please try again later.';
}; 