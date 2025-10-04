import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Calendar, DollarSign, MessageCircle, Settings } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Home', icon: Home, href: '/' },
  { id: 'shows', label: 'Shows', icon: Calendar, href: '/shows' },
  { id: 'earnings', label: 'Earnings', icon: DollarSign, href: '/earnings' },
  { id: 'assistant', label: 'AI', icon: MessageCircle, href: '/assistant' },
  { id: 'profile', label: 'Profile', icon: Settings, href: '/profile' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
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