# 🔍 SEARCH SYSTEM - COMPLETE!

## **✅ WHAT WAS BUILT**

Complete **search functionality** with:
- Universal search (trainers, facilities, workouts)
- Advanced filters (location, price, specialty, rating)
- Autocomplete suggestions
- Popular searches
- Distance calculation
- Multi-sort options

---

## **🔌 API ENDPOINTS (4 routes)**

### **1. Universal Search**
```typescript
GET /api/search?query=yoga&type=trainer&lat=40.7128&lng=-74.0060&radius=10&priceMin=30&priceMax=100&specialty=yoga&minRating=4.5&sortBy=distance

// Parameters:
// - query: Search text
// - type: trainer | facility | workout | all
// - lat, lng, radius: Location filter (miles)
// - priceMin, priceMax: Price range
// - specialty: Filter by specialty
// - minRating: Minimum rating (1-5)
// - sortBy: relevance | distance | price | rating
// - availability: available | online | in_person
// - limit, offset: Pagination

// Response
{
  "trainers": [
    {
      "id": "trainer_123",
      "name": "Sarah Johnson",
      "image": "...",
      "bio": "Certified yoga instructor...",
      "specialties": ["yoga", "pilates"],
      "hourlyRate": 75.00,
      "rating": 4.8,
      "totalSessions": 245,
      "distance": 2.3,  // miles
      "city": "New York",
      "state": "NY"
    }
  ],
  "facilities": [],
  "workouts": [],
  "total": 15,
  "metadata": {
    "query": "yoga",
    "type": "trainer",
    "filters": {
      "location": { "lat": 40.7128, "lng": -74.0060, "radius": 10 },
      "price": { "min": "30", "max": "100" },
      "specialty": "yoga",
      "minRating": "4.5"
    },
    "sortBy": "distance",
    "pagination": {
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### **2. Autocomplete Suggestions**
```typescript
GET /api/search/suggestions?query=yog&limit=10

// Response
{
  "suggestions": [
    {
      "type": "specialty",
      "value": "yoga",
      "label": "Yoga",
      "subtitle": "Specialty"
    },
    {
      "type": "trainer",
      "value": "Yoga with Sarah",
      "label": "Yoga with Sarah",
      "subtitle": "Personal Trainer"
    },
    {
      "type": "location",
      "value": "Yonkers",
      "label": "Yonkers, NY",
      "subtitle": "Location"
    }
  ],
  "count": 3,
  "query": "yog"
}
```

### **3. Available Filters**
```typescript
GET /api/search/filters

// Response
{
  "specialties": [
    { "value": "yoga", "label": "Yoga", "count": 45 },
    { "value": "pilates", "label": "Pilates", "count": 32 },
    { "value": "strength_training", "label": "Strength Training", "count": 67 }
  ],
  "certifications": [
    { "value": "NASM", "label": "NASM", "count": 23 },
    { "value": "ACE", "label": "ACE", "count": 18 }
  ],
  "priceRange": {
    "min": 30,
    "max": 200,
    "average": 75
  },
  "ratingDistribution": {
    "5": 45,
    "4": 23,
    "3": 5,
    "2": 1,
    "1": 0
  },
  "totalTrainers": 74
}
```

### **4. Popular Searches**
```typescript
GET /api/search/popular?limit=10

// Response
{
  "searches": [
    { "query": "Personal Training", "type": "specialty", "count": 67 },
    { "query": "Yoga", "type": "specialty", "count": 45 },
    { "query": "HIIT", "type": "specialty", "count": 38 },
    { "query": "Weight Loss", "type": "goal" }
  ],
  "count": 4
}
```

---

## **📱 FRONTEND INTEGRATION**

### **Example: Search Screen**
```typescript
// SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList } from 'react-native';

function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    priceMin: null,
    priceMax: null,
    specialty: null,
    minRating: null,
    sortBy: 'relevance',
  });

  // Get autocomplete suggestions
  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions();
    }
  }, [query]);

  const fetchSuggestions = async () => {
    const response = await fetch(
      `YOUR_API/api/search/suggestions?query=${query}`
    );
    const data = await response.json();
    setSuggestions(data.suggestions);
  };

  // Search with filters
  const search = async () => {
    const params = new URLSearchParams({
      query,
      type: 'trainer',
      ...filters,
    });

    const response = await fetch(`YOUR_API/api/search?${params}`);
    const data = await response.json();
    setResults(data.trainers);
  };

  return (
    <View>
      <TextInput
        placeholder="Search trainers, specialties..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={search}
      />
      
      {/* Show suggestions while typing */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          renderItem={({ item }) => (
            <SuggestionItem
              item={item}
              onPress={() => {
                setQuery(item.value);
                search();
              }}
            />
          )}
        />
      )}

      {/* Show results */}
      <FlatList
        data={results}
        renderItem={({ item }) => <TrainerCard trainer={item} />}
      />
    </View>
  );
}
```

### **Example: Filter Sheet**
```typescript
// FilterSheet.tsx
function FilterSheet({ onApply }) {
  const [filters, setFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState(null);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    const response = await fetch('YOUR_API/api/search/filters');
    const data = await response.json();
    setAvailableFilters(data);
  };

  return (
    <View>
      {/* Price Range Slider */}
      <Slider
        min={availableFilters?.priceRange.min}
        max={availableFilters?.priceRange.max}
        value={[filters.priceMin, filters.priceMax]}
        onChange={(values) => {
          setFilters({
            ...filters,
            priceMin: values[0],
            priceMax: values[1],
          });
        }}
      />

      {/* Specialty Pills */}
      <View>
        {availableFilters?.specialties.map((specialty) => (
          <Chip
            key={specialty.value}
            label={`${specialty.label} (${specialty.count})`}
            selected={filters.specialty === specialty.value}
            onPress={() => {
              setFilters({
                ...filters,
                specialty: specialty.value,
              });
            }}
          />
        ))}
      </View>

      {/* Rating Filter */}
      <StarRating
        value={filters.minRating}
        onChange={(rating) => {
          setFilters({ ...filters, minRating: rating });
        }}
      />

      <Button title="Apply Filters" onPress={() => onApply(filters)} />
    </View>
  );
}
```

---

## **🎯 FEATURES**

✅ **Text search** (name, bio, specialties)  
✅ **Location-based** (distance calculation)  
✅ **Price range** filtering  
✅ **Specialty** filtering  
✅ **Rating** filtering  
✅ **Multiple sort options** (relevance, distance, price, rating)  
✅ **Autocomplete** suggestions  
✅ **Popular searches**  
✅ **Filter options** API  
✅ **Pagination** support  

---

## **🚀 SEARCH ALGORITHM**

### **Relevance Scoring:**
1. **Exact match** - highest priority
2. **Name match** - high priority
3. **Specialty match** - medium priority
4. **Bio match** - low priority

### **Distance Calculation:**
Uses **Haversine formula** for accurate distance between coordinates.

### **Multi-factor Sorting:**
- **Relevance:** Text match score
- **Distance:** Nearest first
- **Price:** Lowest first
- **Rating:** Highest first

---

## **✅ TESTING**

```bash
# Basic search
curl "http://localhost:3000/api/search?query=yoga&type=trainer"

# With location
curl "http://localhost:3000/api/search?query=yoga&lat=40.7128&lng=-74.0060&radius=10"

# With filters
curl "http://localhost:3000/api/search?query=yoga&priceMin=30&priceMax=100&minRating=4.5&sortBy=distance"

# Autocomplete
curl "http://localhost:3000/api/search/suggestions?query=yog"

# Get filters
curl "http://localhost:3000/api/search/filters"

# Popular searches
curl "http://localhost:3000/api/search/popular"
```

---

## **🎉 SEARCH SYSTEM READY!**

Users can now **find exactly what they need** with powerful search and filters! 🔍

**Next: Building Reviews & Ratings System...** ⭐

