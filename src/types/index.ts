// Core Domain Types
export interface Profile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Band {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BandMember {
  id: string;
  band_id: string;
  profile_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  place_id?: string; // Google/Mapbox place ID
  created_at: string;
}

export interface Show {
  id: string;
  band_id: string;
  venue_id: string;
  date: string;
  time?: string;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  setlist_name?: string;
  weather_summary?: string;
  weather_temp?: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  venue?: Venue;
  earnings?: Earning[];
}

export interface Earning {
  id: string;
  show_id: string;
  amount: number;
  currency: string;
  description?: string;
  created_at: string;
}

export interface AssistantPlan {
  id: string;
  band_id: string;
  profile_id: string;
  user_input: string;
  plan_description: string;
  actions: AssistantAction[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  applied_at?: string;
}

export interface AssistantAction {
  type: 'create_show' | 'add_earning' | 'update_show' | 'add_calendar_event';
  data: Record<string, any>;
}

// UI/Component Types
export interface TabItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Weather API Types
export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

// Map/Location Types
export interface LocationSearchResult {
  place_id: string;
  display_name: string;
  address: string;
  latitude: number;
  longitude: number;
}