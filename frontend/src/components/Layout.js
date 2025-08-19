import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PrototypeHeader from './PrototypeHeader';
import { useSocket } from '../contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isConnected } = useSocket();

  return (
    <div className="app">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <PrototypeHeader />
        <div className="content-wrapper px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
