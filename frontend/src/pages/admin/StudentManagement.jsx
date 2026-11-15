import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Plus, Search, Filter, CheckCircle2, Trash2, Check, X, Clock, AlertCircle } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [secFilter, setSecFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [msg, setMsg] = useState('');

  // New student form
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: 'Student@123',
    roll_number: '',
    phone: '',
    department_code: 'CYBER',
    academic_year: '2026-2027',
    semester: 3,
    section: 'A'
  });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const [sRes, dRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/departments').catch(() => ({
          data: [
            { code: 'CYBER', name: 'Cybersecurity' },
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'ECE', name: 'Electronics & Communication Engineering' },
            { code: 'IT', name: 'Information Technology' }
          ]
        }))
      ]);
      setStudents(sRes.data);
      setDepartments(dRes.data.length > 0 ? dRes.data : [
        { code: 'CYBER', name: 'CSE (Cyber Security)' }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', form);
      setMsg(`Student ${form.full_name} (${form.roll_number}) enrolled successfully.`);
      setModalOpen(false);
      setForm({
        full_name: '',
        email: '',
        password: 'Student@123',
        roll_number: '',
        phone: '',
        department_code: departments[0]?.code || 'CYBER',
        academic_year: '2026-2027',
        semester: 3,
        section: 'A'
      });
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create student.');
    }
  };

  const handleDeleteStudent = async (userId, name, rollNumber) => {
    if (!window.confirm(`Delete student ${name} (${rollNumber})? This will remove all their enrollments and attendance records.`)) {
      return;
    }
    try {
      await api.delete(`/admin/students/${userId}`);
      setMsg(`Student ${name} deleted successfully.`);
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete student.');
    }
  };

  const handleApproveStudent = async (userId, name, approved) => {
    try {
      await api.post(`/admin/students/${userId}/approve`, {
        approved,
        comments: approved ? 'Approved by Administrator' : 'Declined by Administrator'
      });
      setMsg(`Student registration for ${name} ${approved ? 'approved successfully! Account is now active.' : 'declined.'}`);
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update student status.');
    }
  };

  const pendingCount = students.filter(s => s.profile_status === 'pending' || s.is_active === false).length;

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = !deptFilter || s.department_code === deptFilter;
    const matchSec = !secFilter || s.section === secFilter;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? (s.profile_status === 'pending' || s.is_active === false)
        : (s.profile_status === 'approved' && s.is_active !== false);
    return matchSearch && matchDept && matchSec && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Directory & Enrollments</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain institutional student registry across branches, assign roll numbers, and view enrolled classes.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Students ({students.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Active Enrolled ({students.filter(s => s.profile_status === 'approved' && s.is_active !== false).length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Approvals</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-black">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name, roll number, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="">All Branches</option>
            {departments.map((d) => (
              <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            value={secFilter}
            onChange={(e) => setSecFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Branch / Dept</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isPending = s.profile_status === 'pending' || s.is_active === false;
                  return (
                    <tr key={s.user_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{s.roll_number}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{s.full_name}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{s.department_code}</td>
                      <td className="py-3 px-4 text-slate-600">Sem {s.semester}</td>
                      <td className="py-3 px-4 text-slate-600">Sec {s.section}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{s.email}</td>
                      <td className="py-3 px-4">
                        {isPending ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Pending Approval</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active Enrolled</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApproveStudent(s.user_id, s.full_name, true)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition"
                              title="Approve Student Registration"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproveStudent(s.user_id, s.full_name, false)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                              title="Decline Registration"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteStudent(s.user_id, s.full_name, s.roll_number)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Student Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Enroll New Student</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 26GVPCYB001"
                    value={form.roll_number}
                    onChange={(e) => setForm({ ...form, roll_number: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@elc.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Initial Password *</label>
                  <input
                    type="text"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Branch / Department *</label>
                  <select
                    value={form.department_code}
                    onChange={(e) => setForm({ ...form, department_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Semester</label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Section</label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={form.academic_year}
                    onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
