-- TRIPWISE SUPABASE DATABASE SCHEMA

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
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
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create receipts table (Travel Vault)
CREATE TABLE IF NOT EXISTS public.receipts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT,
  destination TEXT,
  amount TEXT,
  currency TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create trip_comments table (Lightweight Collaboration)
CREATE TABLE IF NOT EXISTS public.trip_comments (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_comments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 7. RLS Policies for Trips
DROP POLICY IF EXISTS "Users can create their own trips" ON public.trips;
CREATE POLICY "Users can create their own trips" 
  ON public.trips FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
CREATE POLICY "Users can view their own trips" 
  ON public.trips FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own trips" ON public.trips;
CREATE POLICY "Users can update their own trips" 
  ON public.trips FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own trips" ON public.trips;
CREATE POLICY "Users can delete their own trips" 
  ON public.trips FOR DELETE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view shared trips via share_id" ON public.trips;
CREATE POLICY "Anyone can view shared trips via share_id" 
  ON public.trips FOR SELECT 
  USING (share_id IS NOT NULL);

-- 8. RLS Policies for Receipts (Travel Vault)
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts;
CREATE POLICY "Users can view their own receipts" 
  ON public.receipts FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own receipts" ON public.receipts;
CREATE POLICY "Users can insert their own receipts" 
  ON public.receipts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own receipts" ON public.receipts;
CREATE POLICY "Users can delete their own receipts" 
  ON public.receipts FOR DELETE 
  USING (auth.uid() = user_id);

-- 9. RLS Policies for Comments
DROP POLICY IF EXISTS "Anyone can view comments for a trip" ON public.trip_comments;
CREATE POLICY "Anyone can view comments for a trip" 
  ON public.trip_comments FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert comments for a trip" ON public.trip_comments;
CREATE POLICY "Anyone can insert comments for a trip" 
  ON public.trip_comments FOR INSERT 
  WITH CHECK (true);

-- 10. Trigger for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now()
  )
  ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
