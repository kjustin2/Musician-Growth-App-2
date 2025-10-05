import { useState, useEffect } from 'react';
import { serviceConfig } from '../lib/services/config';

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'unknown' | 'checking';
  latency?: number;
  error?: string;
}

interface HealthStatus {
  [key: string]: ServiceHealth;
}

export function DevHealthDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({});
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Only show this page in local mode
  if (!serviceConfig.isLocalMode) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🚫 Access Restricted</h1>
          <p className="text-gray-600">
            The health dashboard is only available in local development mode.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Current mode: {import.meta.env.VITE_APP_MODE || 'production'}
          </p>
        </div>
      </div>
    );
  }

  const checkServiceHealth = async (service: string, url: string): Promise<ServiceHealth> => {
    const start = Date.now();
    try {
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      } as RequestInit);
      
      const latency = Date.now() - start;
      
      if (response.ok) {
        return { status: 'healthy', latency };
      } else {
        return { 
          status: 'unhealthy', 
          latency, 
          error: `HTTP ${response.status}` 
        };
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runHealthChecks = async () => {
    setIsChecking(true);
    
    const services = [
      { name: 'Supabase', url: 'http://127.0.0.1:54321/health' },
      { name: 'Mock APIs', url: 'http://localhost:8080/health' },
      { name: 'OpenWeather', url: 'http://localhost:8081/health' },
      { name: 'Spotify', url: 'http://localhost:8082/health' },
      { name: 'Google Calendar', url: 'http://localhost:8083/health' },
      { name: 'OpenRouter', url: 'http://localhost:8084/health' },
      { name: 'Mapbox', url: 'http://localhost:8085/health' }
    ];

    // Set all services to checking state
    const checkingStatus: HealthStatus = {};
    services.forEach(service => {
      checkingStatus[service.name] = { status: 'checking' };
    });
    setHealthStatus(checkingStatus);

    // Check each service
    const results: HealthStatus = {};
    await Promise.all(
      services.map(async (service) => {
        results[service.name] = await checkServiceHealth(service.name, service.url);
      })
    );

    setHealthStatus(results);
    setIsChecking(false);
    setLastUpdate(new Date());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'unhealthy': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'unhealthy': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const restartService = async (serviceName: string) => {
    // This would typically call the local stack management script
    alert(`Restart functionality for ${serviceName} would be implemented here.\n\nFor now, please use:\nPowerShell scripts/local-stack.ps1 restart`);
  };

  const resetMockData = async () => {
    if (confirm('Are you sure you want to reset all mock data to defaults?')) {
      try {
        // This would call the database reset
        alert('Mock data reset would be implemented here.\n\nFor now, please use:\nnpm run local:reset');
      } catch (error) {
        alert('Error resetting mock data: ' + error);
      }
    }
  };

  useEffect(() => {
    runHealthChecks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(runHealthChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  const serviceUrls = serviceConfig.getServiceUrls();
  const healthyCount = Object.values(healthStatus).filter(s => s.status === 'healthy').length;
  const totalCount = Object.keys(healthStatus).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Local Stack Health Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage your Mode B local testing environment
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📊</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {healthyCount}/{totalCount}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🌐</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Mode</p>
                <p className="text-2xl font-semibold text-blue-600">Local</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⚡</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-2xl font-semibold ${healthyCount === totalCount ? 'text-green-600' : 'text-yellow-600'}`}>
                  {healthyCount === totalCount ? 'Healthy' : 'Issues'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={runHealthChecks}
              disabled={isChecking}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isChecking ? '🔄 Checking...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Service Status</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {Object.entries(healthStatus).map(([serviceName, health]) => (
              <div key={serviceName} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getStatusIcon(health.status)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{serviceName}</p>
                    <p className="text-sm text-gray-500">
                      {serviceUrls[serviceName.toLowerCase().replace(/\s+/g, '')] || 
                       serviceUrls[serviceName.toLowerCase()] || 
                       'URL not configured'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {health.latency && (
                    <span className="text-sm text-gray-500">
                      {health.latency}ms
                    </span>
                  )}
                  {health.error && (
                    <span className="text-sm text-red-500">
                      {health.error}
                    </span>
                  )}
                  <span className={`text-sm font-medium ${getStatusColor(health.status)}`}>
                    {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                  </span>
                  <button
                    onClick={() => restartService(serviceName)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Restart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🛠️ Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={resetMockData}
                className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                🔄 Reset Mock Data
              </button>
              <button
                onClick={() => window.open('http://localhost:54323', '_blank')}
                className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                🗄️ Open Supabase Studio
              </button>
              <button
                onClick={() => window.open('http://localhost:8080/health', '_blank')}
                className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                🧪 View Mock API Status
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Environment Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Mode:</span> {serviceConfig.isLocalMode ? 'Local' : 'Production'}
              </div>
              <div>
                <span className="font-medium">Supabase:</span> {serviceConfig.supabaseConfig.url}
              </div>
              <div>
                <span className="font-medium">Mock APIs:</span> localhost:8080-8085
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📚 Documentation</h3>
            <div className="space-y-2">
              <a
                href="/docs/LOCAL_TESTING.md"
                target="_blank"
                className="block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 bg-gray-100 hover:bg-gray-200 rounded"
              >
                📖 Local Testing Guide
              </a>
              <a
                href="https://supabase.com/docs"
                target="_blank"
                className="block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 bg-gray-100 hover:bg-gray-200 rounded"
              >
                📚 Supabase Docs
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Available commands:\n\n• PowerShell scripts/local-stack.ps1 start\n• PowerShell scripts/local-stack.ps1 stop\n• PowerShell scripts/local-stack.ps1 status\n• npm run dev:mock');
                }}
                className="block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 bg-gray-100 hover:bg-gray-200 rounded"
              >
                💻 CLI Commands
              </a>
            </div>
          </div>
        </div>

        {/* Test Data Preview */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">🧾 Mock Data Preview</h2>
            <p className="text-sm text-gray-500">Sample test data available in local mode</p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">👤 Test Users</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>demo@chordline.app</li>
                  <li>sarah.songwriter@music.com</li>
                  <li>mike.bassist@band.com</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🎵 Test Bands</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>The Midnight Echoes</li>
                  <li>Electric Sunrise</li>
                  <li>The Wandering Minstrels</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🏛️ Test Venues</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>The Bluebird Cafe</li>
                  <li>Mercury Lounge</li>
                  <li>Red Rocks Amphitheatre</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🎪 Mock APIs</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Weather Data</li>
                  <li>Spotify Tracks</li>
                  <li>AI Responses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Mode B Local Testing Environment • Musician Growth App</p>
          <p className="mt-1">
            Switch to production mode by changing VITE_APP_MODE in .env.local
          </p>
        </div>
      </div>
    </div>
  );
}