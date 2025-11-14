'use client';

/**
 * Pre-Launch Waitlist Landing Page
 * Beautiful landing page with signup form and referral system
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShareButtons } from '@/components/referral/ShareButtons';
import { ReferralStats } from '@/components/referral/ReferralStats';

export default function WaitlistPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'signup' | 'success'>('signup');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    userType: 'player',
  });
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get referral code from URL
  const referredBy = searchParams?.get('ref') || '';

  useEffect(() => {
    // If there's a referral code in URL, show who referred them
    if (referredBy) {
      // You could fetch referrer details here if you want to show who invited them
    }
  }, [referredBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          referredBy: referredBy || undefined,
          source: 'landing',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReferralData(data.data);
        setStep('success');
      } else {
        setError(data.error || 'Failed to join waitlist');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏃‍♂️</div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            GoodRunss
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-2">
            Train Smarter. Connect Better.
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The ultimate fitness ecosystem connecting trainers, facilities, and players. 
            Join the waitlist and earn rewards for inviting friends!
          </p>
        </div>

        {step === 'signup' && (
          <div className="max-w-md mx-auto">
            {/* Referral Alert */}
            {referredBy && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 text-center">
                <p className="text-blue-800 font-medium">
                  🎉 You've been invited! Use code: <strong>{referredBy}</strong>
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  You'll both get rewards when you join!
                </p>
              </div>
            )}

            {/* Signup Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Join the Waitlist
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['player', 'trainer', 'facility'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: type })}
                        className={`py-3 px-4 rounded-lg font-medium transition-all ${
                          formData.userType === type
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join the Waitlist →'}
                </button>
              </form>
            </div>

            {/* Benefits Section */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🏋️</div>
                <h3 className="font-semibold text-gray-800 mb-1">Find Trainers</h3>
                <p className="text-sm text-gray-600">Match with certified trainers for your goals</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🏟️</div>
                <h3 className="font-semibold text-gray-800 mb-1">Book Facilities</h3>
                <p className="text-sm text-gray-600">Instantly reserve courts and gyms nearby</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🤝</div>
                <h3 className="font-semibold text-gray-800 mb-1">Connect Players</h3>
                <p className="text-sm text-gray-600">Find partners for games and workouts</p>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && referralData && (
          <div className="max-w-4xl mx-auto">
            {/* Success Message */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to GoodRunss!
              </h2>
              <p className="text-gray-600 mb-6">
                {referralData.name ? `Thanks ${referralData.name}! ` : ''}
                Check your email for your welcome message and start inviting friends!
              </p>

              {/* Referral Code Display */}
              <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-700 font-medium mb-2">YOUR REFERRAL CODE</p>
                <p className="text-4xl font-bold text-gray-800 mb-1 tracking-wider">
                  {referralData.referralCode}
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Share this code to earn amazing rewards! 🎁
                </p>
              </div>

              {/* Current Tier */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 rounded-full">
                <span className="text-3xl">{referralData.badge}</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {referralData.tier} Tier
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Share Section */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📤 Share Your Code
                </h3>
                <p className="text-gray-600 mb-6">
                  Invite friends and earn free months at launch!
                </p>
                <ShareButtons referralCode={referralData.referralCode} />
              </div>

              {/* Stats Section */}
              <div>
                <ReferralStats
                  referralCode={referralData.referralCode}
                  initialReferralCount={0}
                />
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-xl p-8 mt-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">What happens next?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl mb-2">📧</div>
                  <p className="font-medium">We'll email you updates as we get closer to launch</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">🎁</div>
                  <p className="font-medium">Keep referring friends to earn bigger rewards</p>
                </div>
                <div>
                  <div className="text-4xl mb-2">🚀</div>
                  <p className="font-medium">Get early access when we launch!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} GoodRunss. All rights reserved.</p>
      </footer>
    </div>
  );
}









