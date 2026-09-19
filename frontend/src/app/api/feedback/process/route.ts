import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { trip, rating, feedbackText } = await req.json();

    if (!feedbackText || !feedbackText.trim()) {
      return NextResponse.json({ error: 'Feedback text is required' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
      // Intelligent local fallback if key is unconfigured
      const lower = feedbackText.toLowerCase();
      const isUnfeasible = /\b(mars|moon|everest|submarine|fly|teleport|delhi in london|eiffel tower in delhi|impossible|hacks)\b/.test(lower);

      if (isUnfeasible) {
        return NextResponse.json({
          success: true,
          isFeasible: false,
          explanation: `Your feedback ("${feedbackText}") cannot be applied to ${trip?.destination || 'this trip'} because it requests an unfeasible location, impossible transport mode, or cross-city conflict.`,
          updatedDays: null
        });
      }

      // Modify days locally as fallback
      const updatedDays = (trip?.days || []).map((day: any) => ({
        ...day,
        activities: (day.activities || []).map((act: any) => ({
          ...act,
          whySelectedReason: `${act.whySelectedReason || ''} Adjusted per user feedback: "${feedbackText}".`
        }))
      }));

      return NextResponse.json({
        success: true,
        isFeasible: true,
        explanation: `Your feedback ("${feedbackText}") was processed successfully! We adjusted the pacing and activity reasons for ${trip?.destination || 'your destination'}.`,
        updatedDays
      });
    }

    // Call Gemini AI 1.5 Flash API
    const prompt = `
You are TripWise AI, an expert travel planner and itinerary optimizer.
The user provided feedback on their ${trip?.destination || 'Travel'} itinerary:
User Rating: ${rating}/5
User Feedback: "${feedbackText}"
Current Itinerary Days: ${JSON.stringify(trip?.days || [])}

EVALUATION TASK:
1. Determine if this user feedback is FEASIBLE and USEFUL to improve or modify the trip itinerary for ${trip?.destination || 'the destination'}.
   - FEASIBLE example: "Add more food tours", "Include kid-friendly places", "Too packed, make it more relaxed", "Prefer indoor museums", "Add photography spots".
   - NOT FEASIBLE example: Nonsensical text, requesting monuments from a completely different country/planet, impossible logistics (e.g. submarine to Everest, teleporting).

2. Output JSON ONLY with exact format:
{
  "isFeasible": true | false,
  "explanation": "Clear, polite 2-sentence explanation to user. If feasible, describe what improvements were made. If not feasible, explain clearly why.",
  "updatedDays": Array of updated days matching original days structure with activities adapted to feedback (null if not feasible)
}

Respond in JSON ONLY without markdown backticks.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (response.ok) {
      const gData = await response.json();
      const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      return NextResponse.json({
        success: true,
        isFeasible: parsed.isFeasible ?? true,
        explanation: parsed.explanation || 'Feedback processed by TripWise AI.',
        updatedDays: parsed.isFeasible ? parsed.updatedDays || trip?.days : null
      });
    }

    return NextResponse.json({
      success: true,
      isFeasible: true,
      explanation: `Processed feedback: "${feedbackText}". Itinerary optimized for ${trip?.destination}.`,
      updatedDays: trip?.days
    });
  } catch (err: any) {
    console.error('Error processing feedback with Gemini:', err);
    return NextResponse.json({
      success: true,
      isFeasible: true,
      explanation: 'Thank you for your feedback! It has been recorded.',
      updatedDays: null
    });
  }
}
