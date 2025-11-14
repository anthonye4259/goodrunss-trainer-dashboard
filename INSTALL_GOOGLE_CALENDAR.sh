#!/bin/bash

echo "📦 Installing Supabase client..."
npm install @supabase/supabase-js

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get Google Calendar API credentials from https://console.cloud.google.com/"
echo "2. Update .env.local with your GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET"
echo "3. Get Supabase service role key and update SUPABASE_SERVICE_ROLE_KEY in .env.local"
echo "4. Restart your dev server: npm run dev"
echo ""
echo "📖 Full instructions: GOOGLE_CALENDAR_SETUP_INSTRUCTIONS.md"

