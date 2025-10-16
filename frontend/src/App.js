import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { CityProvider } from './contexts/CityContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/design-system.css';
import './styles/indian-theme.css';
const Login = lazy(() => import('./pages/Login'));
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PrototypeDashboard = lazy(() => import('./components/PrototypeDashboard'));
const Sensors = lazy(() => import('./pages/Sensors'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Services = lazy(() => import('./pages/Services'));
const EmergencyServices = lazy(() => import('./pages/EmergencyServices'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Blockchain = lazy(() => import('./pages/Blockchain'));
const CityTwin = lazy(() => import('./pages/CityTwin'));
const Announcements = lazy(() => import('./pages/Announcements'));
const AnnouncementDetail = lazy(() => import('./pages/AnnouncementDetail'));
const ComposeAnnouncement = lazy(() => import('./pages/ComposeAnnouncement'));
const EmergencyPaymentStatus = lazy(() => import('./pages/EmergencyPaymentStatus'));
const QuickEmergencyBook = lazy(() => import('./pages/QuickEmergencyBook'));
const BillingDashboard = lazy(() => import('./components/billing/BillingDashboard'));

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <SocketProvider>
            <CityProvider>
            <Router>
              <div className="App">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                <Route element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<PrototypeDashboard />} />
                  <Route path="/sensors" element={<Sensors />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/emergency" element={<EmergencyServices />} />
                      <Route path="/services/emergency/quick" element={<QuickEmergencyBook />} />

                      <Route path="/services/emergency/success" element={<EmergencyPaymentStatus type="success" />} />
                      <Route path="/services/emergency/cancel" element={<EmergencyPaymentStatus type="cancel" />} />
                  <Route path="/billing" element={<BillingDashboard />} />

                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/announcements/:id" element={<AnnouncementDetail />} />
                  <Route path="/announcements/new" element={<ProtectedRoute requiredRole="admin"><ComposeAnnouncement /></ProtectedRoute>} />
                  <Route path="/blockchain" element={<Blockchain />} />
                  <Route path="/city-twin" element={<CityTwin />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
            </div>
          </Router>
          </CityProvider>
        </SocketProvider>
      </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
