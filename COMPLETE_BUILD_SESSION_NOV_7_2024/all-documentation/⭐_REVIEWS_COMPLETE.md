# ⭐ REVIEWS & RATINGS SYSTEM - COMPLETE!

## **✅ WHAT WAS BUILT**

Complete **reviews and ratings system** with:
- Create/update/delete reviews
- 5-star ratings
- Review comments
- Trainer responses
- Mark helpful
- Report reviews
- Rating distribution
- Average rating calculation

---

## **🔌 API ENDPOINTS (7 routes)**

### **1. Create Review**
```typescript
POST /api/reviews
{
  "trainerId": "trainer_123",
  "clientId": "user_456",
  "sessionId": "session_789",  // Optional
  "rating": 5,
  "comment": "Amazing trainer! Very professional and helped me reach my goals."
}

// Response
{
  "review": {
    "id": "review_123",
    "rating": 5,
    "comment": "...",
    "createdAt": "2025-11-08T..."
  },
  "message": "Review created successfully"
}
```

### **2. Get Reviews**
```typescript
GET /api/reviews?trainerId=trainer_123&limit=20&sortBy=recent

// Response
{
  "reviews": [
    {
      "id": "review_123",
      "rating": 5,
      "comment": "Amazing trainer!",
      "createdAt": "2025-11-08T...",
      "trainerResponse": "Thank you so much!",
      "respondedAt": "2025-11-09T...",
      "client": {
        "id": "user_456",
        "name": "John Doe",
        "image": "..."
      }
    }
  ],
  "total": 45,
  "hasMore": true,
  "distribution": {
    "5": 30,
    "4": 10,
    "3": 3,
    "2": 1,
    "1": 1
  }
}

// Query params:
// - trainerId: Get trainer's reviews
// - clientId: Get client's reviews
// - rating: Filter by rating (1-5)
// - limit, offset: Pagination
// - sortBy: recent | rating | helpful
```

### **3. Update Review**
```typescript
PUT /api/reviews/[id]
{
  "clientId": "user_456",
  "rating": 4,
  "comment": "Updated comment"
}

// Note: Reviews can only be edited within 7 days

// Response
{
  "review": {...},
  "message": "Review updated successfully"
}
```

### **4. Delete Review**
```typescript
DELETE /api/reviews/[id]?clientId=user_456

// Response
{
  "message": "Review deleted successfully"
}
```

### **5. Mark as Helpful**
```typescript
POST /api/reviews/[id]/helpful
{
  "userId": "user_789",
  "helpful": true
}

// Response
{
  "message": "Marked as helpful"
}
```

### **6. Report Review**
```typescript
POST /api/reviews/[id]/report
{
  "userId": "user_789",
  "reason": "inappropriate",
  "details": "Contains offensive language"
}

// Reasons:
// - inappropriate
// - spam
// - fake
// - offensive
// - other

// Response
{
  "message": "Review reported successfully. Our team will review it."
}
```

### **7. Trainer Response**
```typescript
POST /api/reviews/[id]/respond
{
  "trainerId": "trainer_123",
  "response": "Thank you for the feedback! I'm glad I could help you reach your goals."
}

// Response
{
  "review": {...},
  "message": "Response added successfully"
}
```

---

## **📱 FRONTEND INTEGRATION**

### **Example: Leave Review Screen**
```typescript
// LeaveReviewScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { Rating } from 'react-native-ratings';

function LeaveReviewScreen({ sessionId, trainerId, clientId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submitReview = async () => {
    const response = await fetch('YOUR_API/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainerId,
        clientId,
        sessionId,
        rating,
        comment,
      }),
    });

    if (response.ok) {
      alert('Review submitted!');
      navigation.goBack();
    }
  };

  return (
    <View>
      <Rating
        startingValue={rating}
        imageSize={40}
        onFinishRating={setRating}
      />
      
      <TextInput
        placeholder="Tell us about your experience..."
        multiline
        numberOfLines={5}
        value={comment}
        onChangeText={setComment}
      />
      
      <Button title="Submit Review" onPress={submitReview} />
    </View>
  );
}
```

### **Example: Reviews List**
```typescript
// ReviewsList.tsx
function ReviewsList({ trainerId }) {
  const [reviews, setReviews] = useState([]);
  const [distribution, setDistribution] = useState({});

  useEffect(() => {
    loadReviews();
  }, [trainerId]);

  const loadReviews = async () => {
    const response = await fetch(
      `YOUR_API/api/reviews?trainerId=${trainerId}&limit=20&sortBy=recent`
    );
    const data = await response.json();
    setReviews(data.reviews);
    setDistribution(data.distribution);
  };

  return (
    <View>
      {/* Rating Summary */}
      <View>
        <Text>4.8 ⭐</Text>
        <Text>45 reviews</Text>
        
        {/* Distribution Bars */}
        {[5, 4, 3, 2, 1].map((star) => (
          <View key={star}>
            <Text>{star} ⭐</Text>
            <ProgressBar
              progress={distribution[star] / 45}
              width={100}
            />
            <Text>{distribution[star]}</Text>
          </View>
        ))}
      </View>

      {/* Reviews */}
      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <ReviewCard review={item} />
        )}
      />
    </View>
  );
}
```

### **Example: Review Card**
```typescript
// ReviewCard.tsx
function ReviewCard({ review }) {
  const [helpful, setHelpful] = useState(false);

  const markHelpful = async () => {
    await fetch(`YOUR_API/api/reviews/${review.id}/helpful`, {
      method: 'POST',
      body: JSON.stringify({
        userId: currentUserId,
        helpful: !helpful,
      }),
    });
    setHelpful(!helpful);
  };

  const reportReview = async () => {
    await fetch(`YOUR_API/api/reviews/${review.id}/report`, {
      method: 'POST',
      body: JSON.stringify({
        userId: currentUserId,
        reason: 'inappropriate',
      }),
    });
    alert('Review reported');
  };

  return (
    <View>
      <View>
        <Image source={{ uri: review.client.image }} />
        <Text>{review.client.name}</Text>
        <Rating
          readonly
          startingValue={review.rating}
          imageSize={16}
        />
      </View>

      <Text>{review.comment}</Text>
      <Text>{new Date(review.createdAt).toLocaleDateString()}</Text>

      {/* Trainer Response */}
      {review.trainerResponse && (
        <View style={{ backgroundColor: '#f5f5f5', padding: 10 }}>
          <Text>Response from trainer:</Text>
          <Text>{review.trainerResponse}</Text>
        </View>
      )}

      {/* Actions */}
      <View>
        <Button
          title={helpful ? '✓ Helpful' : 'Helpful'}
          onPress={markHelpful}
        />
        <Button title="Report" onPress={reportReview} />
      </View>
    </View>
  );
}
```

---

## **🎯 FEATURES**

✅ **5-star ratings**  
✅ **Review comments**  
✅ **Trainer responses**  
✅ **Edit reviews** (within 7 days)  
✅ **Delete reviews**  
✅ **Mark helpful**  
✅ **Report reviews**  
✅ **Session verification** (only review completed sessions)  
✅ **Automatic rating updates** (trainer average)  
✅ **Rating distribution** (5⭐, 4⭐, etc.)  
✅ **Multiple sort options** (recent, rating, helpful)  

---

## **🔒 SECURITY**

✅ Only review completed sessions  
✅ One review per session  
✅ Only edit your own reviews  
✅ Only trainers can respond  
✅ 7-day edit window  
✅ Report inappropriate reviews  

---

## **✅ TESTING**

```bash
# Create review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"trainerId":"trainer_123","clientId":"user_456","rating":5,"comment":"Great!"}'

# Get reviews
curl "http://localhost:3000/api/reviews?trainerId=trainer_123&limit=20"

# Update review
curl -X PUT http://localhost:3000/api/reviews/review_123 \
  -d '{"clientId":"user_456","rating":4}'

# Delete review
curl -X DELETE "http://localhost:3000/api/reviews/review_123?clientId=user_456"

# Mark helpful
curl -X POST http://localhost:3000/api/reviews/review_123/helpful \
  -d '{"userId":"user_789","helpful":true}'

# Report review
curl -X POST http://localhost:3000/api/reviews/review_123/report \
  -d '{"userId":"user_789","reason":"spam"}'

# Trainer response
curl -X POST http://localhost:3000/api/reviews/review_123/respond \
  -d '{"trainerId":"trainer_123","response":"Thank you!"}'
```

---

## **🎉 REVIEWS SYSTEM READY!**

Social proof is now **fully functional**! Users can see authentic reviews. ⭐

**Next: Building Push Notifications...** 📱

