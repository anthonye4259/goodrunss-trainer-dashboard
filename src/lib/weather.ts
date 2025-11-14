/**
 * Weather API Service
 * Using OpenWeatherMap API for weather data
 */

interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  isGoodForOutdoor: boolean;
  workoutRecommendation: string;
}

interface ForecastData {
  date: string;
  temperature: number;
  condition: string;
  description: string;
  isGoodForOutdoor: boolean;
}

interface AirQualityData {
  aqi: number; // 1-5 (1=Good, 5=Very Poor)
  aqiLabel: string;
  co: number; // Carbon monoxide
  no2: number; // Nitrogen dioxide
  o3: number; // Ozone
  pm2_5: number; // Fine particles
  pm10: number; // Coarse particles
  recommendation: string;
  isSafeForOutdoor: boolean;
}

interface FireWeatherData {
  fwi: number; // Fire Weather Index
  risk: string; // Low, Moderate, High, Very High, Extreme
  recommendation: string;
}

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(
  city?: string,
  lat?: number,
  lon?: number
): Promise<WeatherData | null> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenWeatherMap API key not configured');
      return null;
    }

    let url = 'https://api.openweathermap.org/data/2.5/weather?';
    
    if (lat && lon) {
      url += `lat=${lat}&lon=${lon}`;
    } else if (city) {
      url += `q=${encodeURIComponent(city)}`;
    } else {
      // Default to a major city if no location provided
      url += 'q=New York';
    }
    
    url += `&appid=${apiKey}&units=imperial`; // Use Fahrenheit

    const response = await fetch(url, {
      next: { revalidate: 600 } // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Determine if weather is good for outdoor workouts
    const temp = data.main.temp;
    const condition = data.weather[0].main.toLowerCase();
    const windSpeed = data.wind.speed;

    const isGoodForOutdoor = 
      temp >= 40 && temp <= 90 && // Comfortable temperature range
      !['rain', 'snow', 'thunderstorm'].includes(condition) &&
      windSpeed < 20; // Not too windy

    // Generate workout recommendation
    let workoutRecommendation = '';
    if (isGoodForOutdoor) {
      workoutRecommendation = 'Great weather for outdoor training! Consider running, cycling, or outdoor HIIT.';
    } else if (temp < 40) {
      workoutRecommendation = 'Cold weather - perfect for indoor training or shorter outdoor sessions with proper layers.';
    } else if (temp > 90) {
      workoutRecommendation = 'Hot weather - stay hydrated! Early morning or evening outdoor sessions recommended, or train indoors.';
    } else if (condition.includes('rain')) {
      workoutRecommendation = 'Rainy day - great time for indoor gym sessions, yoga, or home workouts.';
    } else if (condition.includes('snow')) {
      workoutRecommendation = 'Snowy conditions - indoor training recommended for safety.';
    } else if (windSpeed > 20) {
      workoutRecommendation = 'Windy conditions - indoor training might be more comfortable.';
    }

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      icon: data.weather[0].icon,
      isGoodForOutdoor,
      workoutRecommendation,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Get 5-day weather forecast
 */
export async function getWeatherForecast(
  city?: string,
  lat?: number,
  lon?: number
): Promise<ForecastData[]> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenWeatherMap API key not configured');
      return [];
    }

    let url = 'https://api.openweathermap.org/data/2.5/forecast?';
    
    if (lat && lon) {
      url += `lat=${lat}&lon=${lon}`;
    } else if (city) {
      url += `q=${encodeURIComponent(city)}`;
    } else {
      url += 'q=New York';
    }
    
    url += `&appid=${apiKey}&units=imperial`;

    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Group by day and get noon forecast for each day
    const dailyForecasts: ForecastData[] = [];
    const processedDates = new Set<string>();

    for (const item of data.list) {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toDateString();
      
      // Get noon forecast for each day (or closest to noon)
      if (!processedDates.has(dateStr) && date.getHours() >= 11 && date.getHours() <= 14) {
        const temp = item.main.temp;
        const condition = item.weather[0].main.toLowerCase();
        const windSpeed = item.wind.speed;

        const isGoodForOutdoor = 
          temp >= 40 && temp <= 90 &&
          !['rain', 'snow', 'thunderstorm'].includes(condition) &&
          windSpeed < 20;

        dailyForecasts.push({
          date: dateStr,
          temperature: Math.round(temp),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          isGoodForOutdoor,
        });

        processedDates.add(dateStr);
      }

      if (dailyForecasts.length >= 5) break;
    }

    return dailyForecasts;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return [];
  }
}

/**
 * Get weather context for G.I.A
 */
export async function getWeatherContext(
  city?: string,
  lat?: number,
  lon?: number
): Promise<string> {
  const weather = await getCurrentWeather(city, lat, lon);
  
  if (!weather) {
    return 'Weather data unavailable.';
  }

  return `
CURRENT WEATHER:
- Temperature: ${weather.temperature}°F (feels like ${weather.feelsLike}°F)
- Conditions: ${weather.description}
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed} mph
- Outdoor Training: ${weather.isGoodForOutdoor ? 'Recommended ✅' : 'Not Ideal ⚠️'}
- Recommendation: ${weather.workoutRecommendation}
`.trim();
}

/**
 * Get fitness-specific weather advice
 */
export function getWeatherWorkoutAdvice(weather: WeatherData): string {
  const { temperature, condition, isGoodForOutdoor } = weather;

  if (isGoodForOutdoor) {
    return 'Perfect weather for outdoor training! Take advantage of these conditions for running, cycling, or outdoor bootcamp sessions.';
  }

  if (temperature < 32) {
    return '❄️ Freezing conditions - Indoor training highly recommended. If training outdoors, dress in layers, wear gloves, and limit duration.';
  }

  if (temperature < 40) {
    return '🧊 Cold weather - Warm up thoroughly indoors before outdoor sessions. Layer up and watch for ice on surfaces.';
  }

  if (temperature > 95) {
    return '🔥 Extreme heat - Train indoors or schedule early morning/evening sessions. Stay hydrated and watch for heat exhaustion signs.';
  }

  if (temperature > 85) {
    return '☀️ Hot weather - Reduce intensity for outdoor training, take frequent breaks, and increase water intake. Indoor AC training is ideal.';
  }

  if (condition.toLowerCase().includes('rain')) {
    return '🌧️ Rainy conditions - Great day for indoor gym sessions, yoga, swimming, or at-home strength training.';
  }

  if (condition.toLowerCase().includes('snow')) {
    return '❄️ Snowy weather - Indoor training recommended. If you must train outdoors, watch for slippery surfaces and dress warmly.';
  }

  if (condition.toLowerCase().includes('thunderstorm')) {
    return '⛈️ Thunderstorms - Stay indoors! Great time for strength training, yoga, or indoor cardio equipment.';
  }

  return 'Check current conditions and adjust your workout accordingly. Safety first!';
}

/**
 * Get air quality data for a location
 */
export async function getAirQuality(
  lat: number,
  lon: number
): Promise<AirQualityData | null> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenWeatherMap API key not configured');
      return null;
    }

    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 600 } // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`Air Quality API error: ${response.status}`);
    }

    const data = await response.json();
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    // Map AQI to label
    const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiLabel = aqiLabels[aqi - 1] || 'Unknown';

    // Determine if safe for outdoor exercise
    const isSafeForOutdoor = aqi <= 3; // Good, Fair, or Moderate

    // Generate recommendation
    let recommendation = '';
    switch (aqi) {
      case 1: // Good
        recommendation = 'Air quality is excellent! Perfect for outdoor training of any intensity.';
        break;
      case 2: // Fair
        recommendation = 'Air quality is acceptable. Outdoor training is fine for most people.';
        break;
      case 3: // Moderate
        recommendation = 'Air quality is moderate. Sensitive individuals should consider reducing prolonged outdoor exertion.';
        break;
      case 4: // Poor
        recommendation = '⚠️ Air quality is poor. Consider indoor training. If outdoors, reduce intensity and duration.';
        break;
      case 5: // Very Poor
        recommendation = '❌ Air quality is very poor! Indoor training strongly recommended. Avoid outdoor exercise.';
        break;
    }

    return {
      aqi,
      aqiLabel,
      co: components.co,
      no2: components.no2,
      o3: components.o3,
      pm2_5: components.pm2_5,
      pm10: components.pm10,
      recommendation,
      isSafeForOutdoor,
    };
  } catch (error) {
    console.error('Error fetching air quality:', error);
    return null;
  }
}

/**
 * Get fire weather index data
 */
export async function getFireWeather(
  lat: number,
  lon: number
): Promise<FireWeatherData | null> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenWeatherMap API key not configured');
      return null;
    }

    const url = `https://api.openweathermap.org/data/2.5/fwi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      // Fire Weather Index might not be available for all locations
      console.warn('Fire Weather Index not available for this location');
      return null;
    }

    const data = await response.json();
    const fwi = data.list[0]?.fwi || 0;

    // Determine risk level
    let risk = 'Low';
    let recommendation = '';

    if (fwi < 5.2) {
      risk = 'Low';
      recommendation = 'Fire risk is low. Normal outdoor activities are safe.';
    } else if (fwi < 11.2) {
      risk = 'Moderate';
      recommendation = 'Moderate fire risk. Be aware of fire conditions in the area.';
    } else if (fwi < 21.3) {
      risk = 'High';
      recommendation = '⚠️ High fire risk. Avoid activities that could spark fires. Stay on designated trails.';
    } else if (fwi < 38.0) {
      risk = 'Very High';
      recommendation = '⚠️ Very high fire risk. Consider indoor training. If outdoors, extreme caution required.';
    } else {
      risk = 'Extreme';
      recommendation = '❌ EXTREME fire risk! Indoor training only. Avoid all outdoor activities in fire-prone areas.';
    }

    return {
      fwi,
      risk,
      recommendation,
    };
  } catch (error) {
    console.error('Error fetching fire weather:', error);
    return null;
  }
}

/**
 * Get comprehensive environmental context for G.I.A
 */
export async function getEnvironmentalContext(
  city?: string,
  lat?: number,
  lon?: number
): Promise<string> {
  const weather = await getCurrentWeather(city, lat, lon);
  
  if (!weather) {
    return 'Environmental data unavailable.';
  }

  let context = `
CURRENT WEATHER:
- Temperature: ${weather.temperature}°F (feels like ${weather.feelsLike}°F)
- Conditions: ${weather.description}
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed} mph
- Outdoor Training: ${weather.isGoodForOutdoor ? 'Recommended ✅' : 'Not Ideal ⚠️'}
- Recommendation: ${weather.workoutRecommendation}`;

  // Add air quality if coordinates are provided
  if (lat && lon) {
    const airQuality = await getAirQuality(lat, lon);
    if (airQuality) {
      context += `

AIR QUALITY:
- AQI: ${airQuality.aqi}/5 (${airQuality.aqiLabel})
- PM2.5: ${airQuality.pm2_5.toFixed(1)} μg/m³
- Safe for Outdoor: ${airQuality.isSafeForOutdoor ? 'Yes ✅' : 'No ⚠️'}
- Recommendation: ${airQuality.recommendation}`;
    }

    // Add fire weather if available
    const fireWeather = await getFireWeather(lat, lon);
    if (fireWeather) {
      context += `

FIRE WEATHER:
- Fire Risk: ${fireWeather.risk}
- Fire Weather Index: ${fireWeather.fwi.toFixed(1)}
- Recommendation: ${fireWeather.recommendation}`;
    }
  }

  return context.trim();
}

export default {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherContext,
  getWeatherWorkoutAdvice,
  getAirQuality,
  getFireWeather,
  getEnvironmentalContext,
};

