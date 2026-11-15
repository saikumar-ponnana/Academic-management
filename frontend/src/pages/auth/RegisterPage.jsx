import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HeaderBanner from '../../components/common/HeaderBanner';
import {
  UserPlus,
  GraduationCap,
  Briefcase,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import api from '../../services/api';

const RegisterPage = () => {
  const [role, setRole] = useState('student'); // 'student' or 'faculty'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [submittedRole, setSubmittedRole] = useState('student');
  const [departments, setDepartments] = useState([
    { code: 'CYBER', name: 'CSE (Cyber Security)' }
  ]);

  // Form fields
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    // Student
    roll_number: '',
    department_code: 'CYBER',
    semester: 1,
    section: '1',
    academic_year: '2026-27',
    // Faculty
    faculty_id: '',
    designation: 'Assistant Professor',
    highest_degree: 'Ph.D. in Cyber Security',
    specialization: 'Cyber Security & Digital Forensics'
  });

  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/departments')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setDepartments(res.data);
          setFormData((prev) => ({ ...prev, department_code: res.data[0].code }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        role,
        full_name: (formData.full_name || '').trim(),
        email: (formData.email || '').trim().toLowerCase(),
        password: formData.password,
        phone: (formData.phone || '').trim(),
        ...(role === 'student'
          ? {
              roll_number: (formData.roll_number || '').trim().toUpperCase(),
              department_code: formData.department_code || 'CYBER',
              semester: Number(formData.semester) || 1,
              section: (formData.section || '1').trim(),
              academic_year: formData.academic_year || '2026-27'
            }
          : {
              faculty_id: (formData.faculty_id || '').trim().toUpperCase(),
              department_code: formData.department_code || 'CYBER',
              designation: formData.designation || 'Assistant Professor',
              highest_degree: formData.highest_degree || 'Ph.D.',
              specialization: formData.specialization || 'Cyber Security'
            })
      };

      await api.post('/auth/register', payload);
      setSubmittedRole(role);
      setRegistrationSuccess(true);
    } catch (err) {
      let detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        detail = detail.map((e) => e.msg || e.detail).join('; ');
      } else if (typeof detail === 'object' && detail !== null) {
        detail = JSON.stringify(detail);
      }
      setError(detail || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-between">
      {/* 1. Official Gayatri Vidya Parishad Static Photo Header */}
      <HeaderBanner />

      {/* Main Registration Card */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        {registrationSuccess ? (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 border-t-4 border-t-amber-500 w-full max-w-lg p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200 shadow-sm">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[#0e387a] uppercase tracking-wider mb-1">
                Gayatri Vidya Parishad • ELC Center
              </span>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                {submittedRole === 'faculty' ? 'Faculty' : 'Student'} Registration Submitted
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Application Received for CSE (Cyber Security) • M.Tech Program
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-left space-y-2 text-xs text-amber-950">
              <p className="font-bold flex items-center space-x-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Pending Institutional Administrator Approval</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Your <strong>{submittedRole === 'faculty' ? 'Faculty' : 'Student'}</strong> registration has been securely submitted. To maintain academic integrity and prevent unauthorized activity, all registrations must be reviewed and approved by the Gayatri Vidya Parishad Administrator before account access is activated.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 pt-1">
                <li>Your profile is currently queued in the Administrator Approval panel.</li>
                <li>Once the Administrator verifies and clicks <strong>Approve</strong>, your login will be immediately enabled.</li>
              </ul>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 bg-[#0e387a] hover:bg-[#08224d] text-white font-bold rounded-xl text-sm shadow-md shadow-[#0e387a]/20 transition"
              >
                Return to Academic Portal Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 border-t-4 border-t-[#0e387a] w-full max-w-xl p-7 sm:p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0e387a] to-[#08224d] text-amber-400 mb-2 shadow-md">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="block text-[11px] font-bold text-[#0e387a] uppercase tracking-wider mb-0.5">
              Gayatri Vidya Parishad • ELC Center
            </span>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Academic Account</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              CSE (Cyber Security) • M.Tech Program
            </p>
          </div>

          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setRole('student'); setError(''); }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
                role === 'student'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Register as Student</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('faculty'); setError(''); }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
                role === 'faculty'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Register as Faculty</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Common Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold uppercase mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sai Kumar"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold uppercase mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="student@elc.edu"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold uppercase mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="+91 98480 12345"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Section */}
            {role === 'student' ? (
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <h4 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  <span>Academic Student Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">Roll Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 26GVPCYB001"
                      name="roll_number"
                      value={formData.roll_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">Department / Branch *</label>
                    <select
                      name="department_code"
                      value={formData.department_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    >
                      {departments.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">Semester</label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    >
                      {[1, 2, 3, 4].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem} (M.Tech)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">Section</label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    >
                      <option value="1">Section 1</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
                <h4 className="font-bold text-purple-900 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4 text-purple-700" />
                  <span>Academic Faculty Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">Faculty ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FAC-CYBER-001"
                      name="faculty_id"
                      value={formData.faculty_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">Department / Branch *</label>
                    <select
                      name="department_code"
                      value={formData.department_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    >
                      {departments.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Assistant Professor / Professor"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">Highest Degree</label>
                    <input
                      type="text"
                      placeholder="e.g. Ph.D. in Cyber Security"
                      name="highest_degree"
                      value={formData.highest_degree}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-xl text-sm shadow-md transition duration-150 flex items-center justify-center space-x-2 ${
                role === 'faculty'
                  ? 'bg-purple-700 hover:bg-purple-800 shadow-purple-600/25'
                  : 'bg-[#0e387a] hover:bg-[#08224d] shadow-[#0e387a]/25'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Complete Registration & Enter Portal</span>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>

      <footer className="text-center py-3 text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 Gayatri Vidya Parishad Institute of Higher Learning & Research. All rights reserved.
      </footer>
    </div>
  );
};

export default RegisterPage;
