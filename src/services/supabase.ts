import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

if (!supabaseUrl || !supabaseAnonKey) {
  if (!useMockData) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.')
  }
  console.warn('⚠️ Running in mock mode - Supabase features will be simulated')
}

// Create Supabase client - in mock mode, this won't actually connect
export const supabase = createClient<Database>(
  supabaseUrl || 'https://mock.supabase.co',
  supabaseAnonKey || 'mock-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Mock user for development
const mockUser = {
  id: 'mock-user-id',
  email: 'demo@chordline.app',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  user_metadata: {
    full_name: 'Demo User'
  }
}

// Auth helpers with mock support
export const signInWithEmail = async (email: string) => {
  if (useMockData) {
    console.log('🧪 Mock: Simulating email sign-in for', email)
    return {
      data: { user: mockUser, session: null },
      error: null
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })
    return { data, error }
  } catch (error) {
    console.error('Auth error:', error)
    return { data: null, error }
  }
}

export const signInWithGoogle = async () => {
  if (useMockData) {
    console.log('🧪 Mock: Simulating Google sign-in')
    return {
      data: { user: mockUser, session: null },
      error: null
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  } catch (error) {
    console.error('Auth error:', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  if (useMockData) {
    console.log('🧪 Mock: Simulating sign out')
    return { error: null }
  }
  
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('Auth error:', error)
    return { error }
  }
}

export const getCurrentUser = async () => {
  if (useMockData) {
    return { user: null, error: null } // Start as not logged in
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    console.error('Auth error:', error)
    return { user: null, error }
  }
}

export const getCurrentSession = async () => {
  if (useMockData) {
    return { session: null, error: null } // Start as not logged in
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  } catch (error) {
    console.error('Auth error:', error)
    return { session: null, error }
  }
}
