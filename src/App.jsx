import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// User Components
import SubmitTicket from './components/user/SubmitTicket';
import CheckTicket from './components/user/CheckTicket';
import TicketSuccess from './components/user/TicketSuccess';

// Auth Components
import ITLogin from './components/auth/ITLogin';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Manager Components
import ManagerDashboard from './components/manager/ManagerDashboard';

// Staff Components
import StaffDashboard from './components/staff/StaffDashboard';

// Shared Components
import Header from './components/shared/Header';
import Home from './components/shared/Home';

// Styles
import './styles/globals.css';
import { useAuth } from './context/AuthContext';

// const emailRoutes = require('./api/emailService');

// app.use('/api', emailRoutes)

// Inner App component that can use useAuth
function AppContent() {
  // const { useAuth } = require('./context/AuthContext')
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={logout} />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/submit-ticket" element={<SubmitTicket />} />
          <Route path="/check-ticket" element={<CheckTicket />} />
          <Route path="/ticket-success" element={<TicketSuccess />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              user ? (
                // Redirect authenticated users to their role-specific dashboard
                <Navigate
                  to={
                    user.role === 'manager' ? '/manager' : '/dashboard'
                  }
                  replace
                />
              ) : (
                <ITLogin />
              )
            }
          />
          
          {/* Generic Dashboard Route - redirects to role-specific dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user?.role === 'manager' ? (
                  <Navigate to="/manager" replace />
                ) : (
                  <StaffDashboard currentUser={user} />
                )}
              </ProtectedRoute>
            }
          />

          {/* Manager Dashboard Routes */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute requireRole="manager">
                <ManagerDashboard currentUser={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute requireRole="manager">
                <ManagerDashboard currentUser={user} />
              </ProtectedRoute>
            }
          />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

// Main App component with AuthProvider wrapper
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;