import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HeaderBanner from '../../components/common/HeaderBanner';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ShieldCheck, GraduationCap, Briefcase, UserPlus } from 'lucide-react';
import api from '../../services/api';

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email/ID or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(res.data.message);
    } catch (err) {
      setForgotMsg('Password reset instructions sent if email exists.');
    }
  };

  const getRoleDetails = () => {
    if (selectedRole === 'admin') {
      return {
        label: 'Administrator Email or ID',
        placeholder: 'e.g. admin@elc.edu',
        helper: 'Authorized Institutional Administrators only'
      };
    } else if (selectedRole === 'faculty') {
      return {
        label: 'Faculty ID or Institutional Email',
        placeholder: 'e.g. muralidhar@elc.edu or FAC-CYBER-003',
        helper: 'Approved Gayatri Vidya Parishad Faculty members'
      };
    } else {
      return {
        label: 'Roll Number or Student Email',
        placeholder: 'e.g. 26GVPCYB001 or your registered email',
        helper: 'Enrolled M.Tech CSE (Cyber Security) students'
      };
    }
  };

  const roleDetails = getRoleDetails();

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-between">
      {/* 1. Gayatri Vidya Parishad Static Photo Header */}
      <HeaderBanner />

      {/* Main Login Card Section */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 border-t-4 border-t-[#0e387a] w-full max-w-md p-7 sm:p-8">
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0e387a] to-[#08224d] text-amber-400 mb-3 shadow-md shadow-[#0e387a]/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="block text-[11px] font-bold text-[#0e387a] uppercase tracking-wider mb-0.5">
              Gayatri Vidya Parishad • ELC Center
            </span>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Academic Portal</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              CSE (Cyber Security) • M.Tech Program
            </p>
          </div>

          {/* Role Selection Tabs: Keeps inputs clean and empty for user entry */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Sign In As
              </span>
              <span className="text-[11px] text-[#0e387a] font-semibold">
                {roleDetails.helper}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedRole === 'student'
                    ? 'bg-white text-[#0e387a] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('faculty')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedRole === 'faculty'
                    ? 'bg-white text-[#0e387a] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedRole === 'admin'
                    ? 'bg-white text-[#0e387a] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {roleDetails.label}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={roleDetails.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0e387a] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-xs text-[#0e387a] hover:text-blue-900 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0e387a] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0e387a] hover:bg-[#08224d] disabled:bg-slate-400 text-white font-bold rounded-xl text-sm shadow-md shadow-[#0e387a]/25 transition duration-150 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to ELC Center</span>
              )}
            </button>
          </form>

          {/* First Time User Registration Link */}
          <div className="mt-5 text-center p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-600 mb-2">
              New student or faculty member?
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-[#0e387a] font-bold text-xs rounded-xl border border-[#0e387a]/30 shadow-xs transition duration-150 group"
            >
              <UserPlus className="w-4 h-4 mr-1.5 text-[#0e387a] group-hover:scale-110 transition-transform" />
              <span>Create New Account / Register</span>
            </Link>
          </div>

          {/* Institutional Note */}
          <div className="mt-5 pt-4 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Gayatri Vidya Parishad • Timetable attendance cutoff: 7:00 PM IST
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Reset Password</h3>
            <p className="text-xs text-slate-600 mb-4">
              Enter your registered institutional email address. Password reset instructions will be handled through institutional verification.
            </p>
            {forgotMsg ? (
              <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs mb-4">
                {forgotMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="name@elc.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => { setForgotModal(false); setForgotMsg(''); }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#0e387a] text-white text-xs font-semibold"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
            {forgotMsg && (
              <button
                onClick={() => { setForgotModal(false); setForgotMsg(''); }}
                className="w-full mt-2 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="text-center py-3 text-xs text-slate-500 border-t border-slate-200 bg-white/80">
        © 2026 Gayatri Vidya Parishad Institute of Higher Learning & Research • ELC Center. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;