import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Alerts
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  // Password Visibility Toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form State: Profile & Contact
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    roll_number: '',
    department_code: 'CYBER',
    semester: 1,
    section: '1',
    academic_year: '2026-27'
  });

  // Form State: Change Password
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      setProfile(res.data);
      setFormData({
        full_name: res.data.full_name || user?.full_name || '',
        email: res.data.email || user?.email || '',
        phone: res.data.phone || '',
        roll_number: res.data.roll_number || '',
        department_code: res.data.department_code || 'CYBER',
        semester: res.data.semester || 1,
        section: res.data.section || '1',
        academic_year: res.data.academic_year || '2026-27'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // 1. Submit Profile Information & Overwrite Records
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setSavingProfile(true);

    try {
      const res = await api.patch('/auth/profile', {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim()
      });

      // Update Auth context and local storage immediately
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('elc_user', JSON.stringify(res.data.user));
      }

      setProfileMsg('Student profile and login email updated successfully! You can log in with your updated details.');
      fetchProfile();
    } catch (err) {
      setProfileErr(err.response?.data?.detail || 'Failed to update student profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Submit Change Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordErr('New password and confirmation password do not match.');
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordErr('New password must be at least 6 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      setPasswordMsg(res.data.message || 'Password changed successfully! Next time you sign in, use your new password.');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordErr(err.response?.data?.detail || 'Current password verification failed. Please check your old password.');
    } finally {
      setSavingPassword(false);
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-800">Student Profile & Settings</h2>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border bg-emerald-100 text-emerald-800 border-emerald-300">
              Enrolled Student
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Roll Number: <span className="font-semibold text-blue-700 font-mono">{formData.roll_number}</span> • M.Tech CSE (Cyber Security)
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-blue-50 text-blue-900 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Active Login: {user?.email}</span>
        </div>
      </div>

      {/* 1. Main Profile Editing Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {profileMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2.5 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{profileMsg}</span>
          </div>
        )}

        {profileErr && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center space-x-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-medium">{profileErr}</span>
          </div>
        )}

        {/* Editable Personal & Login Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-base">1. Personal Name & Login Email</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Roll Number (Permanent)
              </label>
              <input
                type="text"
                readOnly
                value={formData.roll_number}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-600 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center justify-between">
                <span>Email Address (Login Username) *</span>
                <span className="text-[10px] text-blue-600 font-semibold normal-case">Updates login email</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98480 12345"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Read-Only Academic Records */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base">2. Enrolled Academic Records</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold uppercase block text-[10px]">Department</span>
              <span className="text-slate-800 font-bold text-sm">CSE (Cyber Security)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold uppercase block text-[10px]">Degree Program</span>
              <span className="text-slate-800 font-bold text-sm">M.Tech (2-Year)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold uppercase block text-[10px]">Semester & Section</span>
              <span className="text-blue-700 font-bold text-sm">Semester {formData.semester} • Sec {formData.section}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold uppercase block text-[10px]">Academic Year</span>
              <span className="text-slate-800 font-bold text-sm">{formData.academic_year || '2026-27'}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition flex items-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Overwriting Records...' : 'Save & Overwrite Profile'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 2. Change Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
          <KeyRound className="w-5 h-5 text-amber-600" />
          <h3 className="text-base">3. Change Student Account Password</h3>
        </div>

        <p className="text-xs text-slate-500">
          Enter your current old password to verify your account, then set your new password.
        </p>

        {passwordMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2.5 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{passwordMsg}</span>
          </div>
        )}

        {passwordErr && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center space-x-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-medium">{passwordErr}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Current / Old Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                name="current_password"
                placeholder="Enter current password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  name="new_password"
                  placeholder="At least 6 characters"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  name="confirm_password"
                  placeholder="Repeat new password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-600/20 transition flex items-center space-x-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{savingPassword ? 'Changing Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
