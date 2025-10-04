export default function Earnings() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your income</p>
        </div>
      </header>
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center py-16 text-muted-foreground">
          <p>No earnings yet</p>
          <p className="text-sm mt-1">Add earnings from your shows to see them here!</p>
        </div>
      </div>
    </div>
  );
}