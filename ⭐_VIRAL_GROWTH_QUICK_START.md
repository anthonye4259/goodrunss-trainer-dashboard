# ⭐ VIRAL GROWTH BACKEND - QUICK START

## 🚀 **GET STARTED IN 5 MINUTES**

### **1. Install Dependencies**
```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm install qrcode @types/qrcode
```

### **2. Run Database Migration**
```bash
# Apply the viral growth schema
psql -d goodrunss_db -f prisma/migrations/20250125000000_viral_growth_schema.sql
```

### **3. Test the APIs**

#### **Generate Marketing Content**:
```bash
curl -X POST http://localhost:3000/api/trainer/marketing-generate \
  -H "Content-Type: application/json" \
  -d '{
    "trainerId": "your-trainer-id",
    "specialties": ["Yoga", "Pilates"],
    "location": "San Francisco",
    "targetAudience": "beginners"
  }'
```

#### **Generate QR Code**:
```bash
curl -X POST http://localhost:3000/api/trainer/qr-code \
  -H "Content-Type: application/json" \
  -d '{"trainerId": "your-trainer-id"}'
```

#### **Get Widget Code**:
```bash
curl http://localhost:3000/api/trainer/widget/your-trainer-id
```

#### **Generate Workout Recap**:
```bash
curl http://localhost:3000/api/user/workout-recap/your-user-id?period=month
```

#### **Share G.I.A Workout**:
```bash
curl -X POST http://localhost:3000/api/gia/share-workout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "workoutPlan": "G.I.A recommended this HIIT routine...",
    "environmentalContext": "Perfect weather for outdoor training!",
    "platform": "instagram"
  }'
```

#### **Track Referral**:
```bash
curl -X POST http://localhost:3000/api/referral/track \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "TRAINER_ABC123",
    "newUserEmail": "user@example.com",
    "source": "instagram_share",
    "referrerId": "your-trainer-id"
  }'
```

---

## 🎯 **VIRAL GROWTH FEATURES**

### **✅ READY TO USE**:
- 🧠 **G.I.A Marketing Generator**: Auto-creates personalized content
- 📱 **QR Code Generation**: Easy trainer booking access
- 🎨 **Widget Generator**: Embeddable booking widgets
- 📊 **Workout Recap Cards**: "Spotify Wrapped" style summaries
- 🤖 **G.I.A Workout Sharing**: Viral content generation
- 📱 **Social Media Integration**: Cross-platform sharing
- 🔗 **Referral Tracking**: Complete conversion analytics

### **🚀 NEXT STEPS**:
1. **Frontend Integration**: Connect to React components
2. **Social Media APIs**: Connect to Instagram, TikTok, Twitter
3. **Analytics Dashboard**: Real-time viral metrics
4. **A/B Testing**: Content optimization

---

## 🔥 **MAKE IT GO VIRAL**

### **Trainer Self-Signup**:
1. Trainer builds dashboard free
2. G.I.A auto-creates marketing content
3. Paywall unlock ($40/mo) for premium features

### **Player Social Proof**:
1. After every booking: "Share your run — tag @GoodRunssAI"
2. Auto-generated "Workout Recap Cards"
3. Referral tracking and rewards

### **AI Showcase Loop**:
1. Players post "G.I.A told me to do this today" workouts
2. FOMO virality through AI recommendations
3. Environmental context makes it unique

---

## 📊 **ANALYTICS TRACKING**

### **Viral Metrics**:
- Share count per content
- Referral conversions
- Platform performance
- User engagement rates

### **Referral Analytics**:
- Total referrals per trainer
- Conversion rates
- Source tracking (QR, widget, social)
- Revenue attribution

---

## 🎊 **READY TO LAUNCH**

**The GoodRunss platform now has COMPLETE viral growth backend infrastructure!**

**Built with 💚 for GoodRunss**  
**Train Smarter • Train Safer • Train Better**


