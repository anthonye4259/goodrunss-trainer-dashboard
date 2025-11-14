# 🔌 ZAPIER INTEGRATION - COMPLETE

## ✅ What you get
- Outbound Zapier webhooks on key events
- Inbound Zapier webhook to trigger actions
- Environment-based secrets and optional signing
- Minimal logging via `viral_metrics`

## 🔔 Outbound events (sent to Zapier)
- `booking.created` (default wired)
- `email.sent`
- `payment.completed`
- `trial.started`

Library: `src/lib/zapier.ts`
```ts
await notifyZapier('booking.created', { bookingId, trainerId, clientEmail })
```

Wired in: `src/app/api/public/bookings/route.ts` (fires after successful booking)

## ⤵️ Inbound actions (from Zapier)
Endpoint: `POST /api/integrations/zapier/webhook`

Supported actions:
- `create_client` – create a client record for a trainer

Example request:
```json
{
  "action": "create_client",
  "data": {
    "trainerId": "trainer_123",
    "name": "Alex Runner",
    "email": "alex@example.com",
    "phone": "+1 555 123 4567",
    "goals": ["speed", "endurance"]
  }
}
```

Auth: Provide header `X-Zapier-Token: $ZAPIER_SIGNING_TOKEN`

## 🔐 Environment
Add to `.env.local`:
```
ZAPIER_WEBHOOK_URL="https://hooks.zapier.com/hooks/catch/<zap-id>/<hook-id>"
ZAPIER_SIGNING_TOKEN="your-shared-secret"
```

## 🧪 Quick tests
1) Outbound: Create a booking (or `curl` your Zapier test hook) and verify Zap receives `booking.created` payload.
2) Inbound: `curl` the webhook
```bash
curl -X POST http://localhost:3000/api/integrations/zapier/webhook \
  -H "Content-Type: application/json" \
  -H "X-Zapier-Token: $ZAPIER_SIGNING_TOKEN" \
  -d '{
    "action": "create_client",
    "data": { "trainerId": "trainer_123", "name": "Test", "email": "test@example.com" }
  }'
```

## 📌 Notes
- Outbound notify is non-blocking and won’t fail the main flow
- Extend `ZapierEvent` and add more emits where needed
- Use Zapier to fan out to Slack/Sheets/HubSpot/etc.

**Built with 💚 for GoodRunss**

