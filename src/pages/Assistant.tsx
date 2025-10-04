export default function Assistant() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground">ChordLine AI</h1>
          <p className="text-sm text-muted-foreground mt-1">Your intelligent band assistant</p>
        </div>
      </header>
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center py-16 text-muted-foreground">
          <p>Ask me anything about your band!</p>
          <p className="text-sm mt-1">Try: "We played at The Bluebird tonight for $600"</p>
        </div>
      </div>
    </div>
  );
}