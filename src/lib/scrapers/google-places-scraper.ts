/**
 * Google Places API Scraper
 * For yoga studios, pilates, barre, and other indoor facilities
 */

import { ScrapedFacility } from "./osm-scraper";

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
    periods?: any[];
    weekday_text?: string[];
  };
  formatted_phone_number?: string;
  website?: string;
  price_level?: number;
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  next_page_token?: string;
  status: string;
}

export class GooglePlacesScraper {
  private apiKey: string;
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search for facilities by type in a city/region
   */
  async searchByType(
    type: string,
    location: { lat: number; lng: number },
    radius: number = 50000 // 50km default
  ): Promise<ScrapedFacility[]> {
    try {
      console.log(`🔍 Searching Google Places for ${type}...`);

      const url = `${this.baseUrl}/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${type}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data: GooglePlacesResponse = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      console.log(`✅ Found ${data.results.length} places`);

      const facilities: ScrapedFacility[] = [];

      for (const place of data.results) {
        // Get detailed info for each place
        const detailed = await this.getPlaceDetails(place.place_id);
        if (detailed) {
          facilities.push(detailed);
        }

        // Rate limiting - Google allows 10 QPS
        await this.sleep(100);
      }

      // Handle pagination if there's a next_page_token
      if (data.next_page_token) {
        await this.sleep(2000); // Token takes ~2 seconds to activate
        const nextPage = await this.getNextPage(data.next_page_token);
        facilities.push(...nextPage);
      }

      return facilities;
    } catch (error) {
      console.error(`❌ Error searching Google Places:`, error);
      throw error;
    }
  }

  /**
   * Search by text query (e.g., "yoga studio in Los Angeles")
   */
  async searchByText(query: string): Promise<ScrapedFacility[]> {
    try {
      console.log(`🔍 Searching Google Places: "${query}"...`);

      const url = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data: GooglePlacesResponse = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      console.log(`✅ Found ${data.results.length} places`);

      const facilities: ScrapedFacility[] = [];

      for (const place of data.results) {
        const detailed = await this.getPlaceDetails(place.place_id);
        if (detailed) {
          facilities.push(detailed);
        }
        await this.sleep(100);
      }

      return facilities;
    } catch (error) {
      console.error(`❌ Error text search Google Places:`, error);
      throw error;
    }
  }

  /**
   * Search multiple major cities for a type
   */
  async searchMajorCities(sport: string, facilityType: string): Promise<ScrapedFacility[]> {
    const cities = [
      // US
      { name: "New York", lat: 40.7128, lng: -74.006 },
      { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
      { name: "Chicago", lat: 41.8781, lng: -87.6298 },
      { name: "Houston", lat: 29.7604, lng: -95.3698 },
      { name: "Phoenix", lat: 33.4484, lng: -112.074 },
      { name: "Philadelphia", lat: 39.9526, lng: -75.1652 },
      { name: "San Antonio", lat: 29.4241, lng: -98.4936 },
      { name: "San Diego", lat: 32.7157, lng: -117.1611 },
      { name: "Dallas", lat: 32.7767, lng: -96.797 },
      { name: "San Jose", lat: 37.3382, lng: -121.8863 },
      // International
      { name: "London", lat: 51.5074, lng: -0.1278 },
      { name: "Paris", lat: 48.8566, lng: 2.3522 },
      { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
      { name: "Sydney", lat: -33.8688, lng: 151.2093 },
      { name: "Toronto", lat: 43.6532, lng: -79.3832 },
    ];

    const allFacilities: ScrapedFacility[] = [];

    for (const city of cities) {
      try {
        console.log(`📍 Searching ${sport} in ${city.name}...`);
        const facilities = await this.searchByType(facilityType, city, 50000);
        allFacilities.push(...facilities);
        console.log(`✅ ${city.name}: ${facilities.length} facilities`);

        // Rate limiting
        await this.sleep(1000);
      } catch (error) {
        console.error(`❌ Error searching ${city.name}:`, error);
      }
    }

    return allFacilities;
  }

  /**
   * Get detailed place information
   */
  private async getPlaceDetails(placeId: string): Promise<ScrapedFacility | null> {
    try {
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,types,rating,user_ratings_total,photos,opening_hours,formatted_phone_number,website,price_level,address_components&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        console.error(`Error fetching place details: ${data.status}`);
        return null;
      }

      const place = data.result;

      // Parse address components
      const addressComponents = this.parseAddressComponents(place.address_components || []);

      // Determine sport type from place types
      const sport = this.determineSport(place.types || []);
      if (!sport) return null; // Skip if we can't determine sport

      // Get photos
      const photos = (place.photos || []).slice(0, 5).map((photo: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&photo_reference=${photo.photo_reference}&key=${this.apiKey}`
      );

      return {
        name: place.name,
        type: sport,
        category: "studio",
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        address: place.formatted_address,
        city: addressComponents.city,
        state: addressComponents.state,
        country: addressComponents.country,
        postalCode: addressComponents.postalCode,
        phone: place.formatted_phone_number,
        website: place.website,
        indoor: true,
        isPublic: true,
        requiresBooking: true,
        hours: this.parseHours(place.opening_hours),
        priceRange: this.parsePriceLevel(place.price_level),
        photos,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        googlePlaceId: placeId,
        source: "google",
        sourceId: `google_${placeId}`,
        sourceUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
        metadata: {
          googleTypes: place.types,
          googleRating: place.rating,
          googleReviews: place.user_ratings_total,
        },
      };
    } catch (error) {
      console.error(`Error getting place details for ${placeId}:`, error);
      return null;
    }
  }

  /**
   * Get next page of results
   */
  private async getNextPage(pageToken: string): Promise<ScrapedFacility[]> {
    const url = `${this.baseUrl}/nearbysearch/json?pagetoken=${pageToken}&key=${this.apiKey}`;

    const response = await fetch(url);
    const data: GooglePlacesResponse = await response.json();

    if (data.status !== "OK") {
      return [];
    }

    const facilities: ScrapedFacility[] = [];

    for (const place of data.results) {
      const detailed = await this.getPlaceDetails(place.place_id);
      if (detailed) {
        facilities.push(detailed);
      }
      await this.sleep(100);
    }

    return facilities;
  }

  /**
   * Parse address components
   */
  private parseAddressComponents(components: any[]): {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  } {
    const result: any = {};

    for (const component of components) {
      if (component.types.includes("locality")) {
        result.city = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        result.state = component.short_name;
      } else if (component.types.includes("country")) {
        result.country = component.short_name;
      } else if (component.types.includes("postal_code")) {
        result.postalCode = component.long_name;
      }
    }

    return result;
  }

  /**
   * Determine sport from Google Place types
   */
  private determineSport(types: string[]): string | null {
    const typeMap: Record<string, string> = {
      gym: "yoga", // Generic gym, default to yoga
      yoga: "yoga",
      pilates: "pilates",
      fitness_center: "pilates",
    };

    for (const type of types) {
      if (typeMap[type]) {
        return typeMap[type];
      }
    }

    return null;
  }

  /**
   * Parse opening hours
   */
  private parseHours(openingHours: any): any {
    if (!openingHours || !openingHours.weekday_text) {
      return null;
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const result: Record<string, string> = {};

    openingHours.weekday_text.forEach((text: string, index: number) => {
      const dayName = days[index];
      const hours = text.split(": ")[1] || "Closed";
      result[dayName.toLowerCase()] = hours;
    });

    return result;
  }

  /**
   * Parse price level
   */
  private parsePriceLevel(priceLevel: number | undefined): string {
    if (priceLevel === undefined) return "$$";
    if (priceLevel === 0) return "free";
    if (priceLevel === 1) return "$";
    if (priceLevel === 2) return "$$";
    if (priceLevel === 3) return "$$$";
    return "$$$$";
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

