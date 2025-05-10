import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO, isWithinInterval } from 'date-fns';
import getIcon from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';
import DateRangeFilter from '../components/DateRangeFilter';

export default function Home() {
  const [stats, setStats] = useState([
    { id: 1, title: 'Total Members', value: 256, change: '+12%', icon: 'Users' },
    { id: 2, title: 'Today\'s Check-ins', value: 48, change: '+8%', icon: 'LogIn' },
    { id: 3, title: 'Active Classes', value: 12, change: '0%', icon: 'Dumbbell' },
    { id: 4, title: 'Monthly Revenue', value: '$12,650', change: '+15%', icon: 'DollarSign' },
  ]);
  
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'check-in', name: 'Emma Thompson', time: '10 minutes ago' },
    { id: 2, type: 'payment', name: 'John Davis', time: '25 minutes ago', amount: '$89.99' },
    { id: 3, type: 'class-booking', name: 'Sophia Lee', time: '1 hour ago', className: 'Power Yoga' },
    { id: 4, type: 'new-member', name: 'Michael Rodriguez', time: '2 hours ago' },
    { id: 5, type: 'check-in', name: 'Rebecca Wilson', time: '3 hours ago' }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateRange, setCurrentDateRange] = useState({
    startDate: format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    label: 'Last 7 Days'
  });
  
  // Save original data for filtering
  const [originalRecentActivity, setOriginalRecentActivity] = useState([]);
  
  const CheckInIcon = getIcon('LogIn');
  const PaymentIcon = getIcon('CreditCard');
  const BookingIcon = getIcon('Calendar');
  const NewMemberIcon = getIcon('UserPlus');
  const RefreshIcon = getIcon('RefreshCw');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Initialize with sample data - normally this would come from an API
      const sampleActivity = [
        { id: 1, type: 'check-in', name: 'Emma Thompson', time: '10 minutes ago', date: '2023-10-15' },
        { id: 2, type: 'payment', name: 'John Davis', time: '25 minutes ago', amount: '$89.99', date: '2023-10-15' },
        { id: 3, type: 'class-booking', name: 'Sophia Lee', time: '1 hour ago', className: 'Power Yoga', date: '2023-10-14' },
        { id: 4, type: 'new-member', name: 'Michael Rodriguez', time: '2 hours ago', date: '2023-10-13' },
        { id: 5, type: 'check-in', name: 'Rebecca Wilson', time: '3 hours ago', date: '2023-10-12' },
        { id: 6, type: 'payment', name: 'David Thompson', time: '1 day ago', amount: '$120.00', date: '2023-10-11' },
        { id: 7, type: 'class-booking', name: 'Jennifer Adams', time: '2 days ago', className: 'Spinning', date: '2023-10-10' },
        { id: 8, type: 'check-in', name: 'Robert Johnson', time: '3 days ago', date: '2023-10-09' },
        { id: 9, type: 'new-member', name: 'Sarah Mitchell', time: '4 days ago', date: '2023-10-08' },
        { id: 10, type: 'check-in', name: 'Thomas Wright', time: '5 days ago', date: '2023-10-07' }
      ];
      
      setOriginalRecentActivity(sampleActivity);
      filterActivityByDateRange(sampleActivity, currentDateRange);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (originalRecentActivity.length > 0) {
      filterActivityByDateRange(originalRecentActivity, currentDateRange);
    }
  }, [currentDateRange, originalRecentActivity]);

  const handleDateRangeChange = (dateRange) => {
    setCurrentDateRange(dateRange);
  };

  const refreshData = () => {
    setIsLoading(true);
    
    // Simulate refreshing data
    setTimeout(() => {
      // Update with "new" data
      const updatedStats = stats.map(stat => ({
        ...stat,
        value: stat.title === 'Today\'s Check-ins' 
          ? Math.floor(Math.random() * 10) + 48 
          : stat.value
      }));
      
      // Re-filter activity with current date range
      filterActivityByDateRange(originalRecentActivity, currentDateRange);
      setStats(updatedStats);
      setIsLoading(false);
      toast.success("Dashboard data refreshed!");
    }, 800);
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'check-in': return <CheckInIcon className="h-4 w-4 text-green-500" />;
      case 'payment': return <PaymentIcon className="h-4 w-4 text-blue-500" />;
      case 'class-booking': return <BookingIcon className="h-4 w-4 text-purple-500" />;
      case 'new-member': return <NewMemberIcon className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };
  
  const filterActivityByDateRange = (activities, dateRange) => {
    const { startDate, endDate } = dateRange;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    // Add one day to end date to make it inclusive
    end.setHours(23, 59, 59, 999);
    
    const filtered = activities.filter(activity => {
      const activityDate = parseISO(activity.date);
      return isWithinInterval(activityDate, { start, end });
    });
    
    setRecentActivity(filtered);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
            Dashboard
          </h1>
         <div className="flex items-center space-x-3">
            <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg transition-colors hover:bg-primary-dark disabled:opacity-70"
            >
              <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fadeIn">
        {stats.map((stat) => {
          const StatIcon = getIcon(stat.icon);
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stat.id * 0.1 }}
              className="group card hover:border-primary transition-colors duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{stat.value}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{stat.title}</p>
                  <p className={`text-xs mt-1 ${stat.change.includes('+') ? 'text-green-500' : stat.change.includes('-') ? 'text-red-500' : 'text-surface-500'}`}>
                    {stat.change} from previous period
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <StatIcon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main Feature */}
        <div className="lg:col-span-3">
          <MainFeature />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-white">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 && (
                <div className="text-center py-6 text-surface-500 dark:text-surface-400">
                  No activity found in the selected date range
                </div>
              )}
              {recentActivity.map((activity) => (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: activity.id * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-surface-100 dark:bg-surface-700">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-surface-900 dark:text-white">{activity.name}</p>
                      <span className="text-xs text-surface-500">{activity.time}</span>
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      {activity.type === 'check-in' && 'Checked in to the gym'}
                      {activity.type === 'payment' && `Made a payment of ${activity.amount}`}
                      {activity.type === 'class-booking' && `Booked ${activity.className} class`}
                      {activity.type === 'new-member' && 'Joined as a new member'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}