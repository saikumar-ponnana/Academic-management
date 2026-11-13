import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Save,
  Send,
  Users,
  Clock,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

const AttendanceRegister = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessionRegister();
  }, [sessionId]);

  const fetchSessionRegister = async () => {
    try {
      const res = await api.get(`/attendance/session/${sessionId}`);
      setData(res.data);
      setStudents(res.data.students || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load attendance session.');
    } finally {
      setLoading(false);
    }
  };

  const setStudentStatus = (studentId, status) => {
    // If not eligible to mark and not override, ignore
    if (!data?.is_eligible) return;
    setStudents((prev) =>
      prev.map((s) => (s.student_user_id === studentId ? { ...s, status } : s))
    );
  };

  const markAll = (status) => {
    if (!data?.is_eligible) return;
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSaveDraft = async () => {
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        records: students.map((s) => ({
          student_user_id: s.student_user_id,
          roll_number: s.roll_number,
          student_name: s.student_name,
          status: s.status
        }))
      };
      const res = await api.post(`/attendance/session/${sessionId}/submit?is_draft=true`, payload);
      setMessage(res.data.message);
      await fetchSessionRegister();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save attendance draft.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFinal = async () => {
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        records: students.map((s) => ({
          student_user_id: s.student_user_id,
          roll_number: s.roll_number,
          student_name: s.student_name,
          status: s.status
        }))
      };
      const res = await api.post(`/attendance/session/${sessionId}/submit?is_draft=false`, payload);
      setMessage(res.data.message);
      setConfirmModal(false);
      await fetchSessionRegister();
    } catch (err) {
      setError(err.response?.data?.detail || 'Attendance submission rejected by institutional server.');
      setConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const session = data?.session;
  const isEligible = data?.is_eligible;
  const isSubmitted = data?.submission_status === 'submitted';
  const hasOverride = data?.has_override;

  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;

  const filteredStudents = students.filter(
    (s) =>
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/faculty/attendance"
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Attendance / RNS List</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">Session: {sessionId}</span>
      </div>

      {/* RNS Cutoff Alert Banner */}
      {!isEligible && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start space-x-3">
          <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Attendance Register Locked (RNS Policy)</h4>
            <p className="text-xs text-red-700 mt-0.5">
              {data?.eligibility_message || 'Attendance submission is closed for today. The deadline was 7:00 PM. Please contact the administrator.'}
            </p>
          </div>
        </div>
      )}

      {hasOverride && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Active Administrative Override</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              An administrator has granted temporary late attendance submission access for this session.
            </p>
          </div>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Session Metadata Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold text-xs">
                {session?.course_code}
              </span>
              <span className="text-xs text-slate-500">
                Sec {session?.section} • Sem {session?.semester} ({session?.department_code})
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">{session?.course_name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Faculty: <span className="font-semibold text-slate-700">{session?.faculty_name}</span> • Room: {session?.location}
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Scheduled Period</span>
              <span className="text-sm font-bold text-slate-800 font-mono">
                {session?.start_time} - {session?.end_time}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-300"></div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Class Date</span>
              <span className="text-sm font-bold text-slate-800">{session?.date}</span>
            </div>
          </div>
        </div>

        {/* Counter Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Students</p>
            <p className="text-2xl font-bold text-slate-800">{students.length}</p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-[11px] text-emerald-700 uppercase font-semibold">Present</p>
            <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
          </div>

          <div className="p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-[11px] text-red-700 uppercase font-semibold">Absent</p>
            <p className="text-2xl font-bold text-red-700">{absentCount}</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-[11px] text-blue-700 uppercase font-semibold">Submission Deadline</p>
            <p className="text-xl font-bold text-blue-700 font-mono">7:00 PM</p>
          </div>
        </div>
      </div>

      {/* Attendance Register Table & Batch Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Quick Mark Batch Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={!isEligible}
              onClick={() => markAll('present')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition"
            >
              Mark All Present
            </button>
            <button
              type="button"
              disabled={!isEligible}
              onClick={() => markAll('absent')}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, index) => {
                const isPresent = s.status === 'present';
                return (
                  <tr
                    key={s.student_user_id}
                    className={`transition ${isPresent ? 'hover:bg-slate-50' : 'bg-red-50/20 hover:bg-red-50/40'}`}
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{s.roll_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{s.student_name}</td>
                    <td className="py-3 px-4">
                      {isPresent ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Present</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Absent</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          disabled={!isEligible}
                          onClick={() => setStudentStatus(s.student_user_id, 'present')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          disabled={!isEligible}
                          onClick={() => setStudentStatus(s.student_user_id, 'absent')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                            !isPresent
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          A
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {isSubmitted && (
              <span className="font-semibold text-emerald-700">
                Attendance was submitted on {data?.submitted_at ? new Date(data.submitted_at).toLocaleTimeString() : 'record'}.
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={!isEligible || submitting}
              onClick={handleSaveDraft}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 border border-slate-300 font-semibold rounded-xl text-xs transition flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={!isEligible || submitting}
              onClick={() => setConfirmModal(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/20 transition flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Confirm Final Attendance Submission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to officially submit attendance for <strong>{session?.course_name}</strong> (Section {session?.section}).
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Enrolled:</span>
                <span className="font-bold text-slate-800">{students.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 font-medium">Marked Present:</span>
                <span className="font-bold text-emerald-700">{presentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700 font-medium">Marked Absent:</span>
                <span className="font-bold text-red-700">{absentCount}</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-700">
              * Note: Submission is recorded under institutional RNS audit rules and locks at 7:00 PM IST.
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitFinal}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow transition flex items-center justify-center space-x-2"
              >
                {submitting ? <span>Recording...</span> : <span>Confirm & Submit</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRegister;

