import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ClipboardCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

const AttendanceRNS = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get('/attendance/today');
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

  return (
    <div className="space-y-6">
      {/* 7:00 PM Deadline Alert Card */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-amber-800/60 rounded-xl shrink-0 mt-0.5">
              <Clock className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded">
                  Mandatory Academic Cutoff
                </span>
                <span className="text-xs text-amber-100 font-mono">Asia/Kolkata Clock</span>
              </div>
              <h2 className="text-2xl font-bold mt-1">Attendance / RNS Submission Portal</h2>
              <p className="text-xs text-amber-100 mt-1 max-w-2xl leading-relaxed">
                Faculty must submit attendance for scheduled classes by <strong>7:00 PM (19:00:00 IST)</strong> on the class date. Sessions lock strictly at 7:00 PM. A class must have concluded before attendance can be marked.
              </p>
            </div>
          </div>

          <div className="bg-amber-800/80 p-4 rounded-xl text-center shrink-0 border border-amber-500/50">
            <p className="text-[11px] text-amber-200 font-semibold uppercase">Daily Cutoff Time</p>
            <p className="text-2xl font-black text-white font-mono">{data?.cutoff_time || '19:00'} IST</p>
            <p className="text-[10px] text-amber-300 mt-0.5">Server Time: {data?.current_time}</p>
          </div>
        </div>
      </div>

      {/* Today's Timetable Scheduled Sessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Today's Scheduled Class Sessions — {data?.day}, {data?.date}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an active class session to open its attendance register.
            </p>
          </div>
          <button
            onClick={fetchTodayAttendance}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-auto"
          >
            Refresh Sessions
          </button>
        </div>

        {data?.sessions?.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-700">No Classes Scheduled Today</h4>
            <p className="text-xs text-slate-400 mt-1">You have no teaching allocations on today's timetable.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Subject & Code</th>
                  <th className="py-3.5 px-4">Class / Section</th>
                  <th className="py-3.5 px-4">Scheduled Period</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Attendance Status</th>
                  <th className="py-3.5 px-4">Summary</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.sessions?.map((s) => {
                  const isSubmitted = s.submission_status === 'submitted';
                  const isLocked = s.submission_status === 'locked';
                  const isOverride = s.has_override;

                  return (
                    <tr key={s.session_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm">{s.course_name}</div>
                        <span className="text-[11px] font-mono font-semibold text-blue-700">{s.course_code}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        Dept: {s.department_code} • Sem {s.semester} (Sec {s.section})
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {s.start_time} - {s.end_time}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {s.location}
                      </td>

                      <td className="py-3.5 px-4">
                        {isSubmitted ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Submitted</span>
                          </span>
                        ) : isLocked ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                            <Lock className="w-3.5 h-3.5 text-red-600" />
                            <span>Locked (7:00 PM)</span>
                          </span>
                        ) : isOverride ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Override Approved</span>
                          </span>
                        ) : !s.is_eligible_to_mark ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Awaiting End Time</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Eligible (Pending)</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {isSubmitted ? (
                          <span className="font-semibold text-slate-800">
                            {s.present_count} P / {s.absent_count} A ({s.total_students} Total)
                          </span>
                        ) : (
                          <span>{s.total_students} Enrolled</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/faculty/attendance/register/${s.session_id}`}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                            isLocked
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : isSubmitted
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                          }`}
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>{isLocked ? 'View (Locked)' : isSubmitted ? 'View Records' : 'Mark Attendance'}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRNS;

