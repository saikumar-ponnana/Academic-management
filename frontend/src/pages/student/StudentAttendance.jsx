import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const StudentAttendance = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    api.get('/attendance/my-report')
      .then((res) => setReport(res.data))
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

  const overall = report?.overall_percentage ?? 100;
  const isShortage = overall < 75;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Attendance Register & Records</h2>
        <p className="text-xs text-slate-500 mt-1">
          Official academic attendance calculated from verified faculty submissions.
        </p>
      </div>

      {/* Top Banner KPI */}
      <div className={`p-6 rounded-2xl border shadow-xs ${isShortage ? 'bg-red-50 border-red-200 text-red-950' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-xs font-bold text-slate-600">{report?.roll_number}</span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-600">{report?.student_name}</span>
            </div>
            <h3 className="text-xl font-bold">Overall Academic Attendance</h3>
            <p className="text-xs text-slate-600 mt-1">
              Conducted: <span className="font-semibold text-slate-800">{report?.total_conducted}</span> sessions • Attended: <span className="font-semibold text-slate-800">{report?.total_attended}</span> sessions
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className={`text-4xl font-black ${isShortage ? 'text-red-600' : 'text-emerald-700'}`}>
                {overall}%
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
                {isShortage ? 'Attendance Shortage' : 'Exam Eligible'}
              </p>
            </div>
          </div>
        </div>

        {isShortage && (
          <div className="mt-4 pt-4 border-t border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Warning:</strong> Your overall attendance is currently below the mandatory institutional requirement of 75%. Please contact your respective faculty members or department head.
            </span>
          </div>
        )}
      </div>

      {/* Courses List with Expandable History */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800">Subject-Wise Detailed Attendance Breakdown</h3>

        {report?.courses?.map((c) => {
          const isExpanded = expandedCourse === c.course_id;
          const low = c.is_low;

          return (
            <div
              key={c.course_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
            >
              <div
                onClick={() => setExpandedCourse(isExpanded ? null : c.course_id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded">
                      {c.course_code}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm">{c.course_name}</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Conducted: {c.conducted} classes • Attended: {c.attended} classes
                  </p>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className={`text-xl font-bold ${low ? 'text-red-600' : 'text-emerald-700'}`}>
                      {c.percentage}%
                    </span>
                    <span className={`block text-[10px] font-bold uppercase ${low ? 'text-red-600' : 'text-emerald-700'}`}>
                      {low ? 'Shortage (<75%)' : 'Eligible'}
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expandable History Table */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Class Attendance Session History ({c.history?.length || 0})
                  </h5>
                  {c.history?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No class sessions conducted yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {c.history?.map((h, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border bg-white border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 font-mono">{h.date}</span>
                            <span className="text-[10px] text-slate-400 block">{h.time}</span>
                          </div>
                          {h.status === 'present' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Present
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                              Absent
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentAttendance;

