#!/bin/bash
# GoodRunss API - Quick Setup Script

echo "🔑 Setting up GoodRunss Public API..."
echo ""

# Get DATABASE_URL from .env.local
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | grep DATABASE_URL | xargs)
else
    echo "❌ .env.local not found"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env.local"
    exit 1
fi

echo "✅ Found DATABASE_URL"
echo ""

# Run migration using psql
echo "📦 Running database migration..."
echo ""

if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -f prisma/migrations/20250131000000_api_keys_system.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration successful!"
        echo ""
        echo "🚀 Next steps:"
        echo "  1. Start server: npm run dev"
        echo "  2. Go to: http://localhost:3000/dashboard/developer"
        echo "  3. Create your first API key!"
        echo ""
    else
        echo ""
        echo "❌ Migration failed. Try manual setup:"
        echo "  1. Go to: https://supabase.com/dashboard"
        echo "  2. Open SQL Editor"
        echo "  3. Copy/paste: prisma/migrations/20250131000000_api_keys_system.sql"
        echo "  4. Run it"
        echo ""
    fi
else
    echo "❌ psql not installed. Manual setup required:"
    echo ""
    echo "  1. Go to: https://supabase.com/dashboard"
    echo "  2. Your project → SQL Editor"
    echo "  3. Copy contents of: prisma/migrations/20250131000000_api_keys_system.sql"
    echo "  4. Paste and run"
    echo ""
    echo "  Then restart: npm run dev"
    echo ""
fi

