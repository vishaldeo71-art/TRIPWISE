import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// In-Memory Fallback Store (for local testing prior to Supabase credentials)
const localTripsStore: Record<string, any> = {};

// 1. GET /api/health
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    app: 'TRIPWISE Express Engine',
    timestamp: new Date().toISOString()
  });
});

// 2. POST /api/trips
app.post('/api/trips', async (req: Request, res: Response) => {
  try {
    const tripData = req.body;
    if (!tripData || !tripData.destination || !tripData.durationDays) {
      return res.status(400).json({ error: 'Missing required trip parameters.' });
    }

    const tripId = tripData.id || `trip-${Date.now()}`;
    const shareId = tripData.shareId || `share-${Math.random().toString(36).substring(2, 9)}`;

    const newTrip = {
      ...tripData,
      id: tripId,
      shareId,
      createdAt: new Date().toISOString()
    };

    localTripsStore[tripId] = newTrip;
    localTripsStore[shareId] = newTrip;

    // Save to Supabase if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await supabase.from('trips').upsert({
        id: tripId,
        share_id: shareId,
        destination: tripData.destination,
        latitude: tripData.latitude,
        longitude: tripData.longitude,
        duration: tripData.durationDays,
        persona: tripData.persona,
        travel_pace: tripData.pace,
        interests: tripData.interests || [],
        itinerary: tripData.days,
        weather_summary: tripData.weatherSummary,
        trip_score: tripData.healthScore
      });
    }

    return res.status(201).json({ success: true, trip: newTrip });
  } catch (error: any) {
    console.error('Error saving trip:', error);
    return res.status(500).json({ error: 'Failed to save trip.' });
  }
});

// 3. GET /api/trips/:id
app.get('/api/trips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (localTripsStore[id]) {
      return res.status(200).json(localTripsStore[id]);
    }

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .or(`id.eq.${id},share_id.eq.${id}`)
        .single();

      if (!error && data) {
        return res.status(200).json(data);
      }
    }

    return res.status(404).json({ error: 'Trip not found.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve trip.' });
  }
});

// 4. GET /api/share/:shareId (Public shareable trip retrieval - excludes user credentials)
app.get('/api/share/:shareId', async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;
    const match = localTripsStore[shareId];

    if (match) {
      // Exclude private attributes
      const { userId, user_id, email, ...publicTrip } = match;
      return res.status(200).json(publicTrip);
    }

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabase
        .from('trips')
        .select('id, share_id, destination, duration, persona, travel_pace, interests, itinerary, weather_summary, trip_score, created_at')
        .eq('share_id', shareId)
        .single();

      if (!error && data) {
        return res.status(200).json(data);
      }
    }

    return res.status(404).json({ error: 'Shareable trip not found.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch shared trip.' });
  }
});

// 5. DELETE /api/trips/:id
app.delete('/api/trips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    delete localTripsStore[id];

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await supabase.from('trips').delete().eq('id', id);
    }

    return res.status(200).json({ success: true, message: 'Trip deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete trip.' });
  }
});

// Global counter for AI Questions handled
let aiQuestionsCount = 0;

// 6. POST /api/ai/ask (TripWise AI Assistant Endpoint)
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    aiQuestionsCount++;
    const { question, tripContext } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Valid question parameter is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Direct Gemini REST API call if key is available
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const promptText = `
You are TripWise AI, a friendly, intelligent travel assistant.
The user is asking a question about their travel itinerary.

[CURRENT TRIP CONTEXT]
Destination: ${tripContext?.destination || 'Destination unspecified'}
Duration: ${tripContext?.durationDays || 'N/A'} days
Traveler Persona: ${tripContext?.persona || 'Explorer'}
Weather Forecast: ${JSON.stringify(tripContext?.weatherSummary || 'Clear weather expected')}

[USER QUESTION]
"${question}"

Provide a concise, helpful, and encouraging answer in 2-4 sentences tailored directly to their destination and persona.
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const aiReply =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'I have processed your request for your trip!';
          return res.status(200).json({ answer: aiReply, aiQuestionsCount });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call warning, using intelligent rule-based engine:', geminiErr);
      }
    }

    // Intelligent Fallback Engine (runs when GEMINI_API_KEY is not set or network fails)
    const lowerQ = question.toLowerCase();
    const dest = tripContext?.destination || 'your destination';
    const persona = tripContext?.persona || 'traveler';
    let fallbackAnswer = `As a ${persona} visiting ${dest}, prioritizing a smooth flow and authentic local experiences is key to a great trip!`;

    if (lowerQ.includes('rain') || lowerQ.includes('weather')) {
      fallbackAnswer = `If it rains in ${dest}, swap outdoor sightseeing for indoor cultural spots like local museums, covered markets, or cozy cafes.`;
    } else if (lowerQ.includes('food') || lowerQ.includes('eat') || lowerQ.includes('restaurant')) {
      fallbackAnswer = `For top food experiences in ${dest}, explore popular street food hubs and historic local eateries during lunch hours!`;
    } else if (lowerQ.includes('relaxed') || lowerQ.includes('pace') || lowerQ.includes('slow')) {
      fallbackAnswer = `To make your ${dest} trip more relaxed, spread activities across morning and evening slots, leaving afternoons for leisurely walks.`;
    } else if (lowerQ.includes('culture') || lowerQ.includes('history') || lowerQ.includes('museum')) {
      fallbackAnswer = `To immerse in local culture at ${dest}, schedule visits to iconic heritage monuments, traditional artisan quarters, and local galleries.`;
    } else if (lowerQ.includes('why') || lowerQ.includes('choose')) {
      fallbackAnswer = `Activities in your itinerary were curated based on your ${persona} profile and expected weather conditions at ${dest}.`;
    }

    return res.status(200).json({ answer: fallbackAnswer, aiQuestionsCount });
  } catch (error: any) {
    console.error('Error handling AI ask request:', error);
    return res.status(500).json({
      error: 'TripWise AI is temporarily unavailable. Your itinerary remains safe.',
    });
  }
});

// 7. GET /api/admin/stats (Admin Dashboard Metrics)
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  try {
    let totalUsers = 1;
    let totalTrips = Object.keys(localTripsStore).length / 2;
    let popularDestinationsMap: Record<string, number> = {};
    let personaMap: Record<string, number> = {};
    let recentTrips: any[] = [];

    // Aggregate in-memory store data
    Object.values(localTripsStore).forEach((t: any) => {
      if (t.destination) {
        popularDestinationsMap[t.destination] = (popularDestinationsMap[t.destination] || 0) + 1;
      }
      if (t.persona) {
        personaMap[t.persona] = (personaMap[t.persona] || 0) + 1;
      }
    });

    // Query Supabase if available
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (userCount !== null) totalUsers = Math.max(totalUsers, userCount);

        const { data: dbTrips, count: tripCount } = await supabase
          .from('trips')
          .select('id, destination, duration, persona, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(10);

        if (tripCount !== null && tripCount > 0) totalTrips = Math.max(totalTrips, tripCount);

        if (dbTrips && dbTrips.length > 0) {
          recentTrips = dbTrips;
          dbTrips.forEach((item) => {
            if (item.destination) {
              popularDestinationsMap[item.destination] =
                (popularDestinationsMap[item.destination] || 0) + 1;
            }
            if (item.persona) {
              personaMap[item.persona] = (personaMap[item.persona] || 0) + 1;
            }
          });
        }
      } catch (dbErr) {
        console.warn('Supabase stats read warning:', dbErr);
      }
    }

    const popularDestinations = Object.entries(popularDestinationsMap)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const personaBreakdown = Object.entries(personaMap).map(([persona, count]) => ({
      persona,
      count,
    }));

    return res.status(200).json({
      totalUsers,
      totalTrips,
      aiQuestionsCount,
      popularDestinations,
      personaBreakdown,
      recentTrips,
    });
  } catch (error: any) {
    console.error('Error retrieving admin stats:', error);
    return res.status(500).json({ error: 'Failed to retrieve admin dashboard stats.' });
  }
});

app.listen(PORT, () => {
  console.log(`TRIPWISE Express Backend running on port ${PORT}`);
});

