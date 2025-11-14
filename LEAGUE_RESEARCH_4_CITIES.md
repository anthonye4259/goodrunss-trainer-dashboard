# 🏆 GEE LEAGUES - 4 CITY LAUNCH

## 🎯 **TARGET CITIES:**
1. San Francisco, CA
2. New York City, NY
3. Pittsburgh, PA
4. Atlanta, GA

**Goal:** Add 10-15 leagues per city = 40-60 total leagues

---

## 📋 **RESEARCH CHECKLIST PER CITY:**

For each city, find:
- [ ] 3 Tennis leagues
- [ ] 3 Basketball leagues
- [ ] 2 Pickleball leagues
- [ ] 2 Golf leagues (if available)

---

## 🔍 **RESEARCH SOURCES:**

### **1. SAN FRANCISCO**

**City Rec Department:**
- https://sfrecpark.org/programs-activities/sports/
- SF Recreation & Parks Adult Sports

**Tennis:**
- SF Tennis Coalition: https://www.sftenniscoalition.com/
- Golden Gate Tennis League
- SF City Tennis League

**Basketball:**
- SF Rec & Park Basketball Leagues
- Mission Bay Basketball League
- SOMA Basketball League

**Pickleball:**
- SF Pickleball League
- Golden Gate Pickleball Club

**Where to search:**
```
Google: "San Francisco tennis league adult"
Google: "San Francisco basketball league recreational"
Google: "SF pickleball league"
```

---

### **2. NEW YORK CITY**

**City Rec Department:**
- https://www.nycgovparks.org/permits/athletics
- NYC Parks Adult Sports

**Tennis:**
- USTA Eastern (NYC): https://eastern.usta.com/
- NYC Tennis League: https://www.nyctennisleague.com/
- Brooklyn Tennis League
- Manhattan Tennis League

**Basketball:**
- NYC Parks Basketball Leagues
- West 4th Street Basketball League
- Dyckman Basketball League
- Brooklyn Rec League

**Pickleball:**
- NYC Pickleball League
- Brooklyn Pickleball League
- Central Park Pickleball

**Where to search:**
```
Google: "NYC tennis league adult"
Google: "New York basketball league recreational"
Google: "Brooklyn pickleball league"
```

---

### **3. PITTSBURGH**

**City Rec Department:**
- https://pittsburghpa.gov/citiparks/athletics
- Pittsburgh Parks & Recreation

**Tennis:**
- USTA Western Pennsylvania: https://www.westpenn.usta.com/
- Pittsburgh Tennis League
- Three Rivers Tennis League

**Basketball:**
- Pittsburgh Parks Basketball League
- Steel City Basketball League
- Pittsburgh Rec League

**Pickleball:**
- Pittsburgh Pickleball Club
- Three Rivers Pickleball

**Where to search:**
```
Google: "Pittsburgh tennis league adult"
Google: "Pittsburgh basketball league"
Google: "Pittsburgh pickleball club"
```

---

### **4. ATLANTA**

**City Rec Department:**
- https://www.atlantarecreation.com/
- Atlanta Parks & Recreation

**Tennis:**
- USTA Southern (Atlanta): https://www.southern.usta.com/
- Atlanta Lawn Tennis Association: https://www.alta.org/
- Atlanta Tennis League

**Basketball:**
- Atlanta Parks Basketball League
- ATL Rec Basketball
- Midtown Basketball League

**Pickleball:**
- Atlanta Pickleball League
- Georgia Pickleball Association

**Golf:**
- Atlanta City Golf (Atlanta Municipal)

**Where to search:**
```
Google: "Atlanta tennis league adult"
Google: "ALTA tennis league"
Google: "Atlanta basketball league recreational"
```

---

## 📝 **DATA TO COLLECT FOR EACH LEAGUE:**

### **Required:**
- [ ] League Name
- [ ] Sport
- [ ] City & State
- [ ] Venue/Location Name

### **Nice to Have:**
- [ ] Organizer Name
- [ ] Organizer Email
- [ ] Website URL
- [ ] Registration Fee
- [ ] Skill Levels (beginner, intermediate, advanced, open)
- [ ] Season Info (spring, summer, fall, winter, year-round)
- [ ] Day of Week

---

## 🚀 **QUICK ADD SQL TEMPLATE:**

Once you find leagues, use this SQL to add them quickly:

```sql
-- SAN FRANCISCO LEAGUES

INSERT INTO leagues (
  id, name, sport, city, state, venue_name, 
  organizer_name, organizer_email, website, registration_fee, 
  skill_levels, registration_status, description, is_active
) VALUES
(
  'league_sf_tennis_1',
  'Golden Gate Tennis League',
  'tennis',
  'San Francisco',
  'CA',
  'Golden Gate Park Tennis Complex',
  'SF Tennis Coalition',
  'info@sftenniscoalition.com',
  'https://www.sftenniscoalition.com',
  85.00,
  ARRAY['intermediate', 'advanced'],
  'open',
  'Competitive adult tennis league in Golden Gate Park',
  true
),
(
  'league_sf_bball_1',
  'Mission Bay Basketball League',
  'basketball',
  'San Francisco',
  'CA',
  'Mission Bay Recreation Center',
  NULL,
  NULL,
  'https://sfrecpark.org',
  60.00,
  ARRAY['open'],
  'open',
  'Recreational 5v5 basketball league',
  true
),
(
  'league_sf_pickle_1',
  'SF Pickleball League',
  'pickleball',
  'San Francisco',
  'CA',
  'Various SF Parks',
  NULL,
  NULL,
  NULL,
  50.00,
  ARRAY['beginner', 'intermediate'],
  'open',
  'Beginner-friendly pickleball league',
  true
);

-- NEW YORK LEAGUES

INSERT INTO leagues (
  id, name, sport, city, state, venue_name, 
  website, registration_fee, skill_levels, 
  registration_status, description, is_active
) VALUES
(
  'league_nyc_tennis_1',
  'NYC Tennis League',
  'tennis',
  'New York',
  'NY',
  'Various NYC Courts',
  'https://www.nyctennisleague.com',
  95.00,
  ARRAY['all'],
  'open',
  'Largest adult tennis league in NYC',
  true
),
(
  'league_nyc_bball_1',
  'West 4th Street Basketball League',
  'basketball',
  'New York',
  'NY',
  'West 4th Street Courts (The Cage)',
  NULL,
  40.00,
  ARRAY['advanced'],
  'open',
  'Legendary street basketball league',
  true
),
(
  'league_nyc_pickle_1',
  'Brooklyn Pickleball League',
  'pickleball',
  'Brooklyn',
  'NY',
  'Prospect Park',
  NULL,
  55.00,
  ARRAY['beginner', 'intermediate', 'advanced'],
  'open',
  'Competitive pickleball in Brooklyn',
  true
);

-- PITTSBURGH LEAGUES

INSERT INTO leagues (
  id, name, sport, city, state, venue_name, 
  website, registration_fee, skill_levels, 
  registration_status, description, is_active
) VALUES
(
  'league_pitt_tennis_1',
  'Pittsburgh Tennis League',
  'tennis',
  'Pittsburgh',
  'PA',
  'Mellon Park Tennis Center',
  NULL,
  70.00,
  ARRAY['intermediate', 'advanced'],
  'open',
  'Competitive adult tennis in Pittsburgh',
  true
),
(
  'league_pitt_bball_1',
  'Steel City Basketball League',
  'basketball',
  'Pittsburgh',
  'PA',
  'Various Pittsburgh Parks',
  NULL,
  55.00,
  ARRAY['open'],
  'open',
  'Pittsburgh recreational basketball',
  true
);

-- ATLANTA LEAGUES

INSERT INTO leagues (
  id, name, sport, city, state, venue_name, 
  website, registration_fee, skill_levels, 
  registration_status, description, is_active
) VALUES
(
  'league_atl_tennis_1',
  'Atlanta Lawn Tennis Association',
  'tennis',
  'Atlanta',
  'GA',
  'Various Atlanta Clubs',
  'https://www.alta.org',
  100.00,
  ARRAY['all'],
  'open',
  'One of largest tennis leagues in the US',
  true
),
(
  'league_atl_bball_1',
  'Atlanta Parks Basketball League',
  'basketball',
  'Atlanta',
  'GA',
  'Various Atlanta Recreation Centers',
  'https://www.atlantarecreation.com',
  50.00,
  ARRAY['open'],
  'open',
  'City-run recreational basketball',
  true
),
(
  'league_atl_pickle_1',
  'Atlanta Pickleball League',
  'pickleball',
  'Atlanta',
  'GA',
  'Various Atlanta Parks',
  NULL,
  60.00,
  ARRAY['beginner', 'intermediate', 'advanced'],
  'open',
  'Atlanta area pickleball league',
  true
);
```

---

## ⏱️ **TIME ESTIMATE:**

**Per City (2-3 hours):**
- 1 hour: Research & find 10 leagues
- 30 min: Collect contact info
- 30 min: Add to database

**Total for 4 Cities:** 8-12 hours spread over 2-3 days

---

## 🎯 **LAUNCH CHECKLIST:**

### **Day 1: San Francisco (3 hours)**
- [ ] Find 10 SF leagues
- [ ] Add to database
- [ ] Test search API

### **Day 2: New York (3 hours)**
- [ ] Find 10 NYC leagues
- [ ] Add to database
- [ ] Verify all data

### **Day 3: Pittsburgh & Atlanta (4 hours)**
- [ ] Find 10 Pittsburgh leagues
- [ ] Find 10 Atlanta leagues
- [ ] Add to database

### **Day 4: Polish & Launch**
- [ ] Test all APIs
- [ ] Verify all league links work
- [ ] LAUNCH! 🚀

---

## 💡 **PRO TIPS:**

### **1. Start with Official Leagues:**
- ALTA (Atlanta) = 80,000+ members!
- NYC Tennis League = huge
- These are established, trusted

### **2. Call Them:**
Don't just scrape websites - call the organizers:
- "Hi, we're featuring local leagues on GoodRunss"
- "Can we list your league for free during our beta?"
- Get accurate info + build relationship

### **3. Take Screenshots:**
For each league, screenshot their website
- Shows social proof
- Can use in your app
- Helps verify legitimacy

---

## 📞 **OUTREACH TEMPLATE:**

```
Subject: Feature [League Name] on GoodRunss? (Free Beta)

Hi [Name],

I'm launching GEE Leagues - a discovery platform that helps 
10,000+ sports enthusiasts find local leagues.

I'd love to feature [Your League] for FREE during our beta launch.

Would you be open to a quick 5-min call to discuss?

Benefits for you:
✅ Free exposure to 10,000+ active users
✅ Direct registration link to your site
✅ Featured listing during beta

Let me know if you're interested!

Best,
[Your Name]
Founder, GoodRunss
```

---

## 🚀 **READY TO RESEARCH?**

Start with **San Francisco** tomorrow:
1. Spend 3 hours researching
2. Find 10 leagues
3. Add them to database
4. You'll have your first city live!

Then do NYC, Pittsburgh, Atlanta over the next 3 days.

**By next week: 40 leagues, 4 cities, ready to launch!** 🎉

