-- TRIPWISE SUPABASE DATABASE SCHEMA

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_id TEXT UNIQUE NOT NULL,
  destination TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  duration INTEGER NOT NULL,
  persona TEXT NOT NULL,
  travel_pace TEXT NOT NULL,
  interests JSONB DEFAULT '[]'::jsonb,
  itinerary JSONB NOT NULL,
  weather_summary JSONB,
  trip_score JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 5. RLS Policies for Trips
-- Allow users to manage their private trips
CREATE POLICY "Users can create their own trips" 
  ON public.trips FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own trips" 
  ON public.trips FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own trips" 
  ON public.trips FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
  ON public.trips FOR DELETE 
  USING (auth.uid() = user_id);

-- Public Share Access Policy (allows viewing shared trip by share_id)
CREATE POLICY "Anyone can view shared trips via share_id" 
  ON public.trips FOR SELECT 
  USING (share_id IS NOT NULL);
