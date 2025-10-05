// Database types for the application

// Base types
export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Band {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BandMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profiles?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string | null;
  };
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
  place_id?: string;
  created_at: string;
}

export interface Show {
  id: string;
  band_id: string;
  venue_id?: string;
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
  show_id?: string;
  band_id: string;
  amount: number;
  currency?: string;
  type: 'show' | 'streaming' | 'merchandise' | 'lessons' | 'other';
  date: string;
  description: string;
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
  data: Record<string, unknown>;
}
