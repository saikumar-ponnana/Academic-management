import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Download, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

const ReportsPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [secFilter, setSecFilter] = useState('');
  const [threshold, setThreshold] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then((res) => setCourses(res.data))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedCourse, deptFilter, secFilter, threshold]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = '/attendance/reports?';
      if (selectedCourse) url += `course_id=${selectedCourse}&`;
      if (deptFilter) url += `department_code=${deptFilter}&`;
      if (secFilter) url += `section=${secFilter}&`;
      if (threshold) url += `threshold=${threshold}&`;
      const res = await api.get(url);
      setReport(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      let url = '/attendance/reports?format=csv&';
      if (selectedCourse) url += `course_id=${selectedCourse}&`;
      if (deptFilter) url += `department_code=${deptFilter}&`;
      if (secFilter) url += `section=${secFilter}&`;
      if (threshold) url += `threshold=${threshold}&`;
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'institutional_attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      alert('Failed to export CSV: ' + e.message);
    }
  };

  const records = report?.records || [];
  const filteredRecords = records.filter(
    (r) =>
      r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Institution Attendance Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Campus-wide analytics • Shortage thresholds • End-semester examination eligibility reports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export All Records (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="w-48">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Subject</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
          >
            <option value="">All Subjects</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-36">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Department</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
          >
            <option value="">All Depts</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="IT">IT</option>
          </select>
        </div>

        <div className="w-36">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Section</label>
          <select
            value={secFilter}
            onChange={(e) => setSecFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>

        <div className="w-40">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Threshold</label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
          >
            <option value="">All</option>
            <option value="low">Shortage (&lt;75%)</option>
            <option value="mid">Average (75-85%)</option>
            <option value="high">High (&gt;85%)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Search Student</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Students Analyzed</p>
          <p className="text-2xl font-bold text-slate-800">{report?.total_records || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 font-semibold uppercase">Submitted Sessions</p>
          <p className="text-2xl font-bold text-slate-800">{report?.total_sessions_analyzed || 0}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
          <p className="text-[11px] text-red-600 font-semibold uppercase">Attendance Shortage (&lt;75%)</p>
          <p className="text-2xl font-bold text-red-700">{report?.low_attendance_count || 0}</p>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Conducted</th>
                  <th className="py-3 px-4">Attended</th>
                  <th className="py-3 px-4">Attendance %</th>
                  <th className="py-3 px-4">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => {
                  const isLow = r.is_low_attendance;
                  return (
                    <tr key={r.student_user_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{r.roll_number}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{r.student_name}</td>
                      <td className="py-3 px-4 text-slate-600">{r.department}</td>
                      <td className="py-3 px-4 text-slate-600">Sec {r.section}</td>
                      <td className="py-3 px-4 text-slate-600">{r.conducted_sessions}</td>
                      <td className="py-3 px-4 text-slate-600">{r.attended_sessions}</td>
                      <td className="py-3 px-4 font-bold">
                        <span className={isLow ? 'text-red-600' : 'text-emerald-700'}>
                          {r.attendance_percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>Shortage (&lt;75%)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Eligible</span>
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
    </div>
  );
};

export default ReportsPage;

