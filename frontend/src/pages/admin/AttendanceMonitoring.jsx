import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ClipboardCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus
} from 'lucide-react';

const AttendanceMonitoring = () => {
  const [data, setData] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryDate, setQueryDate] = useState('');
  const [overrideModal, setOverrideModal] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideHours, setOverrideHours] = useState(4);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchMonitoring();
    fetchOverrides();
  }, [queryDate]);

  const fetchMonitoring = async () => {
    setLoading(true);
    try {
      const url = queryDate ? `/admin/attendance-status?date=${queryDate}` : '/admin/attendance-status';
      const res = await api.get(url);
      setData(res.data);
      if (!queryDate) setQueryDate(res.data.date);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverrides = async () => {
    try {
      const res = await api.get('/admin/attendance-overrides');
      setOverrides(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGrantOverride = async (e) => {
    e.preventDefault();
    if (!overrideModal) return;

    try {
      const payload = {
        session_id: overrideModal.session_id,
        faculty_user_id: overrideModal.faculty_user_id,
        reason: overrideReason,
        expiration_hours: Number(overrideHours)
      };
      const res = await api.post('/admin/attendance-overrides', payload);
      setMsg(res.data.message);
      setOverrideModal(null);
      setOverrideReason('');
      fetchMonitoring();
      fetchOverrides();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to grant override.');
    }
  };

  const missedCount = data?.sessions?.filter((s) => s.status === 'missed_deadline').length || 0;
  const completedCount = data?.sessions?.filter((s) => s.status === 'submitted').length || 0;
  const pendingCount = data?.sessions?.filter((s) => s.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Attendance Monitoring & Exception Control</h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional RNS compliance oversight • 7:00 PM deadline validation • Administrative overrides.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600">Select Date:</label>
          <input
            type="date"
            value={queryDate}
            onChange={(e) => setQueryDate(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
          />
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Scheduled Classes</p>
          <p className="text-2xl font-bold text-slate-800">{data?.sessions?.length || 0}</p>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
          <p className="text-[11px] text-emerald-700 font-semibold uppercase">Submitted</p>
          <p className="text-2xl font-bold text-emerald-700">{completedCount}</p>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
          <p className="text-[11px] text-amber-700 font-semibold uppercase">Pending (&lt; 7:00 PM)</p>
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
          <p className="text-[11px] text-red-700 font-semibold uppercase">Missed 7:00 PM Deadline</p>
          <p className="text-2xl font-bold text-red-700">{missedCount}</p>
        </div>
      </div>

      {/* Main Monitoring Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Class Session Compliance Roster — {data?.day}, {data?.date}
          </h3>
          <span className="text-xs text-slate-500 font-mono">Cutoff: {data?.cutoff_time || '19:00'} IST</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject & Code</th>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Scheduled Period</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4 text-right">Exception Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.sessions?.map((s) => {
                  const isSubmitted = s.status === 'submitted';
                  const isMissed = s.status === 'missed_deadline';
                  const isOverride = s.status === 'override_approved';

                  return (
                    <tr key={s.session_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{s.course_name}</span>
                        <span className="font-mono text-[10px] text-blue-700 font-bold">{s.course_code}</span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {s.faculty_name}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {s.department_code} Sec {s.section}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-800">
                        {s.time}
                      </td>

                      <td className="py-3 px-4">
                        {isSubmitted ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Submitted</span>
                          </span>
                        ) : isMissed ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <Lock className="w-3 h-3 text-red-600" />
                            <span>Missed Deadline (Locked)</span>
                          </span>
                        ) : isOverride ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Override Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isMissed && (
                          <button
                            onClick={() => setOverrideModal(s)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1 ml-auto"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Grant Override</span>
                          </button>
                        )}
                        {isOverride && (
                          <span className="text-[11px] text-amber-700 font-medium italic">
                            Authorized Late Window
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approved Overrides Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <span>Historical Attendance Overrides Audit Trail</span>
        </h3>

        {overrides.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No overrides recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Session ID</th>
                  <th className="py-2.5 px-4">Reason For Override</th>
                  <th className="py-2.5 px-4">Approved By</th>
                  <th className="py-2.5 px-4">Approval Timestamp</th>
                  <th className="py-2.5 px-4">Expiration Window</th>
                  <th className="py-2.5 px-4">Usage Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overrides.map((o) => (
                  <tr key={o._id}>
                    <td className="py-2.5 px-4 font-mono font-bold text-purple-700">{o.session_id}</td>
                    <td className="py-2.5 px-4 text-slate-700">{o.reason}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{o.approved_by_name}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono">{new Date(o.approved_at).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono">{new Date(o.expires_at).toLocaleString()}</td>
                    <td className="py-2.5 px-4">
                      {o.used ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Submitted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Open
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              Grant Administrative Attendance Override
            </h3>
            <p className="text-xs text-slate-600">
              Temporarily unlock the attendance register for <strong>{overrideModal.course_name}</strong> taught by <strong>{overrideModal.faculty_name}</strong>.
            </p>

            <form onSubmit={handleGrantOverride} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold uppercase mb-1">Official Reason for Override *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Approved due to power disruption or server maintenance verified by HOD."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold uppercase mb-1">Override Window Duration</label>
                <select
                  value={overrideHours}
                  onChange={(e) => setOverrideHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value={2}>2 Hours</option>
                  <option value={4}>4 Hours</option>
                  <option value={8}>8 Hours</option>
                  <option value={24}>24 Hours</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setOverrideModal(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700"
                >
                  Approve Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceMonitoring;

