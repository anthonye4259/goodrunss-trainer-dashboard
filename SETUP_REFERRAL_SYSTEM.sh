#!/bin/bash

# Setup Script for GoodRunss Pre-Launch Referral System
# Run this script to get everything up and running

echo "🚀 Setting up GoodRunss Referral System..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the goodrunss-trainer-dashboard directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

echo "🗄️  Running Prisma migration..."
npx prisma migrate dev --name add_waitlist_referral_system
echo "✅ Database migration complete"
echo ""

echo "🔄 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

echo "📧 Checking environment variables..."
if grep -q "RESEND_API_KEY" .env 2>/dev/null; then
    echo "✅ RESEND_API_KEY found in .env"
else
    echo "⚠️  WARNING: RESEND_API_KEY not found in .env"
    echo "   Add your Resend API key to .env file:"
    echo "   RESEND_API_KEY=re_your_api_key_here"
    echo ""
fi

if grep -q "NEXT_PUBLIC_APP_URL" .env 2>/dev/null; then
    echo "✅ NEXT_PUBLIC_APP_URL found in .env"
else
    echo "⚠️  WARNING: NEXT_PUBLIC_APP_URL not found in .env"
    echo "   Add your app URL to .env file:"
    echo "   NEXT_PUBLIC_APP_URL=https://goodrunss.com"
    echo ""
fi

echo ""
echo "✨ Setup complete! Next steps:"
echo ""
echo "1. Add your Resend API key to .env file:"
echo "   RESEND_API_KEY=re_your_api_key_here"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Visit these pages:"
echo "   - Landing page: http://localhost:3000/waitlist"
echo "   - Admin dashboard: http://localhost:3000/admin/waitlist"
echo ""
echo "📖 Read the full documentation in 🎉_REFERRAL_SYSTEM_COMPLETE.md"
echo ""
echo "🎉 Happy launching!"









