'use client';

/**
 * Referral Stats Display Component
 * Shows referral count, tier, rewards, and progress
 */

import { useEffect, useState } from 'react';
import { calculateRewards, REWARD_TIERS } from '@/lib/referral-utils';

interface ReferralStatsProps {
  referralCode: string;
  initialReferralCount?: number;
}

interface Stats {
  referralCount: number;
  tier: string;
  rewards: any;
  referrals: any[];
}

export function ReferralStats({ referralCode, initialReferralCount = 0 }: ReferralStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [referralCode]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/waitlist/stats?code=${referralCode}`);
      const data = await response.json();
      
      if (data.success) {
        setStats({
          referralCount: data.data.referralCount,
          tier: data.data.tier,
          rewards: data.data.rewards,
          referrals: data.data.referrals,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load stats</div>;
  }

  const { referralCount, rewards } = stats;
  const { badge, tier, freeMonths, description, progress } = rewards;

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{badge}</div>
          <h2 className="text-2xl font-bold text-gray-800 capitalize">{tier} Tier</h2>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{referralCount}</div>
            <div className="text-sm text-gray-600 mt-1">Referrals</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{freeMonths}</div>
            <div className="text-sm text-gray-600 mt-1">Free Months</div>
          </div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {progress.nextTier && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Next Tier: {progress.nextTier} {progress.nextTierName}</h3>
            <span className="text-sm text-gray-600">{progress.remaining} more</span>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-600 mt-2 text-center">
            {progress.current} / {progress.needed} referrals
          </p>
          <p className="text-sm text-gray-700 mt-3 text-center">
            🎁 {progress.nextTierReward}
          </p>
        </div>
      )}

      {/* All Tiers Display */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">All Reward Tiers</h3>
        <div className="space-y-3">
          {REWARD_TIERS.map((tierData) => (
            <div
              key={tierData.name}
              className={`p-4 rounded-lg border-2 transition-all ${
                tier === tierData.name
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tierData.badge}</span>
                  <div>
                    <div className="font-semibold text-gray-800 capitalize">
                      {tierData.name}
                      {tier === tierData.name && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {tierData.minReferrals}
                      {tierData.maxReferrals ? `-${tierData.maxReferrals}` : '+'} referrals
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg" style={{ color: tierData.color }}>
                    {tierData.freeMonths} {tierData.freeMonths === 1 ? 'month' : 'months'}
                  </div>
                  {tierData.vipStatus && (
                    <div className="text-xs text-purple-600 font-semibold">+ VIP Status</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Referrals */}
      {stats.referrals && stats.referrals.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Referrals</h3>
          <div className="space-y-2">
            {stats.referrals.slice(0, 5).map((referral: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-medium text-gray-800">{referral.name}</div>
                  <div className="text-xs text-gray-500">{referral.email}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(referral.joinedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}









