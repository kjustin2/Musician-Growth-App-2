import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Calendar, DollarSign, MessageCircle, Settings, LogOut, User, Plug } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Home', icon: Home, href: '/' },
  { id: 'shows', label: 'Shows', icon: Calendar, href: '/shows' },
  { id: 'earnings', label: 'Earnings', icon: DollarSign, href: '/earnings' },
  { id: 'assistant', label: 'AI', icon: MessageCircle, href: '/assistant' },
  { id: 'integrations', label: 'Apps', icon: Plug, href: '/integrations' },
  { id: 'profile', label: 'Profile', icon: Settings, href: '/profile' },
];

export default function Layout() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with user info */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {profile?.full_name || profile?.email || 'User'}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.href;
            
            return (
              <Link
                key={tab.id}
                to={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full',
                  'text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5 mb-1', isActive && 'text-primary')} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}