/**
 * Referral Email Service - Resend Integration
 * Handles sending referral-related emails
 */

import { Resend } from 'resend';
import { 
  welcomeEmailTemplate, 
  referralInviteTemplate,
  milestoneEmailTemplate 
} from './referral-email-templates';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'GoodRunss <anthony@goodrunss.com>';
const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO_EMAIL || 'anthony@goodrunss.com';

export interface WelcomeEmailData {
  email: string;
  name?: string;
  referralCode: string;
  referralUrl: string;
  tier: string;
  badge: string;
}

export interface ReferralInviteData {
  toEmail: string;
  fromName?: string;
  fromEmail: string;
  referralCode: string;
  referralUrl: string;
  personalMessage?: string;
}

export interface MilestoneEmailData {
  email: string;
  name?: string;
  referralCount: number;
  tier: string;
  badge: string;
  freeMonths: number;
  nextMilestone?: {
    tier: string;
    badge: string;
    needed: number;
    remaining: number;
  };
}

/**
 * Send welcome email with referral code
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const html = welcomeEmailTemplate(data);
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      replyTo: REPLY_TO_EMAIL,
      subject: `Welcome to GoodRunss! Your referral code: ${data.referralCode}`,
      html,
    });

    console.log('✅ Welcome email sent:', result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Send referral invite email
 */
export async function sendReferralInvite(data: ReferralInviteData) {
  try {
    const html = referralInviteTemplate(data);
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.toEmail,
      replyTo: data.fromEmail,
      subject: `${data.fromName || 'Your friend'} invited you to join GoodRunss!`,
      html,
    });

    console.log('✅ Referral invite sent:', result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('❌ Error sending referral invite:', error);
    return { success: false, error };
  }
}

/**
 * Send milestone achievement email
 */
export async function sendMilestoneEmail(data: MilestoneEmailData) {
  try {
    const html = milestoneEmailTemplate(data);
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      replyTo: REPLY_TO_EMAIL,
      subject: `🎉 Milestone Reached! You've earned ${data.freeMonths} month${data.freeMonths > 1 ? 's' : ''} free!`,
      html,
    });

    console.log('✅ Milestone email sent:', result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('❌ Error sending milestone email:', error);
    return { success: false, error };
  }
}

/**
 * Send batch referral invites
 */
export async function sendBatchReferralInvites(
  emails: string[],
  fromData: { name?: string; email: string; referralCode: string; referralUrl: string; personalMessage?: string }
) {
  const results = await Promise.allSettled(
    emails.map(email => 
      sendReferralInvite({
        toEmail: email,
        fromName: fromData.name,
        fromEmail: fromData.email,
        referralCode: fromData.referralCode,
        referralUrl: fromData.referralUrl,
        personalMessage: fromData.personalMessage,
      })
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    total: emails.length,
    successful,
    failed,
    results,
  };
}







