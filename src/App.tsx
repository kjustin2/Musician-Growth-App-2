import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import { OrgProvider } from '@/contexts/OrgContext';
import AuthGuard from '@/components/AuthGuard';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Shows from '@/pages/Shows';
import Earnings from '@/pages/Earnings';
import Assistant from '@/pages/Assistant';
import Profile from '@/pages/Profile';
import CalendarEmbed from '@/pages/CalendarEmbed';
import AuthPage from '@/pages/Auth';
import { DevHealthDashboard } from '@/pages/DevHealth';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<div>Loading...</div>} />
              
              {/* Development routes (local mode only) */}
              <Route path="/dev/health" element={<DevHealthDashboard />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <AuthGuard>
                  <OrgProvider>
                    <Layout />
                  </OrgProvider>
                </AuthGuard>
              }>
                <Route index element={<Dashboard />} />
                <Route path="shows" element={<Shows />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="assistant" element={<Assistant />} />
                <Route path="calendar/google" element={<CalendarEmbed />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
