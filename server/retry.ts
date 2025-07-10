// Retry logic with exponential backoff

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  retryCondition?: (error: any) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if condition fails
      if (options.retryCondition && !options.retryCondition(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === options.maxAttempts) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        options.baseDelay * Math.pow(2, attempt - 1),
        options.maxDelay
      );
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Default retry condition for API calls
export function shouldRetryAPICall(error: any): boolean {
  // Retry on network errors, 5xx errors, and rate limits
  return (
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ENOTFOUND' ||
    (error.statusCode && error.statusCode >= 500) ||
    error.statusCode === 429
  );
}