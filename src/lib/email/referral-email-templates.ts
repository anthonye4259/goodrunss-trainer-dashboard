/**
 * Referral Email Templates
 * Professional HTML email templates for referral campaign
 */

import type { WelcomeEmailData, ReferralInviteData, MilestoneEmailData } from './referral-email-service';

const BRAND_COLOR = '#10B981'; // Green
const ACCENT_COLOR = '#3B82F6'; // Blue

/**
 * Base email wrapper with branding
 */
function emailWrapper(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoodRunss</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${ACCENT_COLOR} 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                🏃‍♂️ GoodRunss
              </h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                Train Smarter. Connect Better.
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                © ${new Date().getFullYear()} GoodRunss. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This email was sent because you signed up for the GoodRunss waitlist.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Welcome email template
 */
export function welcomeEmailTemplate(data: WelcomeEmailData): string {
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">
      Welcome to the GoodRunss Community! ${data.badge}
    </h2>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      ${data.name ? `Hi ${data.name}! ` : 'Hi there! '}Thank you for joining our waitlist! 
      We're building something incredible, and you're now part of the journey.
    </p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid ${BRAND_COLOR}; padding: 20px; margin: 30px 0; border-radius: 8px;">
      <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase;">
        Your Unique Referral Code
      </p>
      <p style="margin: 0; color: #047857; font-size: 32px; font-weight: bold; letter-spacing: 2px;">
        ${data.referralCode}
      </p>
    </div>
    
    <h3 style="margin: 30px 0 15px; color: #111827; font-size: 20px;">
      🎁 Earn Incredible Rewards
    </h3>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Share your code with friends and unlock amazing rewards:
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        <td style="padding: 15px; background-color: #fef3c7; border-radius: 8px; margin-bottom: 10px;">
          <span style="font-size: 24px;">🥉</span>
          <strong style="color: #92400e; margin-left: 10px;">Bronze:</strong>
          <span style="color: #78350f; margin-left: 5px;">Early access (0-2 referrals)</span>
        </td>
      </tr>
      <tr><td style="height: 10px;"></td></tr>
      <tr>
        <td style="padding: 15px; background-color: #e0e7ff; border-radius: 8px; margin-bottom: 10px;">
          <span style="font-size: 24px;">🥈</span>
          <strong style="color: #3730a3; margin-left: 10px;">Silver:</strong>
          <span style="color: #4338ca; margin-left: 5px;">1 month free (3-9 referrals)</span>
        </td>
      </tr>
      <tr><td style="height: 10px;"></td></tr>
      <tr>
        <td style="padding: 15px; background-color: #fef9c3; border-radius: 8px; margin-bottom: 10px;">
          <span style="font-size: 24px;">🥇</span>
          <strong style="color: #713f12; margin-left: 10px;">Gold:</strong>
          <span style="color: #854d0e; margin-left: 5px;">3 months free (10-24 referrals)</span>
        </td>
      </tr>
      <tr><td style="height: 10px;"></td></tr>
      <tr>
        <td style="padding: 15px; background-color: #f3e8ff; border-radius: 8px;">
          <span style="font-size: 24px;">💎</span>
          <strong style="color: #581c87; margin-left: 10px;">Platinum:</strong>
          <span style="color: #6b21a8; margin-left: 5px;">1 year free + VIP (25+ referrals)</span>
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.referralUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${ACCENT_COLOR} 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Share Your Code Now
      </a>
    </div>
    
    <h3 style="margin: 30px 0 15px; color: #111827; font-size: 20px;">
      📱 What's Coming
    </h3>
    
    <ul style="color: #374151; font-size: 16px; line-height: 1.8; padding-left: 20px;">
      <li>Find and book top trainers in your area</li>
      <li>Discover nearby facilities and courts</li>
      <li>Connect with players for pickup games</li>
      <li>Track your fitness journey with AI insights</li>
      <li>Seamless payments and scheduling</li>
    </ul>
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Questions? Just reply to this email—we'd love to hear from you!
    </p>
  `;
  
  return emailWrapper(content);
}

/**
 * Referral invite template
 */
export function referralInviteTemplate(data: ReferralInviteData): string {
  const content = `
    <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">
      ${data.fromName || 'Your friend'} invited you to join GoodRunss!
    </h2>
    
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      Hey there! ${data.fromName ? `<strong>${data.fromName}</strong>` : 'A friend'} thought you'd love GoodRunss—a revolutionary 
      fitness platform that connects trainers, facilities, and players all in one place.
    </p>
    
    ${data.personalMessage ? `
      <div style="background-color: #f9fafb; border-left: 4px solid ${ACCENT_COLOR}; padding: 20px; margin: 20px 0; border-radius: 8px; font-style: italic; color: #4b5563;">
        "${data.personalMessage}"
      </div>
    ` : ''}
    
    <div style="background-color: #eff6ff; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
      <p style="margin: 0 0 15px; color: #1e40af; font-size: 16px; font-weight: 600;">
        Use this referral code to join:
      </p>
      <p style="margin: 0 0 20px; color: #1e3a8a; font-size: 36px; font-weight: bold; letter-spacing: 2px;">
        ${data.referralCode}
      </p>
      <a href="${data.referralUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${ACCENT_COLOR} 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Join the Waitlist
      </a>
    </div>
    
    <h3 style="margin: 30px 0 15px; color: #111827; font-size: 20px;">
      🎯 What is GoodRunss?
    </h3>
    
    <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
      GoodRunss is the ultimate fitness ecosystem where you can:
    </p>
    
    <ul style="color: #374151; font-size: 16px; line-height: 1.8; padding-left: 20px;">
      <li><strong>Find trainers</strong> who match your fitness goals</li>
      <li><strong>Book facilities</strong> near you instantly</li>
      <li><strong>Connect with players</strong> for games and workouts</li>
      <li><strong>Track progress</strong> with AI-powered insights</li>
    </ul>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
        <strong>🎁 Bonus:</strong> When you join, you'll also get your own referral code to share with friends 
        and earn free months at launch!
      </p>
    </div>
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
      Can't wait to see you in the community! 🏃‍♂️
    </p>
  `;
  
  return emailWrapper(content);
}

/**
 * Milestone achievement template
 */
export function milestoneEmailTemplate(data: MilestoneEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 72px; margin-bottom: 10px;">${data.badge}</div>
      <h2 style="margin: 0; color: #111827; font-size: 28px;">
        Congratulations${data.name ? `, ${data.name}` : ''}!
      </h2>
    </div>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
      <p style="margin: 0 0 10px; color: #78350f; font-size: 18px;">
        You've reached the <strong>${data.tier.toUpperCase()}</strong> tier!
      </p>
      <p style="margin: 0; color: #92400e; font-size: 42px; font-weight: bold;">
        ${data.referralCount} Referral${data.referralCount > 1 ? 's' : ''}
      </p>
    </div>
    
    <h3 style="margin: 30px 0 15px; color: #111827; font-size: 22px; text-align: center;">
      🎁 Your Rewards
    </h3>
    
    <div style="background-color: #f0fdf4; padding: 25px; border-radius: 12px; margin: 20px 0;">
      <ul style="list-style: none; padding: 0; margin: 0; color: #065f46; font-size: 18px; line-height: 2;">
        <li style="margin-bottom: 10px;">
          <strong style="font-size: 24px;">✅</strong> 
          <strong>${data.freeMonths} month${data.freeMonths > 1 ? 's' : ''} free</strong> at launch
        </li>
        <li style="margin-bottom: 10px;">
          <strong style="font-size: 24px;">✅</strong> 
          <strong>Early access</strong> to the platform
        </li>
        ${data.tier === 'platinum' ? `
          <li style="margin-bottom: 10px;">
            <strong style="font-size: 24px;">✅</strong> 
            <strong>VIP status</strong> with exclusive benefits
          </li>
        ` : ''}
      </ul>
    </div>
    
    ${data.nextMilestone ? `
      <h3 style="margin: 30px 0 15px; color: #111827; font-size: 20px;">
        🎯 Next Milestone: ${data.nextMilestone.badge} ${data.nextMilestone.tier.toUpperCase()}
      </h3>
      
      <p style="margin: 0 0 15px; color: #374151; font-size: 16px; line-height: 1.6;">
        You're only <strong>${data.nextMilestone.remaining} referral${data.nextMilestone.remaining > 1 ? 's' : ''}</strong> away 
        from the next tier!
      </p>
      
      <div style="background-color: #f3f4f6; height: 24px; border-radius: 12px; overflow: hidden; margin: 20px 0;">
        <div style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${ACCENT_COLOR} 100%); height: 100%; width: ${(data.referralCount / data.nextMilestone.needed) * 100}%; border-radius: 12px;"></div>
      </div>
      
      <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; text-align: center;">
        ${data.referralCount} of ${data.nextMilestone.needed} referrals
      </p>
    ` : `
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; color: #065f46; font-size: 18px; font-weight: 600;">
          🏆 You've reached the maximum tier!
        </p>
        <p style="margin: 10px 0 0; color: #047857; font-size: 14px;">
          Keep sharing to help more people discover GoodRunss!
        </p>
      </div>
    `}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://goodrunss.com'}/waitlist" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${ACCENT_COLOR} 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Your Dashboard
      </a>
    </div>
    
    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
      Thank you for being an amazing advocate for GoodRunss! 💚
    </p>
  `;
  
  return emailWrapper(content);
}


















