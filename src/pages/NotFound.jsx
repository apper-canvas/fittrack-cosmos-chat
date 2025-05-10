import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import getIcon from '../utils/iconUtils';

export default function NotFound() {
  const HomeIcon = getIcon('Home');
  const AlertTriangleIcon = getIcon('AlertTriangle');

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
            <AlertTriangleIcon className="h-12 w-12" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-4 text-surface-900 dark:text-white">404</h1>
        <h2 className="text-2xl font-semibold mb-2 text-surface-800 dark:text-surface-200">Page Not Found</h2>
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/" 
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}