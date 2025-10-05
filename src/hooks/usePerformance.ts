import { useEffect, useRef } from 'react'

// Hook for measuring component render time
export const useRenderTime = (componentName: string) => {
  const renderStartTime = useRef<number>()
  
  useEffect(() => {
    renderStartTime.current = performance.now()
  })
  
  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current
      console.log(`⚡ ${componentName} rendered in ${renderTime.toFixed(2)}ms`)
    }
  })
}

// Hook for measuring first contentful paint
export const useFirstContentfulPaint = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`)
        }
      }
    })
    
    observer.observe({ entryTypes: ['paint'] })
    
    return () => observer.disconnect()
  }, [])
}

// Hook for measuring Core Web Vitals
export const useCoreWebVitals = () => {
  useEffect(() => {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`📊 LCP: ${entry.startTime.toFixed(2)}ms`)
      }
    })
    
    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`⚡ FID: ${(entry as any).processingStart - entry.startTime}ms`)
      }
    })
    
    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          console.log(`🔄 CLS: ${(entry as any).value}`)
        }
      }
    })
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      fidObserver.observe({ entryTypes: ['first-input'] })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('Performance API not fully supported in this browser')
    }
    
    return () => {
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])
}

// Hook for memory usage monitoring
export const useMemoryMonitor = () => {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log(`🧠 Memory Usage:`, {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
        })
      }
    }
    
    // Check memory every 30 seconds
    const interval = setInterval(checkMemory, 30000)
    checkMemory() // Check once immediately
    
    return () => clearInterval(interval)
  }, [])
}

// Hook for network monitoring
export const useNetworkMonitor = () => {
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      console.log(`📡 Network:`, {
        effectiveType: connection.effectiveType,
        downlink: `${connection.downlink} Mbps`,
        rtt: `${connection.rtt}ms`,
        saveData: connection.saveData
      })
      
      const handleConnectionChange = () => {
        console.log(`📡 Network changed:`, {
          effectiveType: connection.effectiveType,
          downlink: `${connection.downlink} Mbps`
        })
      }
      
      connection.addEventListener('change', handleConnectionChange)
      
      return () => {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])
}

// Bundle analyzer helper (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📦 Bundle Analysis:')
    console.log('Run `npm run build && npm run analyze` to see bundle size breakdown')
  }
}

// Performance budget checker
export const checkPerformanceBudget = (metrics: {
  renderTime?: number
  loadTime?: number
  bundleSize?: number
}) => {
  const budgets = {
    renderTime: 16, // Target 60fps (16ms per frame)
    loadTime: 1000, // 1 second
    bundleSize: 250 * 1024 // 250KB
  }
  
  const warnings = []
  
  if (metrics.renderTime && metrics.renderTime > budgets.renderTime) {
    warnings.push(`⚠️ Render time (${metrics.renderTime}ms) exceeds budget (${budgets.renderTime}ms)`)
  }
  
  if (metrics.loadTime && metrics.loadTime > budgets.loadTime) {
    warnings.push(`⚠️ Load time (${metrics.loadTime}ms) exceeds budget (${budgets.loadTime}ms)`)
  }
  
  if (metrics.bundleSize && metrics.bundleSize > budgets.bundleSize) {
    warnings.push(`⚠️ Bundle size (${metrics.bundleSize} bytes) exceeds budget (${budgets.bundleSize} bytes)`)
  }
  
  if (warnings.length > 0) {
    console.warn('Performance Budget Violations:')
    warnings.forEach(warning => console.warn(warning))
  } else {
    console.log('✅ All performance budgets met')
  }
}