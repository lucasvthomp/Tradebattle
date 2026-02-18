import { Request, Response, NextFunction } from 'express';

/**
 * Simple input sanitization middleware
 * Removes potentially dangerous characters from string inputs
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query params
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
}

function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
}

function sanitizeString(str: string): string {
  if (!str) return str;

  // Remove null bytes
  str = str.replace(/\0/g, '');

  // Remove or escape potentially dangerous patterns
  // Remove script tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove iframe tags
  str = str.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove on* event handlers
  str = str.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  str = str.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Limit string length to prevent DOS attacks
  if (str.length > 10000) {
    str = str.substring(0, 10000);
  }

  return str;
}

/**
 * Validate and sanitize numeric inputs
 */
export function validateNumeric(value: any, fieldName: string = 'value'): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`Invalid ${fieldName}: must be a valid number`);
  }
  return num;
}

/**
 * Validate and sanitize email inputs
 */
export function validateEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  if (sanitized.length > 255) {
    throw new Error('Email too long');
  }

  return sanitized;
}

/**
 * Validate cryptocurrency address format
 */
export function validateCryptoAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    throw new Error('Address is required');
  }

  const sanitized = address.trim();

  // Basic validation - alphanumeric and some special chars
  if (!/^[a-zA-Z0-9]+$/.test(sanitized)) {
    throw new Error('Invalid address format');
  }

  if (sanitized.length < 26 || sanitized.length > 100) {
    throw new Error('Invalid address length');
  }

  return sanitized;
}
