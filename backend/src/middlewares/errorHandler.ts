import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError, ErrorCode, ApiError } from '../types/error.types';

const isProd = process.env.NODE_ENV === 'production';

function logError(err: Error | AppError) {
  console.error('Error 💥', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...(err instanceof AppError && {
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    }),
  });
}

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  logError(err);

  if (err instanceof AppError) {
    const errorResponse: ApiError = {
      code: err.code,
      message: err.message,
      details: err.details,
      ...(isProd ? {} : { stack: err.stack }),
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Programming or other unknown error
  const errorResponse: ApiError = {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: isProd ? 'Something went wrong!' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  };

  res.status(500).json(errorResponse);
}; 