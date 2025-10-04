import { Plus, Calendar, MessageCircle, CloudSun } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground">ChordLine</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back!</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Next Show Card */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Next Show</h2>
            <CloudSun className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No upcoming shows</p>
            <p className="text-sm">Add your first show to get started!</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Quick Actions</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <button className={cn(
              'flex items-center gap-3 p-4 bg-card border border-border rounded-lg',
              'text-left transition-colors hover:bg-accent'
            )}>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Log a Show</p>
                <p className="text-sm text-muted-foreground">Add a new performance</p>
              </div>
            </button>

            <button className={cn(
              'flex items-center gap-3 p-4 bg-card border border-border rounded-lg',
              'text-left transition-colors hover:bg-accent'
            )}>
              <div className="bg-primary/10 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Ask ChordLine AI</p>
                <p className="text-sm text-muted-foreground">Get smart suggestions</p>
              </div>
            </button>

            <button className={cn(
              'flex items-center gap-3 p-4 bg-card border border-border rounded-lg',
              'text-left transition-colors hover:bg-accent'
            )}>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Import Calendar</p>
                <p className="text-sm text-muted-foreground">Sync from Google Calendar</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}