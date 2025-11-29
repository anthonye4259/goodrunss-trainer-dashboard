# 🌍 G.I.A Environmental Intelligence Integration

## Backend API Update Required

To enable G.I.A to use environmental intelligence data, update your backend API.

### File to Update:
`src/app/api/gia/route.ts`

---

## Implementation:

### 1. Update the POST handler to accept environmentalData:

```typescript
export async function POST(req: Request) {
  const { 
    message, 
    conversationHistory, 
    userId, 
    userRole,
    environmentalData  // ADD THIS PARAMETER
  } = await req.json();
  
  // ... existing code ...
}
```

### 2. Add environmental context to system prompt:

```typescript
// After determining the base system prompt
let systemPrompt = userRole === 'TRAINER' 
  ? trainerSystemPrompt 
  : clientSystemPrompt;

// ADD THIS BLOCK:
if (environmentalData) {
  const envContext = `\n\n🌍 CURRENT ENVIRONMENTAL CONDITIONS (User's Location):

WEATHER:
• Temperature: ${environmentalData.weather.temperature}°F (feels like ${environmentalData.weather.feelsLike}°F)
• Conditions: ${environmentalData.weather.condition}
• Wind: ${environmentalData.weather.windSpeed} mph
• Humidity: ${environmentalData.weather.humidity}%

AIR QUALITY:
• AQI: ${environmentalData.airQuality?.aqi}/5 (${environmentalData.airQuality?.aqiLabel})
• PM2.5: ${environmentalData.airQuality?.pm2_5} μg/m³
• Safe for outdoor: ${environmentalData.airQuality?.isSafeForOutdoor ? 'YES ✅' : 'NO ❌'}
• ${environmentalData.airQuality?.recommendation}

FIRE RISK:
• Risk Level: ${environmentalData.fireRisk?.risk}
• FWI: ${environmentalData.fireRisk?.fwi}
• ${environmentalData.fireRisk?.recommendation}

TRAFFIC:
• Congestion: ${environmentalData.traffic?.congestionLevel.toUpperCase()}
• Current speed: ${environmentalData.traffic?.currentSpeed} mph
• Delay: ${environmentalData.traffic?.travelTimeDelay} minutes
• ${environmentalData.traffic?.recommendation}

CROWD DENSITY:
• Level: ${environmentalData.population?.currentCrowd.toUpperCase()}
• Estimated people: ~${environmentalData.population?.estimatedPeople}
• Peak hours: ${environmentalData.population?.peakHours.join(', ')}
• ${environmentalData.population?.recommendation}

OVERALL SAFETY ASSESSMENT:
${environmentalData.isSafeForOutdoor ? '✅ SAFE for outdoor training' : '⚠️ INDOOR training recommended'}

RECOMMENDATIONS:
${environmentalData.recommendations.join('\n')}

---

IMPORTANT INSTRUCTIONS:
1. Use this environmental data to provide CONTEXT-AWARE recommendations
2. PRIORITIZE USER SAFETY above all else
3. If conditions are unsafe, recommend INDOOR alternatives
4. Consider ALL factors: weather, air quality, fire risk, traffic pollution, and crowds
5. Be specific about WHY certain conditions matter for training
6. Provide ACTIONABLE alternatives when outdoor isn't safe
7. Reference specific metrics (e.g., "AQI of 4 means poor air quality")
`;

  systemPrompt += envContext;
}
```

### 3. Complete Updated Function:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const clientSystemPrompt = `You are G.I.A (GoodRunss Intelligence Agent), a fitness and wellness AI assistant helping CLIENTS find trainers, book sessions, and achieve their fitness goals. You have access to environmental intelligence data including weather, air quality, fire risk, traffic, and crowd levels. Use this data to provide safe, context-aware recommendations.`;

const trainerSystemPrompt = `You are G.I.A (GoodRunss Intelligence Agent), a business and fitness AI assistant helping TRAINERS grow their business, manage clients, and optimize their training services. You have access to environmental intelligence data to help trainers make smart decisions about outdoor sessions.`;

export async function POST(req: Request) {
  try {
    const { 
      message, 
      conversationHistory = [], 
      userId, 
      userRole = 'CLIENT',
      environmentalData  // Environmental intelligence
    } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Determine system prompt based on role
    let systemPrompt = userRole === 'TRAINER' 
      ? trainerSystemPrompt 
      : clientSystemPrompt;

    // Add environmental context if available
    if (environmentalData) {
      const envContext = `\n\n🌍 CURRENT ENVIRONMENTAL CONDITIONS (User's Location):

WEATHER:
• Temperature: ${environmentalData.weather.temperature}°F (feels like ${environmentalData.weather.feelsLike}°F)
• Conditions: ${environmentalData.weather.condition}
• Wind: ${environmentalData.weather.windSpeed} mph
• Humidity: ${environmentalData.weather.humidity}%

AIR QUALITY:
• AQI: ${environmentalData.airQuality?.aqi}/5 (${environmentalData.airQuality?.aqiLabel})
• PM2.5: ${environmentalData.airQuality?.pm2_5} μg/m³
• Safe for outdoor: ${environmentalData.airQuality?.isSafeForOutdoor ? 'YES ✅' : 'NO ❌'}
• ${environmentalData.airQuality?.recommendation}

FIRE RISK:
• Risk Level: ${environmentalData.fireRisk?.risk}
• FWI: ${environmentalData.fireRisk?.fwi}
• ${environmentalData.fireRisk?.recommendation}

TRAFFIC:
• Congestion: ${environmentalData.traffic?.congestionLevel.toUpperCase()}
• Current speed: ${environmentalData.traffic?.currentSpeed} mph
• Delay: ${environmentalData.traffic?.travelTimeDelay} minutes
• ${environmentalData.traffic?.recommendation}

CROWD DENSITY:
• Level: ${environmentalData.population?.currentCrowd.toUpperCase()}
• Estimated people: ~${environmentalData.population?.estimatedPeople}
• Peak hours: ${environmentalData.population?.peakHours.join(', ')}
• ${environmentalData.population?.recommendation}

OVERALL SAFETY ASSESSMENT:
${environmentalData.isSafeForOutdoor ? '✅ SAFE for outdoor training' : '⚠️ INDOOR training recommended'}

RECOMMENDATIONS:
${environmentalData.recommendations.join('\n')}

---

IMPORTANT INSTRUCTIONS:
1. Use this environmental data to provide CONTEXT-AWARE recommendations
2. PRIORITIZE USER SAFETY above all else
3. If conditions are unsafe, recommend INDOOR alternatives
4. Consider ALL factors: weather, air quality, fire risk, traffic pollution, and crowds
5. Be specific about WHY certain conditions matter for training
6. Provide ACTIONABLE alternatives when outdoor isn't safe
7. Reference specific metrics (e.g., "AQI of 4 means poor air quality")
`;

      systemPrompt += envContext;
    }

    // Build conversation messages
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    // Call Gemini Pro
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: messages.slice(0, -1),
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      response: {
        role: 'assistant',
        content: text,
      },
      userId,
      userRole,
      hasEnvironmentalContext: !!environmentalData,
    });

  } catch (error: any) {
    console.error('G.I.A API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process G.I.A request', details: error.message },
      { status: 500 }
    );
  }
}
```

---

## Testing the Integration:

### 1. Start your backend:
```bash
cd goodrunss-trainer-dashboard
npm run dev
```

### 2. Test with environmental data:

```bash
curl -X POST http://localhost:3000/api/gia \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Should I run outside today?",
    "userRole": "CLIENT",
    "environmentalData": {
      "weather": {
        "temperature": 72,
        "feelsLike": 70,
        "condition": "Clear",
        "windSpeed": 8,
        "humidity": 65
      },
      "airQuality": {
        "aqi": 4,
        "aqiLabel": "Poor",
        "pm2_5": 78.5,
        "isSafeForOutdoor": false,
        "recommendation": "Air quality is poor. Outdoor exercise not recommended."
      },
      "traffic": {
        "congestionLevel": "high",
        "currentSpeed": 15,
        "travelTimeDelay": 10,
        "recommendation": "Heavy traffic. Air quality affected."
      },
      "isSafeForOutdoor": false,
      "recommendations": [
        "⚠️ Outdoor training not recommended",
        "🌫️ Poor air quality detected",
        "🚗 Heavy traffic affecting air pollution"
      ]
    }
  }'
```

Expected response should reference:
- The poor air quality (AQI 4)
- Heavy traffic pollution
- Recommendation for indoor training
- Specific alternatives

---

## Expected Behavior:

### Example 1: Good Conditions
**User**: "Can I train outside?"

**G.I.A** (with environmental context):
```
Based on current conditions in your area:

✅ Weather is perfect - 72°F with clear skies
✅ Air quality is excellent (AQI 2 - Fair)
✅ Fire risk is low
✅ Traffic is moderate - some pollution but acceptable
✅ Crowd levels are low right now

Yes, it's a great time for outdoor training! The conditions are ideal. 
I recommend taking advantage of the clear weather and good air quality. 
Parks and trails should be less crowded at this hour.
```

### Example 2: Poor Conditions
**User**: "Should I run outside?"

**G.I.A** (with environmental context):
```
⚠️ I don't recommend outdoor running right now. Here's why:

❌ Air Quality is POOR (AQI 4/5)
   • PM2.5 levels at 78.5 μg/m³ (unhealthy)
   • Can cause respiratory issues during exercise

⚠️ Heavy traffic nearby
   • Congestion is high, adding more pollution
   • Air quality is further compromised

🏠 SAFER ALTERNATIVES:
1. Indoor treadmill at your gym
2. Indoor track facility
3. Swimming (indoor pool)
4. Home cardio equipment

Wait for better conditions or stay indoors. Your lungs will thank you!
```

---

## Status:

✅ Mobile app updated (sends environmental data)
⚠️ Backend API needs update (accept environmental data)
📋 Documentation complete

**Action Required**: Update `goodrunss-trainer-dashboard/src/app/api/gia/route.ts` with the code above.



