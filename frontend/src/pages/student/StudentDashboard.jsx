import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  FolderArchive,
  Megaphone,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Clock,
  ArrowRight
} from 'lucide-react';
import DocumentViewerModal from '../../components/common/DocumentViewerModal';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    api.get('/students/dashboard')
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

  const profile = data?.profile;
  const overallPct = data?.overall_attendance_percentage ?? 100;
  const isShortage = overallPct < 75;

  return (
    <div className="space-y-6">
      {/* Student Welcome Card */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Dept: {profile?.department_code}</span>
              <span>•</span>
              <span>Sem {profile?.semester} (Sec {profile?.section})</span>
              <span>•</span>
              <span className="font-mono bg-blue-800/80 px-2 py-0.5 rounded text-white font-bold">
                {profile?.roll_number}
              </span>
            </div>
            <h2 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'Student'}!</h2>
            <p className="text-xs text-blue-100 mt-1">
              Academic Year {profile?.academic_year || '2026-2027'} • Gayatri Vidya Parishad ELC Center
            </p>
          </div>

          <Link
            to="/student/materials"
            className="self-start md:self-auto px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-semibold rounded-xl text-xs shadow transition flex items-center space-x-2 shrink-0"
          >
            <FolderArchive className="w-4 h-4 text-blue-700" />
            <span>Browse Study Materials</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Enrolled Courses</p>
            <p className="text-2xl font-bold text-slate-800">{data?.enrolled_courses_count || 0}</p>
          </div>
        </div>

        <div className={`p-5 rounded-xl border shadow-xs flex items-center space-x-4 ${isShortage ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`p-3 rounded-xl ${isShortage ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Overall Attendance</p>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${isShortage ? 'text-red-700' : 'text-emerald-700'}`}>
                {overallPct}%
              </span>
              {isShortage && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-200 text-red-800 uppercase">
                  &lt;75% Alert
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Today's Classes</p>
            <p className="text-2xl font-bold text-slate-800">{data?.today_classes?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">New Materials</p>
            <p className="text-2xl font-bold text-slate-800">{data?.recent_materials?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Course-Wise Attendance & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Course Attendance Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Subject-Wise Attendance Summary</h3>
              <p className="text-xs text-slate-500">Official sessions recorded through faculty attendance submissions.</p>
            </div>
            <Link to="/student/attendance" className="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center space-x-1">
              <span>Detailed Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.courses_summary?.map((c) => {
              const low = c.percentage < 75;
              return (
                <div key={c.course_id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-800">{c.name}</span>
                      <span className="text-xs font-mono font-bold text-blue-700 ml-2">({c.code})</span>
                    </div>
                    <span className={`text-sm font-bold ${low ? 'text-red-600' : 'text-emerald-700'}`}>
                      {c.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${low ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(c.percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Attended {c.attended} of {c.conducted} conducted classes
                    </span>
                    {low ? (
                      <span className="text-red-600 font-bold">Shortage &lt;75%</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Eligible</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Today's Classes & Announcements */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Today's Classes ({data?.today_classes?.length || 0})</span>
            </h4>

            {data?.today_classes?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No classes scheduled today.</p>
            ) : (
              <div className="space-y-2.5">
                {data?.today_classes?.map((item) => (
                  <div key={item._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{item.course_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {item.start_time} - {item.end_time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Faculty: {item.faculty_name} • Room: {item.location}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Materials */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <FolderArchive className="w-4 h-4 text-emerald-600" />
                <span>Recent Study Materials</span>
              </h4>
              <Link to="/student/materials" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {data?.recent_materials?.slice(0, 3).map((m) => (
                <div key={m._id} className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">{m.title}</p>
                    <p className="text-[10px] text-slate-400">{m.course_code} • {m.faculty_name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMaterial(m)}
                    className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center space-x-1 shrink-0"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DocumentViewerModal
        material={selectedMaterial}
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
      />
    </div>
  );
};

export default StudentDashboard;

