import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Lazy loaded routes for bundle optimization
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const PremiumDashboard = React.lazy(() => import('./pages/PremiumDashboard').then(module => ({ default: module.PremiumDashboard })));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard').then(module => ({ default: module.Leaderboard })));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-indigo-600 font-medium">Loading...</div></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/resetpassword" element={<ResetPassword />} />
            
            {/* Dashboard Layout wrapper separates these views from login/register */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/premium" element={<PremiumDashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
