import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Crown, Trophy, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Premium', path: '/premium', icon: Crown, premium: true },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Mobile Top Navigation */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm">
        <div className="text-indigo-600 text-xl font-bold tracking-tight">
          Expenso
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Desktop Logo */}
        <div className="hidden items-center p-6 border-b border-gray-100">
          <span className="text-indigo-600 text-xl font-bold tracking-tight">
            Expenso
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium !no-underline
                ${isActive 
                  ? item.premium 
                    ? 'bg-purple-50 !text-purple-700' 
                    : 'bg-gray-100 !text-gray-900' 
                  : '!text-gray-600 hover:bg-gray-100 hover:!text-gray-900'}
              `}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    className={`
                      ${item.premium ? 'text-amber-500' : ''}
                      ${isActive && !item.premium ? 'text-indigo-600' : ''}
                    `}
                  />
                  <span className={`${item.premium ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 font-bold' : ''}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout (Bottom) */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-2 text-sm text-gray-500">
             Logged in as:<br/>
             <strong className="text-gray-900 truncate block mt-1">{user.name || user.email || 'User'}</strong>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet /> 
          </div>
        </div>
      </main>

      {/* Mobile Dark Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
