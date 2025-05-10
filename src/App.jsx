import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import getIcon from './utils/iconUtils';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const SunIcon = getIcon('Sun');
  const MoonIcon = getIcon('Moon');
  const HomeIcon = getIcon('Home');
  const BarChartIcon = getIcon('BarChart');
  const UsersIcon = getIcon('Users');
  const CalendarIcon = getIcon('Calendar');
  const DollarSignIcon = getIcon('DollarSign');
  const DumbbellIcon = getIcon('Dumbbell');

  useEffect(() => {
    // Check system preference or saved user preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(
      !darkMode ? "Dark mode activated" : "Light mode activated", 
      { icon: !darkMode ? "🌙" : "☀️" }
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <DumbbellIcon className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl md:text-2xl text-surface-800 dark:text-white">
                FitTrack<span className="text-primary">Pro</span>
              </span>
            </Link>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-200"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {darkMode ? 
                  <SunIcon className="h-5 w-5" /> : 
                  <MoonIcon className="h-5 w-5" />
                }
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block bg-white dark:bg-surface-800 w-20 lg:w-64 border-r border-surface-200 dark:border-surface-700 shrink-0">
          <nav className="p-4 space-y-2">
            <Link to="/" className="flex items-center p-3 lg:px-4 lg:py-3 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
              <HomeIcon className="h-5 w-5 lg:mr-3" />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
            <Link to="/members" className="flex items-center p-3 lg:px-4 lg:py-3 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
              <UsersIcon className="h-5 w-5 lg:mr-3" />
              <span className="hidden lg:block">Members</span>
            </Link>
            <Link to="/schedule" className="flex items-center p-3 lg:px-4 lg:py-3 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
              <CalendarIcon className="h-5 w-5 lg:mr-3" />
              <span className="hidden lg:block">Schedule</span>
            </Link>
            <Link to="/payments" className="flex items-center p-3 lg:px-4 lg:py-3 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
              <DollarSignIcon className="h-5 w-5 lg:mr-3" />
              <span className="hidden lg:block">Payments</span>
            </Link>
            <Link to="/reports" className="flex items-center p-3 lg:px-4 lg:py-3 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
              <BarChartIcon className="h-5 w-5 lg:mr-3" />
              <span className="hidden lg:block">Reports</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 z-30">
        <div className="grid grid-cols-5 h-16">
          <Link to="/" className="flex flex-col items-center justify-center text-surface-600 dark:text-surface-300">
            <HomeIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/members" className="flex flex-col items-center justify-center text-surface-600 dark:text-surface-300">
            <UsersIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Members</span>
          </Link>
          <Link to="/schedule" className="flex flex-col items-center justify-center text-surface-600 dark:text-surface-300">
            <CalendarIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Schedule</span>
          </Link>
          <Link to="/payments" className="flex flex-col items-center justify-center text-surface-600 dark:text-surface-300">
            <DollarSignIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Payments</span>
          </Link>
          <Link to="/reports" className="flex flex-col items-center justify-center text-surface-600 dark:text-surface-300">
            <BarChartIcon className="h-5 w-5" />
            <span className="text-xs mt-1">Reports</span>
          </Link>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
}