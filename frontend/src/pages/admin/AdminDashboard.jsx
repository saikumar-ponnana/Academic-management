import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  FolderArchive,
  Calendar,
  ClipboardCheck,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded">
            Administrative Controller
          </span>
          <h2 className="text-2xl font-bold mt-1">ELC Center Central Administration</h2>
          <p className="text-xs text-purple-200 mt-1">
            Academic Operations • Faculty Allocations • Student Rosters • Attendance Compliance
          </p>
        </div>

        <Link
          to="/admin/attendance"
          className="self-start md:self-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow transition flex items-center space-x-2 shrink-0"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Monitor Attendance Deadlines</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-bold text-slate-800">{data?.total_students || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Faculty</p>
            <p className="text-2xl font-bold text-slate-800">{data?.total_faculty || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Subjects / Courses</p>
            <p className="text-2xl font-bold text-slate-800">{data?.total_courses || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Uploaded Materials</p>
            <p className="text-2xl font-bold text-slate-800">{data?.total_materials || 0}</p>
          </div>
        </div>
      </div>

      {/* Attendance Compliance Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Today's Attendance Compliance ({data?.current_date})
            </h3>
            <p className="text-xs text-slate-500">
              Enforcing mandatory 7:00 PM (19:00 IST) deadline across all faculties.
            </p>
          </div>
          <Link
            to="/admin/attendance"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
          >
            <span>Live Attendance Monitor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-800 uppercase">Completed Submissions</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{data?.attendance_completed_today || 0}</p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-semibold text-amber-800 uppercase">Pending Submissions</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{data?.attendance_pending_today || 0}</p>
          </div>

          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-xs font-semibold text-red-800 uppercase">Missed Deadlines (&gt; 7:00 PM)</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{data?.attendance_missed_deadlines || 0}</p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Pending Faculty Profile Approvals & Low Attendance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registered Faculty Members Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>Registered Faculty Directory ({data?.total_faculty || 0})</span>
            </h4>
            <Link to="/admin/faculty" className="text-xs text-purple-600 hover:text-purple-800 font-semibold">
              Manage Faculty
            </Link>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Faculty members register and maintain their academic profiles automatically. Profiles and personal details are verified immediately upon submission without administrative gating.
          </p>

          <div className="pt-2">
            <Link
              to="/admin/faculty"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition"
            >
              <span>Open Faculty Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Low Attendance Student Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Low-Attendance Shortage Alerts (&lt; 75%)</span>
            </h4>
            <Link to="/admin/reports" className="text-xs text-purple-600 hover:text-purple-800 font-semibold">
              Full Report
            </Link>
          </div>

          {data?.low_attendance_count === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">All students are maintaining &ge;75% attendance.</p>
          ) : (
            <div className="space-y-2.5">
              {data?.low_attendance_sample?.map((s) => (
                <div key={s.roll_number} className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-blue-700 text-xs mr-2">{s.roll_number}</span>
                    <span className="font-semibold text-slate-800 text-xs">{s.name}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {s.department} Sec {s.section} • Attended {s.attended} of {s.conducted} classes
                    </p>
                  </div>
                  <span className="font-bold text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">
                    {s.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

