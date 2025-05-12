import { useState } from 'react';
import getIcon from '../utils/iconUtils';

export default function DateRangeFilter({ onDateRangeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('last7days');
  
  const CalendarIcon = getIcon('Calendar');
  const ChevronDownIcon = getIcon('ChevronDown');
  
  const dateRanges = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' }
  ];
  
  const handleRangeSelect = (rangeId) => {
    setSelectedRange(rangeId);
    
    const now = new Date();
    let startDate, endDate;
    
    switch (rangeId) {
      case 'today':
        startDate = now;
        endDate = now;
        break;
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        endDate = new Date(startDate);
        break;
      case 'last7days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        endDate = now;
        break;
      case 'last30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        endDate = now;
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        endDate = now;
    }
    
    // Format dates to ISO string and get only the date part
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    onDateRangeChange({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      label: dateRanges.find(r => r.id === rangeId).label
    });
    
    setIsOpen(false);
  };
  
  const getCurrentRangeLabel = () => {
    const range = dateRanges.find(r => r.id === selectedRange);
    return range ? range.label : 'Select Date Range';
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
      >
        <CalendarIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{getCurrentRangeLabel()}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-lg overflow-hidden z-10 border border-surface-200 dark:border-surface-700">
          <div className="p-2">
            {dateRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => handleRangeSelect(range.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedRange === range.id 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}