import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { getLatestAnnouncement, syncAnnouncementsFromRemote } from '../lib/announcements';


function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAnnouncementPeek, setShowAnnouncementPeek] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isConnected } = useSocket();
  const { isDark } = useTheme();
  const [, forceRerender] = useState(0);


  // Apply theme to document
  // Sync announcements from Supabase once on mount to populate the floating peek
  useEffect(() => {
    (async () => {
      const ok = await syncAnnouncementsFromRemote();
      if (ok) forceRerender((t) => t + 1);
    })();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="layout-container">
      {/* Desktop Sidebar */}
      <aside className="sidebar-container hidden lg:block">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="sidebar-container open"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="main-container">
        {/* Header */}
        <header className="header-container">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </header>

        {/* Page Content */}
        <main className="content-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Connection Status Toast */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3">
              <div className="loading-spinner border-yellow-600"></div>
              <span className="text-sm font-medium">Reconnecting to server...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Notice Peek */}
      {showAnnouncementPeek && getLatestAnnouncement() && (
        <div className="fixed top-20 right-4 z-40">
          <div className="backdrop-blur bg-white/60 dark:bg-gray-800/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 rounded-lg shadow-lg max-w-sm">
            <button
              className="absolute -top-2 -right-2 bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300 rounded-full w-6 h-6 text-xs"
              aria-label="Dismiss"
              onClick={() => setShowAnnouncementPeek(false)}
            >
              ×
            </button>
            <button
              onClick={() => navigate('/announcements')}
              className="w-full text-left p-4"
              title="Open City Notices"
            >
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">City Notice</p>
              <p className="text-sm line-clamp-2 text-gray-800 dark:text-gray-200">
                {getLatestAnnouncement().title}: {getLatestAnnouncement().content}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Read more →</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
