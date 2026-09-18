import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Allow large payloads for base64 receipt uploads
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder'))
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// In-Memory Fallback Stores (for local development prior to Supabase production credentials)
const localTripsStore: Record<string, any> = {};
const localReceiptsStore: Record<string, any[]> = {};
const localCommentsStore: Record<string, any[]> = {};

// Helper: Curated city places fallback dataset for Geoapify fallback
const CURATED_CITY_PLACES: Record<string, any[]> = {
  Delhi: [
    { name: "Red Fort (Lal Qila)", category: "tourism.sights", lat: 28.6562, lon: 77.2410, desc: "Historic Mughal fortress with red sandstone walls.", isOutdoor: true },
    { name: "Humayun's Tomb", category: "tourism.sights", lat: 28.5849, lon: 77.2507, desc: "UNESCO World Heritage site with Persian garden layout.", isOutdoor: true },
    { name: "Qutub Minar", category: "tourism.sights", lat: 28.5245, lon: 77.1855, desc: "Tallest brick minaret in the world, surrounded by ancient ruins.", isOutdoor: true },
    { name: "Akshardham Temple", category: "tourism.sights", lat: 28.6127, lon: 77.2773, desc: "Spiritual campus showcasing Indian culture and architecture.", isOutdoor: false },
    { name: "Chandni Chowk Street Food", category: "catering.restaurant", lat: 28.6506, lon: 77.2303, desc: "Bustling historic market famous for paranthas and kebabs.", isOutdoor: true },
    { name: "National Gallery of Modern Art", category: "entertainment", lat: 28.6100, lon: 77.2344, desc: "Premier art museum housing modern Indian masterpieces.", isOutdoor: false }
  ],
  London: [
    { name: "Tower of London", category: "tourism.sights", lat: 51.5081, lon: -0.0759, desc: "Historic castle housing Crown Jewels and royal fortress.", isOutdoor: true },
    { name: "British Museum", category: "entertainment", lat: 51.5194, lon: -0.1270, desc: "World museum dedicated to human history, art, and culture.", isOutdoor: false },
    { name: "Westminster Abbey", category: "tourism.sights", lat: 51.4994, lon: -0.1273, desc: "Gothic coronation church of British monarchs.", isOutdoor: false },
    { name: "Covent Garden Market", category: "catering.restaurant", lat: 51.5117, lon: -0.1240, desc: "Vibrant piazza with artisan food stalls and street performers.", isOutdoor: true },
    { name: "Hyde Park Gardens", category: "leisure.park", lat: 51.5073, lon: -0.1657, desc: "Expansive royal park with Serpentine lake and rose gardens.", isOutdoor: true }
  ],
  Tokyo: [
    { name: "Senso-ji Temple", category: "tourism.sights", lat: 35.7148, lon: 139.7967, desc: "Ancient Buddhist temple in Asakusa with iconic red lantern.", isOutdoor: true },
    { name: "Shibuya Crossing & Sky", category: "tourism.sights", lat: 35.6595, lon: 139.7004, desc: "Famous pedestrian scramble with panoramic city deck.", isOutdoor: true },
    { name: "Meiji Shrine & Forest", category: "leisure.park", lat: 35.6764, lon: 139.6993, desc: "Serene Shinto shrine enclosed in dense evergreen forest.", isOutdoor: true },
    { name: "Akihabara Electric Town", category: "entertainment", lat: 35.6984, lon: 139.7731, desc: "Hub for electronics, anime, gaming cafes, and manga stores.", isOutdoor: false },
    { name: "teamLab Planets Tokyo", category: "entertainment", lat: 35.6491, lon: 139.7898, desc: "Immersive digital art museum with body-involving exhibits.", isOutdoor: false }
  ],
  Paris: [
    { name: "Eiffel Tower & Champ de Mars", category: "tourism.sights", lat: 48.8584, lon: 2.2945, desc: "Iconic wrought-iron landmark with panoramic city views.", isOutdoor: true },
    { name: "Louvre Museum", category: "entertainment", lat: 48.8606, lon: 2.3376, desc: "World's largest art museum housing Mona Lisa and Venus de Milo.", isOutdoor: false },
    { name: "Montmartre & Sacré-Cœur", category: "tourism.sights", lat: 48.8867, lon: 2.3431, desc: "Historic hilltop artist quarter crowned by white dome basilica.", isOutdoor: true },
    { name: "Musée d'Orsay", category: "entertainment", lat: 48.8599, lon: 2.3266, desc: "Impressionist masterpiece museum set in former railway station.", isOutdoor: false }
  ]
};

// 1. GET /api/health
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    app: 'TRIPWISE Intelligent Backend',
    geminiEnabled: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    geoapifyEnabled: !!(process.env.GEOAPIFY_API_KEY && process.env.GEOAPIFY_API_KEY !== 'your_geoapify_api_key_here'),
    supabaseEnabled: !!supabase,
    timestamp: new Date().toISOString()
  });
});

// 2. GET /api/recommendations (Geoapify Real Places + Gemini Personalization)
app.get('/api/recommendations', async (req: Request, res: Response) => {
  try {
    const destination = (req.query.destination as string) || 'Delhi';
    const persona = (req.query.persona as string) || 'Explorer';
    const latStr = req.query.lat as string;
    const lonStr = req.query.lon as string;

    const lat = latStr ? parseFloat(latStr) : 28.6139;
    const lon = lonStr ? parseFloat(lonStr) : 77.2090;

    const geoapifyKey = process.env.GEOAPIFY_API_KEY;
    let fetchedPlaces: any[] = [];

    // Step 1: Query Geoapify Places API if key is present
    if (geoapifyKey && geoapifyKey !== 'your_geoapify_api_key_here') {
      try {
        const categories = 'tourism.sights,catering.restaurant,catering.cafe,leisure.park,entertainment';
        const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},15000&limit=12&apiKey=${geoapifyKey}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            fetchedPlaces = data.features.map((f: any) => ({
              name: f.properties.name || f.properties.address_line1 || 'Local Landmark',
              category: f.properties.categories?.[0] || 'tourism.sights',
              lat: f.properties.lat,
              lon: f.properties.lon,
              desc: f.properties.formatted || `${destination} attraction`,
              distanceKm: f.properties.distance ? (f.properties.distance / 1000).toFixed(1) : '1.5',
              isOutdoor: !(f.properties.categories || []).some((c: string) => c.includes('museum') || c.includes('indoor'))
            })).filter((p: any) => p.name && p.name !== 'Local Landmark');
          }
        }
      } catch (geoErr) {
        console.warn('Geoapify API fetch fallback:', geoErr);
      }
    }

    // Fallback if Geoapify returned no results or key not configured
    if (fetchedPlaces.length === 0) {
      const cityKey = Object.keys(CURATED_CITY_PLACES).find(c => c.toLowerCase() === destination.toLowerCase()) || 'Delhi';
      fetchedPlaces = CURATED_CITY_PLACES[cityKey] || CURATED_CITY_PLACES['Delhi'];
    }

    // Step 2: Pass places to Gemini for persona ranking and natural language explanation
    const geminiKey = process.env.GEMINI_API_KEY;
    let recommendations = fetchedPlaces.slice(0, 6).map((p: any) => ({
      id: `rec-${Math.random().toString(36).substring(2, 8)}`,
      name: p.name,
      category: p.category?.includes('restaurant') ? 'food' : p.category?.includes('park') ? 'nature' : 'culture',
      description: p.desc || `Authentic ${destination} location`,
      distanceKm: p.distanceKm || '1.2',
      whyRecommended: `Great match for ${persona} traveler persona in ${destination}.`,
      isOutdoor: p.isOutdoor ?? true,
      lat: p.lat,
      lon: p.lon,
      durationMinutes: 90,
      bestTime: 'Afternoon'
    }));

    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const prompt = `
Given this traveler persona: "${persona}" and destination: "${destination}".
Rank and tailor these real places: ${JSON.stringify(fetchedPlaces.slice(0, 6).map(p => p.name))}
Return JSON array with array of objects containing: { "name": string, "whyRecommended": string (1 concise sentence why persona will like it) }.
Respond with JSON only.
`;
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (Array.isArray(parsed)) {
            recommendations = recommendations.map(rec => {
              const match = parsed.find((item: any) => item.name?.toLowerCase().includes(rec.name.toLowerCase()));
              if (match && match.whyRecommended) {
                rec.whyRecommended = match.whyRecommended;
              }
              return rec;
            });
          }
        }
      } catch (gErr) {
        console.warn('Gemini recommendation ranking fallback:', gErr);
      }
    }

    return res.status(200).json({ success: true, destination, persona, recommendations });
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ error: 'Unable to load recommendations right now.' });
  }
});

// 3. POST /api/inspiration/make-my-own (Customizes Inspiration Trip via Gemini)
app.post('/api/inspiration/make-my-own', async (req: Request, res: Response) => {
  try {
    const { inspirationTrip, newPersona, newInterests } = req.body;

    if (!inspirationTrip || !inspirationTrip.destination) {
      return res.status(400).json({ error: 'Invalid inspiration trip data.' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    let updatedItinerary = inspirationTrip.days;

    // Call Gemini to customize activities if key is set
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const prompt = `
You are TripWise AI. Adapt this ${inspirationTrip.destination} trip for a "${newPersona || 'Explorer'}" persona who loves ${JSON.stringify(newInterests || ['Culture'])}.
Original days: ${JSON.stringify(inspirationTrip.days)}
Return updated JSON array of days matching exact structure with personalized activity descriptions. Respond in JSON only.
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
          const parsedDays = JSON.parse(cleanedText);
          if (Array.isArray(parsedDays) && parsedDays.length > 0) {
            updatedItinerary = parsedDays;
          }
        }
      } catch (e) {
        console.warn('Gemini trip adaptation fallback:', e);
      }
    }

    const tripId = `trip-${Date.now()}`;
    const shareId = `share-${Math.random().toString(36).substring(2, 9)}`;

    const customTrip = {
      ...inspirationTrip,
      id: tripId,
      shareId,
      persona: newPersona || inspirationTrip.persona,
      interests: newInterests || inspirationTrip.interests,
      days: updatedItinerary,
      createdAt: new Date().toISOString()
    };

    localTripsStore[tripId] = customTrip;
    localTripsStore[shareId] = customTrip;

    if (supabase) {
      await supabase.from('trips').upsert({
        id: tripId,
        share_id: shareId,
        destination: customTrip.destination,
        latitude: customTrip.latitude,
        longitude: customTrip.longitude,
        duration: customTrip.durationDays,
        persona: customTrip.persona,
        travel_pace: customTrip.pace,
        interests: customTrip.interests || [],
        itinerary: customTrip.days,
        weather_summary: customTrip.weatherSummary,
        trip_score: customTrip.healthScore
      });
    }

    return res.status(201).json({ success: true, trip: customTrip });
  } catch (error: any) {
    console.error('Error making trip custom:', error);
    return res.status(500).json({ error: 'Failed to customize trip.' });
  }
});

// 4. POST /api/vault/extract (Multimodal Receipt AI Extraction using Gemini)
app.post('/api/vault/extract', async (req: Request, res: Response) => {
  try {
    const { fileBase64, mimeType, fileName } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'Receipt file base64 data required.' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    // Default fallback extraction
    let extractedData = {
      title: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Travel Receipt',
      type: 'Ticket',
      date: new Date().toISOString().split('T')[0],
      destination: 'Local Destination',
      amount: 'Not detected',
      currency: 'INR',
      reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Uploaded to Travel Vault.'
    };

    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const cleanBase64 = fileBase64.includes('base64,') ? fileBase64.split('base64,')[1] : fileBase64;
        const actualMime = mimeType || 'image/png';

        const prompt = `
Extract structured information from this travel receipt or booking document.
Return JSON ONLY with exact structure:
{
  "title": "Clear name of hotel, restaurant, attraction, or transport vendor",
  "type": "Hotel" | "Restaurant" | "Ticket" | "Transport" | "Other",
  "date": "YYYY-MM-DD or date text (or 'Not detected')",
  "destination": "City name if visible (or 'Not detected')",
  "amount": "Formatted price e.g. ₹5,400 or $120 (or 'Not detected')",
  "currency": "INR/USD/EUR/GBP (or 'Not detected')",
  "reference": "Booking ref # or PNR (or 'Not detected')",
  "notes": "Short 1-sentence receipt note"
}
Do NOT invent fields that are missing. Use 'Not detected' if missing. Output valid JSON only.
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { inline_data: { mime_type: actualMime, data: cleanBase64 } },
                  { text: prompt }
                ]
              }]
            })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed && parsed.title) {
            extractedData = { ...extractedData, ...parsed };
          }
        }
      } catch (gErr) {
        console.warn('Multimodal Gemini receipt extraction fallback:', gErr);
      }
    }

    return res.status(200).json({ success: true, extractedData });
  } catch (error: any) {
    console.error('Error extracting receipt:', error);
    return res.status(200).json({
      success: true,
      extractedData: {
        title: 'Travel Document',
        type: 'Other',
        date: new Date().toISOString().split('T')[0],
        destination: 'Not detected',
        amount: 'Not detected',
        currency: 'INR',
        reference: 'Not detected',
        notes: 'Receipt uploaded successfully. You can update details manually.'
      }
    });
  }
});

// 5. POST /api/trips (Save Trip)
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

    if (supabase) {
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

// 6. GET /api/trips/:id
app.get('/api/trips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (localTripsStore[id]) {
      return res.status(200).json(localTripsStore[id]);
    }

    if (supabase) {
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

// 7. GET /api/share/:shareId
app.get('/api/share/:shareId', async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;
    const match = localTripsStore[shareId];

    if (match) {
      const { userId, user_id, email, ...publicTrip } = match;
      return res.status(200).json(publicTrip);
    }

    if (supabase) {
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

// 8. DELETE /api/trips/:id
app.delete('/api/trips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    delete localTripsStore[id];

    if (supabase) {
      await supabase.from('trips').delete().eq('id', id);
    }

    return res.status(200).json({ success: true, message: 'Trip deleted.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete trip.' });
  }
});

// 9. POST /api/trips/:id/comments (Lightweight Collaboration)
app.get('/api/trips/:id/comments', async (req: Request, res: Response) => {
  const { id } = req.params;
  const comments = localCommentsStore[id] || [];
  return res.status(200).json({ comments });
});

app.post('/api/trips/:id/comments', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userName, comment } = req.body;
  const newComment = {
    id: `cmt-${Date.now()}`,
    userName: userName || 'Fellow Traveler',
    comment: comment || 'Awesome itinerary!',
    createdAt: new Date().toISOString()
  };

  if (!localCommentsStore[id]) localCommentsStore[id] = [];
  localCommentsStore[id].unshift(newComment);

  if (supabase) {
    try {
      await supabase.from('trip_comments').insert({
        id: newComment.id,
        trip_id: id,
        user_name: newComment.userName,
        comment: newComment.comment
      });
    } catch (e) {}
  }

  return res.status(201).json({ success: true, comment: newComment });
});

// Global counter for AI Questions handled
let aiQuestionsCount = 0;

// 10. POST /api/ai/ask (TripWise AI Assistant Endpoint)
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    aiQuestionsCount++;
    const { question, tripContext } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Valid question parameter is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

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
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
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
        console.warn('Gemini API call warning, using intelligent rule engine:', geminiErr);
      }
    }

    // Rule-based fallback engine
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
    }

    return res.status(200).json({ answer: fallbackAnswer, aiQuestionsCount });
  } catch (error: any) {
    console.error('Error handling AI ask request:', error);
    return res.status(500).json({
      error: 'TripWise AI is temporarily unavailable. Your itinerary remains safe.',
    });
  }
});

// 11. GET /api/admin/stats
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  try {
    let totalUsers = 1;
    let totalTrips = Object.keys(localTripsStore).length / 2;
    let popularDestinationsMap: Record<string, number> = {};
    let personaMap: Record<string, number> = {};
    let recentTrips: any[] = [];

    Object.values(localTripsStore).forEach((t: any) => {
      if (t.destination) popularDestinationsMap[t.destination] = (popularDestinationsMap[t.destination] || 0) + 1;
      if (t.persona) personaMap[t.persona] = (personaMap[t.persona] || 0) + 1;
    });

    if (supabase) {
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
              popularDestinationsMap[item.destination] = (popularDestinationsMap[item.destination] || 0) + 1;
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
