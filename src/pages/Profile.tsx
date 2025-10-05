import { useState } from 'react';
import { User, Mail, Music2, Users, Settings, LogOut, Camera, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useOrg } from '@/contexts/OrgContext';
import { signOut, supabase } from '@/services/supabase';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const { currentOrg, userOrgs } = useOrg();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'account' | 'band'>('account');
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      if (useMockData) {
        console.log('🧪 Mock: Saving profile with display name:', displayName);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        console.log('🧪 Mock: Profile saved successfully');
        setIsSaving(false);
        return;
      }
      
      // Update user metadata with display name
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: displayName
        }
      });
      
      if (error) throw error;
      
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and band</p>
        </div>
      </header>
      
      {/* Tab Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4">
          <div className="flex space-x-4 py-2">
            <button
              onClick={() => setActiveTab('account')}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === 'account'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Account</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('band')}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === 'band'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <div className="flex items-center space-x-2">
                <Music2 className="h-4 w-4" />
                <span>Band</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'account' ? (
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-semibold text-foreground mb-4">Profile Picture</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full hover:bg-primary/90">
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Upload new photo</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max 2MB)</p>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="font-semibold text-foreground mb-4">Account Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className={cn(
                    "w-full px-3 py-2 border border-border rounded-md",
                    "bg-background text-foreground placeholder-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="flex items-center space-x-2 px-3 py-2 border border-border rounded-md bg-accent">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{user?.email}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className={cn(
                  "w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-semibold text-foreground mb-4">Account Actions</h2>
              <button
                onClick={handleSignOut}
                className={cn(
                  "w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md",
                  "bg-red-100 text-red-800 hover:bg-red-200",
                  "dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                )}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Band */}
            {currentOrg ? (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-foreground mb-4">Current Band</h2>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Music2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{currentOrg.name}</h3>
                    {currentOrg.description && (
                      <p className="text-sm text-muted-foreground">{currentOrg.description}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    className={cn(
                      "w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md",
                      "bg-accent text-accent-foreground hover:bg-accent/80",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Members</span>
                  </button>
                  <button
                    className={cn(
                      "w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md",
                      "bg-accent text-accent-foreground hover:bg-accent/80",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Band Settings</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Music2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">No band selected</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create or join a band to get started
                </p>
              </div>
            )}

            {/* All Bands */}
            {userOrgs.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-foreground mb-4">
                  Your Bands ({userOrgs.length})
                </h2>
                <div className="space-y-2">
                  {userOrgs.map((org) => (
                    <div
                      key={org.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md",
                        "border border-border",
                        currentOrg?.id === org.id ? "bg-primary/10" : "bg-background"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Music2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{org.name}</p>
                          {currentOrg?.id === org.id && (
                            <p className="text-xs text-primary">Active</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
