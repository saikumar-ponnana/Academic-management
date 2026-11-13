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
  Clock
} from 'lucide-react';

const Sidebar = () => {
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

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-125px)]">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
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

      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">Gayatri Vidya Parishad</p>
        <p className="text-[11px] text-slate-500">ELC Academic System v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;

