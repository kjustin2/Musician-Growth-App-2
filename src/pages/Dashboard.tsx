import { useState } from 'react';
import { Plus, Calendar, MessageCircle, CloudSun, Music2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrg } from '@/contexts/OrgContext';
import CreateOrgModal from '@/components/CreateOrgModal';

export default function Dashboard() {
  const { currentOrg, userOrgs, loading, switchOrg } = useOrg();
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no orgs, show create org prompt
  if (!currentOrg && userOrgs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <Music2 className="h-8 w-8 text-primary mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome to ChordLine!
          </h1>
          <p className="text-muted-foreground mb-6">
            Let's start by creating your band or music organization.
          </p>
          <button
            onClick={() => setIsCreateOrgOpen(true)}
            className={cn(
              "bg-primary text-primary-foreground px-6 py-3 rounded-md",
              "font-medium hover:bg-primary/90 focus:outline-none focus:ring-2",
              "focus:ring-offset-2 focus:ring-primary"
            )}
          >
            Create Your Band
          </button>
          <CreateOrgModal 
            isOpen={isCreateOrgOpen} 
            onClose={() => setIsCreateOrgOpen(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Organization Selector */}
          <div className="relative mb-4">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className={cn(
                "flex items-center justify-between w-full p-2",
                "bg-background border border-border rounded-md",
                "hover:bg-accent transition-colors"
              )}
            >
              <div className="flex items-center space-x-2">
                <Music2 className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {currentOrg?.name || 'Select Band'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            
            {isOrgDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10">
                {userOrgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrg(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-accent",
                      "first:rounded-t-md last:rounded-b-md",
                      currentOrg?.id === org.id && "bg-accent"
                    )}
                  >
                    <span className="font-medium">{org.name}</span>
                    {org.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {org.description}
                      </p>
                    )}
                  </button>
                ))}
                <div className="border-t border-border">
                  <button
                    onClick={() => {
                      setIsCreateOrgOpen(true);
                      setIsOrgDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-accent rounded-b-md text-primary"
                  >
                    + Create New Band
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back to {currentOrg?.name || 'ChordLine'}!
          </p>
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
      
      <CreateOrgModal 
        isOpen={isCreateOrgOpen} 
        onClose={() => setIsCreateOrgOpen(false)} 
      />
    </div>
  );
}
