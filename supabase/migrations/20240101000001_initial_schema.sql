-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bands/organizations table
CREATE TABLE bands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  spotify_artist_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create band members junction table
CREATE TABLE band_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(band_id, profile_id)
);

-- Create venues table
CREATE TABLE venues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  place_id TEXT, -- Google Places API ID
  venue_type TEXT DEFAULT 'venue', -- venue, bar, club, festival, etc.
  capacity INTEGER,
  website TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create shows table
CREATE TABLE shows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME,
  status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
  notes TEXT,
  setlist_name TEXT,
  weather_summary TEXT,
  weather_temp INTEGER,
  weather_condition TEXT,
  door_fee DECIMAL(10, 2),
  guarantee_fee DECIMAL(10, 2),
  actual_attendance INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create earnings table
CREATE TABLE earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  earning_type TEXT DEFAULT 'performance', -- performance, merch, tips, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create setlists table
CREATE TABLE setlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create setlist songs table
CREATE TABLE setlist_songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setlist_id UUID REFERENCES setlists(id) ON DELETE CASCADE NOT NULL,
  song_title TEXT NOT NULL,
  artist TEXT,
  duration_seconds INTEGER,
  position INTEGER NOT NULL,
  notes TEXT,
  spotify_track_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create oauth_tokens table for external integrations
CREATE TABLE oauth_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- spotify, google, etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, provider)
);

-- Create assistant_plans table for AI assistant functionality
CREATE TABLE assistant_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_input TEXT NOT NULL,
  plan_description TEXT NOT NULL,
  actions JSONB,
  status TEXT DEFAULT 'pending', -- pending, applied, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_band_members_band_id ON band_members(band_id);
CREATE INDEX idx_band_members_profile_id ON band_members(profile_id);
CREATE INDEX idx_shows_band_id ON shows(band_id);
CREATE INDEX idx_shows_venue_id ON shows(venue_id);
CREATE INDEX idx_shows_date ON shows(date);
CREATE INDEX idx_earnings_show_id ON earnings(show_id);
CREATE INDEX idx_setlist_songs_setlist_id ON setlist_songs(setlist_id);
CREATE INDEX idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_location ON venues(latitude, longitude);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bands_updated_at BEFORE UPDATE ON bands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_setlists_updated_at BEFORE UPDATE ON setlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON oauth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();