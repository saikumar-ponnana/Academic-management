import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell, Clock, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LogoutConfirmModal from './LogoutConfirmModal';

const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      setTimeStr(new Intl.DateTimeFormat('en-IN', options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    faculty: 'bg-blue-100 text-blue-800 border-blue-200',
    student: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <header className="bg-slate-900 text-white px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b border-slate-800 shadow-md sticky top-0 z-30">
      {/* Brand & Mobile Hamburger Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 sm:p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700/60 shrink-0"
          aria-label="Toggle navigation menu"
          title="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="bg-blue-600 text-white font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-xs sm:text-sm tracking-wider shrink-0">
          ELC
        </div>
        <div className="min-w-0">
          <h1 className="font-semibold text-xs sm:text-base leading-tight truncate">
            Academic Management System
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400 truncate">
            GVP Institute of Higher Learning & Research
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-6 shrink-0">
        {/* Clock (Desktop/Tablet) */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300 font-mono">{timeStr} IST</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-medium">Cutoff: 7:00 PM</span>
        </div>

        {/* User Info with Profile Link */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={() => navigate(user?.role === 'faculty' ? '/faculty/profile' : user?.role === 'student' ? '/student/profile' : '/admin/settings')}
            className="flex items-center space-x-2 sm:space-x-3 text-left hover:opacity-85 transition group cursor-pointer"
            title="Click to view profile & change password"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-medium leading-none text-slate-100 group-hover:text-blue-300 transition-colors truncate max-w-[140px]">
                {user?.full_name || user?.email}
              </p>
              <span className={`inline-block mt-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleColors[user?.role] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                {user?.role}
              </span>
            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow group-hover:ring-2 group-hover:ring-blue-400 transition shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            title="Exit / Sign Out"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 transition-colors border border-slate-700/60 shrink-0 cursor-pointer flex items-center space-x-1"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-medium">Exit</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog on Exit */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </header>
  );
};

export default Navbar;
