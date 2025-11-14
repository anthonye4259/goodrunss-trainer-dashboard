# 📚 Referral System API Reference

Complete API documentation for the GoodRunss pre-launch referral system.

---

## Base URL

```
Development: http://localhost:3000
Production: https://goodrunss.com
```

---

## Public Endpoints

### 1. Join Waitlist

Sign up for the waitlist with optional referral code.

**Endpoint:** `POST /api/waitlist/signup`

**Request Body:**
```json
{
  "email": "user@example.com",        // Required
  "name": "John Doe",                 // Optional
  "userType": "player",               // Optional: "player", "trainer", "facility"
  "referredBy": "GOODRUNSS-ALEX-K8M2", // Optional: Referral code
  "source": "landing",                // Optional: Signup source
  "utm": {                            // Optional: UTM tracking
    "source": "facebook",
    "medium": "social",
    "campaign": "launch"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "referralCode": "GOODRUNSS-JOHN-X7K2",
    "referralUrl": "https://goodrunss.com/waitlist?ref=GOODRUNSS-JOHN-X7K2",
    "tier": "bronze",
    "badge": "🥉",
    "rewards": {
      "tier": "bronze",
      "badge": "🥉",
      "freeMonths": 0,
      "earlyAccess": true,
      "vipStatus": false,
      "description": "Early access to GoodRunss at launch",
      "color": "#CD7F32",
      "progress": {
        "current": 0,
        "needed": 3,
        "remaining": 3,
        "percentage": 0,
        "nextTier": "🥈",
        "nextTierName": "silver"
      }
    }
  }
}
```

**Error Response (400):**
```json
{
  "error": "Valid email is required"
}
```

```json
{
  "error": "Email already registered",
  "referralCode": "GOODRUNSS-JOHN-X7K2",
  "alreadyRegistered": true
}
```

---

### 2. Get Referral Stats

Get statistics and progress for a referral code.

**Endpoint:** `GET /api/waitlist/stats?code=REFERRAL_CODE`

**Query Parameters:**
- `code` (required): The referral code

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "referralCode": "GOODRUNSS-JOHN-X7K2",
    "referralUrl": "https://goodrunss.com/waitlist?ref=GOODRUNSS-JOHN-X7K2",
    "referralCount": 5,
    "shareCount": 12,
    "tier": "silver",
    "rewards": {
      "tier": "silver",
      "badge": "🥈",
      "freeMonths": 1,
      "earlyAccess": true,
      "vipStatus": false,
      "description": "1 month free + early access",
      "color": "#C0C0C0",
      "progress": {
        "current": 5,
        "needed": 10,
        "remaining": 5,
        "percentage": 50,
        "nextTier": "🥇",
        "nextTierName": "gold",
        "nextTierReward": "3 months free + early access"
      }
    },
    "referrals": [
      {
        "name": "Jane Smith",
        "email": "ja***",
        "joinedAt": "2024-11-06T12:00:00Z"
      }
    ],
    "recentActivity": [
      {
        "type": "share",
        "timestamp": "2024-11-06T12:00:00Z",
        "platform": "twitter"
      }
    ],
    "joinedAt": "2024-11-05T10:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Referral code not found"
}
```

---

### 3. Track Share

Track when someone shares their referral code.

**Endpoint:** `POST /api/waitlist/share`

**Request Body:**
```json
{
  "referralCode": "GOODRUNSS-JOHN-X7K2",
  "platform": "twitter",                    // email, twitter, facebook, linkedin, whatsapp, copy
  "shareUrl": "https://twitter.com/..."     // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Share tracked successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Referral code not found"
}
```

---

### 4. Send Email Invites

Send referral invitations to multiple email addresses.

**Endpoint:** `POST /api/waitlist/send-invites`

**Request Body:**
```json
{
  "referralCode": "GOODRUNSS-JOHN-X7K2",
  "emails": [
    "friend1@example.com",
    "friend2@example.com"
  ],
  "personalMessage": "Hey! Check out GoodRunss, I think you'll love it!" // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "sent": 2,
    "failed": 0
  }
}
```

**Error Response (400):**
```json
{
  "error": "Maximum 50 emails allowed per batch"
}
```

---

## Admin Endpoints

⚠️ **Note:** These endpoints should be protected with authentication in production.

### 5. Get All Waitlist Data

Get complete waitlist statistics and signups.

**Endpoint:** `GET /api/admin/waitlist`

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page
- `sortBy` (optional, default: "createdAt"): Sort field
- `order` (optional, default: "desc"): Sort order (asc/desc)
- `userType` (optional): Filter by user type (player/trainer/facility)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "signups": [
      {
        "id": "clx...",
        "email": "user@example.com",
        "name": "John Doe",
        "referralCode": "GOODRUNSS-JOHN-X7K2",
        "referredBy": null,
        "referredById": null,
        "userType": "player",
        "referralCount": 5,
        "tier": "silver",
        "rewardMonths": 1,
        "earlyAccess": true,
        "vipStatus": false,
        "shareCount": 12,
        "emailSent": true,
        "emailOpened": true,
        "createdAt": "2024-11-05T10:00:00Z",
        "referrals": [...]
      }
    ],
    "stats": {
      "totalSignups": 1234,
      "totalPlayers": 800,
      "totalTrainers": 300,
      "totalFacilities": 134,
      "totalReferrals": 4567,
      "totalShares": 8901,
      "emailsSent": 1200,
      "recentSignups": 123,
      "averageReferralsPerUser": "3.70",
      "tierCounts": {
        "bronze": 800,
        "silver": 300,
        "gold": 100,
        "platinum": 34
      }
    },
    "topReferrers": [
      {
        "id": "clx...",
        "email": "topuser@example.com",
        "name": "Top User",
        "referralCode": "GOODRUNSS-TOP-X7K2",
        "referralCount": 45,
        "tier": "platinum",
        "userType": "trainer",
        "createdAt": "2024-11-01T10:00:00Z"
      }
    ],
    "signupTrend": [
      {
        "date": "2024-11-01",
        "count": 23
      },
      {
        "date": "2024-11-02",
        "count": 45
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalPages": 25,
      "totalCount": 1234
    }
  }
}
```

---

### 6. Export Waitlist as CSV

Export all waitlist data as CSV file.

**Endpoint:** `POST /api/admin/waitlist`

**Request Body:**
```json
{
  "action": "export"
}
```

**Success Response (200):**
Returns CSV file with headers:
```csv
Email,Name,User Type,Referral Code,Referred By,Referral Count,Tier,Free Months,Early Access,VIP Status,Share Count,Email Sent,Joined At
user@example.com,John Doe,player,GOODRUNSS-JOHN-X7K2,,5,silver,1,Yes,No,12,Yes,2024-11-05T10:00:00Z
```

---

## Reward Tiers

Default reward tiers (customizable):

| Tier | Badge | Referrals | Free Months | Benefits |
|------|-------|-----------|-------------|----------|
| Bronze | 🥉 | 0-2 | 0 | Early access |
| Silver | 🥈 | 3-9 | 1 | 1 month free + early access |
| Gold | 🥇 | 10-24 | 3 | 3 months free + early access |
| Platinum | 💎 | 25+ | 12 | 1 year free + VIP status |

---

## Referral Code Format

Referral codes follow this format:
```
GOODRUNSS-{NAME}-{RANDOM}
```

Examples:
- `GOODRUNSS-ALEX-K8M2`
- `GOODRUNSS-TRAINER-X7Y3`
- `GOODRUNSS-JOHN-A1B2`

---

## Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | "Valid email is required" | Invalid email format |
| 400 | "Email already registered" | Email exists in waitlist |
| 400 | "Referral code is required" | Missing referral code |
| 400 | "Maximum 50 emails allowed per batch" | Too many emails in invite |
| 404 | "Referral code not found" | Invalid referral code |
| 500 | "Failed to sign up for waitlist" | Server error |

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production:

- Signup: 10 requests per IP per hour
- Send invites: 5 requests per user per hour
- Stats: 100 requests per IP per hour

---

## Webhooks (Future Enhancement)

Consider adding webhooks for:
- New signup
- Referral converted
- Tier reached
- Milestone achieved

---

## Testing

### Test Signup
```bash
curl -X POST http://localhost:3000/api/waitlist/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "userType": "player"
  }'
```

### Test Stats
```bash
curl http://localhost:3000/api/waitlist/stats?code=GOODRUNSS-TEST-X7K2
```

### Test Share Tracking
```bash
curl -X POST http://localhost:3000/api/waitlist/share \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "GOODRUNSS-TEST-X7K2",
    "platform": "twitter"
  }'
```

---

## JavaScript/TypeScript Examples

### Sign Up
```typescript
const response = await fetch('/api/waitlist/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    userType: 'player',
    referredBy: 'GOODRUNSS-ALEX-K8M2'
  })
});

const data = await response.json();
console.log(data.data.referralCode); // Your new referral code
```

### Get Stats
```typescript
const code = 'GOODRUNSS-JOHN-X7K2';
const response = await fetch(`/api/waitlist/stats?code=${code}`);
const data = await response.json();

console.log(`You have ${data.data.referralCount} referrals!`);
console.log(`Current tier: ${data.data.tier}`);
```

### Track Share
```typescript
await fetch('/api/waitlist/share', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    referralCode: 'GOODRUNSS-JOHN-X7K2',
    platform: 'twitter'
  })
});
```

---

## Security Considerations

1. **Email Validation**: All emails are validated before storage
2. **Rate Limiting**: Should be added for production
3. **Admin Auth**: Protect admin endpoints with authentication
4. **Input Sanitization**: All inputs are sanitized
5. **CORS**: Configure CORS for production
6. **SQL Injection**: Protected via Prisma ORM

---

## Support

For questions or issues:
- Check the main documentation: `🎉_REFERRAL_SYSTEM_COMPLETE.md`
- Review utility functions: `/src/lib/referral-utils.ts`
- Email service: `/src/lib/email/referral-email-service.ts`

---

Made with ❤️ for GoodRunss 🏃‍♂️









