import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import getIcon from '../utils/iconUtils';
import memberService from '../services/memberService';
import paymentService from '../services/paymentService';
import activityService from '../services/activityService';
import { setMembers } from '../store/slices/membersSlice';
import { setPayments } from '../store/slices/paymentsSlice';
import { setActivities } from '../store/slices/activitiesSlice';
import Chart from 'react-apexcharts';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [membershipData, setMembershipData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  
  const dispatch = useDispatch();
  const members = useSelector(state => state.members.members);
  const payments = useSelector(state => state.payments.payments);
  const activities = useSelector(state => state.activities.activities);
  
  const BarChartIcon = getIcon('BarChart');
  const UsersIcon = getIcon('Users');
  const ActivityIcon = getIcon('Activity');
  const RefreshIcon = getIcon('RefreshCw');
  const CalendarIcon = getIcon('Calendar');
  const DollarSignIcon = getIcon('DollarSign');
  
  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data needed for reports
        const membersData = await memberService.fetchMembers();
        const paymentsData = await paymentService.fetchPayments();
        const activitiesData = await activityService.fetchActivities(100);
        
        dispatch(setMembers(membersData));
        dispatch(setPayments(paymentsData));
        dispatch(setActivities(activitiesData));
        
        // Process data for reports based on the selected date range
        processReportData(membersData, paymentsData, activitiesData, dateRange);
      } catch (error) {
        console.error("Failed to load report data:", error);
        toast.error("Failed to load report data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReportData();
  }, [dispatch, dateRange]);
  
  const processReportData = (membersData, paymentsData, activitiesData, range) => {
    let startDate, endDate;
    const now = new Date();
    
    // Determine date range
    switch (range) {
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case '3months':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
    
    // Process revenue data
    processRevenueData(paymentsData, startDate, endDate, range);
    
    // Process membership data
    processMembershipData(membersData, activitiesData);
    
    // Process activity data
    processActivityData(activitiesData, startDate, endDate, range);
  };
  
  const processRevenueData = (paymentsData, startDate, endDate, range) => {
    // Filter payments within the date range
    const filteredPayments = paymentsData.filter(payment => {
      if (!payment.date) return false;
      const paymentDate = parseISO(payment.date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
    
    // Group payments by date (day or month depending on range)
    const groupedPayments = filteredPayments.reduce((acc, payment) => {
      if (!payment.date) return acc;
      
      const paymentDate = parseISO(payment.date);
      const dateKey = range === 'year' ?
        format(paymentDate, 'MMM') : // Group by month for yearly view
        format(paymentDate, 'MMM d'); // Group by day for monthly view
      
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      
      acc[dateKey] += Number(payment.amount) || 0;
      return acc;
    }, {});
    
    // Convert to array format for ApexCharts
    const labels = Object.keys(groupedPayments);
    const values = Object.values(groupedPayments);
    
    setRevenueData({
      labels,
      series: [
        {
          name: 'Revenue',
          data: values
        }
      ]
    });
  };
  
  const processMembershipData = (membersData) => {
    // Count members by membership type
    const membershipCounts = membersData.reduce((acc, member) => {
      const type = member.membershipType || 'standard';
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {});
    
    // Convert to array format for ApexCharts
    const labels = Object.keys(membershipCounts).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    );
    const values = Object.values(membershipCounts);
    
    setMembershipData({
      labels,
      series: values
    });
  };
  
  const processActivityData = (activitiesData, startDate, endDate, range) => {
    // Filter activities within the date range
    const filteredActivities = activitiesData.filter(activity => {
      if (!activity.date) return false;
      const activityDate = parseISO(activity.date);
      return activityDate >= startDate && activityDate <= endDate;
    });
    
    // Count activities by type
    const activityCounts = filteredActivities.reduce((acc, activity) => {
      const type = activity.type || 'other';
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {});
    
    // Convert to array format for ApexCharts
    const labels = Object.keys(activityCounts).map(type => {
      switch (type) {
        case 'check-in': return 'Check-ins';
        case 'payment': return 'Payments';
        case 'class-booking': return 'Class Bookings';
        case 'new-member': return 'New Members';
        default: return type.charAt(0).toUpperCase() + type.slice(1);
      }
    });
    const values = Object.values(activityCounts);
    
    setActivityData({
      labels,
      series: values
    });
  };
  
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Fetch fresh data
      const membersData = await memberService.fetchMembers();
      const paymentsData = await paymentService.fetchPayments();
      const activitiesData = await activityService.fetchActivities(100);
      
      dispatch(setMembers(membersData));
      dispatch(setPayments(paymentsData));
      dispatch(setActivities(activitiesData));
      
      // Process data for reports based on the selected date range
      processReportData(membersData, paymentsData, activitiesData, dateRange);
      
      toast.success("Report data refreshed!");
    } catch (error) {
      console.error("Failed to refresh report data:", error);
      toast.error("Failed to refresh report data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };
  
  // Chart options
  const revenueChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
      fontFamily: 'Inter, sans-serif'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 2
    },
    grid: {
      row: {
        colors: ['transparent', 'transparent']
      }
    },
    xaxis: {
      categories: revenueData.labels || [],
      labels: {
        style: {
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Revenue ($)',
        style: {
          fontFamily: 'Inter, sans-serif'
        }
      },
      labels: {
        formatter: function (val) {
          return '$' + val.toFixed(0);
        },
        style: {
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '$' + val.toFixed(2);
        }
      }
    },
    colors: ['#3b82f6'], // primary color
    theme: {
      mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
  };
  
  const membershipChartOptions = {
    chart: {
      type: 'donut',
      height: 350,
      fontFamily: 'Inter, sans-serif'
    },
    labels: membershipData.labels || [],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    colors: ['#3b82f6', '#10b981'], // primary and secondary colors
    theme: {
      mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
  };
  
  const activityChartOptions = {
    chart: {
      type: 'pie',
      height: 350,
      fontFamily: 'Inter, sans-serif'
    },
    labels: activityData.labels || [],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'], // secondary, primary, accent, yellow
    theme: {
      mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
            Reports & Analytics
          </h1>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={handleDateRangeChange}
                className="pr-10 pl-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 appearance-none"
              >
                <option value="month">This Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">This Year</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-surface-400" />
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg transition-colors hover:bg-surface-200 dark:hover:bg-surface-600 disabled:opacity-70"
            >
              <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>
        </div>
        
        {/* Report navigation tabs */}
        <div className="flex border-b border-surface-200 dark:border-surface-700 mb-6 overflow-x-auto scrollbar-hide">
          <button
            className={`px-4 py-2 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap
                       ${activeTab === 'revenue' 
                           ? 'text-primary border-b-2 border-primary' 
                           : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'}`}
            onClick={() => setActiveTab('revenue')}
          >
            <DollarSignIcon className="h-4 w-4" />
            <span>Revenue Analysis</span>
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap
                       ${activeTab === 'membership' 
                           ? 'text-primary border-b-2 border-primary' 
                           : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'}`}
            onClick={() => setActiveTab('membership')}
          >
            <UsersIcon className="h-4 w-4" />
            <span>Membership Distribution</span>
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors flex items-center space-x-2 whitespace-nowrap
                       ${activeTab === 'activity' 
                           ? 'text-primary border-b-2 border-primary' 
                           : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'}`}
            onClick={() => setActiveTab('activity')}
          >
            <ActivityIcon className="h-4 w-4" />
            <span>Activity Breakdown</span>
          </button>
        </div>
        
        {/* Report content */}
        <div className="card">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div>
              {activeTab === 'revenue' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-surface-900 dark:text-white flex items-center">
                    <DollarSignIcon className="h-5 w-5 mr-2 text-primary" />
                    Revenue Analysis
                  </h2>
                  
                  {revenueData.labels && revenueData.labels.length > 0 ? (
                    <div className="mt-6">
                      <Chart
                        options={revenueChartOptions}
                        series={revenueData.series}
                        type="bar"
                        height={350}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-10 text-surface-500 dark:text-surface-400">
                      No revenue data available for the selected period.
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'membership' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-surface-900 dark:text-white flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2 text-primary" />
                    Membership Distribution
                  </h2>
                  
                  {membershipData.labels && membershipData.labels.length > 0 ? (
                    <div className="mt-6">
                      <Chart
                        options={membershipChartOptions}
                        series={membershipData.series}
                        type="donut"
                        height={350}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-10 text-surface-500 dark:text-surface-400">
                      No membership data available.
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-surface-900 dark:text-white flex items-center">
                    <ActivityIcon className="h-5 w-5 mr-2 text-primary" />
                    Activity Breakdown
                  </h2>
                  
                  {activityData.labels && activityData.labels.length > 0 ? (
                    <div className="mt-6">
                      <Chart
                        options={activityChartOptions}
                        series={activityData.series}
                        type="pie"
                        height={350}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-10 text-surface-500 dark:text-surface-400">
                      No activity data available for the selected period.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-surface-900 dark:text-white">Total Members</h3>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{members.length}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {members.filter(m => m.membershipType === 'premium').length} premium members
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-surface-900 dark:text-white">Revenue</h3>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
              <DollarSignIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                ${payments.reduce((total, payment) => total + (Number(payment.amount) || 0), 0).toFixed(2)}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {payments.length} total payments
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-surface-900 dark:text-white">Activity</h3>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
              <ActivityIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{activities.length}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {activities.filter(a => a.type === 'check-in').length} check-ins recorded
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}