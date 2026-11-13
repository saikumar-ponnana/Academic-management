import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Plus, UserPlus, CheckCircle2, Trash2, Users, Layers, ShieldCheck } from 'lucide-react';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseModal, setCourseModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // New course form
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    department_code: 'CYBER',
    semester: 3,
    credits: 3,
    description: ''
  });

  // Assignment form
  const [assignForm, setAssignForm] = useState({
    faculty_user_id: '',
    department_code: 'CYBER',
    semester: 3,
    section: 'A',
    academic_year: '2026-2027'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, fRes, aRes, dRes] = await Promise.all([
        api.get('/courses'),
        api.get('/admin/faculty'),
        api.get('/admin/course-assignments').catch(() => ({ data: [] })),
        api.get('/departments').catch(() => ({
          data: [
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'CYBER', name: 'Cybersecurity' },
            { code: 'ECE', name: 'Electronics & Communication Engineering' },
            { code: 'IT', name: 'Information Technology' }
          ]
        }))
      ]);
      setCourses(cRes.data);
      setFaculty(fRes.data);
      setAssignments(aRes.data);
      setDepartments(dRes.data.length > 0 ? dRes.data : [
        { code: 'CYBER', name: 'CSE (Cyber Security)' }
      ]);

      if (fRes.data.length > 0) {
        setAssignForm((prev) => ({ ...prev, faculty_user_id: fRes.data[0].user_id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/courses', courseForm);
      setMsg(`Subject '${courseForm.name}' (${courseForm.code}) added successfully.`);
      setCourseModal(false);
      setCourseForm({
        code: '',
        name: '',
        department_code: departments[0]?.code || 'CYBER',
        semester: 3,
        credits: 3,
        description: ''
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create course.');
    }
  };

  const handleDeleteCourse = async (courseId, courseCode) => {
    if (!window.confirm(`Are you sure you want to delete course ${courseCode}? This will also delete any related timetable slots and teacher assignments.`)) {
      return;
    }
    try {
      await api.delete(`/courses/${courseId}`);
      setMsg(`Course ${courseCode} deleted successfully.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete course.');
    }
  };

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    if (!assignModal) return;
    setError('');
    try {
      await api.post('/admin/course-assignments', {
        ...assignForm,
        course_id: assignModal._id,
        department_code: assignForm.department_code || assignModal.department_code,
        semester: assignModal.semester
      });
      setMsg(`Successfully mapped teacher to ${assignModal.name} (${assignModal.code}).`);
      setAssignModal(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to map faculty.');
    }
  };

  const handleUnassignFaculty = async (assignmentId, courseCode, facultyName) => {
    if (!window.confirm(`Unmap ${facultyName} from teaching ${courseCode}?`)) {
      return;
    }
    try {
      await api.delete(`/admin/course-assignments/${assignmentId}`);
      setMsg(`Teacher allocation removed.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to unmap teacher.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Course Catalog & Faculty Teaching Allocations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create curriculum subjects for your branches (e.g. Cybersecurity), assign teachers, and allocate classes.
          </p>
        </div>

        <button
          onClick={() => { setError(''); setCourseModal(true); }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center space-x-2">
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Subject Catalog Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Active Subjects / Courses ({courses.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Click "Map Teacher" to assign faculty</span>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-600 font-semibold">No subjects created yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add New Subject" above to create subjects for your Cybersecurity or Engineering classes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                      {c.code}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-semibold">{c.credits} Credits</span>
                      <button
                        onClick={() => handleDeleteCourse(c._id, c.code)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-2">{c.name}</h3>
                  <p className="text-xs text-slate-500">Branch: <span className="font-semibold text-slate-700">{c.department_code}</span> • Semester {c.semester}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{c.description || 'No description provided.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Active Curriculum</span>
                  <button
                    onClick={() => {
                      setAssignModal(c);
                      setAssignForm((p) => ({ ...p, department_code: c.department_code, semester: c.semester }));
                    }}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs flex items-center space-x-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Map Teacher</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Faculty Teaching Allocations (Mapping Table) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-800">Teacher to Subject Allocations (Mappings)</h3>
          </div>
          <span className="text-xs text-slate-500">{assignments.length} Active Mappings</span>
        </div>

        {assignments.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 italic">
            No teachers have been mapped to subjects yet. Use the "Map Teacher" button on any subject card above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject Code & Name</th>
                  <th className="py-3 px-4">Assigned Teacher</th>
                  <th className="py-3 px-4">Branch / Dept</th>
                  <th className="py-3 px-4">Class / Section</th>
                  <th className="py-3 px-4">Academic Year</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <span className="font-mono text-blue-700 font-bold mr-1.5">[{a.course_code}]</span>
                      {a.course_name}
                    </td>
                    <td className="py-3 px-4 text-purple-800 font-medium">{a.faculty_name || a.faculty_user_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{a.department_code}</td>
                    <td className="py-3 px-4 text-slate-600">Sem {a.semester} — Sec {a.section}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{a.academic_year}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleUnassignFaculty(a._id, a.course_code, a.faculty_name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Unmap Teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Add New Subject Modal */}
      {courseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Add New Academic Subject</span>
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CYB301 or CS201"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Network Security & Cryptography"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Branch / Department *</label>
                  <select
                    value={courseForm.department_code}
                    onChange={(e) => setCourseForm({ ...courseForm, department_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Semester</label>
                  <select
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Description / Syllabus Overview</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the course curriculum"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCourseModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Map Faculty to Subject Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              Map Teacher to {assignModal.name} ({assignModal.code})
            </h3>
            <p className="text-xs text-slate-500">
              Assign which faculty member conducts this subject for your class.
            </p>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAssignFaculty} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold uppercase mb-1">Select Faculty Teacher *</label>
                <select
                  required
                  value={assignForm.faculty_user_id}
                  onChange={(e) => setAssignForm({ ...assignForm, faculty_user_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {faculty.map((f) => (
                    <option key={f.user_id} value={f.user_id}>
                      {f.full_name} ({f.faculty_id} - {f.department_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Branch / Dept *</label>
                  <select
                    value={assignForm.department_code}
                    onChange={(e) => setAssignForm({ ...assignForm, department_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold uppercase mb-1">Section *</label>
                  <select
                    value={assignForm.section}
                    onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold uppercase mb-1">Academic Year</label>
                <input
                  type="text"
                  value={assignForm.academic_year}
                  onChange={(e) => setAssignForm({ ...assignForm, academic_year: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModal(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
                >
                  Confirm Official Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
