// Custom error types for better error handling

export class APIError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class RateLimitError extends APIError {
  constructor(provider: string, resetTime?: number) {
    super(`Rate limit exceeded for ${provider}`, provider, 429, true);
    this.name = 'RateLimitError';
    this.resetTime = resetTime;
  }
  
  resetTime?: number;
}

export class DataValidationError extends Error {
  constructor(message: string, public data?: any) {
    super(message);
    this.name = 'DataValidationError';
  }
}

export class NoDataError extends APIError {
  constructor(provider: string, symbol: string, period: string) {
    super(`No data available for ${symbol} (${period}) from ${provider}`, provider, 404, false);
    this.name = 'NoDataError';
  }
}

// Data validation helpers
export function validateQuoteData(data: any): boolean {
  return (
    data &&
    typeof data.c === 'number' &&
    data.c > 0 &&
    typeof data.pc === 'number' &&
    data.pc > 0
  );
}

export function validateHistoricalData(data: any): boolean {
  return (
    data &&
    Array.isArray(data.c) &&
    data.c.length > 0 &&
    data.c.every((price: any) => typeof price === 'number' && price > 0)
  );
}

export function validateTwelveDataResponse(data: any): boolean {
  return (
    data &&
    !data.status?.includes('error') &&
    Array.isArray(data.values) &&
    data.values.length > 0
  );
}