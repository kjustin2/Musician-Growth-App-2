import { useState } from 'react';
import { X, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/services/supabase';

interface AddShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  onShowAdded?: () => void;
}

export default function AddShowModal({ isOpen, onClose, orgId, onShowAdded }: AddShowModalProps) {
  const [title, setTitle] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueState, setVenueState] = useState('');
  const [venueCountry, setVenueCountry] = useState('USA');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<'planned' | 'confirmed' | 'completed' | 'cancelled'>('planned');
  const [notes, setNotes] = useState('');
  const [includeEarnings, setIncludeEarnings] = useState(false);
  const [earningsAmount, setEarningsAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create a show');
      }

      // First, create or find the venue
      let venueId: string;
      
      // Check if venue already exists
      const { data: existingVenues } = await supabase
        .from('venues')
        .select('id')
        .eq('name', venueName)
        .eq('city', venueCity)
        .limit(1);

      if (existingVenues && existingVenues.length > 0) {
        venueId = existingVenues[0].id;
      } else {
        // Create new venue
        const { data: newVenue, error: venueError } = await supabase
          .from('venues')
          .insert({
            name: venueName,
            address: venueAddress,
            city: venueCity,
            state: venueState,
            country: venueCountry,
          })
          .select()
          .single();

        if (venueError) throw venueError;
        venueId = newVenue.id;
      }

      // Create the show
      const { data: newShow, error: showError } = await supabase
        .from('shows')
        .insert({
          org_id: orgId,
          venue_id: venueId,
          title: title || null,
          date: date,
          time: time || null,
          status: status,
          notes: notes || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (showError) throw showError;

      // If earnings are included, create the earnings record
      if (includeEarnings && earningsAmount && parseFloat(earningsAmount) > 0) {
        const { error: earningsError } = await supabase
          .from('earnings')
          .insert({
            show_id: newShow.id,
            org_id: orgId,
            amount: parseFloat(earningsAmount),
            currency: 'USD',
            type: 'show',
            description: `Earnings from ${venueName}`,
            date: date,
            created_by: user.id,
          });

        if (earningsError) throw earningsError;
      }

      // Reset form and close
      setTitle('');
      setVenueName('');
      setVenueAddress('');
      setVenueCity('');
      setVenueState('');
      setDate('');
      setTime('');
      setNotes('');
      setIncludeEarnings(false);
      setEarningsAmount('');
      onClose();
      
      if (onShowAdded) {
        onShowAdded();
      }
    } catch (err: any) {
      console.error('Error creating show:', err);
      setError(err.message || 'Failed to create show');
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
          <h2 className="text-lg font-semibold text-foreground">Add New Show</h2>
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

          {/* Show Title (Optional) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Show Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Friday Night Live"
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
            />
          </div>

          {/* Venue Information */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              <MapPin className="inline h-4 w-4 mr-1" />
              Venue Information
            </label>
            
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Venue Name *"
              required
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
            />

            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Street Address *"
              required
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                placeholder="City *"
                required
                className={cn(
                  "w-full px-3 py-2 border border-border rounded-md",
                  "bg-background text-foreground placeholder-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                )}
              />

              <input
                type="text"
                value={venueState}
                onChange={(e) => setVenueState(e.target.value)}
                placeholder="State"
                className={cn(
                  "w-full px-3 py-2 border border-border rounded-md",
                  "bg-background text-foreground placeholder-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                )}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border border-border rounded-md",
                  "bg-background text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                )}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
            >
              <option value="planned">Planned</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

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

          {/* Earnings Toggle */}
          <div className="border-t border-border pt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEarnings}
                onChange={(e) => setIncludeEarnings(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm font-medium text-foreground">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Add Earnings
              </span>
            </label>

            {includeEarnings && (
              <div className="mt-3">
                <input
                  type="number"
                  value={earningsAmount}
                  onChange={(e) => setEarningsAmount(e.target.value)}
                  placeholder="Amount (USD)"
                  step="0.01"
                  min="0"
                  className={cn(
                    "w-full px-3 py-2 border border-border rounded-md",
                    "bg-background text-foreground placeholder-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  )}
                />
              </div>
            )}
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
              {isSaving ? 'Creating...' : 'Create Show'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
