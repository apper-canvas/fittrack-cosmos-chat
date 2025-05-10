import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

export default function QuickActions() {
  // Import icons
  const UserPlusIcon = getIcon('UserPlus');
  const CreditCardIcon = getIcon('CreditCard');
  const CalendarIcon = getIcon('Calendar');
  const DollarSignIcon = getIcon('DollarSign');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  // Quick action data
  const quickActions = [
    {
      title: 'Add New Member',
      icon: UserPlusIcon,
      color: 'primary',
      path: '/members/new',
      onClick: () => {
        // This could also be implemented to show a modal or navigate programmatically
        console.log('Add new member clicked');
      }
    },
    {
      title: 'Create Membership Plan',
      icon: CreditCardIcon,
      color: 'secondary',
      path: '/plans/new',
      onClick: () => {
        console.log('Create membership plan clicked');
      }
    },
    {
      title: 'Schedule Class',
      icon: CalendarIcon,
      color: 'accent',
      path: '/schedule/new',
      onClick: () => {
        console.log('Schedule class clicked');
      }
    },
    {
      title: 'Record Payment',
      icon: DollarSignIcon,
      color: 'green-500',
      path: '/payments/new',
      onClick: () => {
        console.log('Record payment clicked');
      }
    }
  ];

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4 text-surface-800 dark:text-surface-200">Quick Actions</h2>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {quickActions.map((action, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Link 
              to={action.path}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border border-surface-200 dark:border-surface-700 
                         hover:shadow-md transition-all duration-200 h-full
                         bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700`}
              onClick={action.onClick}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 
                              bg-${action.color}/10 dark:bg-${action.color}/20
                              text-${action.color}`}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-center text-sm font-medium">{action.title}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}