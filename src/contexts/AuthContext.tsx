import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  useEffect(() => {
    if (useMockData) {
      // Check if tests have set mock auth state
      const mockAuthUser = localStorage.getItem('MOCK_AUTH_USER');
      const isAuthenticated = localStorage.getItem('MOCK_AUTH_AUTHENTICATED') === 'true';
      
      if (isAuthenticated && mockAuthUser) {
        console.log('🧪 Mock mode: Starting with authenticated user');
        const user = JSON.parse(mockAuthUser) as User;
        setUser(user);
        fetchProfile(user.id);
      } else {
        console.log('🧪 Mock mode: Starting with no authentication');
      }
      
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [useMockData]); // fetchProfile is stable since it's defined above

  const fetchProfile = async (userId: string) => {
    if (useMockData) {
      // Mock profile data
      const mockProfile: Profile = {
        id: userId,
        email: 'demo@chordline.app',
        username: 'demo_user',
        full_name: 'Demo User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(mockProfile);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signInWithEmail = async (email: string) => {
    setLoading(true);
    try {
      if (useMockData) {
        console.log('🧪 Mock: Simulating email login for', email);
        // Simulate successful login after delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
          id: 'mock-user-id',
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          user_metadata: { full_name: 'Demo User' },
          app_metadata: {},
          aud: 'authenticated'
        } as User;
        
        setUser(mockUser);
        await fetchProfile(mockUser.id);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        console.log('🧪 Mock: Simulating Google login');
        // Simulate successful login after delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
          id: 'mock-user-google-id',
          email: 'demo@gmail.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          user_metadata: { full_name: 'Demo User via Google' },
          app_metadata: {},
          aud: 'authenticated'
        } as User;
        
        setUser(mockUser);
        await fetchProfile(mockUser.id);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        console.log('🧪 Mock: Simulating sign out');
        await new Promise(resolve => setTimeout(resolve, 500));
        setUser(null);
        setProfile(null);
        setSession(null);
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}