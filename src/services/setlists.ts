import { supabase } from './supabase';
import { spotifyService } from './spotify';

// Types
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration_sec?: number;
  spotify_track_id?: string;
  position: number;
  notes?: string;
  created_at: string;
}

export interface Setlist {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  is_template: boolean;
  songs?: Song[];
  created_at: string;
  updated_at: string;
}

export interface CreateSetlistData {
  name: string;
  description?: string;
  is_template?: boolean;
}

export interface CreateSongData {
  title: string;
  artist: string;
  duration_sec?: number;
  spotify_track_id?: string;
  notes?: string;
}

class SetlistService {
  private useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Get all setlists for an organization
  async getSetlists(orgId: string): Promise<Setlist[]> {
    try {
      if (this.useMockData) {
        return this.getMockSetlists(orgId);
      }

      const { data, error } = await supabase
        .from('setlists')
        .select(`
          *,
          songs:setlist_songs(
            id,
            title,
            artist,
            duration_sec,
            spotify_track_id,
            position,
            notes,
            created_at
          )
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(setlist => ({
        ...setlist,
        songs: setlist.songs?.sort((a, b) => a.position - b.position) || []
      })) || [];
    } catch (error) {
      console.error('Error fetching setlists:', error);
      return [];
    }
  }

  // Get a single setlist with songs
  async getSetlist(setlistId: string): Promise<Setlist | null> {
    try {
      if (this.useMockData) {
        const mockSetlists = this.getMockSetlists('mock-org-id');
        return mockSetlists.find(s => s.id === setlistId) || null;
      }

      const { data, error } = await supabase
        .from('setlists')
        .select(`
          *,
          songs:setlist_songs(
            id,
            title,
            artist,
            duration_sec,
            spotify_track_id,
            position,
            notes,
            created_at
          )
        `)
        .eq('id', setlistId)
        .single();

      if (error) {
        throw error;
      }

      return {
        ...data,
        songs: data.songs?.sort((a, b) => a.position - b.position) || []
      };
    } catch (error) {
      console.error('Error fetching setlist:', error);
      return null;
    }
  }

  // Create a new setlist
  async createSetlist(orgId: string, setlistData: CreateSetlistData): Promise<string | null> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Creating setlist', setlistData);
        return `mock_setlist_${Date.now()}`;
      }

      const { data, error } = await supabase
        .from('setlists')
        .insert({
          org_id: orgId,
          ...setlistData,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating setlist:', error);
      return null;
    }
  }

  // Update a setlist
  async updateSetlist(setlistId: string, updates: Partial<CreateSetlistData>): Promise<boolean> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Updating setlist', setlistId, updates);
        return true;
      }

      const { error } = await supabase
        .from('setlists')
        .update(updates)
        .eq('id', setlistId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating setlist:', error);
      return false;
    }
  }

  // Delete a setlist
  async deleteSetlist(setlistId: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Deleting setlist', setlistId);
        return true;
      }

      const { error } = await supabase
        .from('setlists')
        .delete()
        .eq('id', setlistId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting setlist:', error);
      return false;
    }
  }

  // Add song to setlist
  async addSongToSetlist(setlistId: string, songData: CreateSongData): Promise<string | null> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Adding song to setlist', setlistId, songData);
        return `mock_song_${Date.now()}`;
      }

      // Get next position
      const { data: songs } = await supabase
        .from('setlist_songs')
        .select('position')
        .eq('setlist_id', setlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (songs?.[0]?.position || 0) + 1;

      const { data, error } = await supabase
        .from('setlist_songs')
        .insert({
          setlist_id: setlistId,
          position: nextPosition,
          ...songData,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error adding song to setlist:', error);
      return null;
    }
  }

  // Update song in setlist
  async updateSong(songId: string, updates: Partial<CreateSongData>): Promise<boolean> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Updating song', songId, updates);
        return true;
      }

      const { error } = await supabase
        .from('setlist_songs')
        .update(updates)
        .eq('id', songId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating song:', error);
      return false;
    }
  }

  // Remove song from setlist
  async removeSong(songId: string): Promise<boolean> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Removing song', songId);
        return true;
      }

      const { error } = await supabase
        .from('setlist_songs')
        .delete()
        .eq('id', songId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error removing song:', error);
      return false;
    }
  }

  // Reorder songs in setlist
  async reorderSongs(setlistId: string, songIds: string[]): Promise<boolean> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Reordering songs in setlist', setlistId, songIds);
        return true;
      }

      // Update positions for all songs
      const updates = songIds.map((songId, index) => ({
        id: songId,
        position: index + 1
      }));

      const { error } = await supabase
        .from('setlist_songs')
        .upsert(updates.map(update => ({
          id: update.id,
          position: update.position,
          setlist_id: setlistId
        })));

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error reordering songs:', error);
      return false;
    }
  }

  // Search Spotify for tracks and add to setlist
  async searchAndAddSpotifyTrack(setlistId: string, query: string): Promise<any[]> {
    try {
      const tracks = await spotifyService.searchTracks(query, 10);
      
      return tracks.map(track => ({
        spotify_track_id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        duration_sec: Math.floor(track.duration_ms / 1000),
        album: track.album.name,
        popularity: track.popularity,
        preview_url: track.preview_url
      }));
    } catch (error) {
      console.error('Error searching Spotify tracks:', error);
      return [];
    }
  }

  // Link setlist to show
  async linkSetlistToShow(showId: string, setlistId: string, isPrimary: boolean = false): Promise<boolean> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Linking setlist to show', showId, setlistId, isPrimary);
        return true;
      }

      const { error } = await supabase
        .from('show_setlists')
        .upsert({
          show_id: showId,
          setlist_id: setlistId,
          is_primary: isPrimary
        }, {
          onConflict: 'show_id,setlist_id'
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error linking setlist to show:', error);
      return false;
    }
  }

  // Get setlists for a show
  async getShowSetlists(showId: string): Promise<Setlist[]> {
    try {
      if (this.useMockData) {
        return this.getMockSetlists('mock-org-id').slice(0, 1);
      }

      const { data, error } = await supabase
        .from('show_setlists')
        .select(`
          is_primary,
          setlist:setlists(
            *,
            songs:setlist_songs(
              id,
              title,
              artist,
              duration_sec,
              spotify_track_id,
              position,
              notes,
              created_at
            )
          )
        `)
        .eq('show_id', showId);

      if (error) {
        throw error;
      }

      return data?.map(item => ({
        ...item.setlist,
        songs: item.setlist.songs?.sort((a, b) => a.position - b.position) || [],
        is_primary: item.is_primary
      })) || [];
    } catch (error) {
      console.error('Error fetching show setlists:', error);
      return [];
    }
  }

  // Duplicate setlist
  async duplicateSetlist(sourceSetlistId: string, newName: string): Promise<string | null> {
    try {
      if (this.useMockData) {
        console.log('🧪 Mock: Duplicating setlist', sourceSetlistId, newName);
        return `mock_duplicate_${Date.now()}`;
      }

      // Get source setlist
      const sourceSetlist = await this.getSetlist(sourceSetlistId);
      if (!sourceSetlist) {
        throw new Error('Source setlist not found');
      }

      // Create new setlist
      const newSetlistId = await this.createSetlist(sourceSetlist.org_id, {
        name: newName,
        description: sourceSetlist.description,
        is_template: sourceSetlist.is_template
      });

      if (!newSetlistId) {
        throw new Error('Failed to create duplicate setlist');
      }

      // Copy all songs
      for (const song of sourceSetlist.songs || []) {
        await this.addSongToSetlist(newSetlistId, {
          title: song.title,
          artist: song.artist,
          duration_sec: song.duration_sec,
          spotify_track_id: song.spotify_track_id,
          notes: song.notes
        });
      }

      return newSetlistId;
    } catch (error) {
      console.error('Error duplicating setlist:', error);
      return null;
    }
  }

  // Get setlist statistics
  async getSetlistStats(setlistId: string): Promise<{
    totalSongs: number;
    totalDuration: number;
    averageDuration: number;
    spotifyTracks: number;
  }> {
    try {
      const setlist = await this.getSetlist(setlistId);
      if (!setlist?.songs) {
        return { totalSongs: 0, totalDuration: 0, averageDuration: 0, spotifyTracks: 0 };
      }

      const totalSongs = setlist.songs.length;
      const totalDuration = setlist.songs.reduce((sum, song) => sum + (song.duration_sec || 0), 0);
      const averageDuration = totalSongs > 0 ? totalDuration / totalSongs : 0;
      const spotifyTracks = setlist.songs.filter(song => song.spotify_track_id).length;

      return {
        totalSongs,
        totalDuration,
        averageDuration,
        spotifyTracks
      };
    } catch (error) {
      console.error('Error calculating setlist stats:', error);
      return { totalSongs: 0, totalDuration: 0, averageDuration: 0, spotifyTracks: 0 };
    }
  }

  // Generate mock setlists for development
  private getMockSetlists(orgId: string): Setlist[] {
    return [
      {
        id: 'mock_setlist_1',
        org_id: orgId,
        name: 'Rock Night Setlist',
        description: 'High energy rock songs',
        is_template: false,
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z',
        songs: [
          {
            id: 'mock_song_1',
            title: 'Highway Star',
            artist: 'Deep Purple',
            duration_sec: 367,
            spotify_track_id: 'mock_track_1',
            position: 1,
            notes: 'Guitar solo at 3:15',
            created_at: '2024-12-01T10:00:00Z'
          },
          {
            id: 'mock_song_2',
            title: 'Smoke on the Water',
            artist: 'Deep Purple',
            duration_sec: 340,
            spotify_track_id: 'mock_track_2',
            position: 2,
            created_at: '2024-12-01T10:01:00Z'
          }
        ]
      },
      {
        id: 'mock_setlist_2',
        org_id: orgId,
        name: 'Acoustic Evening',
        description: 'Mellow acoustic songs',
        is_template: true,
        created_at: '2024-11-15T14:30:00Z',
        updated_at: '2024-11-15T14:30:00Z',
        songs: [
          {
            id: 'mock_song_3',
            title: 'Blackbird',
            artist: 'The Beatles',
            duration_sec: 136,
            position: 1,
            created_at: '2024-11-15T14:30:00Z'
          },
          {
            id: 'mock_song_4',
            title: 'Dust in the Wind',
            artist: 'Kansas',
            duration_sec: 205,
            position: 2,
            created_at: '2024-11-15T14:31:00Z'
          }
        ]
      }
    ];
  }
}

export const setlistService = new SetlistService();
export default setlistService;