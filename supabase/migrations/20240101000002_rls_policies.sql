-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_plans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Helper function to check if user is member of band
CREATE OR REPLACE FUNCTION is_band_member(band_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM band_members 
    WHERE band_members.band_id = $1 
    AND band_members.profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin of band
CREATE OR REPLACE FUNCTION is_band_admin(band_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM band_members 
    WHERE band_members.band_id = $1 
    AND band_members.profile_id = auth.uid()
    AND band_members.role IN ('admin', 'owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bands policies
CREATE POLICY "Users can view bands they're members of" ON bands
  FOR SELECT USING (is_band_member(id));

CREATE POLICY "Users can create new bands" ON bands
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Band admins can update their bands" ON bands
  FOR UPDATE USING (is_band_admin(id));

CREATE POLICY "Band admins can delete their bands" ON bands
  FOR DELETE USING (is_band_admin(id));

-- Band members policies
CREATE POLICY "Users can view band memberships for bands they're in" ON band_members
  FOR SELECT USING (is_band_member(band_id));

CREATE POLICY "Band admins can manage memberships" ON band_members
  FOR ALL USING (is_band_admin(band_id));

CREATE POLICY "Users can join bands" ON band_members
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Venues policies (public read, band members can create/update)
CREATE POLICY "Anyone can view venues" ON venues
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create venues" ON venues
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update venues" ON venues
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Shows policies
CREATE POLICY "Users can view shows for their bands" ON shows
  FOR SELECT USING (is_band_member(band_id));

CREATE POLICY "Band members can create shows for their bands" ON shows
  FOR INSERT WITH CHECK (is_band_member(band_id));

CREATE POLICY "Band members can update shows for their bands" ON shows
  FOR UPDATE USING (is_band_member(band_id));

CREATE POLICY "Band admins can delete shows" ON shows
  FOR DELETE USING (is_band_admin(band_id));

-- Earnings policies
CREATE POLICY "Users can view earnings for shows of their bands" ON earnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shows 
      WHERE shows.id = earnings.show_id 
      AND is_band_member(shows.band_id)
    )
  );

CREATE POLICY "Band members can add earnings" ON earnings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shows 
      WHERE shows.id = earnings.show_id 
      AND is_band_member(shows.band_id)
    )
  );

CREATE POLICY "Band members can update earnings" ON earnings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM shows 
      WHERE shows.id = earnings.show_id 
      AND is_band_member(shows.band_id)
    )
  );

CREATE POLICY "Band admins can delete earnings" ON earnings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM shows 
      WHERE shows.id = earnings.show_id 
      AND is_band_admin(shows.band_id)
    )
  );

-- Setlists policies
CREATE POLICY "Users can view setlists for their bands" ON setlists
  FOR SELECT USING (is_band_member(band_id));

CREATE POLICY "Band members can create setlists" ON setlists
  FOR INSERT WITH CHECK (is_band_member(band_id));

CREATE POLICY "Band members can update setlists" ON setlists
  FOR UPDATE USING (is_band_member(band_id));

CREATE POLICY "Band admins can delete setlists" ON setlists
  FOR DELETE USING (is_band_admin(band_id));

-- Setlist songs policies
CREATE POLICY "Users can view setlist songs for their bands" ON setlist_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM setlists 
      WHERE setlists.id = setlist_songs.setlist_id 
      AND is_band_member(setlists.band_id)
    )
  );

CREATE POLICY "Band members can manage setlist songs" ON setlist_songs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM setlists 
      WHERE setlists.id = setlist_songs.setlist_id 
      AND is_band_member(setlists.band_id)
    )
  );

-- OAuth tokens policies
CREATE POLICY "Users can manage their own oauth tokens" ON oauth_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Assistant plans policies
CREATE POLICY "Users can view assistant plans for their bands" ON assistant_plans
  FOR SELECT USING (is_band_member(band_id));

CREATE POLICY "Band members can create assistant plans" ON assistant_plans
  FOR INSERT WITH CHECK (is_band_member(band_id) AND profile_id = auth.uid());

CREATE POLICY "Users can update their own assistant plans" ON assistant_plans
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Band admins can manage all assistant plans for their bands" ON assistant_plans
  FOR ALL USING (is_band_admin(band_id));