import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Import New Pages
import RiderDashboard from './pages/rider/RiderDashboard';
import RiderOrderDetail from './pages/rider/RiderOrderDetail';
import RiderRegister from './pages/rider/RiderRegister';
import RiderStatus from './pages/rider/RiderStatus';
import Orders from './pages/admin/Orders';
import Riders from './pages/admin/Riders';
import Billing from './pages/admin/Billing';
import BillingDetail from './pages/admin/BillingDetail';
import MemberDetail from './pages/MemberDetail';
import Developers from './pages/Developers';
import DeveloperDashboard from './pages/developer/DeveloperDashboard';

import './assets/main.css';

// Rider Protected Route wrapper
const RiderProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('rider_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Developer Protected Route wrapper
const DeveloperProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('developer_token');
  if (!token) {
    return <Navigate to="/developers" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  // Exclude public nav & footer from admin, rider, developer dashboard, and login views
  const isSpecialPortal = location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/rider') || 
                          (location.pathname.startsWith('/developer') && !location.pathname.startsWith('/developers')) || 
                          location.pathname === '/login';

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Public Sticky Navigation - Excluded from Administrator and Rider Panels */}
      {!isSpecialPortal && <Navbar />}

      {/* Main Page Content Router */}
      <main style={{ flexGrow: 1 }}>
        <Routes>
          {/* Public Landing Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/member/:slug" element={<MemberDetail />} />

          {/* Secure Rider Portal */}
          <Route path="/rider/login" element={<Navigate to="/login" replace />} />
          <Route path="/rider/register" element={<RiderRegister />} />
          <Route path="/rider/status" element={<RiderStatus />} />
          <Route 
            path="/rider/dashboard" 
            element={
              <RiderProtectedRoute>
                <RiderDashboard />
              </RiderProtectedRoute>
            } 
          />
          <Route 
            path="/rider/orders/:id" 
            element={
              <RiderProtectedRoute>
                <RiderOrderDetail />
              </RiderProtectedRoute>
            } 
          />

          {/* Secure Developer Portal */}
          <Route 
            path="/developer/dashboard" 
            element={
              <DeveloperProtectedRoute>
                <DeveloperDashboard />
              </DeveloperProtectedRoute>
            } 
          />

          {/* Secure Admin Portal */}
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/riders" 
            element={
              <ProtectedRoute>
                <Riders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/billing" 
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/billing/:id" 
            element={
              <ProtectedRoute>
                <BillingDetail />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      {/* Public Footer Navigation - Excluded from Administrator and Rider Panels */}
      {!isSpecialPortal && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
