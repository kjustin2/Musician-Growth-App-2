import React, { useState } from 'react';
import { X, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrg } from '@/contexts/OrgContext';

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateOrgModal({ isOpen, onClose }: CreateOrgModalProps) {
  const { createOrg } = useOrg();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      await createOrg(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating org:', error);
      setError('Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Create Your Band
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="band-name" 
              className="block text-sm font-medium text-foreground mb-2"
            >
              Band Name *
            </label>
            <input
              id="band-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
              placeholder="Enter your band name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label 
              htmlFor="band-description" 
              className="block text-sm font-medium text-foreground mb-2"
            >
              Description (optional)
            </label>
            <textarea
              id="band-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(
                "w-full px-3 py-2 border border-border rounded-md",
                "bg-background text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              )}
              placeholder="Tell us about your band..."
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "flex-1 px-4 py-2 border border-border rounded-md",
                "bg-background text-foreground text-sm font-medium",
                "hover:bg-accent focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary"
              )}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={cn(
                "flex-1 px-4 py-2 border border-transparent rounded-md",
                "bg-primary text-primary-foreground text-sm font-medium",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              ) : (
                'Create Band'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}