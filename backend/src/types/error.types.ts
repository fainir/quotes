export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
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
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorCodeToStatusCode: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.EXTERNAL_API_ERROR]: 502,
  [ErrorCode.RATE_LIMIT_ERROR]: 429,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
}; 