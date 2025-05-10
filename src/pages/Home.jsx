import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

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
  
  const CheckInIcon = getIcon('LogIn');
  const PaymentIcon = getIcon('CreditCard');
  const BookingIcon = getIcon('Calendar');
  const NewMemberIcon = getIcon('UserPlus');
  const RefreshIcon = getIcon('RefreshCw');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-6 mb-20 md:mb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
          Dashboard
        </h1>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const StatIcon = getIcon(stat.icon);
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stat.id * 0.1 }}
              className="card group hover:border-primary transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1 text-surface-900 dark:text-white">{stat.value}</h3>
                  <p className={`text-xs mt-1 ${stat.change.includes('+') ? 'text-green-500' : stat.change.includes('-') ? 'text-red-500' : 'text-surface-500'}`}>
                    {stat.change} from last week
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