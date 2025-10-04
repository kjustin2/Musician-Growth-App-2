export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and band</p>
        </div>
      </header>
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center py-16 text-muted-foreground">
          <p>Profile settings coming soon</p>
          <p className="text-sm mt-1">Band management and preferences</p>
        </div>
      </div>
    </div>
  );
}