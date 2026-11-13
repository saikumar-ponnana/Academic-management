import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  FolderArchive,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Megaphone,
  Lock
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/faculty/dashboard');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const profile = data?.profile;
  const completion = data?.profile_completion || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-200 text-xs uppercase tracking-wider font-semibold mb-1">
              <span>{profile?.department || 'Department of Computer Science'}</span>
              <span>•</span>
              <span>Faculty ID: {profile?.faculty_id || 'FAC-CSE-001'}</span>
            </div>
            <h2 className="text-2xl font-bold">Welcome back, {data?.faculty_name || 'Faculty Member'}!</h2>
            <p className="text-sm text-blue-100 mt-1">
              Class sessions for today ({data?.current_date}) require mandatory attendance submission by 7:00 PM IST.
            </p>
          </div>

          <Link
            to="/faculty/attendance"
            className="self-start md:self-auto px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-semibold rounded-xl text-sm shadow transition flex items-center space-x-2 shrink-0"
          >
            <ClipboardCheck className="w-4 h-4 text-blue-700" />
            <span>Attendance / RNS</span>
          </Link>
        </div>

        {/* Profile Completion Prompt if < 100% */}
        {completion < 100 && (
          <div className="mt-5 pt-4 border-t border-blue-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-blue-200">Profile Completion:</span>
              <div className="w-36 bg-blue-950/60 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
              <span className="font-bold text-white">{completion}%</span>
            </div>
            <Link to="/faculty/profile" className="text-blue-200 hover:text-white underline font-medium">
              Complete Profile Details &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Assigned Subjects</p>
            <p className="text-2xl font-bold text-slate-800">{data?.assigned_courses_count || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Today's Classes</p>
            <p className="text-2xl font-bold text-slate-800">{data?.today_classes_count || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pending Attendance</p>
            <p className="text-2xl font-bold text-amber-600">{data?.pending_attendance_count || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Uploaded Materials</p>
            <p className="text-2xl font-bold text-slate-800">{data?.materials_uploaded || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Timetable & Pending Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Today's Scheduled Teaching Sessions</h3>
              <p className="text-xs text-slate-500">Timetable classes for {data?.current_date} (Asia/Kolkata)</p>
            </div>
            <Link to="/faculty/timetable" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1">
              <span>Weekly Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.today_classes?.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No classes scheduled for today on the timetable.
            </div>
          ) : (
            <div className="space-y-3">
              {data?.today_classes?.map((item) => {
                const isSubmitted = item.attendance_status === 'submitted';
                const isLocked = item.attendance_status === 'locked';
                const isOverride = item.attendance_status === 'override_approved';

                return (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-sm">{item.course_name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                          {item.course_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Class: Sec {item.section} (Sem {item.semester}) • Room: {item.location} • Time: {item.start_time} - {item.end_time}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {isSubmitted ? (
                        <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Submitted ({item.present_count} P / {item.absent_count} A)</span>
                        </span>
                      ) : isLocked ? (
                        <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked (Past 7:00 PM)</span>
                        </span>
                      ) : isOverride ? (
                        <Link
                          to={`/faculty/attendance/register/${item.session_id}`}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition shadow-xs"
                        >
                          <span>Submit (Override Approved)</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/faculty/attendance/register/${item.session_id}`}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Mark Attendance</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Institutional Policy & Announcements */}
        <div className="space-y-6">
          {/* Policy Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Mandatory Attendance Cutoff</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Institutional policy strictly locks all class session attendance registers at <strong>7:00 PM (19:00:00 IST)</strong> on the class date. Classes must have concluded before attendance can be submitted.
                </p>
                <div className="mt-3 text-[11px] text-amber-700 font-medium">
                  Exceptions require formal Administrator Override approval.
                </div>
              </div>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm mb-3">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <span>Campus Announcements</span>
            </div>
            {data?.announcements?.length === 0 ? (
              <p className="text-xs text-slate-500">No current announcements.</p>
            ) : (
              <div className="space-y-3">
                {data?.announcements?.map((a) => (
                  <div key={a._id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <h5 className="text-xs font-semibold text-slate-800">{a.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{a.content}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Posted by {a.author_name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

