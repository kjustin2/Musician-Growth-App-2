import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import { OrgProvider } from '@/contexts/OrgContext';
import AuthGuard from '@/components/AuthGuard';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Shows from '@/pages/Shows';
import Earnings from '@/pages/Earnings';
import Assistant from '@/pages/Assistant';
import Integrations from '@/pages/Integrations';
import Profile from '@/pages/Profile';
import AuthPage from '@/pages/Auth';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<div>Loading...</div>} />
            
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
              <Route path="integrations" element={<Integrations />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
