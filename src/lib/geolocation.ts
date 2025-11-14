/**
 * Geolocation utilities for distance calculation and location management
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 3959; // Earth's radius in miles (use 6371 for kilometers)
  
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return 'Less than 0.1 mi';
  }
  if (miles < 1) {
    return `${miles.toFixed(1)} mi`;
  }
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

/**
 * Get distance range label
 */
export function getDistanceLabel(miles: number): string {
  if (miles < 1) return 'Nearby';
  if (miles < 5) return 'Close';
  if (miles < 10) return 'Near';
  if (miles < 25) return 'Moderate';
  return 'Far';
}

/**
 * Sort array of items by distance from user location
 */
export function sortByDistance<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  userLocation: Coordinates
): (T & { distance?: number })[] {
  return items
    .map((item) => {
      if (item.latitude && item.longitude) {
        const distance = calculateDistance(userLocation, {
          latitude: item.latitude,
          longitude: item.longitude,
        });
        return { ...item, distance };
      }
      return { ...item, distance: undefined };
    })
    .sort((a, b) => {
      // Items without location go to the end
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
}

/**
 * Filter items within a certain radius (in miles)
 */
export function filterByRadius<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  userLocation: Coordinates,
  radiusMiles: number
): T[] {
  return items.filter((item) => {
    if (!item.latitude || !item.longitude) return false;
    
    const distance = calculateDistance(userLocation, {
      latitude: item.latitude,
      longitude: item.longitude,
    });
    
    return distance <= radiusMiles;
  });
}

/**
 * Check if location permissions are granted (browser)
 */
export async function checkLocationPermission(): Promise<boolean> {
  if (!navigator.geolocation) {
    return false;
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state === 'granted';
  } catch (error) {
    // Permissions API not supported, try to get location
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false)
      );
    });
  }
}

/**
 * Get current browser location
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Failed to get location: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Reverse geocode coordinates to address (requires Google Maps API)
 * This is a placeholder - implement with your geocoding service
 */
export async function reverseGeocode(
  coordinates: Coordinates
): Promise<LocationData | null> {
  // TODO: Implement with Google Maps Geocoding API or similar
  // For now, return basic data
  return {
    ...coordinates,
    address: `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`,
  };
}

/**
 * Calculate bounding box for a given center point and radius
 * Returns coordinates for NE and SW corners
 * Useful for database queries
 */
export function getBoundingBox(
  center: Coordinates,
  radiusMiles: number
): { ne: Coordinates; sw: Coordinates } {
  const lat = center.latitude;
  const lon = center.longitude;
  const R = 3959; // Earth radius in miles

  // Calculate angular distance
  const angularDistance = radiusMiles / R;

  const latDelta = angularDistance * (180 / Math.PI);
  const lonDelta =
    (angularDistance * (180 / Math.PI)) / Math.cos(lat * (Math.PI / 180));

  return {
    ne: {
      latitude: lat + latDelta,
      longitude: lon + lonDelta,
    },
    sw: {
      latitude: lat - latDelta,
      longitude: lon - lonDelta,
    },
  };
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(coords: Partial<Coordinates>): coords is Coordinates {
  return (
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}

export default {
  calculateDistance,
  formatDistance,
  getDistanceLabel,
  sortByDistance,
  filterByRadius,
  checkLocationPermission,
  getCurrentLocation,
  reverseGeocode,
  getBoundingBox,
  isValidCoordinates,
};



