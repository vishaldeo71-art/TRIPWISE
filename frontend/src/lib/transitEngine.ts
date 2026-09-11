import { Activity, DayRouteSummary } from '@/types/trip';
import { MetroStation } from '@/data/destinationPlaces';

/**
 * Calculates distance between two geographical points using the Haversine formula.
 * @returns Distance in kilometers (rounded to 1 decimal place)
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the nearest metro/public transport station to a given coordinate.
 */
export function getNearestMetroStation(
  lat: number,
  lng: number,
  stations: MetroStation[]
): { stationName: string; line?: string; distanceKm: number; walkTimeMin: number } | undefined {
  if (!stations || stations.length === 0) return undefined;

  let closest = stations[0];
  let minDistance = haversineDistanceKm(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < stations.length; i++) {
    const d = haversineDistanceKm(lat, lng, stations[i].lat, stations[i].lng);
    if (d < minDistance) {
      minDistance = d;
      closest = stations[i];
    }
  }

  const walkTimeMin = Math.max(2, Math.round(minDistance * 12)); // approx 12 min per km walking pace

  return {
    stationName: closest.name,
    line: closest.line,
    distanceKm: minDistance,
    walkTimeMin,
  };
}

/**
 * Calculates transit parameters between activity A and activity B.
 */
export function calculateTransitBetween(
  actA: Activity,
  actB: Activity,
  stations: MetroStation[]
) {
  const latA = actA.lat || 0;
  const lngA = actA.lng || 0;
  const latB = actB.lat || 0;
  const lngB = actB.lng || 0;

  const distKm = haversineDistanceKm(latA, lngA, latB, lngB);

  const stationA = getNearestMetroStation(latA, lngA, stations);
  const stationB = getNearestMetroStation(latB, lngB, stations);

  const fromStation = stationA ? stationA.stationName : 'Nearest Stop';
  const toStation = stationB ? stationB.stationName : 'Next Stop';

  const approxTransitMin = Math.max(5, Math.round(distKm * 2.5 + 5));
  const approxWalkMin = Math.max(3, Math.round(distKm * 12));

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latA},${lngA}&destination=${latB},${lngB}&travelmode=transit`;

  return {
    nextPlaceName: actB.name,
    fromStation,
    toStation,
    approxTransitMin,
    approxWalkMin,
    distanceKm: distKm,
    mapsUrl,
  };
}

/**
 * Generates a compact day route summary showing sequence, total transit time, and walking distance.
 */
export function calculateDayRouteSummary(
  activities: Activity[],
  stations: MetroStation[]
): DayRouteSummary {
  if (!activities || activities.length === 0) {
    return {
      totalDistanceKm: 0,
      estTransitTimeMin: 0,
      estWalkTimeMin: 0,
      sequence: [],
    };
  }

  let totalDist = 0;
  let totalTransit = 0;
  let totalWalk = 0;

  const sequence: DayRouteSummary['sequence'] = [];

  activities.forEach((act, idx) => {
    sequence.push({
      type: 'place',
      label: act.placeName || act.name.split('&')[0].trim(),
      subLabel: act.nearestMetro ? `Near ${act.nearestMetro.stationName}` : undefined,
    });

    if (idx < activities.length - 1) {
      const nextAct = activities[idx + 1];
      const transit = calculateTransitBetween(act, nextAct, stations);

      totalDist += transit.distanceKm;
      totalTransit += transit.approxTransitMin;
      totalWalk += transit.approxWalkMin;

      sequence.push({
        type: 'metro',
        label: `🚇 ${transit.fromStation} → ${transit.toStation}`,
        subLabel: `~${transit.approxTransitMin} min transit`,
      });
    }
  });

  return {
    totalDistanceKm: Math.round(totalDist * 10) / 10,
    estTransitTimeMin: totalTransit,
    estWalkTimeMin: totalWalk,
    sequence,
  };
}
