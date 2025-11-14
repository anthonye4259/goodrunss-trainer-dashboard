/**
 * Email Service using Resend
 * 
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Get API key from dashboard
 * 3. Verify your domain (or use onboarding domain for testing)
 * 4. Add to .env: RESEND_API_KEY=re_...
 */

import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email sending will fail.');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'GoodRunss <noreply@goodrunss.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@goodrunss.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://goodrunss.com';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

// Send email
export async function sendEmail(options: EmailOptions) {
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || REPLY_TO,
      attachments: options.attachments,
    });

    console.log('Email sent:', response);
    return { success: true, id: response.id };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  // Welcome email
  welcome: (name: string) => ({
    subject: `Welcome to GoodRunss, ${name}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007AFF; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #007AFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to GoodRunss! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We're thrilled to have you join our community of fitness enthusiasts and professional trainers!</p>
              <p>With GoodRunss, you can:</p>
              <ul>
                <li>Find certified trainers near you</li>
                <li>Book sessions instantly</li>
                <li>Train with AI-powered virtual coaches</li>
                <li>Track your fitness journey</li>
              </ul>
              <center>
                <a href="${APP_URL}/explore" class="button">Explore Trainers</a>
              </center>
              <p>Need help getting started? Our support team is here for you!</p>
              <p>Best regards,<br>The GoodRunss Team</p>
            </div>
            <div class="footer">
              <p>© 2025 GoodRunss. All rights reserved.</p>
              <p><a href="${APP_URL}">Website</a> | <a href="${APP_URL}/support">Support</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Booking confirmation
  bookingConfirmation: (data: {
    userName: string;
    trainerName: string;
    date: string;
    time: string;
    location: string;
    bookingId: string;
  }) => ({
    subject: `Booking Confirmed with ${data.trainerName} ✅`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007AFF;">Booking Confirmed! ✅</h2>
            <p>Hi ${data.userName},</p>
            <p>Your training session has been confirmed:</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Trainer:</strong> ${data.trainerName}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Time:</strong> ${data.time}</p>
              <p><strong>Location:</strong> ${data.location}</p>
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            </div>
            <p>We'll send you a reminder 24 hours and 1 hour before your session.</p>
            <center>
              <a href="${APP_URL}/bookings/${data.bookingId}" style="display: inline-block; background: #007AFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">View Booking</a>
            </center>
            <p>See you soon!<br>The GoodRunss Team</p>
          </div>
        </body>
      </html>
    `,
  }),

  // Payment receipt
  paymentReceipt: (data: {
    userName: string;
    amount: string;
    currency: string;
    trainerName: string;
    date: string;
    paymentId: string;
  }) => ({
    subject: `Payment Receipt - ${data.amount} ${data.currency}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007AFF;">Payment Receipt 💳</h2>
            <p>Hi ${data.userName},</p>
            <p>Your payment has been processed successfully.</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
              <p><strong>Trainer:</strong> ${data.trainerName}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Payment ID:</strong> ${data.paymentId}</p>
            </div>
            <p>Thank you for using GoodRunss!</p>
            <center>
              <a href="${APP_URL}/payments/${data.paymentId}" style="display: inline-block; background: #007AFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">View Receipt</a>
            </center>
            <p>Best regards,<br>The GoodRunss Team</p>
          </div>
        </body>
      </html>
    `,
  }),

  // Session reminder
  sessionReminder: (data: {
    userName: string;
    trainerName: string;
    time: string;
    location: string;
    hours: number;
  }) => ({
    subject: `Reminder: Session with ${data.trainerName} in ${data.hours}h ⏰`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007AFF;">Session Reminder ⏰</h2>
            <p>Hi ${data.userName},</p>
            <p>This is a reminder that you have a training session coming up in ${data.hours} hour${data.hours > 1 ? 's' : ''}:</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Trainer:</strong> ${data.trainerName}</p>
              <p><strong>Time:</strong> ${data.time}</p>
              <p><strong>Location:</strong> ${data.location}</p>
            </div>
            <p>Don't forget to bring water and wear comfortable workout clothes!</p>
            <p>See you soon!<br>The GoodRunss Team</p>
          </div>
        </body>
      </html>
    `,
  }),

  // Waitlist notification
  waitlistNotification: (data: {
    userName: string;
    trainerName: string;
    date: string;
    time: string;
    waitlistId: string;
  }) => ({
    subject: `🎉 Spot Available with ${data.trainerName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #28a745;">Spot Available! 🎉</h2>
            <p>Hi ${data.userName},</p>
            <p>Great news! A spot has opened up with ${data.trainerName}:</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Trainer:</strong> ${data.trainerName}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Time:</strong> ${data.time}</p>
            </div>
            <p><strong>Book quickly</strong> - this spot is available to others on the waitlist too!</p>
            <center>
              <a href="${APP_URL}/waitlist/${data.waitlistId}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Book Now</a>
            </center>
            <p>Best regards,<br>The GoodRunss Team</p>
          </div>
        </body>
      </html>
    `,
  }),

  // Password reset
  passwordReset: (data: { userName: string; resetLink: string }) => ({
    subject: 'Reset Your GoodRunss Password',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007AFF;">Reset Your Password</h2>
            <p>Hi ${data.userName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <center>
              <a href="${data.resetLink}" style="display: inline-block; background: #007AFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
            </center>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br>The GoodRunss Team</p>
          </div>
        </body>
      </html>
    `,
  }),
};

