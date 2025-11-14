/**
 * OpenStreetMap Scraper
 * Uses Overpass API to scrape facilities worldwide
 */

interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OSMResponse {
  elements: OSMElement[];
}

export interface ScrapedFacility {
  name: string;
  type: string;
  category: string;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  description?: string;
  amenities?: string[];
  surfaceType?: string;
  courtCount?: number;
  indoor?: boolean;
  isPublic?: boolean;
  source: string;
  sourceId: string;
  sourceUrl?: string;
  metadata?: Record<string, any>;
}

export class OSMScraper {
  private overpassUrl = "https://overpass-api.de/api/interpreter";

  /**
   * Scrape facilities for a specific sport in a region
   */
  async scrapeSport(
    sport: string,
    osmTags: Record<string, string>,
    bbox?: { south: number; west: number; north: number; east: number }
  ): Promise<ScrapedFacility[]> {
    try {
      console.log(`🔍 Scraping ${sport} facilities from OpenStreetMap...`);

      const query = this.buildOverpassQuery(osmTags, bbox);
      const response = await fetch(this.overpassUrl, {
        method: "POST",
        body: query,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        throw new Error(`OSM API error: ${response.statusText}`);
      }

      const data: OSMResponse = await response.json();
      console.log(`✅ Found ${data.elements.length} ${sport} facilities`);

      return data.elements
        .map((element) => this.parseElement(element, sport))
        .filter((f) => f !== null) as ScrapedFacility[];
    } catch (error) {
      console.error(`❌ Error scraping ${sport} from OSM:`, error);
      throw error;
    }
  }

  /**
   * Scrape worldwide (in chunks to avoid timeout)
   */
  async scrapeWorldwide(
    sport: string,
    osmTags: Record<string, string>
  ): Promise<ScrapedFacility[]> {
    console.log(`🌍 Scraping ${sport} facilities worldwide...`);

    // Break world into chunks (continents/regions)
    const regions = [
      { name: "North America", bbox: { south: 15, west: -170, north: 75, east: -50 } },
      { name: "South America", bbox: { south: -60, west: -85, north: 15, east: -30 } },
      { name: "Europe", bbox: { south: 35, west: -10, north: 72, east: 40 } },
      { name: "Asia", bbox: { south: -10, west: 40, north: 75, east: 180 } },
      { name: "Africa", bbox: { south: -35, west: -20, north: 38, east: 55 } },
      { name: "Oceania", bbox: { south: -50, west: 110, north: -10, east: 180 } },
    ];

    const allFacilities: ScrapedFacility[] = [];

    for (const region of regions) {
      try {
        console.log(`📍 Scraping ${region.name}...`);
        const facilities = await this.scrapeSport(sport, osmTags, region.bbox);
        allFacilities.push(...facilities);
        console.log(`✅ ${region.name}: ${facilities.length} facilities`);

        // Rate limiting - wait 2 seconds between regions
        await this.sleep(2000);
      } catch (error) {
        console.error(`❌ Error scraping ${region.name}:`, error);
        // Continue with other regions
      }
    }

    console.log(`✅ Total worldwide: ${allFacilities.length} facilities`);
    return allFacilities;
  }

  /**
   * Build Overpass QL query
   */
  private buildOverpassQuery(
    tags: Record<string, string>,
    bbox?: { south: number; west: number; north: number; east: number }
  ): string {
    const bboxStr = bbox
      ? `(${bbox.south},${bbox.west},${bbox.north},${bbox.east})`
      : "";

    // Build tag filters
    const tagFilters = Object.entries(tags)
      .map(([key, value]) => `["${key}"="${value}"]`)
      .join("");

    return `
      [out:json][timeout:180];
      (
        node${tagFilters}${bboxStr};
        way${tagFilters}${bboxStr};
        relation${tagFilters}${bboxStr};
      );
      out center body;
    `;
  }

  /**
   * Parse OSM element to facility
   */
  private parseElement(element: OSMElement, sport: string): ScrapedFacility | null {
    const tags = element.tags || {};

    // Get coordinates
    let lat: number;
    let lng: number;

    if (element.lat && element.lon) {
      lat = element.lat;
      lng = element.lon;
    } else if (element.center) {
      lat = element.center.lat;
      lng = element.center.lon;
    } else {
      return null; // Skip if no coordinates
    }

    // Get name
    const name = tags.name || tags["name:en"] || `${sport} facility`;

    // Parse amenities
    const amenities: string[] = [];
    if (tags.lit === "yes") amenities.push("lights");
    if (tags.access === "yes") amenities.push("public_access");
    if (tags.fee === "yes") amenities.push("paid");
    if (tags.fee === "no") amenities.push("free");
    if (tags.surface) amenities.push(`surface:${tags.surface}`);
    if (tags["toilets:wheelchair"] === "yes") amenities.push("accessible_restrooms");

    // Determine category
    const category = this.determineCategory(sport, tags);

    return {
      name,
      type: sport,
      category,
      lat,
      lng,
      address: this.buildAddress(tags),
      city: tags["addr:city"] || tags.city,
      state: tags["addr:state"] || tags.state,
      country: tags["addr:country"] || this.guessCountry(lat, lng),
      postalCode: tags["addr:postcode"],
      phone: tags.phone || tags["contact:phone"],
      website: tags.website || tags["contact:website"],
      description: tags.description,
      amenities,
      surfaceType: tags.surface,
      courtCount: this.parseCourtCount(tags),
      indoor: tags.indoor === "yes",
      isPublic: tags.access !== "private",
      source: "osm",
      sourceId: `osm_${element.type}_${element.id}`,
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      metadata: {
        osmType: element.type,
        osmId: element.id,
        osmTags: tags,
      },
    };
  }

  /**
   * Build address from tags
   */
  private buildAddress(tags: Record<string, string>): string | undefined {
    const parts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:city"],
      tags["addr:state"],
      tags["addr:postcode"],
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : undefined;
  }

  /**
   * Parse court count from tags
   */
  private parseCourtCount(tags: Record<string, string>): number | undefined {
    const count = tags["capacity"] || tags["courts"] || tags["pitches"];
    return count ? parseInt(count) : undefined;
  }

  /**
   * Determine facility category
   */
  private determineCategory(sport: string, tags: Record<string, string>): string {
    if (tags.indoor === "yes") return "indoor_court";
    if (tags.leisure === "golf_course") return "course";
    if (tags.leisure === "pitch") return "outdoor_court";
    if (tags.leisure === "sports_centre") return "sports_complex";
    if (tags.leisure === "park") return "park";

    // Default categories by sport
    const categoryMap: Record<string, string> = {
      tennis: "outdoor_court",
      basketball: "outdoor_court",
      pickleball: "outdoor_court",
      soccer: "outdoor_field",
      volleyball: "outdoor_court",
      golf: "course",
    };

    return categoryMap[sport] || "outdoor_court";
  }

  /**
   * Guess country from coordinates (simplified)
   */
  private guessCountry(lat: number, lng: number): string {
    // Very simplified - you'd want a proper reverse geocoding service
    if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -65) return "USA";
    if (lat >= 36 && lat <= 72 && lng >= -10 && lng <= 40) return "EUR";
    if (lat >= -10 && lat <= 55 && lng >= 40 && lng <= 150) return "ASIA";

    return "UNKNOWN";
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const osmScraper = new OSMScraper();

