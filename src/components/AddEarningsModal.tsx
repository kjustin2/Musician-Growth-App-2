import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/services/supabase';

interface AddEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  onEarningAdded?: () => void;
}

interface Show {
  id: string;
  title: string | null;
  date: string;
  venue: {
    name: string;
  };
}

export default function AddEarningsModal({ isOpen, onClose, orgId, onEarningAdded }: AddEarningsModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'show' | 'streaming' | 'merchandise' | 'lessons' | 'other'>('show');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showId, setShowId] = useState('');
  const [shows, setShows] = useState<Show[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch available shows for linking
  useEffect(() => {
    const fetchShows = async () => {
      if (!isOpen || !orgId) return;
      
      try {
        const { data, error: fetchError } = await supabase
          .from('shows')
          .select(`
            id,
            title,
            date,
            venue:venues(name)
          `)
          .eq('org_id', orgId)
          .order('date', { ascending: false })
          .limit(20);

        if (fetchError) throw fetchError;
        setShows(data as any || []);
      } catch (err) {
        console.error('Error fetching shows:', err);
      }
    };

    fetchShows();
  }, [isOpen, orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create earnings');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Create the earnings record
      const { error: earningsError } = await supabase
        .from('earnings')
        .insert({
          org_id: orgId,
          show_id: showId || null,
          amount: amountNum,
          currency: 'USD',
          type: type,
          description: description || null,
          date: date,
          notes: notes || null,
          created_by: user.id,
        });

      if (earningsError) throw earningsError;

      // Reset form and close
      setAmount('');
      setType('show');
      setDescription('');
      setDate('');
      setNotes('');
      setShowId('');
      onClose();
      
      if (onEarningAdded) {
        onEarningAdded();
      }
    } catch (err: any) {
      console.error('Error creating earning:', err);
      setError(err.message || 'Failed to create earning');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Add Earnings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Amount (USD) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
            >
              <option value="show">Show/Gig</option>
              <option value="streaming">Streaming Royalties</option>
              <option value="merchandise">Merchandise Sales</option>
              <option value="lessons">Lessons/Teaching</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Friday night performance"
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
            />
          </div>

          {/* Link to Show (Optional) */}
          {shows.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Music className="inline h-4 w-4 mr-1" />
                Link to Show (Optional)
              </label>
              <select
                value={showId}
                onChange={(e) => setShowId(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border border-border rounded-md",
                  "bg-background text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                )}
              >
                <option value="">None</option>
                {shows.map((show) => (
                  <option key={show.id} value={show.id}>
                    {show.title || show.venue.name} - {new Date(show.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "flex-1 px-4 py-2 border border-border rounded-md",
                "text-foreground hover:bg-accent",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSaving ? 'Adding...' : 'Add Earning'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
