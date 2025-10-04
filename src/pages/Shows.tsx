import { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, DollarSign, Users, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrg } from '@/contexts/OrgContext';

// Mock data for demonstration
interface Show {
  id: string;
  title: string;
  venue: {
    name: string;
    city: string;
    state: string;
  };
  date: string;
  time: string;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  ticketPrice?: number;
  expectedAttendance?: number;
  actualAttendance?: number;
  earnings?: number;
}

const mockShows: Show[] = [
  {
    id: '1',
    title: 'Friday Night Live',
    venue: { name: 'The Bluebird Cafe', city: 'Nashville', state: 'TN' },
    date: '2024-12-15',
    time: '20:00',
    status: 'confirmed',
    ticketPrice: 25,
    expectedAttendance: 150,
    earnings: 3750,
  },
  {
    id: '2',
    title: 'Saturday Night Show',
    venue: { name: 'Ryman Auditorium', city: 'Nashville', state: 'TN' },
    date: '2024-12-20',
    time: '19:30',
    status: 'planned',
    ticketPrice: 45,
    expectedAttendance: 300,
  },
  {
    id: '3',
    title: 'New Year\'s Eve Celebration',
    venue: { name: 'Grand Ole Opry', city: 'Nashville', state: 'TN' },
    date: '2024-12-31',
    time: '21:00',
    status: 'planned',
    ticketPrice: 75,
    expectedAttendance: 500,
  },
];

const getStatusColor = (status: Show['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'planned':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Shows() {
  const { currentOrg } = useOrg();
  const [shows] = useState<Show[]>(mockShows);
  const [filterStatus, setFilterStatus] = useState<'all' | Show['status']>('all');
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);

  const filteredShows = shows.filter(show => 
    filterStatus === 'all' || show.status === filterStatus
  );

  const sortedShows = [...filteredShows].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (!currentOrg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">Create a band first</p>
          <p className="text-sm text-muted-foreground">You need to create a band to manage shows</p>
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
              <h1 className="text-2xl font-bold text-foreground">Shows</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentOrg.name} performances
              </p>
            </div>
            <button
              onClick={() => setIsAddShowOpen(true)}
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

      {/* Filter Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4">
          <div className="flex space-x-4 py-2">
            {(['all', 'planned', 'confirmed', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-3 py-1 text-sm rounded-md capitalize transition-colors",
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {status === 'all' ? 'All Shows' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shows List */}
      <div className="max-w-md mx-auto px-4 py-6">
        {sortedShows.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              {filterStatus === 'all' ? 'No shows yet' : `No ${filterStatus} shows`}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first show to get started!
            </p>
            <button
              onClick={() => setIsAddShowOpen(true)}
              className={cn(
                "bg-primary text-primary-foreground px-4 py-2 rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary"
              )}
            >
              Add Your First Show
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedShows.map((show) => (
              <div key={show.id} className="bg-card border border-border rounded-lg p-4">
                {/* Show Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{show.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-md font-medium capitalize",
                        getStatusColor(show.status)
                      )}>
                        {show.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-accent rounded-md transition-colors">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-accent rounded-md transition-colors">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Show Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{show.venue.name}, {show.venue.city}, {show.venue.state}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(show.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{show.time}</span>
                    </div>
                  </div>

                  {show.ticketPrice && (
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>${show.ticketPrice} per ticket</span>
                      </div>
                      {show.expectedAttendance && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{show.expectedAttendance} expected</span>
                        </div>
                      )}
                    </div>
                  )}

                  {show.earnings && show.status === 'confirmed' && (
                    <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <p className="text-green-800 dark:text-green-100 font-medium">
                        Earned: ${show.earnings.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Show Modal Placeholder */}
      {isAddShowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddShowOpen(false)} />
          <div className="relative bg-card rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Add New Show</h2>
            <p className="text-muted-foreground mb-4">
              Show creation form would go here. This will include:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-6">
              <li>• Show title and description</li>
              <li>• Venue search with map integration</li>
              <li>• Date and time selection</li>
              <li>• Ticket pricing</li>
              <li>• Expected attendance</li>
            </ul>
            <button
              onClick={() => setIsAddShowOpen(false)}
              className={cn(
                "w-full bg-primary text-primary-foreground py-2 rounded-md",
                "hover:bg-primary/90 focus:outline-none focus:ring-2",
                "focus:ring-offset-2 focus:ring-primary"
              )}
            >
              Close (Form Coming Soon)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
