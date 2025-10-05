import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Music, Plus, Filter, ChevronDown, ChevronUp, Edit, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrg } from '@/contexts/OrgContext';
import { supabase } from '@/services/supabase';
import AddEarningsModal from '@/components/AddEarningsModal';

interface EarningsRecord {
  id: string;
  date: string;
  type: 'show' | 'streaming' | 'merchandise' | 'lessons' | 'other';
  description: string | null;
  amount: number;
  currency: string;
  notes: string | null;
  show?: {
    id: string;
    title: string | null;
    venue: {
      name: string;
    };
  } | null;
}

const getTypeIcon = (type: EarningsRecord['type']) => {
  switch (type) {
    case 'show':
      return Music;
    case 'streaming':
      return TrendingUp;
    case 'merchandise':
      return DollarSign;
    case 'lessons':
      return Music;
    default:
      return DollarSign;
  }
};

const getTypeColor = (type: EarningsRecord['type']) => {
  switch (type) {
    case 'show':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'streaming':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'merchandise':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    case 'lessons':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
  }
};

export default function Earnings() {
  const { currentOrg } = useOrg();
  const [earnings, setEarnings] = useState<EarningsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'all' | EarningsRecord['type']>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddEarningOpen, setIsAddEarningOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Mock earnings data
  const mockEarnings: EarningsRecord[] = [
    {
      id: '1',
      date: '2024-12-15',
      type: 'show',
      description: 'Friday Night Live - The Bluebird Cafe',
      amount: 3750,
      currency: 'USD',
      notes: '150 tickets sold at $25 each',
      show: {
        id: 'show-1',
        title: 'Friday Night Live',
        venue: { name: 'The Bluebird Cafe' }
      }
    },
    {
      id: '2',
      date: '2024-12-10',
      type: 'streaming',
      description: 'Spotify Monthly Royalties',
      amount: 248.50,
      currency: 'USD',
      notes: '50,000 streams this month',
      show: null
    },
    {
      id: '3',
      date: '2024-12-08',
      type: 'merchandise',
      description: 'T-shirt and CD sales',
      amount: 425,
      currency: 'USD',
      notes: '15 t-shirts, 8 CDs sold at show',
      show: null
    },
    {
      id: '4',
      date: '2024-12-05',
      type: 'lessons',
      description: 'Guitar lessons',
      amount: 300,
      currency: 'USD',
      notes: '6 lessons at $50 each',
      show: null
    },
    {
      id: '5',
      date: '2024-12-01',
      type: 'show',
      description: 'Saturday Night Show - Ryman Auditorium',
      amount: 8500,
      currency: 'USD',
      notes: '200 tickets sold at $45 each minus venue fees',
      show: {
        id: 'show-2',
        title: 'Saturday Night Show',
        venue: { name: 'Ryman Auditorium' }
      }
    }
  ];

  // Fetch earnings from database or use mock data
  const fetchEarnings = async () => {
    if (!currentOrg) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (useMockData) {
        console.log('🧪 Mock: Loading earnings for', currentOrg.name);
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate loading
        setEarnings(mockEarnings);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('earnings')
        .select(`
          id,
          date,
          type,
          description,
          amount,
          currency,
          notes,
          show:shows(
            id,
            title,
            venue:venues(
              name
            )
          )
        `)
        .eq('org_id', currentOrg.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      
      setEarnings(data as any || []);
    } catch (err: any) {
      console.error('Error fetching earnings:', err);
      setError(err.message || 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [currentOrg]);

  const filteredEarnings = earnings.filter(earning => 
    filterType === 'all' || earning.type === filterType
  );

  const sortedEarnings = [...filteredEarnings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);
  
  // Calculate timeframe-specific totals
  const now = new Date();
  const getTimeframeTotal = (timeframe: 'week' | 'month' | 'year') => {
    const cutoff = new Date();
    switch (timeframe) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    return filteredEarnings
      .filter(earning => new Date(earning.date) >= cutoff)
      .reduce((sum, earning) => sum + earning.amount, 0);
  };

  const timeframeTotal = getTimeframeTotal(selectedTimeframe);

  if (!currentOrg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">Create a band first</p>
          <p className="text-sm text-muted-foreground">You need to create a band to track earnings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentOrg.name} revenue tracking
              </p>
            </div>
            <button
              onClick={() => setIsAddEarningOpen(true)}
              className={cn(
                "bg-primary text-primary-foreground p-2 rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary"
              )}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${totalEarnings.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  This {selectedTimeframe}
                </span>
              </div>
              <button
                onClick={() => {
                  const timeframes: ('week' | 'month' | 'year')[] = ['week', 'month', 'year'];
                  const currentIndex = timeframes.indexOf(selectedTimeframe);
                  const nextIndex = (currentIndex + 1) % timeframes.length;
                  setSelectedTimeframe(timeframes[nextIndex]);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${timeframeTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center space-x-2 text-sm text-muted-foreground",
              "hover:text-foreground transition-colors"
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filter by type</span>
            {showFilters ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
          
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(['all', 'show', 'streaming', 'merchandise', 'lessons', 'other'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md capitalize transition-colors",
                    filterType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground hover:bg-accent/80"
                  )}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Earnings List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <button
              onClick={fetchEarnings}
              className={cn(
                "px-4 py-2 bg-primary text-primary-foreground rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary"
              )}
            >
              Try Again
            </button>
          </div>
        ) : sortedEarnings.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              {filterType === 'all' ? 'No earnings yet' : `No ${filterType} earnings`}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first earnings record to get started!
            </p>
            <button
              onClick={() => setIsAddEarningOpen(true)}
              className={cn(
                "bg-primary text-primary-foreground px-4 py-2 rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary"
              )}
            >
              Add First Earning
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEarnings.map((earning) => {
              const IconComponent = getTypeIcon(earning.type);
              return (
                <div key={earning.id} className="bg-card border border-border rounded-lg p-4">
                  {/* Earning Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-md font-medium capitalize",
                          getTypeColor(earning.type)
                        )}>
                          {earning.type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {earning.description || 'Untitled earning'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(earning.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +${earning.amount.toLocaleString()}
                      </p>
                      <button className="mt-1 p-1 hover:bg-accent rounded-md transition-colors">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(earning.show || earning.notes) && (
                    <div className="text-sm space-y-1">
                      {earning.show && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Show:</span> {earning.show.title || earning.show.venue.name}
                        </p>
                      )}
                      {earning.notes && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Notes:</span> {earning.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Earning Modal */}
      {currentOrg && (
        <AddEarningsModal
          isOpen={isAddEarningOpen}
          onClose={() => setIsAddEarningOpen(false)}
          orgId={currentOrg.id}
          onEarningAdded={fetchEarnings}
        />
      )}
    </div>
  );
}
