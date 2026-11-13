import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Plus, CheckCircle2, Trash2, Search, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModal, setDetailsModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // New Faculty Form
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: 'Faculty@123',
    faculty_id: '',
    phone: '',
    designation: 'Assistant Professor',
    department_code: 'CYBER',
    highest_degree: 'M.Tech / Ph.D. in Cybersecurity',
    specialization: 'Cybersecurity'
  });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const [fRes, dRes] = await Promise.all([
        api.get('/admin/faculty'),
        api.get('/departments').catch(() => ({
          data: [
            { code: 'CYBER', name: 'Cybersecurity' },
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'ECE', name: 'Electronics & Communication Engineering' },
            { code: 'IT', name: 'Information Technology' }
          ]
        }))
      ]);
      setFaculty(fRes.data);
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
      await api.post('/admin/faculty', form);
      setMsg(`Faculty member ${form.full_name} (${form.faculty_id}) registered successfully.`);
      setModalOpen(false);
      setForm({
        full_name: '',
        email: '',
        password: 'Faculty@123',
        faculty_id: '',
        phone: '',
        designation: 'Assistant Professor',
        department_code: departments[0]?.code || 'CYBER',
        highest_degree: 'M.Tech / Ph.D.',
        specialization: 'Cybersecurity'
      });
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create faculty.');
    }
  };

  const handleDeleteFaculty = async (userId, name, facultyId) => {
    if (!window.confirm(`Delete faculty member ${name} (${facultyId})? This will also remove any assigned subjects and timetable entries.`)) {
      return;
    }
    try {
      await api.delete(`/admin/faculty/${userId}`);
      setMsg(`Faculty member ${name} deleted successfully.`);
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete faculty.');
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    const matchSearch =
      f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.faculty_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = !deptFilter || f.department_code === deptFilter || f.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Faculty Management Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain institutional teachers, assign department credentials, and review academic assignments.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher / Faculty</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name, ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Branch:</span>
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
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Faculty ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Branch / Dept</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No faculty found. Click "Add New Teacher / Faculty" above to add your 5 teachers.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f) => (
                  <tr key={f.user_id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">{f.faculty_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{f.full_name}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{f.department_code || f.department}</td>
                    <td className="py-3 px-4 text-slate-600">{f.designation}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{f.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setDetailsModal(f)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(f.user_id, f.full_name, f.faculty_id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Faculty"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Faculty Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Create New Teacher / Faculty Account</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Faculty ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAC-CYBER-001"
                    value={form.faculty_id}
                    onChange={(e) => setForm({ ...form, faculty_id: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@elc.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Initial Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2 pr-8 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
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
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Assistant Professor / Professor"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Highest Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Tech in Cybersecurity"
                    value={form.highest_degree}
                    onChange={(e) => setForm({ ...form, highest_degree: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
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
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
                >
                  Create Teacher Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              Faculty Profile: {detailsModal.full_name}
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Faculty ID:</span> <span className="font-mono font-bold text-purple-700">{detailsModal.faculty_id}</span></div>
                <div><span className="text-slate-500">Branch:</span> <span className="font-bold">{detailsModal.department_code || detailsModal.department}</span></div>
                <div><span className="text-slate-500">Email:</span> <span className="font-mono">{detailsModal.email}</span></div>
                <div><span className="text-slate-500">Phone:</span> <span>{detailsModal.phone || 'N/A'}</span></div>
                <div><span className="text-slate-500">Designation:</span> <span>{detailsModal.designation}</span></div>
                <div><span className="text-slate-500">Degree:</span> <span>{detailsModal.highest_degree || 'N/A'}</span></div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailsModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;
