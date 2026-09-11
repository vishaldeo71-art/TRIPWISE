export type Persona = 'Backpacker' | 'Family' | 'Luxury' | 'Explorer' | 'Solo Explorer';
export type TravelPace = 'Relaxed' | 'Balanced' | 'Packed';

export interface Activity {
  id: string;
  name: string;
  category: 'culture' | 'food' | 'nature' | 'adventure' | 'shopping' | 'relaxation' | 'indoor_museum' | 'indoor_entertainment';
  isOutdoor: boolean;
  durationMinutes: number;
  bestTime: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  description: string;
  estimatedTravelTime: string;
  weatherSuitability: 'High' | 'Moderate' | 'Low' | 'Indoor Only';
  personaSuitability: Persona[];
  whySelectedReason?: string;
  lat?: number;
  lng?: number;
  placeName?: string;
  nearestMetro?: {
    stationName: string;
    line?: string;
    distanceKm: number;
    walkTimeMin: number;
  };
  transitToNext?: {
    nextPlaceName: string;
    fromStation: string;
    toStation: string;
    approxTransitMin: number;
    approxWalkMin: number;
    distanceKm: number;
    mapsUrl: string;
  };
  indoorAlternative?: {
    name: string;
    description: string;
    durationMinutes: number;
    category: string;
  };
}

export interface DayRouteSummary {
  totalDistanceKm: number;
  estTransitTimeMin: number;
  estWalkTimeMin: number;
  sequence: {
    type: 'place' | 'metro' | 'walk';
    label: string;
    subLabel?: string;
  }[];
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  weatherForecast: {
    tempC: number;
    condition: string;
    rainProbability: number;
    suitability: 'High' | 'Moderate' | 'Low';
    icon: string;
    note?: string;
  };
  activities: Activity[];
  routeSummary?: DayRouteSummary;
  isPlanBActive?: boolean;
  planBReason?: string;
}

export interface WeatherSummary {
  city: string;
  avgTempC: number;
  overallCondition: string;
  maxRainProbability: number;
  suitabilityScore: 'High' | 'Moderate' | 'Low';
}

export interface HealthScore {
  score: number; // 0 to 100
  label: 'Exceptional' | 'Well Balanced' | 'Moderate Risk' | 'Needs Adjustment';
  factors: {
    text: string;
    type: 'positive' | 'warning' | 'info';
  }[];
}

export interface Trip {
  id?: string;
  shareId?: string;
  userId?: string;
  destination: string;
  latitude: number;
  longitude: number;
  durationDays: number;
  persona: Persona;
  pace: TravelPace;
  interests: string[];
  weatherSummary: WeatherSummary;
  days: ItineraryDay[];
  healthScore: HealthScore;
  createdAt?: string;
}
