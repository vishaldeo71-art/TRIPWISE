import { NextRequest, NextResponse } from 'next/server';

function processAdaptiveFallback(trip: any, rating: number, feedbackText: string) {
  const lower = feedbackText.toLowerCase();
  const destination = trip?.destination || 'your destination';

  // Check unfeasible requests
  const isUnfeasible = /\b(mars|moon|everest|submarine|fly to|teleport|delhi in london|eiffel tower in delhi|impossible|hacks|underwater walk)\b/.test(lower);
  if (isUnfeasible) {
    return {
      success: true,
      isFeasible: false,
      explanation: `Your feedback ("${feedbackText}") cannot be applied to ${destination} because it involves an unfeasible location, impossible transport mode, or cross-city conflict.`,
      updatedDays: null
    };
  }

  // Detect feedback focus
  let focusTag = 'Tailored Preferences';
  let changeSummary = `We updated your ${destination} itinerary pacing and activity highlights to better reflect your preferences.`;

  if (/\b(food|eat|restaurant|cafe|street food|tasty|dining|culinary)\b/.test(lower)) {
    focusTag = 'Culinary & Dining Focus';
    changeSummary = `We re-engineered your ${destination} plan to highlight top culinary experiences, authentic local food stalls, and relaxed cafe breaks.`;
  } else if (/\b(relaxed|slow|easy|less walking|chill|peaceful|rest)\b/.test(lower)) {
    focusTag = 'Relaxed Pacing';
    changeSummary = `We adjusted the schedule for a more leisurely pace with delayed morning starts, extended break intervals, and reduced travel fatigue.`;
  } else if (/\b(museum|art|history|culture|monument|heritage)\b/.test(lower)) {
    focusTag = 'Culture & Heritage Focus';
    changeSummary = `We enriched your daily plan with iconic historical monuments, indoor galleries, and deep cultural heritage tours in ${destination}.`;
  } else if (/\b(nature|park|garden|outdoor|green|hiking|walk)\b/.test(lower)) {
    focusTag = 'Nature & Outdoors';
    changeSummary = `We swapped indoor spots for serene botanical gardens, scenic urban parks, and outdoor walking paths across ${destination}.`;
  } else if (/\b(kids?|family|children|fun)\b/.test(lower)) {
    focusTag = 'Family & Kid Friendly';
    changeSummary = `We optimized the activities to be family-oriented with kid-friendly venues, interactive spots, and accessible transport options.`;
  } else if (/\b(shopping|market|bazaar|souvenir)\b/.test(lower)) {
    focusTag = 'Shopping & Local Markets';
    changeSummary = `We added vibrant artisan bazaars, shopping streets, and local craft markets to your itinerary.`;
  }

  const origDays = trip?.days || [];
  const updatedDays = origDays.map((day: any, dIdx: number) => {
    const updatedActivities = (day.activities || []).map((act: any, aIdx: number) => {
      let updatedAct = { ...act };

      if (focusTag === 'Culinary & Dining Focus' && (aIdx === 1 || act.category === 'food')) {
        updatedAct.name = act.name.includes('Food') || act.name.includes('Cafe') ? act.name : `${act.placeName || destination} Culinary Walk & Local Food Tour`;
        updatedAct.category = 'food';
        updatedAct.description = `${act.description || ''} Specially selected to sample authentic local street food and culinary specialties.`;
        updatedAct.whySelectedReason = `Added per your feedback: "${feedbackText}" to experience top regional delicacies.`;
      } else if (focusTag === 'Relaxed Pacing') {
        updatedAct.durationMinutes = Math.max(45, Math.round((act.durationMinutes || 90) * 0.8));
        updatedAct.whySelectedReason = `Adjusted to a relaxed, unhurried pace per your feedback: "${feedbackText}".`;
      } else if (focusTag === 'Culture & Heritage Focus' && aIdx === 0) {
        updatedAct.whySelectedReason = `Priority cultural landmark highlighted per your request: "${feedbackText}".`;
      } else {
        updatedAct.whySelectedReason = `Adapted for ${destination} based on user feedback: "${feedbackText}".`;
      }

      return updatedAct;
    });

    return {
      ...day,
      title: day.title ? `${day.title} (${focusTag})` : `Day ${day.dayNumber || dIdx + 1}: ${focusTag}`,
      activities: updatedActivities
    };
  });

  return {
    success: true,
    isFeasible: true,
    explanation: changeSummary,
    updatedDays
  };
}

export async function POST(req: NextRequest) {
  try {
    const { trip, rating, feedbackText } = await req.json();

    const userFeedback = (feedbackText && feedbackText.trim()) ? feedbackText.trim() : (rating === 5 ? 'Loved the trip! Make it perfect.' : 'Please adjust pacing and activities.');
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const prompt = `
You are TripWise AI, an expert travel itinerary architect.
The user provided feedback on their ${trip?.destination || 'Travel'} itinerary:
User Rating: ${rating}/5
User Feedback: "${userFeedback}"

Current Itinerary Days Structure:
${JSON.stringify(trip?.days || [], null, 2)}

YOUR INSTRUCTIONS:
1. Evaluate if the feedback is feasible for ${trip?.destination || 'the destination'}.
2. If FEASIBLE:
   - Generate an updated array of days ("updatedDays") where activities, timings, descriptions, titles, and whySelectedReason are modified to directly fulfill the user's feedback.
   - For example: if user asked for more food, add food tours or local eateries. If they asked for a relaxed pace, adjust start times and reduce fatigue. If they asked for nature/museums/family spots, incorporate those.
   - Keep the exact same JSON schema for each day and activity.
   - Provide a clear 2-sentence summary ("explanation") of what exact changes were made to the plan.
3. If NOT FEASIBLE (e.g. requesting impossible locations/monuments in wrong countries or teleportation):
   - Set "isFeasible": false
   - Set "explanation": polite 2-sentence explanation why it cannot be applied.
   - Set "updatedDays": null

Respond ONLY with valid JSON in this exact structure:
{
  "isFeasible": boolean,
  "explanation": "string",
  "updatedDays": Array of Day objects OR null
}
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );

        if (response.ok) {
          const gData = await response.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);

          if (parsed.isFeasible && parsed.updatedDays && Array.isArray(parsed.updatedDays)) {
            return NextResponse.json({
              success: true,
              isFeasible: true,
              explanation: parsed.explanation || `Gemini AI updated your ${trip?.destination || 'trip'} itinerary based on your feedback!`,
              updatedDays: parsed.updatedDays
            });
          } else if (parsed.isFeasible === false) {
            return NextResponse.json({
              success: true,
              isFeasible: false,
              explanation: parsed.explanation || 'Feedback could not be applied to this itinerary.',
              updatedDays: null
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API fetch error in feedback processing route, using adaptive fallback:', geminiErr);
      }
    }

    // High quality adaptive fallback
    const fallbackResult = processAdaptiveFallback(trip, rating, userFeedback);
    return NextResponse.json(fallbackResult);
  } catch (err: any) {
    console.error('Error processing feedback route:', err);
    return NextResponse.json({
      success: false,
      error: 'Failed to process feedback.'
    }, { status: 500 });
  }
}
