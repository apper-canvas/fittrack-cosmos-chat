import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

function Login() {
  const { isInitialized } = useContext(AuthContext);
  const DumbbellIcon = getIcon('Dumbbell');

  useEffect(() => {
    if (isInitialized) {
      // Show login UI in this component
      const { ApperUI } = window.ApperSDK;
      ApperUI.showLogin("#authentication");
    }
  }, [isInitialized]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 p-6 bg-white dark:bg-surface-800 rounded-lg shadow-md"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <DumbbellIcon className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-surface-800 dark:text-surface-100 mb-1">Welcome Back</h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">Sign in to your FitTrack Pro account</p>
        </div>
        
        <div id="authentication" className="min-h-[400px]" />
        
        <div className="text-center mt-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;