import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO, isWithinInterval, subDays } from 'date-fns';
import getIcon from '../utils/iconUtils';
import QuickActions from '../components/QuickActions';
import activityService from '../services/activityService';
import memberService from '../services/memberService';
import classScheduleService from '../services/classScheduleService';
import paymentService from '../services/paymentService';
import { setActivities } from '../store/slices/activitiesSlice';
import { setMembers } from '../store/slices/membersSlice';

export default function Home() {
  const [stats, setStats] = useState([
    { id: 1, title: 'Total Members', value: 0, change: '0%', icon: 'Users' },
    { id: 2, title: 'Today\'s Check-ins', value: 0, change: '0%', icon: 'LogIn' },
    { id: 3, title: 'Active Classes', value: 0, change: '0%', icon: 'Dumbbell' },
    { id: 4, title: 'Monthly Revenue', value: '$0', change: '0%', icon: 'DollarSign' },
  ]);
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateRange, setCurrentDateRange] = useState({
    startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    label: 'Last 7 Days'
  });
  
  const dispatch = useDispatch();
  const activities = useSelector(state => state.activities.activities);
  const members = useSelector(state => state.members.members);
  
  const CheckInIcon = getIcon('LogIn');
  const PaymentIcon = getIcon('CreditCard');
  const BookingIcon = getIcon('Calendar');
  const NewMemberIcon = getIcon('UserPlus');
  const RefreshIcon = getIcon('RefreshCw');

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch activities
        const activitiesData = await activityService.fetchActivities(10);
        dispatch(setActivities(activitiesData));
        
        // Fetch members
        const membersData = await memberService.fetchMembers();
        dispatch(setMembers(membersData));
        
        // Fetch upcoming classes
        const upcomingClasses = await classScheduleService.fetchUpcomingClasses();
        
        // Fetch recent payments
        const recentPayments = await paymentService.fetchRecentPayments();
        
        // Update stats
        const todayCheckIns = activitiesData.filter(
          activity => activity.type === 'check-in' && 
          activity.date === format(new Date(), 'yyyy-MM-dd')
        ).length;
        
        const monthlyPayments = recentPayments.reduce((total, payment) => {
          const paymentDate = parseISO(payment.date);
          const now = new Date();
          if (paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()) {
            return total + (parseFloat(payment.amount) || 0);
          }
          return total;
        }, 0);
        
        setStats([
          { id: 1, title: 'Total Members', value: membersData.length, change: '+5%', icon: 'Users' },
          { id: 2, title: 'Today\'s Check-ins', value: todayCheckIns, change: '+8%', icon: 'LogIn' },
          { id: 3, title: 'Active Classes', value: upcomingClasses.length, change: '0%', icon: 'Dumbbell' },
          { id: 4, title: 'Monthly Revenue', value: `$${monthlyPayments.toFixed(2)}`, change: '+15%', icon: 'DollarSign' },
        ]);
        
        // Format activities for display
        const formattedActivities = activitiesData.map(activity => {
          let memberName = 'Unknown Member';
          let time = 'Recent';
          
          // Find member name if this is a member activity
          if (activity.type === 'check-in' || activity.type === 'payment') {
            const activityName = activity.Name || '';
            const nameParts = activityName.split(' ');
            if (nameParts.length >= 2) {
              memberName = `${nameParts[0]} ${nameParts[1]}`;
            }
          }
          
          // Format relative time
          const activityDate = activity.date ? parseISO(activity.date) : new Date();
          const now = new Date();
          const diffMs = now - activityDate;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
            if (activity.time) {
              time = activity.time;
            } else {
              time = 'Today';
            }
          } else if (diffDays === 1) {
            time = 'Yesterday';
          } else {
            time = `${diffDays} days ago`;
          }
          
          return {
            id: activity.Id,
            type: activity.type,
            name: memberName,
            time: time,
            amount: activity.amount,
            className: activity.className,
            date: activity.date
          };
        });
        
        setRecentActivity(formattedActivities);
        
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [dispatch]);

  const handleDateRangeChange = (dateRange) => {
    setCurrentDateRange(dateRange);
    filterActivityByDateRange(dateRange);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Refresh all data
      const activitiesData = await activityService.fetchActivities(10);
      dispatch(setActivities(activitiesData));
      
      // Format activities for display
      const formattedActivities = activitiesData.map(activity => {
        let memberName = 'Unknown Member';
        let time = 'Recent';
        
        // Find member name if this is a member activity
        if (activity.type === 'check-in' || activity.type === 'payment') {
          const activityName = activity.Name || '';
          const nameParts = activityName.split(' ');
          if (nameParts.length >= 2) {
            memberName = `${nameParts[0]} ${nameParts[1]}`;
          }
        }
        
        // Format relative time
        const activityDate = activity.date ? parseISO(activity.date) : new Date();
        const now = new Date();
        const diffMs = now - activityDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          if (activity.time) {
            time = activity.time;
          } else {
            time = 'Today';
          }
        } else if (diffDays === 1) {
          time = 'Yesterday';
        } else {
          time = `${diffDays} days ago`;
        }
        
        return {
          id: activity.Id,
          type: activity.type,
          name: memberName,
          time: time,
          amount: activity.amount,
          className: activity.className,
          date: activity.date
        };
      });
      
      setRecentActivity(formattedActivities);
      filterActivityByDateRange(currentDateRange);
      
      toast.success("Dashboard data refreshed!");
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      toast.error("Failed to refresh dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
  
  const filterActivityByDateRange = (dateRange) => {
    if (!activities.length) return;
    
    const { startDate, endDate } = dateRange;
    const start = parseISO(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const filtered = activities.filter(activity => {
      if (!activity.date) return false;
      const activityDate = parseISO(activity.date);
      return isWithinInterval(activityDate, { start, end });
    });
    
    // Format activities for display
    const formattedActivities = filtered.map(activity => {
      let memberName = 'Unknown Member';
      let time = 'Recent';
      
      // Find member name if this is a member activity
      if (activity.type === 'check-in' || activity.type === 'payment') {
        const activityName = activity.Name || '';
        const nameParts = activityName.split(' ');
        if (nameParts.length >= 2) {
          memberName = `${nameParts[0]} ${nameParts[1]}`;
        }
      }
      
      // Format relative time
      const activityDate = activity.date ? parseISO(activity.date) : new Date();
      const now = new Date();
      const diffMs = now - activityDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        if (activity.time) {
          time = activity.time;
        } else {
          time = 'Today';
        }
      } else if (diffDays === 1) {
        time = 'Yesterday';
      } else {
        time = `${diffDays} days ago`;
      }
      
      return {
        id: activity.Id,
        type: activity.type,
        name: memberName,
        time: time,
        amount: activity.amount,
        className: activity.className,
        date: activity.date
      };
    });
    
    setRecentActivity(formattedActivities);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
            Dashboard
          </h1>
          <div className="flex items-center space-x-3">
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
      
      {/* Quick Actions Section */}
      <div className="mb-8">
        <QuickActions />
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
          <div className="card h-full">
            <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-white">Member Overview</h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Membership</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                      {members.slice(0, 5).map((member) => (
                        <tr key={member.Id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-surface-900 dark:text-white">
                              {member.firstName} {member.lastName}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.checkedIn 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-300'
                            }`}>
                              {member.checkedIn ? 'Checked In' : 'Not Checked In'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.membershipType === 'premium' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {member.membershipType === 'premium' ? 'Premium' : 'Standard'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-surface-500 dark:text-surface-400">
                            {member.expiryDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                  No members found. Add members to see them here.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <h3 className="text-lg font-semibold mb-4 text-surface-900 dark:text-white">Recent Activity</h3>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.length === 0 && (
                  <div className="text-center py-6 text-surface-500 dark:text-surface-400">
                    No activity found in the selected date range
                  </div>
                )}
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={activity.id || index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
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
                        {activity.type === 'payment' && `Made a payment of ${activity.amount || '$0.00'}`}
                        {activity.type === 'class-booking' && `Booked ${activity.className || 'a class'}`}
                        {activity.type === 'new-member' && 'Joined as a new member'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}