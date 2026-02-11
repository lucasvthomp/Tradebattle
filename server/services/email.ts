import { randomBytes } from "crypto";

/**
 * Email service for sending verification emails, password resets, etc.
 *
 * In production, wire this up to Resend, SendGrid, or AWS SES.
 * For now, this logs emails to console (development mode).
 */

const APP_NAME = "ORSATH";
const APP_URL = process.env.APP_URL || "http://localhost:5000";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In production, integrate with a real email provider here.
  // For development, log to console.
  if (process.env.NODE_ENV === "production" && process.env.SMTP_HOST) {
    // Future: integrate with actual SMTP/API provider
    console.log(`[EMAIL] Would send to ${options.to}: ${options.subject}`);
    return true;
  }

  console.log(`\n========== EMAIL ==========`);
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body: ${options.text || options.html}`);
  console.log(`===========================\n`);
  return true;
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: `${APP_NAME} - Verify your email address`,
    html: `
      <h2>Welcome to ${APP_NAME}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#E3B341;color:#080C14;text-decoration:none;border-radius:8px;font-weight:bold;">Verify Email</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verifyUrl}</p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
    text: `Welcome to ${APP_NAME}! Verify your email by visiting: ${verifyUrl} (expires in 24 hours)`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: `${APP_NAME} - Reset your password`,
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your ${APP_NAME} account.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#E3B341;color:#080C14;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
    `,
    text: `Reset your ${APP_NAME} password by visiting: ${resetUrl} (expires in 1 hour)`,
  });
}

export async function sendNotificationEmail(email: string, title: string, message: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `${APP_NAME} - ${title}`,
    html: `
      <h2>${title}</h2>
      <p>${message}</p>
      <p><a href="${APP_URL}" style="display:inline-block;padding:12px 24px;background:#E3B341;color:#080C14;text-decoration:none;border-radius:8px;font-weight:bold;">Go to ${APP_NAME}</a></p>
    `,
    text: `${title}: ${message}`,
  });
}
