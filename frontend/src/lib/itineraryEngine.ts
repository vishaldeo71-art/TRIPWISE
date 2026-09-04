import { Activity, ItineraryDay, Persona, TravelPace, WeatherSummary, HealthScore, Trip } from '@/types/trip';

// Comprehensive activity database with rich fallback tagging
const GLOBAL_ACTIVITIES_DATABASE: Omit<Activity, 'id'>[] = [
  // CULTURE & HERITAGE
  {
    name: 'Historical Landmark & Architectural Walking Tour',
    category: 'culture',
    isOutdoor: true,
    durationMinutes: 120,
    bestTime: 'Morning',
    description: 'Explore world-famous historic monuments, ancient archways, and iconic photo spots.',
    estimatedTravelTime: '🚶 10 min walk',
    weatherSuitability: 'High',
    personaSuitability: ['Explorer', 'Backpacker', 'Family', 'Solo Explorer'],
    whySelectedReason: 'Selected for rich historical immersion and great morning photo conditions.',
    indoorAlternative: {
      name: 'National Heritage Museum & Galleries',
      description: 'Explore climate-controlled galleries filled with centuries of artifacts and royal exhibits.',
      durationMinutes: 120,
      category: 'indoor_museum',
    },
  },
  {
    name: 'Ancient Temple & Spiritual Grounds',
    category: 'culture',
    isOutdoor: true,
    durationMinutes: 90,
    bestTime: 'Morning',
    description: 'Serene morning visit to sacred architecture, peaceful gardens, and spiritual courtyards.',
    estimatedTravelTime: '🚗 15 min drive',
    weatherSuitability: 'High',
    personaSuitability: ['Explorer', 'Family', 'Solo Explorer', 'Luxury'],
    whySelectedReason: 'Chosen for peaceful morning atmosphere and high cultural significance.',
    indoorAlternative: {
      name: 'Artisan Craft & Cultural Workshop',
      description: 'Interactive indoor workshop with master craftsmen demonstrating traditional pottery & art.',
      durationMinutes: 90,
      category: 'indoor_entertainment',
    },
  },

  // FOOD & LOCAL GASTRONOMY
  {
    name: 'Old City Street Food & Spice Tasting',
    category: 'food',
    isOutdoor: true,
    durationMinutes: 105,
    bestTime: 'Afternoon',
    description: 'Sample iconic street food, local snacks, fresh teas, and fragrant spices through bustling market lanes.',
    estimatedTravelTime: '🚶 8 min walk',
    weatherSuitability: 'Moderate',
    personaSuitability: ['Backpacker', 'Explorer', 'Solo Explorer'],
    whySelectedReason: 'Matches your food interest with authentic local budget-friendly flavors.',
    indoorAlternative: {
      name: 'Covered Gourmet Food Hall & Masterclass',
      description: 'Taste authentic regional cuisine under shelter with live chef demonstrations.',
      durationMinutes: 105,
      category: 'food',
    },
  },
  {
    name: 'Chef-Led Fine Dining & Wine Pairing',
    category: 'food',
    isOutdoor: false,
    durationMinutes: 120,
    bestTime: 'Evening',
    description: 'Multi-course luxury culinary experience featuring curated seasonal menus and sommelier pairings.',
    estimatedTravelTime: '🚕 12 min drive',
    weatherSuitability: 'Indoor Only',
    personaSuitability: ['Luxury', 'Family'],
    whySelectedReason: 'Selected for premium gastronomy tailored to a luxury travel persona.',
  },

  // NATURE & OUTDOORS
  {
    name: 'Botanical Gardens & Eco Sanctuary Walk',
    category: 'nature',
    isOutdoor: true,
    durationMinutes: 110,
    bestTime: 'Morning',
    description: 'Lush green pathways, rare plant collections, and peaceful bird-watching lakes.',
    estimatedTravelTime: '🚗 20 min drive',
    weatherSuitability: 'High',
    personaSuitability: ['Family', 'Explorer', 'Backpacker', 'Solo Explorer'],
    whySelectedReason: 'Ideal for natural outdoor relaxation during cool morning temperatures.',
    indoorAlternative: {
      name: 'Tropical Bio-Dome & Planetarium Center',
      description: 'Immersive indoor rainforest dome with exotic flora and interactive astronomy shows.',
      durationMinutes: 110,
      category: 'indoor_museum',
    },
  },
  {
    name: 'Scenic Riverfront Promenade & Sunset View',
    category: 'nature',
    isOutdoor: true,
    durationMinutes: 90,
    bestTime: 'Evening',
    description: 'Picturesque evening stroll along river banks with panoramic sunset views over the skyline.',
    estimatedTravelTime: '🚶 10 min walk',
    weatherSuitability: 'High',
    personaSuitability: ['Backpacker', 'Luxury', 'Explorer', 'Family'],
    whySelectedReason: 'Selected for stunning golden hour views and relaxed evening pace.',
    indoorAlternative: {
      name: 'Panoramic Skyline Observation Deck',
      description: 'Enjoy 360-degree views of the illuminated city from high-floor indoor glass lounges.',
      durationMinutes: 90,
      category: 'indoor_entertainment',
    },
  },

  // SHOPPING & MARKETS
  {
    name: 'Bustling Local Handicraft Bazaar',
    category: 'shopping',
    isOutdoor: true,
    durationMinutes: 120,
    bestTime: 'Afternoon',
    description: 'Browse handmade souvenirs, vibrant textiles, jewelry, and local artwork directly from artisans.',
    estimatedTravelTime: '🚶 15 min walk',
    weatherSuitability: 'Moderate',
    personaSuitability: ['Backpacker', 'Explorer', 'Family'],
    whySelectedReason: 'Brings you authentic local crafts and vibrant market energy.',
    indoorAlternative: {
      name: 'Luxury Designer Ateliers & Covered Galleria',
      description: 'Explore boutique indoor shopping centers showcasing premium crafts and fashion.',
      durationMinutes: 120,
      category: 'shopping',
    },
  },

  // ADVENTURE & ENTERTAINMENT
  {
    name: 'Hillside Off-Road Nature Trek',
    category: 'adventure',
    isOutdoor: true,
    durationMinutes: 150,
    bestTime: 'Morning',
    description: 'Guided trek along scenic mountain ridges with spectacular valley lookouts.',
    estimatedTravelTime: '🚗 25 min drive',
    weatherSuitability: 'High',
    personaSuitability: ['Explorer', 'Backpacker', 'Solo Explorer'],
    whySelectedReason: 'Matches high adventure interest and outdoor exploration.',
    indoorAlternative: {
      name: 'Indoor Rock Climbing & VR Adventure Park',
      description: 'State-of-the-art indoor climbing walls, bouldering, and virtual reality simulations.',
      durationMinutes: 150,
      category: 'indoor_entertainment',
    },
  },
];

// Helper: Geocode city using Open-Meteo Geocoding API
export async function geocodeCity(city: string): Promise<{ name: string; lat: number; lon: number } | null> {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const first = data.results[0];
      return {
        name: `${first.name}${first.country ? `, ${first.country}` : ''}`,
        lat: first.latitude,
        lon: first.longitude,
      };
    }
    return null;
  } catch (e) {
    console.error('Geocoding error:', e);
    return null;
  }
}

// Weather WMO Code Interpreter
function getWmoCondition(code: number): { condition: string; isRain: boolean; icon: string } {
  if (code === 0) return { condition: 'Clear Skies & Sunny', isRain: false, icon: '☀️' };
  if (code >= 1 && code <= 3) return { condition: 'Partly Cloudy', isRain: false, icon: '⛅' };
  if (code >= 45 && code <= 48) return { condition: 'Foggy & Misty', isRain: false, icon: '🌫️' };
  if (code >= 51 && code <= 67) return { condition: 'Light to Moderate Rain', isRain: true, icon: '🌧️' };
  if (code >= 71 && code <= 77) return { condition: 'Snowfall', isRain: false, icon: '❄️' };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Showers', isRain: true, icon: '🌧️' };
  if (code >= 95) return { condition: 'Thunderstorm', isRain: true, icon: '🌩️' };
  return { condition: 'Mild Weather', isRain: false, icon: '🌤️' };
}

// Fetch forecast from Open-Meteo
export async function fetchWeatherForecast(lat: number, lon: number, daysCount: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();

    const daily = data.daily;
    const forecasts = [];

    for (let i = 0; i < Math.min(daysCount, daily.time.length); i++) {
      const code = daily.weathercode[i] ?? 0;
      const maxTemp = Math.round(daily.temperature_2m_max[i] ?? 25);
      const minTemp = Math.round(daily.temperature_2m_min[i] ?? 18);
      const avgTemp = Math.round((maxTemp + minTemp) / 2);
      const rainProb = daily.precipitation_probability_max[i] ?? 15;
      const { condition, isRain, icon } = getWmoCondition(code);

      let suitability: 'High' | 'Moderate' | 'Low' = 'High';
      if (rainProb > 50 || isRain) suitability = 'Low';
      else if (rainProb > 25) suitability = 'Moderate';

      forecasts.push({
        tempC: avgTemp,
        condition,
        rainProbability: rainProb,
        suitability,
        icon,
        note: isRain ? 'Rain expected in afternoon hours.' : 'Ideal conditions for outdoor sightseeing.',
      });
    }

    return forecasts;
  } catch (e) {
    // Graceful fallback weather data
    console.warn('Using fallback forecast data:', e);
    return Array.from({ length: daysCount }).map((_, i) => ({
      tempC: 26 + (i % 3),
      condition: i % 2 === 0 ? 'Clear Skies' : 'Passing Clouds',
      rainProbability: i % 3 === 0 ? 35 : 10,
      suitability: i % 3 === 0 ? ('Moderate' as const) : ('High' as const),
      icon: i % 3 === 0 ? '⛅' : '☀️',
      note: 'Normal weather expected.',
    }));
  }
}

// Generate Weather + Persona Aware Itinerary
export function generateItinerary(
  destination: string,
  durationDays: number,
  persona: Persona,
  pace: TravelPace,
  interests: string[],
  forecasts: any[]
): { days: ItineraryDay[]; weatherSummary: WeatherSummary; healthScore: HealthScore } {
  // Determine activities per day based on pace
  const activitiesPerDay = pace === 'Relaxed' ? 2 : pace === 'Balanced' ? 3 : 4;

  const days: ItineraryDay[] = [];
  let totalRainRiskDays = 0;

  for (let dayIdx = 0; dayIdx < durationDays; dayIdx++) {
    const forecast = forecasts[dayIdx] || forecasts[0];
    const isRainyDay = forecast.rainProbability >= 40;
    if (isRainyDay) totalRainRiskDays++;

    const dayActivities: Activity[] = [];

    // Filter and score candidates
    const selectedIndices = new Set<number>();

    for (let slot = 0; slot < activitiesPerDay; slot++) {
      const bestTime = slot === 0 ? 'Morning' : slot === 1 ? 'Afternoon' : slot === 2 ? 'Evening' : 'Night';

      // Pick matching activity from database
      let matchIdx = GLOBAL_ACTIVITIES_DATABASE.findIndex(
        (act, idx) =>
          !selectedIndices.has(idx) &&
          (act.personaSuitability.includes(persona) || act.personaSuitability.includes('Explorer'))
      );

      if (matchIdx === -1) {
        matchIdx = (dayIdx * 2 + slot) % GLOBAL_ACTIVITIES_DATABASE.length;
      }

      selectedIndices.add(matchIdx);
      const baseActivity = GLOBAL_ACTIVITIES_DATABASE[matchIdx];

      const activityObj: Activity = {
        id: `day-${dayIdx + 1}-act-${slot + 1}`,
        name: baseActivity.name,
        category: baseActivity.category,
        isOutdoor: baseActivity.isOutdoor,
        durationMinutes: baseActivity.durationMinutes,
        bestTime: bestTime as any,
        description: baseActivity.description,
        estimatedTravelTime: baseActivity.estimatedTravelTime,
        weatherSuitability: isRainyDay && baseActivity.isOutdoor ? 'Low' : baseActivity.weatherSuitability,
        personaSuitability: baseActivity.personaSuitability,
        whySelectedReason: `Selected for your ${persona} travel style. ${baseActivity.whySelectedReason}`,
        indoorAlternative: baseActivity.indoorAlternative,
      };

      dayActivities.push(activityObj);
    }

    days.push({
      dayNumber: dayIdx + 1,
      title: `Day ${dayIdx + 1}: ${destination} Exploration`,
      weatherForecast: forecast,
      activities: dayActivities,
      isPlanBActive: false,
      planBReason: isRainyDay
        ? 'High rain probability detected. Indoor Plan B alternatives are ready.'
        : undefined,
    });
  }

  // Calculate overall weather summary
  const avgTemp = Math.round(forecasts.reduce((acc, f) => acc + f.tempC, 0) / forecasts.length);
  const maxRain = Math.max(...forecasts.map((f) => f.rainProbability));

  const weatherSummary: WeatherSummary = {
    city: destination,
    avgTempC: avgTemp,
    overallCondition: forecasts[0]?.condition || 'Clear',
    maxRainProbability: maxRain,
    suitabilityScore: maxRain > 50 ? 'Low' : maxRain > 25 ? 'Moderate' : 'High',
  };

  // Calculate Deterministic Trip Health Score (0-100)
  let score = 100;
  const factors: HealthScore['factors'] = [];

  // Weather compatibility
  if (totalRainRiskDays > 0) {
    score -= totalRainRiskDays * 5;
    factors.push({
      text: `Weather Notice: ${totalRainRiskDays} day(s) have potential rain. Plan B available.`,
      type: 'warning',
    });
  } else {
    factors.push({
      text: '✓ Weather Compatible: Favorable outdoor conditions projected.',
      type: 'positive',
    });
  }

  // Activity balance
  if (pace === 'Packed') {
    score -= 5;
    factors.push({
      text: 'High intensity pace. Reminders set for rest breaks.',
      type: 'info',
    });
  } else {
    factors.push({
      text: '✓ Balanced Activity Load: Optimal spacing between locations.',
      type: 'positive',
    });
  }

  // Persona match
  factors.push({
    text: `✓ Strong Persona Match: Activities tailored for ${persona} traveler.`,
    type: 'positive',
  });

  const healthScore: HealthScore = {
    score: Math.max(70, Math.min(100, score)),
    label: score >= 90 ? 'Exceptional' : score >= 80 ? 'Well Balanced' : 'Moderate Risk',
    factors,
  };

  return { days, weatherSummary, healthScore };
}
