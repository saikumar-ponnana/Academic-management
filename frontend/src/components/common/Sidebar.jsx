import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FolderArchive,
  Settings,
  UserCheck,
  BarChart3,
  Clock,
  X
} from 'lucide-react';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { role } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/faculty', label: 'Faculty Management', icon: Users },
    { to: '/admin/students', label: 'Student Management', icon: GraduationCap },
    { to: '/admin/courses', label: 'Course Catalog', icon: BookOpen },
    { to: '/admin/timetable', label: 'Timetable Schedules', icon: CalendarDays },
    { to: '/admin/attendance', label: 'Attendance Monitor', icon: ClipboardCheck },
    { to: '/admin/reports', label: 'Attendance Reports', icon: BarChart3 },
    { to: '/admin/settings', label: 'Institution Settings', icon: Settings },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/profile', label: 'My Profile', icon: UserCheck },
    { to: '/faculty/courses', label: 'My Courses', icon: BookOpen },
    { to: '/faculty/timetable', label: 'My Timetable', icon: CalendarDays },
    { to: '/faculty/students', label: 'My Students', icon: Users },
    { to: '/faculty/attendance', label: 'Attendance / RNS', icon: ClipboardCheck, highlight: true },
    { to: '/faculty/reports', label: 'Attendance Reports', icon: BarChart3 },
    { to: '/faculty/materials', label: 'Study Materials', icon: FolderArchive },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/materials', label: 'Study Materials', icon: FolderArchive, highlight: true },
    { to: '/student/attendance', label: 'My Attendance', icon: ClipboardCheck },
    { to: '/student/timetable', label: 'My Timetable', icon: CalendarDays },
    { to: '/student/profile', label: 'My Profile', icon: UserCheck },
  ];

  const links = role === 'admin' ? adminLinks : role === 'faculty' ? facultyLinks : studentLinks;

  const renderNavLinks = (isMobile = false) => (
    <div className="py-2 px-3 space-y-1">
      <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Navigation
      </div>
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => isMobile && setMobileMenuOpen && setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${item.highlight && !isActive ? 'border border-blue-500/40 text-blue-300 bg-blue-950/20' : ''}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
            {item.highlight && (
              <span className="ml-auto text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                Key
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (Hidden on mobile < md, visible on md+) */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between shrink-0 min-h-[calc(100vh-125px)]">
        {renderNavLinks(false)}

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Gayatri Vidya Parishad</p>
          <p className="text-[11px] text-slate-500">ELC Academic System v1.0</p>
        </div>
      </aside>

      {/* 2. Mobile Off-Canvas Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* 3. Mobile Off-Canvas Drawer (Slide-Over from Left) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow">
                  ELC
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">Navigation Menu</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Gayatri Vidya Parishad</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
              {renderNavLinks(true)}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
            <p className="font-semibold text-slate-300">Gayatri Vidya Parishad</p>
            <p className="text-[11px] text-slate-500">CSE (Cyber Security) • ELC</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
