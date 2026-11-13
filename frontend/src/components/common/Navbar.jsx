import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      setTimeStr(new Intl.DateTimeFormat('en-IN', options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    faculty: 'bg-blue-100 text-blue-800 border-blue-200',
    student: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded text-sm tracking-wider">
          ELC
        </div>
        <div>
          <h1 className="font-semibold text-base leading-tight">Academic Management System</h1>
          <p className="text-xs text-slate-400">GVP Institute of Higher Learning & Research</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Clock */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300 font-mono">{timeStr} IST</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-medium">Cutoff: 7:00 PM</span>
        </div>

        {/* User Info with Profile Link */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(user?.role === 'faculty' ? '/faculty/profile' : user?.role === 'student' ? '/student/profile' : '/admin/settings')}
            className="flex items-center space-x-3 text-left hover:opacity-85 transition group cursor-pointer"
            title="Click to view profile & change password"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none text-slate-100 group-hover:text-blue-300 transition-colors">
                {user?.full_name || user?.email}
              </p>
              <span className={`inline-block mt-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleColors[user?.role] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                {user?.role}
              </span>
            </div>

            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow group-hover:ring-2 group-hover:ring-blue-400 transition">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
          </button>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 transition-colors border border-slate-700/60"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

