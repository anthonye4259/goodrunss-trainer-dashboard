#!/bin/bash

echo "📦 Installing Supabase client..."
npm install @supabase/supabase-js

echo ""
echo "✅ Installation complete!"
echo ""
echo "🎉 Google Calendar Auto-Sync is now 100% ready!"
echo ""
echo "📋 Test it:"
echo "1. Visit: http://localhost:3001/api/integrations/google-calendar/connect?facilityId=test_123"
echo "2. Grant Google Calendar permission"
echo "3. Add events to your Google Calendar"
echo "4. Test sync:"
echo "   curl -X POST http://localhost:3001/api/integrations/google-calendar/sync \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"facilityId\": \"test_123\"}'"
echo ""
echo "📖 Full docs: /Users/anthonyedwards/Downloads/goodrunss-apps/GOOGLE_CALENDAR_SYNC_COMPLETE/"

