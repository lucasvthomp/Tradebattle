import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
  }
}

/**
 * Log error with timestamp
 */
export function logError(error: Error, req?: Request): void {
  const timestamp = new Date().toISOString();
  const url = req ? `${req.method} ${req.url}` : 'Unknown';
  
  console.error(`[${timestamp}] ${url} - ${error.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }
}

/**
 * Express error handling middleware
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logError(error, req);

  // Handle known operational errors
  if ('isOperational' in error && error.isOperational) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    });
    return;
  }

  // Handle Yahoo Finance API errors
  if (error.message.includes('Not Found') || error.message.includes('Invalid symbol')) {
    res.status(404).json({
      success: false,
      error: 'Symbol not found',
      statusCode: 404,
    });
    return;
  }

  if (error.message.includes('Rate limit') || error.message.includes('429')) {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      statusCode: 429,
    });
    return;
  }

  // Handle network/timeout errors
  if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
    res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable. Please try again.',
      statusCode: 503,
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    statusCode: 500,
  });
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validate stock symbol format
 */
export function validateSymbol(symbol: string): boolean {
  // Basic validation: alphanumeric, 1-5 characters, optionally with dots or dashes
  const symbolRegex = /^[A-Za-z0-9.-]{1,10}$/;
  return symbolRegex.test(symbol);
}

/**
 * Sanitize input strings
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}