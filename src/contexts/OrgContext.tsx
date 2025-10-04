import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Band, BandMember } from '@/types';

interface OrgContextType {
  currentOrg: Band | null;
  userOrgs: Band[];
  orgMembers: BandMember[];
  loading: boolean;
  createOrg: (name: string, description?: string) => Promise<Band>;
  switchOrg: (orgId: string) => Promise<void>;
  inviteMember: (email: string, role?: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: string) => Promise<void>;
  refreshOrgs: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}

interface OrgProviderProps {
  children: React.ReactNode;
}

export function OrgProvider({ children }: OrgProviderProps) {
  const { user } = useAuth();
  const [currentOrg, setCurrentOrg] = useState<Band | null>(null);
  const [userOrgs, setUserOrgs] = useState<Band[]>([]);
  const [orgMembers, setOrgMembers] = useState<BandMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  
  // Mock data for development
  const mockOrgs: Band[] = [
    {
      id: 'mock-band-1',
      name: 'The Demo Band',
      slug: 'the-demo-band',
      description: 'A demo band for testing ChordLine',
      logo_url: null,
      created_by: 'mock-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-band-2', 
      name: 'Acoustic Vibes',
      slug: 'acoustic-vibes',
      description: 'Chill acoustic performances',
      logo_url: null,
      created_by: 'mock-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    if (user) {
      fetchUserOrgs();
    } else {
      setCurrentOrg(null);
      setUserOrgs([]);
      setOrgMembers([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (currentOrg) {
      fetchOrgMembers();
    }
  }, [currentOrg]);

  const fetchUserOrgs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      if (useMockData) {
        console.log('🧪 Mock: Loading user orgs');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        setUserOrgs(mockOrgs);
        // Set current org to the first one if none selected
        if (mockOrgs.length > 0 && !currentOrg) {
          setCurrentOrg(mockOrgs[0]);
        }
        return;
      }
      
      const { data: memberData, error: memberError } = await supabase
        .from('org_members')
        .select(`
          org_id,
          role,
          orgs (
            id,
            name,
            slug,
            description,
            logo_url,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const orgs = memberData
        ?.map((m: any) => m.orgs)
        .filter(Boolean) as Band[];

      setUserOrgs(orgs || []);

      // Set current org to the first one if none selected
      if (orgs && orgs.length > 0 && !currentOrg) {
        setCurrentOrg(orgs[0]);
      }
    } catch (error) {
      console.error('Error fetching user orgs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgMembers = async () => {
    if (!currentOrg) return;

    try {
      if (useMockData) {
        console.log('🧪 Mock: Loading org members for', currentOrg.name);
        const mockMembers: BandMember[] = [
          {
            id: 'mock-member-1',
            org_id: currentOrg.id,
            user_id: 'mock-user-id',
            role: 'owner',
            joined_at: new Date().toISOString(),
            profiles: {
              id: 'mock-user-id',
              email: 'demo@chordline.app',
              full_name: 'Demo User',
              avatar_url: null
            }
          }
        ];
        setOrgMembers(mockMembers);
        return;
      }
      
      const { data, error } = await supabase
        .from('org_members')
        .select(`
          id,
          org_id,
          user_id,
          role,
          joined_at,
          profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('org_id', currentOrg.id);

      if (error) throw error;

      setOrgMembers(data || []);
    } catch (error) {
      console.error('Error fetching org members:', error);
    }
  };

  const createOrg = async (name: string, description?: string): Promise<Band> => {
    if (!user) throw new Error('No user logged in');

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      if (useMockData) {
        console.log('🧪 Mock: Creating new org:', name);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
        
        const newOrg: Band = {
          id: `mock-band-${Date.now()}`,
          name,
          slug,
          description: description || '',
          logo_url: null,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUserOrgs(prev => [...prev, newOrg]);
        setCurrentOrg(newOrg);
        return newOrg;
      }
      
      const { data, error } = await supabase
        .from('orgs')
        .insert({
          name,
          slug,
          description,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      await refreshOrgs();
      setCurrentOrg(data);
      
      return data;
    } catch (error) {
      console.error('Error creating org:', error);
      throw error;
    }
  };

  const switchOrg = async (orgId: string) => {
    const org = userOrgs.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
    }
  };

  const inviteMember = async (email: string, role: string = 'member') => {
    if (!currentOrg || !user) throw new Error('No org or user');

    try {
      // First, check if user with this email exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError) {
        throw new Error('User not found. They need to sign up first.');
      }

      // Add user to org
      const { error } = await supabase
        .from('org_members')
        .insert({
          org_id: currentOrg.id,
          user_id: (profile as any).id,
          role,
        } as any);

      if (error) throw error;

      await fetchOrgMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('org_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await fetchOrgMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    try {
      const { error } = await (supabase as any)
        .from('org_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      await fetchOrgMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  };

  const refreshOrgs = async () => {
    await fetchUserOrgs();
  };

  const value = {
    currentOrg,
    userOrgs,
    orgMembers,
    loading,
    createOrg,
    switchOrg,
    inviteMember,
    removeMember,
    updateMemberRole,
    refreshOrgs,
  };

  return (
    <OrgContext.Provider value={value}>
      {children}
    </OrgContext.Provider>
  );
}