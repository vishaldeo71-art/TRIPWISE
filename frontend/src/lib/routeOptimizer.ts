import { Activity } from '@/types/trip';
import { getDestinationPlaces } from '@/data/destinationPlaces';
import { calculateTransitBetween } from '@/lib/transitEngine';

/**
 * Calculates the approximate straight-line distance between two geographic points
 * using the Haversine Formula (returns distance in kilometers).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface RouteOptimizationResult {
  optimizedActivities: Activity[];
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  estimatedTravelTimeMins: number;
  locationCount: number;
}

/**
 * Reorders a list of daily activities using Nearest-Neighbor distance calculation
 * to minimize total travel distance between consecutive stops.
 */
export function optimizeDayRoute(
  activities: Activity[],
  destinationName: string = 'Delhi',
  baseLat: number = 28.6139,
  baseLng: number = 77.209
): RouteOptimizationResult {
  if (!activities || activities.length <= 1) {
    return {
      optimizedActivities: activities || [],
      originalDistanceKm: 0,
      optimizedDistanceKm: 0,
      distanceSavedKm: 0,
      estimatedTravelTimeMins: 0,
      locationCount: activities ? activities.length : 0,
    };
  }

  const destData = getDestinationPlaces(destinationName, baseLat, baseLng);

  // Ensure each activity has valid latitude and longitude coordinates
  const itemsWithCoords = activities.map((act, index) => {
    const lat = act.lat !== undefined ? act.lat : baseLat + (index * 0.015 - 0.02);
    const lng = act.lng !== undefined ? act.lng : baseLng + (index * 0.02 - 0.01);
    return { ...act, lat, lng };
  });

  // 1. Calculate original total distance before optimization
  let originalDistanceKm = 0;
  for (let i = 0; i < itemsWithCoords.length - 1; i++) {
    originalDistanceKm += calculateHaversineDistance(
      itemsWithCoords[i].lat,
      itemsWithCoords[i].lng,
      itemsWithCoords[i + 1].lat,
      itemsWithCoords[i + 1].lng
    );
  }

  // 2. Perform Nearest-Neighbor Optimization
  const unvisited = [...itemsWithCoords];
  const optimized: typeof itemsWithCoords = [];

  let current = unvisited.shift()!;
  optimized.push(current);

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateHaversineDistance(
        current.lat,
        current.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    current = unvisited.splice(nearestIdx, 1)[0];
    optimized.push(current);
  }

  // 3. Re-calculate transitToNext links for the newly ordered activities
  const reorderedWithTransit = optimized.map((act, i) => {
    const bestTime = i === 0 ? 'Morning' : i === 1 ? 'Afternoon' : i === 2 ? 'Evening' : 'Night';
    const updated = { ...act, bestTime: bestTime as any };
    if (i < optimized.length - 1) {
      const nextAct = optimized[i + 1];
      const transit = calculateTransitBetween(act, nextAct, destData.metroStations);
      return { ...updated, transitToNext: transit };
    }
    return { ...updated, transitToNext: undefined };
  });

  // 4. Calculate optimized total distance
  let optimizedDistanceKm = 0;
  for (let i = 0; i < reorderedWithTransit.length - 1; i++) {
    optimizedDistanceKm += calculateHaversineDistance(
      reorderedWithTransit[i].lat!,
      reorderedWithTransit[i].lng!,
      reorderedWithTransit[i + 1].lat!,
      reorderedWithTransit[i + 1].lng!
    );
  }

  const distanceSavedKm = Math.max(0, originalDistanceKm - optimizedDistanceKm);
  const estimatedTravelTimeMins = Math.round((optimizedDistanceKm / 25) * 60) + reorderedWithTransit.length * 5;

  return {
    optimizedActivities: reorderedWithTransit,
    originalDistanceKm: Number(originalDistanceKm.toFixed(1)),
    optimizedDistanceKm: Number(optimizedDistanceKm.toFixed(1)),
    distanceSavedKm: Number(distanceSavedKm.toFixed(1)),
    estimatedTravelTimeMins,
    locationCount: reorderedWithTransit.length,
  };
}
