'use client';

/**
 * Admin Waitlist Dashboard
 * View all waitlist signups, stats, and export data
 */

import { useEffect, useState } from 'react';

interface WaitlistStats {
  totalSignups: number;
  totalPlayers: number;
  totalTrainers: number;
  totalFacilities: number;
  totalReferrals: number;
  totalShares: number;
  emailsSent: number;
  recentSignups: number;
  averageReferralsPerUser: string;
  tierCounts: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
}

interface Signup {
  id: string;
  email: string;
  name: string | null;
  referralCode: string;
  referralCount: number;
  tier: string;
  userType: string;
  createdAt: string;
}

export default function AdminWaitlistPage() {
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchData();
  }, [filter, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        ...(filter !== 'all' && { userType: filter }),
      });

      const response = await fetch(`/api/admin/waitlist?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setSignups(data.data.signups);
        setTopReferrers(data.data.topReferrers);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export' }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading waitlist data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Waitlist Dashboard</h1>
            <p className="text-gray-600 mt-1">Pre-launch referral campaign analytics</p>
          </div>
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Signups */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Signups</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalSignups}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">+{stats.recentSignups} last 7 days</p>
            </div>

            {/* Total Referrals */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Referrals</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalReferrals}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Avg: {stats.averageReferralsPerUser} per user</p>
            </div>

            {/* User Types */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-4">User Types</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Players</span>
                  <span className="font-bold text-gray-800">{stats.totalPlayers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Trainers</span>
                  <span className="font-bold text-gray-800">{stats.totalTrainers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Facilities</span>
                  <span className="font-bold text-gray-800">{stats.totalFacilities}</span>
                </div>
              </div>
            </div>

            {/* Tiers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-4">Reward Tiers</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">🥉 Bronze</span>
                  <span className="font-bold text-gray-800">{stats.tierCounts.bronze}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">🥈 Silver</span>
                  <span className="font-bold text-gray-800">{stats.tierCounts.silver}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">🥇 Gold</span>
                  <span className="font-bold text-gray-800">{stats.tierCounts.gold}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">💎 Platinum</span>
                  <span className="font-bold text-gray-800">{stats.tierCounts.platinum}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Referrers */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Top Referrers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Referrals</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tier</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((referrer, index) => (
                  <tr key={referrer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span>🥇</span>}
                        {index === 1 && <span>🥈</span>}
                        {index === 2 && <span>🥉</span>}
                        <span className="font-medium">{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{referrer.email}</td>
                    <td className="py-3 px-4 text-gray-700">{referrer.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">
                        {referrer.userType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-green-600">{referrer.referralCount}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium">{referrer.tier}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Signups */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">All Signups</h2>
            <div className="flex gap-2">
              {['all', 'player', 'trainer', 'facility'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    filter === type
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Referrals</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((signup) => (
                  <tr key={signup.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{signup.email}</td>
                    <td className="py-3 px-4 text-gray-700">{signup.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">
                        {signup.userType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {signup.referralCode}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-green-600">{signup.referralCount}</span>
                    </td>
                    <td className="py-3 px-4 capitalize">{signup.tier}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(signup.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}









