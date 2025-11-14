// 🎯 DATA QUALITY & VERIFICATION SYSTEM
// GPS verification + confidence scoring for user check-ins

import * as geolib from 'geolib';

export interface CheckInQualityMetrics {
  isVerified: boolean;
  confidenceScore: number; // 0.0 to 1.0
  qualityFactors: {
    gpsAccuracy: 'excellent' | 'good' | 'fair' | 'poor';
    locationMatch: 'exact' | 'close' | 'nearby' | 'far';
    hasPhoto: boolean;
    userReputation: 'high' | 'medium' | 'low';
    deviceType: 'mobile' | 'unknown';
    timeOfDay: 'peak' | 'normal' | 'offpeak';
  };
  warnings: string[];
}

export interface CheckInData {
  userId: string;
  facilityId: string;
  latitude: number;
  longitude: number;
  gpsAccuracy?: number; // meters
  photoUrl?: string;
  timestamp?: Date;
  deviceType?: string;
  appVersion?: string;
}

export interface FacilityLocation {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
}

/**
 * Verify GPS location and calculate confidence score for check-in
 */
export async function verifyCheckIn(
  checkIn: CheckInData,
  facility: FacilityLocation,
  userStats?: { totalCheckIns: number; reportedIssues: number; badgesEarned: number }
): Promise<CheckInQualityMetrics> {
  const warnings: string[] = [];
  let confidenceScore = 0.5; // Base score

  // 1. GPS ACCURACY CHECK
  const gpsAccuracy = checkIn.gpsAccuracy || 999;
  let gpsAccuracyRating: 'excellent' | 'good' | 'fair' | 'poor';
  
  if (gpsAccuracy < 10) {
    gpsAccuracyRating = 'excellent';
    confidenceScore += 0.25;
  } else if (gpsAccuracy < 30) {
    gpsAccuracyRating = 'good';
    confidenceScore += 0.20;
  } else if (gpsAccuracy < 100) {
    gpsAccuracyRating = 'fair';
    confidenceScore += 0.10;
  } else {
    gpsAccuracyRating = 'poor';
    confidenceScore += 0.05;
    warnings.push('GPS accuracy is low. Please enable precise location.');
  }

  // 2. LOCATION MATCH CHECK (distance from facility)
  const distance = geolib.getDistance(
    { latitude: checkIn.latitude, longitude: checkIn.longitude },
    { latitude: facility.latitude, longitude: facility.longitude }
  );

  let locationMatch: 'exact' | 'close' | 'nearby' | 'far';
  
  if (distance < 30) {
    locationMatch = 'exact'; // Within 30 meters (at the facility)
    confidenceScore += 0.25;
  } else if (distance < 100) {
    locationMatch = 'close'; // Within 100 meters (very close)
    confidenceScore += 0.15;
  } else if (distance < 500) {
    locationMatch = 'nearby'; // Within 500 meters (visible from here)
    confidenceScore += 0.05;
    warnings.push(`You are ${Math.round(distance)}m away from ${facility.name}. Get closer for verification.`);
  } else {
    locationMatch = 'far'; // Too far
    confidenceScore = 0; // Override to zero - not verified
    warnings.push(`You are ${(distance / 1000).toFixed(1)}km away from this facility. Please check in at the correct location.`);
  }

  // 3. PHOTO VERIFICATION
  const hasPhoto = !!checkIn.photoUrl;
  if (hasPhoto) {
    confidenceScore += 0.10;
  }

  // 4. USER REPUTATION SCORING
  let userReputation: 'high' | 'medium' | 'low' = 'low';
  
  if (userStats) {
    const totalCheckIns = userStats.totalCheckIns || 0;
    const reportedIssues = userStats.reportedIssues || 0;
    const badgesEarned = userStats.badgesEarned || 0;
    
    // Calculate reputation from user activity
    const issueRate = totalCheckIns > 0 ? reportedIssues / totalCheckIns : 0;
    
    if (totalCheckIns > 50 && issueRate < 0.1 && badgesEarned > 5) {
      userReputation = 'high';
      confidenceScore += 0.10;
    } else if (totalCheckIns > 10 && issueRate < 0.2) {
      userReputation = 'medium';
      confidenceScore += 0.05;
    } else {
      userReputation = 'low';
      // No bonus for new users
    }
  }

  // 5. DEVICE TYPE CHECK
  const deviceType = checkIn.deviceType?.toLowerCase().includes('mobile') ? 'mobile' : 'unknown';
  if (deviceType === 'unknown') {
    warnings.push('Device type unknown. Use mobile app for best verification.');
  }

  // 6. TIME OF DAY (contextual)
  const hour = (checkIn.timestamp || new Date()).getHours();
  let timeOfDay: 'peak' | 'normal' | 'offpeak';
  
  if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21)) {
    timeOfDay = 'peak'; // Morning/evening peak hours
  } else if (hour >= 10 && hour <= 16) {
    timeOfDay = 'normal'; // Daytime
  } else {
    timeOfDay = 'offpeak'; // Late night/early morning
    // Check-ins at odd hours might be suspicious, but not penalizing for now
  }

  // Cap confidence score at 1.0
  confidenceScore = Math.min(confidenceScore, 1.0);

  // Determine if check-in is verified (high enough confidence)
  const isVerified = confidenceScore >= 0.70 && distance < 100;

  return {
    isVerified,
    confidenceScore: Math.round(confidenceScore * 100) / 100, // Round to 2 decimal places
    qualityFactors: {
      gpsAccuracy: gpsAccuracyRating,
      locationMatch,
      hasPhoto,
      userReputation,
      deviceType,
      timeOfDay,
    },
    warnings,
  };
}

/**
 * Calculate aggregate data quality score for a facility
 */
export function calculateFacilityDataQuality(checkIns: Array<{
  confidence_score: number;
  is_verified: boolean;
}>): {
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
  avgConfidence: number;
  verifiedRate: number;
  totalCheckIns: number;
} {
  if (checkIns.length === 0) {
    return {
      overallQuality: 'poor',
      avgConfidence: 0,
      verifiedRate: 0,
      totalCheckIns: 0,
    };
  }

  const avgConfidence = checkIns.reduce((sum, c) => sum + c.confidence_score, 0) / checkIns.length;
  const verifiedCount = checkIns.filter(c => c.is_verified).length;
  const verifiedRate = verifiedCount / checkIns.length;

  let overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
  
  if (avgConfidence >= 0.85 && verifiedRate >= 0.80) {
    overallQuality = 'excellent';
  } else if (avgConfidence >= 0.70 && verifiedRate >= 0.60) {
    overallQuality = 'good';
  } else if (avgConfidence >= 0.50 && verifiedRate >= 0.40) {
    overallQuality = 'fair';
  } else {
    overallQuality = 'poor';
  }

  return {
    overallQuality,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    verifiedRate: Math.round(verifiedRate * 100) / 100,
    totalCheckIns: checkIns.length,
  };
}

/**
 * Get user reputation stats for confidence scoring
 */
export async function getUserReputationStats(userId: string, prisma: any): Promise<{
  totalCheckIns: number;
  reportedIssues: number;
  badgesEarned: number;
}> {
  const [checkIns, issues, badges] = await Promise.all([
    prisma.facility_reports.count({ where: { user_id: userId } }),
    prisma.facility_reports.count({ where: { user_id: userId, confidence_score: { lt: 0.5 } } }),
    prisma.gamification_badges.count({ where: { user_id: userId, earned: true } }),
  ]);

  return {
    totalCheckIns: checkIns,
    reportedIssues: issues,
    badgesEarned: badges,
  };
}

/**
 * Validate check-in data before processing
 */
export function validateCheckInData(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('userId is required and must be a string');
  }

  if (!data.facilityId || typeof data.facilityId !== 'string') {
    errors.push('facilityId is required and must be a string');
  }

  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    errors.push('latitude must be a number between -90 and 90');
  }

  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    errors.push('longitude must be a number between -180 and 180');
  }

  if (data.crowdLevel !== undefined) {
    if (typeof data.crowdLevel !== 'number' || data.crowdLevel < 0 || data.crowdLevel > 100) {
      errors.push('crowdLevel must be a number between 0 and 100');
    }
  }

  if (data.gpsAccuracy !== undefined) {
    if (typeof data.gpsAccuracy !== 'number' || data.gpsAccuracy < 0) {
      errors.push('gpsAccuracy must be a positive number (meters)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

