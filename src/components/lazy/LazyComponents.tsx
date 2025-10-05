import { lazy } from 'react'

// Lazy load dashboard pages
export const LazyDashboard = lazy(() => import('@/pages/Dashboard'))
export const LazyShows = lazy(() => import('@/pages/Shows'))
export const LazyEarnings = lazy(() => import('@/pages/Earnings'))
export const LazyProfile = lazy(() => import('@/pages/Profile'))
export const LazyIntegrations = lazy(() => import('@/pages/Integrations'))
export const LazyAssistant = lazy(() => import('@/pages/Assistant'))

// Lazy load complex components
export const LazyAddShowModal = lazy(() => import('@/components/AddShowModal'))
export const LazyAddEarningsModal = lazy(() => import('@/components/AddEarningsModal'))
export const LazyExportTools = lazy(() => import('@/components/integrations/ExportTools'))

// Lazy load analytics and charts (placeholder for future implementation)
// export const LazyEarningsChart = lazy(() => import('@/components/charts/EarningsChart'))
// export const LazyShowsChart = lazy(() => import('@/components/charts/ShowsChart'))

// Loading fallback component
export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
)

// Error boundary fallback
export const ComponentError = ({ error }: { error: Error }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 text-xl mb-4">⚠️</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-600 mb-4">Failed to load this component</p>
    <button 
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Reload page
    </button>
  </div>
)