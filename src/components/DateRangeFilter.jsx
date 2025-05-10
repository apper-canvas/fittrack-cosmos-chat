import { useState, useRef, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import getIcon from '../utils/iconUtils';

export default function DateRangeFilter({ onDateRangeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('last7Days');
  const [customRange, setCustomRange] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const dropdownRef = useRef(null);
  
  const CalendarIcon = getIcon('Calendar');
  const ChevronDownIcon = getIcon('ChevronDown');
  const CheckIcon = getIcon('Check');

  const ranges = [
    { id: 'today', label: 'Today' },
    { id: 'last7Days', label: 'Last 7 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'custom', label: 'Custom Range' }
  ];

  // Calculate date range based on selection
  useEffect(() => {
    const now = new Date();
    let startDate, endDate;
    
    switch(selectedRange) {
      case 'today':
        startDate = format(now, 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
        break;
      case 'last7Days':
        startDate = format(subDays(now, 6), 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
        break;
      case 'thisMonth':
        startDate = format(startOfMonth(now), 'yyyy-MM-dd');
        endDate = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        startDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        endDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case 'custom':
        startDate = customRange.startDate;
        endDate = customRange.endDate;
        break;
      default:
        startDate = format(subDays(now, 6), 'yyyy-MM-dd');
        endDate = format(now, 'yyyy-MM-dd');
    }
    
    onDateRangeChange({ startDate, endDate, label: getRangeLabel(selectedRange) });
  }, [selectedRange, customRange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleRangeSelect = (rangeId) => {
    setSelectedRange(rangeId);
    if (rangeId !== 'custom') {
      setIsOpen(false);
    }
  };
  
  const handleCustomDateChange = (e, field) => {
    setCustomRange({
      ...customRange,
      [field]: e.target.value
    });
  };

  function getRangeLabel(rangeId) {
    return ranges.find(r => r.id === rangeId)?.label || 'Custom';
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg text-surface-700 dark:text-surface-300 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Select date range"
      >
        <CalendarIcon className="h-4 w-4" />
        <span>{getRangeLabel(selectedRange)}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-10">
          <div className="p-2">
            {ranges.map((range) => (
              <div key={range.id} className="mb-1 last:mb-0">
                <button
                  onClick={() => handleRangeSelect(range.id)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${selectedRange === range.id ? 'bg-primary/10 text-primary' : 'hover:bg-surface-100 dark:hover:bg-surface-700'}`}
                >
                  {range.label}
                  {selectedRange === range.id && <CheckIcon className="h-4 w-4" />}
                </button>
                
                {selectedRange === 'custom' && range.id === 'custom' && (
                  <div className="px-3 py-2 space-y-2">
                    <input type="date" value={customRange.startDate} onChange={(e) => handleCustomDateChange(e, 'startDate')} className="w-full px-2 py-1 text-sm rounded border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700" />
                    <input type="date" value={customRange.endDate} onChange={(e) => handleCustomDateChange(e, 'endDate')} className="w-full px-2 py-1 text-sm rounded border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}