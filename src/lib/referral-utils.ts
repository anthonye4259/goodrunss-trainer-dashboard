/**
 * Referral System Utilities
 * Generate codes, calculate tiers, and helper functions
 */

export interface ReferralTier {
  name: string;
  minReferrals: number;
  maxReferrals: number | null;
  freeMonths: number;
  earlyAccess: boolean;
  vipStatus: boolean;
  badge: string;
  description: string;
  color: string;
}

// Default reward tiers (can be customized in DB)
export const REWARD_TIERS: ReferralTier[] = [
  {
    name: 'bronze',
    minReferrals: 0,
    maxReferrals: 2,
    freeMonths: 0,
    earlyAccess: true,
    vipStatus: false,
    badge: '🥉',
    description: 'Early access to GoodRunss at launch',
    color: '#CD7F32'
  },
  {
    name: 'silver',
    minReferrals: 3,
    maxReferrals: 9,
    freeMonths: 1,
    earlyAccess: true,
    vipStatus: false,
    badge: '🥈',
    description: '1 month free + early access',
    color: '#C0C0C0'
  },
  {
    name: 'gold',
    minReferrals: 10,
    maxReferrals: 24,
    freeMonths: 3,
    earlyAccess: true,
    vipStatus: false,
    badge: '🥇',
    description: '3 months free + early access',
    color: '#FFD700'
  },
  {
    name: 'platinum',
    minReferrals: 25,
    maxReferrals: null,
    freeMonths: 12,
    earlyAccess: true,
    vipStatus: true,
    badge: '💎',
    description: '1 year free + VIP status + exclusive benefits',
    color: '#E5E4E2'
  }
];

/**
 * Generate a unique referral code
 * Format: GOODRUNSS-[NAME]-[RANDOM]
 * Example: GOODRUNSS-ALEX-K8M2
 */
export function generateReferralCode(name?: string, userType?: string): string {
  const randomStr = generateRandomString(4).toUpperCase();
  
  if (name) {
    // Clean name: remove special chars, take first part
    const cleanName = name
      .split(' ')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 10);
    
    return `GOODRUNSS-${cleanName}-${randomStr}`;
  }
  
  // If no name, use user type
  const prefix = userType ? userType.toUpperCase() : 'USER';
  return `GOODRUNSS-${prefix}-${randomStr}`;
}

/**
 * Generate random alphanumeric string
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate tier based on referral count
 */
export function calculateTier(referralCount: number): ReferralTier {
  // Find the highest tier they qualify for
  for (let i = REWARD_TIERS.length - 1; i >= 0; i--) {
    const tier = REWARD_TIERS[i];
    if (referralCount >= tier.minReferrals) {
      if (tier.maxReferrals === null || referralCount <= tier.maxReferrals) {
        return tier;
      }
    }
  }
  return REWARD_TIERS[0]; // Default to bronze
}

/**
 * Calculate rewards based on referral count
 */
export function calculateRewards(referralCount: number) {
  const tier = calculateTier(referralCount);
  return {
    tier: tier.name,
    badge: tier.badge,
    freeMonths: tier.freeMonths,
    earlyAccess: tier.earlyAccess,
    vipStatus: tier.vipStatus,
    description: tier.description,
    color: tier.color,
    progress: calculateProgress(referralCount),
  };
}

/**
 * Calculate progress to next tier
 */
export function calculateProgress(referralCount: number) {
  const currentTier = calculateTier(referralCount);
  const currentIndex = REWARD_TIERS.findIndex(t => t.name === currentTier.name);
  
  // If at max tier
  if (currentIndex === REWARD_TIERS.length - 1) {
    return {
      current: referralCount,
      needed: currentTier.minReferrals,
      remaining: 0,
      percentage: 100,
      nextTier: null,
      nextTierName: null,
    };
  }
  
  const nextTier = REWARD_TIERS[currentIndex + 1];
  const remaining = nextTier.minReferrals - referralCount;
  const percentage = Math.min(
    100,
    (referralCount / nextTier.minReferrals) * 100
  );
  
  return {
    current: referralCount,
    needed: nextTier.minReferrals,
    remaining: Math.max(0, remaining),
    percentage: Math.round(percentage),
    nextTier: nextTier.badge,
    nextTierName: nextTier.name,
    nextTierReward: nextTier.description,
  };
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  // Must be GOODRUNSS-XXX-XXX format
  const pattern = /^GOODRUNSS-[A-Z0-9]+-[A-Z0-9]+$/;
  return pattern.test(code.toUpperCase());
}

/**
 * Generate referral URL
 */
export function generateReferralUrl(code: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://goodrunss.com';
  return `${base}/waitlist?ref=${encodeURIComponent(code)}`;
}

/**
 * Generate social share URLs
 */
export function generateShareUrls(code: string, baseUrl?: string) {
  const referralUrl = generateReferralUrl(code, baseUrl);
  const message = `Join me on the GoodRunss waitlist! Use my code ${code} to get early access 🏃‍♂️`;
  
  return {
    email: {
      subject: 'Join me on GoodRunss!',
      body: `Hey!\n\nI just joined the GoodRunss waitlist and thought you might be interested too.\n\nGoodRunss is a revolutionary fitness platform connecting trainers, facilities, and players.\n\nUse my referral code: ${code}\nOr click here: ${referralUrl}\n\nWe both get rewards when you sign up!\n\nSee you there!`,
      url: `mailto:?subject=${encodeURIComponent('Join me on GoodRunss!')}&body=${encodeURIComponent(`Hey!\n\nI just joined the GoodRunss waitlist and thought you might be interested too.\n\nUse my code: ${code}\nLink: ${referralUrl}`)}`
    },
    twitter: {
      text: message,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}`
    },
    facebook: {
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`
    },
    linkedin: {
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`
    },
    whatsapp: {
      text: message,
      url: `https://wa.me/?text=${encodeURIComponent(message + ' ' + referralUrl)}`
    }
  };
}

/**
 * Format email for display (hide part of it)
 */
export function formatEmailForDisplay(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 3) {
    return email;
  }
  const visiblePart = local.slice(0, 2);
  const hiddenPart = '*'.repeat(Math.min(local.length - 2, 5));
  return `${visiblePart}${hiddenPart}@${domain}`;
}

/**
 * Calculate estimated launch rewards value
 */
export function calculateRewardValue(freeMonths: number, monthlyPrice: number = 29.99): number {
  return freeMonths * monthlyPrice;
}


















