-- Seed data for local testing
-- This file contains realistic test data for the musician growth app

-- Insert test venues
INSERT INTO venues (id, name, address, city, state, country, latitude, longitude, venue_type, capacity, website) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'The Bluebird Cafe', '4104 Hillsboro Pike', 'Nashville', 'TN', 'US', 36.1073, -86.8280, 'cafe', 90, 'https://bluebirdcafe.com'),
('550e8400-e29b-41d4-a716-446655440002', 'Mercury Lounge', '217 E Houston St', 'New York', 'NY', 'US', 40.7223, -73.9878, 'club', 250, 'https://mercuryloungenyc.com'),
('550e8400-e29b-41d4-a716-446655440003', 'The Troubadour', '9081 Santa Monica Blvd', 'West Hollywood', 'CA', 'US', 34.0900, -118.3894, 'venue', 500, 'https://troubadour.com'),
('550e8400-e29b-41d4-a716-446655440004', 'Red Rocks Amphitheatre', '18300 W Alameda Pkwy', 'Morrison', 'CO', 'US', 39.6654, -105.2056, 'amphitheatre', 9525, 'https://redrocksonline.com'),
('550e8400-e29b-41d4-a716-446655440005', 'The Bitter End', '147 Bleecker St', 'New York', 'NY', 'US', 40.7282, -74.0021, 'club', 200, 'https://bitterend.com'),
('550e8400-e29b-41d4-a716-446655440006', 'The Fillmore', '1805 Geary Blvd', 'San Francisco', 'CA', 'US', 37.7849, -122.4330, 'venue', 1200, 'https://thefillmore.com'),
('550e8400-e29b-41d4-a716-446655440007', 'Antone''s', '2015 E Riverside Dr', 'Austin', 'TX', 'US', 30.2438, -97.7321, 'club', 400, 'https://antonesnightclub.com'),
('550e8400-e29b-41d4-a716-446655440008', 'The Station Inn', '402 12th Ave S', 'Nashville', 'TN', 'US', 36.1506, -86.7831, 'venue', 200, 'https://stationinn.com'),
('550e8400-e29b-41d4-a716-446655440009', 'House of Blues Chicago', '329 N Dearborn St', 'Chicago', 'IL', 'US', 41.8884, -87.6297, 'club', 1100, 'https://houseofblues.com'),
('550e8400-e29b-41d4-a716-446655440010', 'The Orange Peel', '101 Biltmore Ave', 'Asheville', 'NC', 'US', 35.5951, -82.5515, 'venue', 1050, 'https://theorangepeel.net');

-- Create test users (these will be created via Auth first)
-- Add some sample auth.users entries for completeness (these would normally be handled by Supabase Auth)
-- Note: This is just for local testing and should not be done in production
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'demo@chordline.app',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Demo User"}',
    FALSE,
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'sarah.songwriter@music.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Sarah Chen"}',
    FALSE,
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'mike.bassist@band.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Mike Rodriguez"}',
    FALSE,
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'jenny.drums@rhythm.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Jenny Kim"}',
    FALSE,
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'alex.guitar@strings.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Alex Johnson"}',
    FALSE,
    '',
    '',
    '',
    ''
);

-- Test user profiles (created after auth users)
INSERT INTO profiles (id, email, display_name, avatar_url) VALUES
('11111111-1111-1111-1111-111111111111', 'demo@chordline.app', 'Demo User', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('22222222-2222-2222-2222-222222222222', 'sarah.songwriter@music.com', 'Sarah Chen', 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=150&h=150&fit=crop&crop=face'),
('33333333-3333-3333-3333-333333333333', 'mike.bassist@band.com', 'Mike Rodriguez', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('44444444-4444-4444-4444-444444444444', 'jenny.drums@rhythm.com', 'Jenny Kim', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
('55555555-5555-5555-5555-555555555555', 'alex.guitar@strings.com', 'Alex Johnson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face');

-- Test bands/organizations
INSERT INTO bands (id, name, description, spotify_artist_name) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'The Midnight Echoes', 'Indie folk rock band from Nashville with dreamy melodies and heartfelt lyrics.', 'The Midnight Echoes'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Electric Sunrise', 'Electronic pop duo creating atmospheric soundscapes and danceable beats.', 'Electric Sunrise'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'The Wandering Minstrels', 'Acoustic folk trio specializing in storytelling through music.', 'The Wandering Minstrels'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Neon Nights', 'Synthwave band bringing 80s nostalgia to modern audiences.', 'Neon Nights');

-- Band memberships
INSERT INTO band_members (band_id, profile_id, role) VALUES
-- The Midnight Echoes
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'member'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member'),

-- Electric Sunrise
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'owner'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'member'),

-- The Wandering Minstrels
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'owner'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'member'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'member'),

-- Neon Nights
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'owner'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'member');

-- Test shows (mix of past, present, and future)
INSERT INTO shows (id, band_id, venue_id, date, time, status, notes, setlist_name, weather_summary, weather_temp, weather_condition, door_fee, guarantee_fee, actual_attendance) VALUES
-- Past shows (completed)
('11110000-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440001', '2024-02-15', '20:00', 'completed', 'Great intimate show, very responsive audience', 'Acoustic Set', 'Clear skies', 68, 'Clear', 15.00, 300.00, 85),
('22220000-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '550e8400-e29b-41d4-a716-446655440002', '2024-03-08', '21:30', 'completed', 'Sold out show! Amazing energy', 'Electronic Dreams', 'Light rain', 45, 'Rain', 25.00, 800.00, 250),
('33330000-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '550e8400-e29b-41d4-a716-446655440003', '2024-04-12', '19:30', 'completed', 'Opening act, gained new fans', 'Folk Tales', 'Partly cloudy', 72, 'Clouds', 0.00, 400.00, 480),
('44440000-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440008', '2024-05-20', '20:30', 'completed', 'Nashville homecoming show', 'Greatest Hits', 'Thunderstorms', 58, 'Thunderstorm', 20.00, 500.00, 180),

-- Upcoming shows (scheduled/confirmed)
('55550000-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '550e8400-e29b-41d4-a716-446655440006', '2024-12-28', '20:00', 'confirmed', 'Year-end show in SF', 'New Year Vibes', NULL, NULL, NULL, 30.00, 1200.00, NULL),
('66660000-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '550e8400-e29b-41d4-a716-446655440009', '2024-12-31', '22:00', 'confirmed', 'New Year''s Eve special', 'Midnight Synthwave', NULL, NULL, NULL, 50.00, 2000.00, NULL),
('77770000-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440004', '2025-06-15', '19:00', 'scheduled', 'Dream venue! Red Rocks debut', 'Summer Solstice', NULL, NULL, NULL, 75.00, 15000.00, NULL),
('88880000-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '550e8400-e29b-41d4-a716-446655440007', '2025-03-17', '21:00', 'scheduled', 'SXSW showcase opportunity', 'Austin Nights', NULL, NULL, NULL, 20.00, 600.00, NULL);

-- Earnings for completed shows
INSERT INTO earnings (show_id, amount, currency, description, earning_type) VALUES
-- The Midnight Echoes at Bluebird Cafe
('11110000-1111-1111-1111-111111111111', 300.00, 'USD', 'Guaranteed fee', 'performance'),
('11110000-1111-1111-1111-111111111111', 45.00, 'USD', 'Merchandise sales', 'merch'),
('11110000-1111-1111-1111-111111111111', 23.50, 'USD', 'Tips from audience', 'tips'),

-- Electric Sunrise at Mercury Lounge
('22220000-2222-2222-2222-222222222222', 800.00, 'USD', 'Guaranteed fee', 'performance'),
('22220000-2222-2222-2222-222222222222', 125.00, 'USD', 'Merchandise sales', 'merch'),
('22220000-2222-2222-2222-222222222222', 200.00, 'USD', 'Door split bonus', 'performance'),

-- The Wandering Minstrels at Troubadour
('33330000-3333-3333-3333-333333333333', 400.00, 'USD', 'Opening act fee', 'performance'),
('33330000-3333-3333-3333-333333333333', 80.00, 'USD', 'Merchandise sales', 'merch'),

-- The Midnight Echoes at Station Inn
('44440000-4444-4444-4444-444444444444', 500.00, 'USD', 'Guaranteed fee', 'performance'),
('44440000-4444-4444-4444-444444444444', 67.50, 'USD', 'Merchandise sales', 'merch'),
('44440000-4444-4444-4444-444444444444', 15.00, 'USD', 'Tips despite weather', 'tips');

-- Sample setlists
INSERT INTO setlists (id, band_id, name, description) VALUES
('11110000-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acoustic Set', 'Intimate acoustic arrangements of our popular songs'),
('22220000-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Greatest Hits', 'Our most requested songs for bigger venues'),
('33330000-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Electronic Dreams', 'High-energy electronic set with extended mixes'),
('44440000-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Folk Tales', 'Storytelling focused acoustic set'),
('55550000-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Midnight Synthwave', 'Dark synthwave journey through the night');

-- Sample setlist songs
INSERT INTO setlist_songs (setlist_id, song_title, artist, duration_seconds, position, notes) VALUES
-- The Midnight Echoes - Acoustic Set
('11110000-1111-1111-1111-111111111111', 'Whispers in the Dark', 'The Midnight Echoes', 245, 1, 'Opening song, build energy slowly'),
('11110000-1111-1111-1111-111111111111', 'Coffee Shop Dreams', 'The Midnight Echoes', 198, 2, 'Crowd favorite, encourage singing'),
('11110000-1111-1111-1111-111111111111', 'Highway to Nowhere', 'The Midnight Echoes', 267, 3, 'Harmonica solo section'),
('11110000-1111-1111-1111-111111111111', 'Midnight Train', 'The Midnight Echoes', 223, 4, 'Closing song, leave them wanting more'),

-- Electric Sunrise - Electronic Dreams
('33330000-3333-3333-3333-333333333333', 'Neon Lights', 'Electric Sunrise', 312, 1, 'High energy opener'),
('33330000-3333-3333-3333-333333333333', 'Digital Hearts', 'Electric Sunrise', 276, 2, 'Fan favorite, extended mix'),
('33330000-3333-3333-3333-333333333333', 'Synthetic Love', 'Electric Sunrise', 298, 3, 'Vocal showcase'),
('33330000-3333-3333-3333-333333333333', 'Electric Dreams', 'Electric Sunrise', 345, 4, 'Epic closer with light show'),

-- The Wandering Minstrels - Folk Tales
('44440000-4444-4444-4444-444444444444', 'The Traveler''s Song', 'The Wandering Minstrels', 234, 1, 'Traditional opener'),
('44440000-4444-4444-4444-444444444444', 'Mountain Morning', 'The Wandering Minstrels', 189, 2, 'Peaceful interlude'),
('44440000-4444-4444-4444-444444444444', 'River''s End', 'The Wandering Minstrels', 276, 3, 'Emotional peak'),
('44440000-4444-4444-4444-444444444444', 'Home Again', 'The Wandering Minstrels', 198, 4, 'Heartwarming closer');

-- Sample OAuth tokens for testing integrations
INSERT INTO oauth_tokens (user_id, provider, access_token, refresh_token, expires_at, scope) VALUES
('11111111-1111-1111-1111-111111111111', 'spotify', 'mock_spotify_token_demo_user', 'mock_refresh_token_spotify', '2025-12-31 23:59:59+00', 'user-read-private user-read-email'),
('22222222-2222-2222-2222-222222222222', 'google', 'mock_google_token_sarah', 'mock_refresh_token_google', '2025-12-31 23:59:59+00', 'https://www.googleapis.com/auth/calendar'),
('11111111-1111-1111-1111-111111111111', 'google', 'mock_google_token_demo', 'mock_refresh_token_google_demo', '2025-12-31 23:59:59+00', 'https://www.googleapis.com/auth/calendar');

-- Sample assistant plans
INSERT INTO assistant_plans (band_id, profile_id, user_input, plan_description, actions, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
 'Help me plan a summer tour with 5-7 shows in the Southwest', 
 'I''ve created a summer tour plan focusing on the Southwest region. This includes 6 strategic venues across Arizona, New Mexico, and Colorado, building momentum with smaller venues and culminating at Red Rocks.',
 '{"venues": ["Phoenix", "Tucson", "Santa Fe", "Denver", "Boulder", "Morrison"], "timeline": "June-August 2025", "budget_estimate": "$15000"}',
 'pending'),
 
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
 'I want to increase our social media presence and get more Spotify streams',
 'Comprehensive digital marketing strategy focusing on consistent content creation, playlist placement, and social media engagement to grow your audience and streaming numbers.',
 '{"social_strategy": "Daily posts", "playlist_targets": ["Indie Electronic", "Chill Vibes"], "content_calendar": "Weekly schedule"}',
 'applied');

