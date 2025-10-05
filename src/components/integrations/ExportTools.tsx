import { useState } from 'react';
import { Download, FileText, Table, Calendar, DollarSign, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrg } from '@/contexts/OrgContext';

interface ExportToolsProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportType = 'shows' | 'earnings' | 'all';
type ExportFormat = 'csv' | 'json' | 'pdf';

export default function ExportTools({ isOpen, onClose }: ExportToolsProps) {
  const { currentOrg } = useOrg();
  const [exportType, setExportType] = useState<ExportType>('all');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<'all_time' | 'this_year' | 'last_year' | 'custom'>('this_year');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (useMockData) {
        // Generate mock export data
        console.log('🧪 Mock: Generating export data', { exportType, exportFormat, dateRange });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
        
        const mockData = generateMockExportData(exportType);
        downloadData(mockData, exportFormat, exportType);
      } else {
        // TODO: Implement real data export
        console.log('Real export not yet implemented');
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateMockExportData = (type: ExportType) => {
    const mockShows = [
      {
        id: 'show-1',
        title: 'Friday Night Live',
        date: '2024-12-14',
        time: '20:00',
        venue: 'The Bluebird Cafe',
        address: '4104 Hillsboro Pike, Nashville, TN',
        status: 'confirmed',
        earnings: 3750
      },
      {
        id: 'show-2', 
        title: 'Saturday Night Show',
        date: '2024-12-19',
        time: '19:30',
        venue: 'Ryman Auditorium',
        address: '116 Rep. John Lewis Way N, Nashville, TN',
        status: 'planned',
        earnings: 0
      },
      {
        id: 'show-3',
        title: 'New Year\'s Eve Celebration',
        date: '2024-12-30',
        time: '21:00',
        venue: 'Grand Ole Opry',
        address: '2804 Opryland Dr, Nashville, TN',
        status: 'planned',
        earnings: 0
      }
    ];

    const mockEarnings = [
      {
        id: 'earning-1',
        title: 'Friday Night Live - The Bluebird Cafe',
        amount: 3750,
        source: 'show',
        date: '2024-12-14',
        notes: '150 tickets sold at $25 each',
        show_id: 'show-1'
      },
      {
        id: 'earning-2',
        title: 'Spotify Monthly Royalties',
        amount: 248.5,
        source: 'streaming',
        date: '2024-12-09',
        notes: '50,000 streams this month'
      },
      {
        id: 'earning-3',
        title: 'T-shirt and CD sales',
        amount: 425,
        source: 'merchandise',
        date: '2024-12-07',
        notes: '15 t-shirts, 8 CDs sold at show'
      },
      {
        id: 'earning-4',
        title: 'Guitar lessons',
        amount: 300,
        source: 'lessons',
        date: '2024-12-04',
        notes: '6 lessons at $50 each'
      },
      {
        id: 'earning-5',
        title: 'Saturday Night Show - Ryman Auditorium',
        amount: 8500,
        source: 'show',
        date: '2024-11-30',
        notes: '200 tickets sold at $45 each minus venue fees'
      }
    ];

    switch (type) {
      case 'shows':
        return mockShows;
      case 'earnings':
        return mockEarnings;
      case 'all':
        return { shows: mockShows, earnings: mockEarnings };
      default:
        return [];
    }
  };

  const downloadData = (data: any, format: ExportFormat, type: ExportType) => {
    let content: string;
    let filename: string;
    let mimeType: string;

    const orgName = currentOrg?.name || 'ChordLine';
    const dateStr = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv':
        content = convertToCSV(data, type);
        filename = `${orgName.toLowerCase().replace(/\s+/g, '_')}_${type}_${dateStr}.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `${orgName.toLowerCase().replace(/\s+/g, '_')}_${type}_${dateStr}.json`;
        mimeType = 'application/json';
        break;
      case 'pdf':
        // For MVP, we'll just export JSON - PDF generation would need additional library
        content = JSON.stringify(data, null, 2);
        filename = `${orgName.toLowerCase().replace(/\s+/g, '_')}_${type}_${dateStr}.json`;
        mimeType = 'application/json';
        break;
      default:
        return;
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Close modal after successful download
    onClose();
  };

  const convertToCSV = (data: any, type: ExportType): string => {
    if (type === 'all') {
      // Combine shows and earnings into separate sections
      const showsCSV = convertArrayToCSV(data.shows, ['id', 'title', 'date', 'time', 'venue', 'address', 'status', 'earnings']);
      const earningsCSV = convertArrayToCSV(data.earnings, ['id', 'title', 'amount', 'source', 'date', 'notes']);
      return `SHOWS\n${showsCSV}\n\nEARNINGS\n${earningsCSV}`;
    } else if (type === 'shows') {
      return convertArrayToCSV(data, ['id', 'title', 'date', 'time', 'venue', 'address', 'status', 'earnings']);
    } else if (type === 'earnings') {
      return convertArrayToCSV(data, ['id', 'title', 'amount', 'source', 'date', 'notes']);
    }
    return '';
  };

  const convertArrayToCSV = (array: any[], headers: string[]): string => {
    if (!array.length) return '';
    
    const csvHeaders = headers.join(',');
    const csvRows = array.map(item => 
      headers.map(header => {
        const value = item[header] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Export Data</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              What to export
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Data', icon: FileText, desc: 'Shows and earnings together' },
                { value: 'shows', label: 'Shows Only', icon: Calendar, desc: 'Performance history' },
                { value: 'earnings', label: 'Earnings Only', icon: DollarSign, desc: 'Revenue data' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExportType(option.value as ExportType)}
                  className={cn(
                    "w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                    exportType === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <option.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Export format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'csv', label: 'CSV', desc: 'Spreadsheet' },
                { value: 'json', label: 'JSON', desc: 'Data file' },
                { value: 'pdf', label: 'PDF', desc: 'Report' }
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value as ExportFormat)}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-colors",
                    exportFormat === format.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs text-muted-foreground">{format.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Date range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all_time">All time</option>
              <option value="this_year">This year</option>
              <option value="last_year">Last year</option>
              <option value="custom">Custom range</option>
            </select>

            {dateRange === 'custom' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">From</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">To</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}