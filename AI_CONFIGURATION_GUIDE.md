# 🤖 AI Configuration Guide

## Overview
The GoodRunss Trainer Dashboard uses multiple AI providers to power intelligent features across the platform.

---

## **AI Providers**

### 1. **Anthropic Claude (Primary)**
- **API Key**: Configured in `.env` as `ANTHROPIC_API_KEY`
- **Model**: Claude 3.5 Sonnet
- **Usage**:
  - GIA Chatbot (`/api/gia/chat/route.ts`)
  - Content generation
  - Conversational AI
  - Function calling with 43 agentic tools

### 2. **Google Gemini** 
- **Configuration**: Available as fallback
- **Usage**:
  - Alternative AI provider
  - Fast inference for simple tasks

---

## **AI-Powered Features**

### **1. GIA Chatbot** 
**Route**: `/api/gia/chat/route.ts`

**Capabilities** (43 Agentic Tools):
- **Client Management** (8 tools): View, add, update, search clients, track progress
- **Scheduling** (6 tools): View & schedule sessions, check availability, recurring sessions
- **Training Plans** (5 tools): Create workout plans, track progress, clone plans
- **Payments** (6 tools): Track payments, create invoices, revenue forecasting
- **Communication** (3 tools): Send emails & SMS, batch messaging
- **Marketing** (8 tools): Generate social content, analyze performance, create campaigns
- **Business Analytics** (5 tools): Revenue analysis, client retention, growth metrics
- **Documents** (2 tools): Generate contracts, waivers, policies

**Configuration**:
```typescript
const model = anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 8192,
  tools: [...43 function definitions...]
})
```

**Status**: ✅ **FULLY CONFIGURED**

---

### **2. AI Session Planner**
**Route**: `/api/gia/generate-session-plan/route.ts`

**Purpose**: Generates personalized training session plans

**Status**: ✅ **CONFIGURED**

---

### **3. GPT Client Analyzer**
**Route**: `/api/gpt/clients/route.ts`

**Purpose**: Analyzes client data and provides insights

**Status**: ✅ **CONFIGURED**

---

### **4. GPT Schedule Optimizer**
**Route**: `/api/gpt/schedule/route.ts`

**Purpose**: Optimizes trainer schedule for maximum efficiency

**Status**: ✅ **CONFIGURED**

---

### **5. AI Persona Generator**
**Route**: `/api/ai-persona/route.ts`

**Purpose**: Creates personalized AI personas for trainers

**Status**: ✅ **CONFIGURED**

---

### **6. Lead Matching**
**Route**: `/api/gia/match-leads/route.ts`

**Purpose**: Matches trainers with potential clients using AI

**Status**: ✅ **CONFIGURED**

---

### **7. Document Processing**
**Route**: `/api/gia/process-documents/route.ts`

**Purpose**: AI-powered document analysis and generation

**Status**: ✅ **CONFIGURED**

---

## **Environment Variables**

Required in `.env`:

```bash
# Anthropic (Primary AI Provider)
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Optional: OpenAI (if using GPT)
OPENAI_API_KEY="sk-..."

# Optional: Google Gemini (if using Gemini)
GOOGLE_AI_API_KEY="..."
```

---

## **Testing AI Features**

### Test GIA Chatbot:
```bash
curl -X POST http://localhost:3000/api/gia/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Show me my clients"}
    ]
  }'
```

### Test Session Plan Generator:
```bash
curl -X POST http://localhost:3000/api/gia/generate-session-plan \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "...",
    "sessionType": "strength",
    "duration": 60
  }'
```

---

## **AI Feature Dashboard**

Access AI features from:
- `/dashboard/ai-persona` - Create your AI persona
- GIA Chatbot - Available on all pages (bottom-right floating button)
- Client pages - AI-powered insights
- Calendar - AI schedule optimization

---

## **Rate Limits & Costs**

### Anthropic Claude:
- **Rate Limit**: 50 requests/min (standard tier)
- **Cost**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Context Window**: 200K tokens

### Recommendations:
1. Cache frequently used prompts
2. Use streaming for long responses
3. Implement request throttling for high-traffic periods
4. Monitor usage via Anthropic Console

---

## **Troubleshooting**

### Issue: "AI API not responding"
**Solution**: 
1. Check API key in `.env`
2. Verify API key is active in Anthropic Console
3. Check rate limits

### Issue: "Function calling not working"
**Solution**:
1. Ensure using Claude 3.5 Sonnet or later
2. Verify tool definitions match expected schema
3. Check logs for tool execution errors

### Issue: "Slow AI responses"
**Solution**:
1. Enable streaming responses
2. Reduce `max_tokens` if possible
3. Use faster model for simple tasks (e.g., Gemini Flash)

---

## **Future Enhancements**

Planned AI features:
- [ ] Voice-to-text session notes
- [ ] Automated workout video analysis
- [ ] Predictive client churn detection
- [ ] Auto-generated marketing content calendar
- [ ] Multi-language support for international trainers

---

## **Status Summary**

| Feature | Status | API Route | Provider |
|---------|--------|-----------|----------|
| GIA Chatbot | ✅ Working | `/api/gia/chat` | Anthropic Claude |
| Session Planner | ✅ Working | `/api/gia/generate-session-plan` | Anthropic Claude |
| Client Analyzer | ✅ Working | `/api/gpt/clients` | Anthropic Claude |
| Schedule Optimizer | ✅ Working | `/api/gpt/schedule` | Anthropic Claude |
| AI Persona | ✅ Working | `/api/ai-persona` | Anthropic Claude |
| Lead Matching | ✅ Working | `/api/gia/match-leads` | Anthropic Claude |
| Document Processing | ✅ Working | `/api/gia/process-documents` | Anthropic Claude |

**Overall Status**: ✅ **ALL AI FEATURES CONFIGURED AND OPERATIONAL**

---

## **Support**

For AI configuration issues:
1. Check Anthropic Console: https://console.anthropic.com
2. Review API logs in `/app/api/gia/chat/route.ts`
3. Test API key: https://docs.anthropic.com/en/api/getting-started

**Last Updated**: November 22, 2025

