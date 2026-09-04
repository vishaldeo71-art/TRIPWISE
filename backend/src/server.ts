import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`TRIPWISE Express Backend running on port ${PORT}`);
});
