import { Activity, ItineraryDay, Trip } from '@/types/trip';

/**
 * Format Date helper
 */
export function formatDate(date: Date): { dateStr: string; formattedDate: string; dayOfWeek: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return { dateStr, formattedDate, dayOfWeek };
}

/**
 * Calculate dates for each day in a trip given start date and duration
 */
export function calculateTripDates(startDateInput?: string, durationDays: number = 3) {
  let baseDate = new Date();
  if (startDateInput) {
    const parsed = new Date(startDateInput);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
  }

  const result = [];
  for (let i = 0; i < durationDays; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    result.push({
      dayNumber: i + 1,
      ...formatDate(d),
    });
  }

  return result;
}

/**
 * Add minutes to "HH:MM" string and return new "HH:MM" string
 */
export function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  const totalMinutes = (h || 9) * 60 + (m || 0) + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * Convert "HH:MM" to total minutes from midnight for comparison
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 540; // Default 09:00 AM
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Automatically assign reasonable start and end times to activities for a day
 */
export function assignActivityTimes(activities: Activity[], startHourStr = '09:00'): Activity[] {
  let currentTime = startHourStr;

  return activities.map((act, idx) => {
    const duration = act.durationMinutes || 90;
    const startTime = act.startTime || currentTime;
    const endTime = addMinutesToTime(startTime, duration);

    // Calculate transit to next activity if available
    const transitMin = act.transitToNext?.approxTransitMin || 20;

    // Set start time for next activity (end time + transit)
    currentTime = addMinutesToTime(endTime, transitMin);

    return {
      ...act,
      startTime,
      endTime,
    };
  });
}

/**
 * Recalculate schedule after a manual edit to an activity's start time or duration
 */
export function recalculateDaySchedule(activities: Activity[], modifiedId?: string): Activity[] {
  if (!activities || activities.length === 0) return [];

  const updated = [...activities];

  // If a specific activity was edited, recalculate from that activity onwards
  let modifiedIdx = modifiedId ? updated.findIndex((a) => a.id === modifiedId) : 0;
  if (modifiedIdx < 0) modifiedIdx = 0;

  for (let i = modifiedIdx; i < updated.length; i++) {
    const current = updated[i];
    const duration = current.durationMinutes || 90;
    if (!current.startTime) {
      current.startTime = i === 0 ? '09:00' : addMinutesToTime(updated[i - 1].endTime || '11:00', 20);
    }
    current.endTime = addMinutesToTime(current.startTime, duration);

    // Adjust next activity if it starts before current ends
    if (i < updated.length - 1) {
      const transitMin = current.transitToNext?.approxTransitMin || 20;
      const minNextStart = addMinutesToTime(current.endTime, transitMin);
      const nextAct = updated[i + 1];

      // If next activity has no start time or starts too early, push it forward
      if (!nextAct.startTime || timeToMinutes(nextAct.startTime) < timeToMinutes(minNextStart)) {
        updated[i + 1] = {
          ...nextAct,
          startTime: minNextStart,
        };
      }
    }
  }

  return updated;
}

export interface ScheduleConflict {
  activityIdA: string;
  activityNameA: string;
  activityIdB: string;
  activityNameB: string;
  overlapMinutes: number;
  message: string;
}

/**
 * Detect time conflicts (overlaps) between activities on a day
 */
export function detectScheduleConflicts(activities: Activity[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < activities.length - 1; i++) {
    const actA = activities[i];
    const actB = activities[i + 1];

    if (actA.endTime && actB.startTime) {
      const endA = timeToMinutes(actA.endTime);
      const startB = timeToMinutes(actB.startTime);

      if (endA > startB) {
        const overlap = endA - startB;
        conflicts.push({
          activityIdA: actA.id,
          activityNameA: actA.name,
          activityIdB: actB.id,
          activityNameB: actB.name,
          overlapMinutes: overlap,
          message: `Schedule conflict: "${actA.name}" ends at ${actA.endTime} but "${actB.name}" starts at ${actB.startTime} (overlaps by ${overlap} min).`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Helper to format ICS date time string: YYYYMMDDTHHMMSS
 */
function formatIcsDateTime(dateStr?: string, timeStr?: string): string {
  const dateObj = dateStr ? new Date(dateStr) : new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  const [h, m] = (timeStr || '09:00').split(':');
  const hour = String(h || '09').padStart(2, '0');
  const min = String(m || '00').padStart(2, '0');

  return `${year}${month}${day}T${hour}${min}00`;
}

/**
 * Generate standard .ICS (iCalendar) content from a Trip object
 */
export function generateIcsCalendar(trip: Trip): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripWise Travel Operating System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:TripWise - ${trip.destination}`,
  ];

  const dates = calculateTripDates(trip.startDate, trip.durationDays);

  trip.days.forEach((day, idx) => {
    const dayDate = day.date || dates[idx]?.dateStr || new Date().toISOString().split('T')[0];
    const activitiesWithTimes = assignActivityTimes(day.activities);

    activitiesWithTimes.forEach((act) => {
      const dtStart = formatIcsDateTime(dayDate, act.startTime);
      const dtEnd = formatIcsDateTime(dayDate, act.endTime);
      const summary = `${act.name} - ${trip.destination}`;
      const description = `${act.description}\\nCategory: ${act.category}\\nDuration: ${act.durationMinutes} min${
        act.nearestMetro ? `\\nNearest Metro: ${act.nearestMetro.stationName}` : ''
      }`;
      const location = `${act.placeName || act.name}, ${trip.destination}`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:tripwise-${trip.id || 'trip'}-${act.id}-${Date.now()}@tripwise.app`,
        `DTSTAMP:${formatIcsDateTime()}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary.replace(/,/g, '\\,')}`,
        `DESCRIPTION:${description.replace(/,/g, '\\,')}`,
        `LOCATION:${location.replace(/,/g, '\\,')}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger download of generated .ICS file in browser
 */
export function downloadIcsFile(trip: Trip) {
  const icsData = generateIcsCalendar(trip);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `TripWise_${trip.destination.replace(/[^a-zA-Z0-9]/g, '_')}_Schedule.ics`;

  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
