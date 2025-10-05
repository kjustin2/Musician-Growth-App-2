import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'
import { Earning } from '@/types/database'
import React from 'react'

// Mock API functions (replace with actual API calls)
const fetchEarnings = async (): Promise<Earning[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // In production, this would be an actual API call
  const earnings: Earning[] = [
    {
      id: '1',
      band_id: '1',
      amount: 500.00,
      type: 'show',
      date: '2024-03-15',
      description: 'The Local Venue - Opening Act',
      show_id: '1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      band_id: '1',
      amount: 75.50,
      type: 'streaming',
      date: '2024-03-01',
      description: 'Spotify monthly royalties',
      show_id: null,
      created_at: '2024-01-20T14:00:00Z',
      updated_at: '2024-01-20T14:00:00Z'
    },
    {
      id: '3',
      band_id: '1',
      amount: 200.00,
      type: 'merchandise',
      date: '2024-02-28',
      description: 'T-shirt sales at show',
      show_id: null,
      created_at: '2024-01-25T16:00:00Z',
      updated_at: '2024-01-25T16:00:00Z'
    }
  ]
  
  return earnings
}

const createEarning = async (earningData: Omit<Earning, 'id' | 'created_at' | 'updated_at'>): Promise<Earning> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const newEarning: Earning = {
    ...earningData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  return newEarning
}

const updateEarning = async ({ id, ...updates }: Partial<Earning> & { id: string }): Promise<Earning> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const updatedEarning: Earning = {
    id,
    band_id: updates.band_id || '1',
    amount: updates.amount || 0,
    type: updates.type || 'other',
    date: updates.date || '',
    description: updates.description || '',
    show_id: updates.show_id || null,
    created_at: updates.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  return updatedEarning
}

const deleteEarning = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  // In production, this would delete from the database
}

// Custom hooks
export const useEarnings = () => {
  return useQuery({
    queryKey: queryKeys.earnings,
    queryFn: fetchEarnings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useEarning = (id: string) => {
  return useQuery({
    queryKey: queryKeys.earning(id),
    queryFn: () => fetchEarnings().then(earnings => earnings.find(e => e.id === id)),
    enabled: !!id,
  })
}

export const useCreateEarning = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createEarning,
    onSuccess: (newEarning) => {
      // Add the new earning to the cache
      queryClient.setQueryData<Earning[]>(queryKeys.earnings, (old) => {
        return old ? [...old, newEarning] : [newEarning]
      })
      
      // Invalidate earnings query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.earnings })
    },
    // Optimistic updates
    onMutate: async (newEarning) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.earnings })
      
      const previousEarnings = queryClient.getQueryData<Earning[]>(queryKeys.earnings)
      
      queryClient.setQueryData<Earning[]>(queryKeys.earnings, (old) => {
        const optimisticEarning: Earning = {
          ...newEarning,
          id: 'temp-' + Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        return old ? [...old, optimisticEarning] : [optimisticEarning]
      })
      
      return { previousEarnings }
    },
    onError: (err, newEarning, context) => {
      if (context?.previousEarnings) {
        queryClient.setQueryData<Earning[]>(queryKeys.earnings, context.previousEarnings)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.earnings })
    },
  })
}

export const useUpdateEarning = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateEarning,
    onSuccess: (updatedEarning) => {
      // Update the specific earning in cache
      queryClient.setQueryData(queryKeys.earning(updatedEarning.id), updatedEarning)
      
      // Update the earnings list
      queryClient.setQueryData<Earning[]>(queryKeys.earnings, (old) => {
        return old?.map(earning => 
          earning.id === updatedEarning.id ? updatedEarning : earning
        ) || [updatedEarning]
      })
    },
  })
}

export const useDeleteEarning = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteEarning,
    onSuccess: (_, deletedId) => {
      // Remove the earning from cache
      queryClient.setQueryData<Earning[]>(queryKeys.earnings, (old) => {
        return old?.filter(earning => earning.id !== deletedId) || []
      })
      
      // Remove the individual earning cache
      queryClient.removeQueries({ queryKey: queryKeys.earning(deletedId) })
    },
  })
}

// Utility hook for earnings statistics
export const useEarningsStats = () => {
  const { data: earnings, isLoading } = useEarnings()
  
  const stats = React.useMemo(() => {
    if (!earnings || earnings.length === 0) {
      return {
        totalEarnings: 0,
        monthlyEarnings: 0,
        showEarnings: 0,
        streamingEarnings: 0,
        merchandiseEarnings: 0,
        otherEarnings: 0,
      }
    }
    
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0)
    
    const monthlyEarnings = earnings
      .filter(earning => {
        const earningDate = new Date(earning.date)
        return earningDate.getMonth() === currentMonth && earningDate.getFullYear() === currentYear
      })
      .reduce((sum, earning) => sum + earning.amount, 0)
    
    const earningsByType = earnings.reduce((acc, earning) => {
      acc[earning.type] = (acc[earning.type] || 0) + earning.amount
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalEarnings,
      monthlyEarnings,
      showEarnings: earningsByType.show || 0,
      streamingEarnings: earningsByType.streaming || 0,
      merchandiseEarnings: earningsByType.merchandise || 0,
      otherEarnings: (earningsByType.lessons || 0) + (earningsByType.other || 0),
    }
  }, [earnings])
  
  return { stats, isLoading }
}

