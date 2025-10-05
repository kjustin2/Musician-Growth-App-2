import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'
import { Show } from '@/types/database'

// Mock API functions (replace with actual API calls)
const fetchShows = async (): Promise<Show[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // In production, this would be an actual API call
  const shows: Show[] = [
    {
      id: '1',
      band_id: '1',
      venue: 'The Local Venue',
      location: 'New York, NY',
      date: '2024-03-15',
      time: '20:00',
      status: 'scheduled',
      notes: 'Opening for The Headliners',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      band_id: '1',
      venue: 'Music Hall',
      location: 'Brooklyn, NY',
      date: '2024-03-22',
      time: '19:30',
      status: 'confirmed',
      notes: 'Acoustic set',
      created_at: '2024-01-20T14:00:00Z',
      updated_at: '2024-01-20T14:00:00Z'
    }
  ]
  
  return shows
}

const createShow = async (showData: Omit<Show, 'id' | 'created_at' | 'updated_at'>): Promise<Show> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const newShow: Show = {
    ...showData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  return newShow
}

const updateShow = async ({ id, ...updates }: Partial<Show> & { id: string }): Promise<Show> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const updatedShow: Show = {
    id,
    band_id: updates.band_id || '1',
    venue: updates.venue || '',
    location: updates.location || '',
    date: updates.date || '',
    time: updates.time || '',
    status: updates.status || 'scheduled',
    notes: updates.notes || '',
    created_at: updates.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  return updatedShow
}

const deleteShow = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  // In production, this would delete from the database
}

// Custom hooks
export const useShows = () => {
  return useQuery({
    queryKey: queryKeys.shows,
    queryFn: fetchShows,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useShow = (id: string) => {
  return useQuery({
    queryKey: queryKeys.show(id),
    queryFn: () => fetchShows().then(shows => shows.find(s => s.id === id)),
    enabled: !!id,
  })
}

export const useCreateShow = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createShow,
    onSuccess: (newShow) => {
      // Add the new show to the cache
      queryClient.setQueryData<Show[]>(queryKeys.shows, (old) => {
        return old ? [...old, newShow] : [newShow]
      })
      
      // Invalidate shows query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.shows })
    },
    // Optimistic updates
    onMutate: async (newShow) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.shows })
      
      const previousShows = queryClient.getQueryData<Show[]>(queryKeys.shows)
      
      queryClient.setQueryData<Show[]>(queryKeys.shows, (old) => {
        const optimisticShow: Show = {
          ...newShow,
          id: 'temp-' + Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        return old ? [...old, optimisticShow] : [optimisticShow]
      })
      
      return { previousShows }
    },
    onError: (err, newShow, context) => {
      if (context?.previousShows) {
        queryClient.setQueryData<Show[]>(queryKeys.shows, context.previousShows)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shows })
    },
  })
}

export const useUpdateShow = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateShow,
    onSuccess: (updatedShow) => {
      // Update the specific show in cache
      queryClient.setQueryData(queryKeys.show(updatedShow.id), updatedShow)
      
      // Update the shows list
      queryClient.setQueryData<Show[]>(queryKeys.shows, (old) => {
        return old?.map(show => 
          show.id === updatedShow.id ? updatedShow : show
        ) || [updatedShow]
      })
    },
  })
}

export const useDeleteShow = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteShow,
    onSuccess: (_, deletedId) => {
      // Remove the show from cache
      queryClient.setQueryData<Show[]>(queryKeys.shows, (old) => {
        return old?.filter(show => show.id !== deletedId) || []
      })
      
      // Remove the individual show cache
      queryClient.removeQueries({ queryKey: queryKeys.show(deletedId) })
    },
  })
}