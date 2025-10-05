import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Configure React Query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed queries 2 times
      retry: 2,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // Use background refetch for better UX
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})

// Query keys for consistent caching
export const queryKeys = {
  shows: ['shows'] as const,
  show: (id: string) => ['shows', id] as const,
  earnings: ['earnings'] as const,
  earning: (id: string) => ['earnings', id] as const,
  venues: (query: string) => ['venues', query] as const,
  weather: (location: string) => ['weather', location] as const,
  bands: ['bands'] as const,
  band: (id: string) => ['bands', id] as const,
  profile: ['profile'] as const,
} as const

export { QueryClientProvider }