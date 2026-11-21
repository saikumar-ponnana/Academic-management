import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HeaderBanner from '../../components/common/HeaderBanner';
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Clock,
  BookOpen,
  Calendar,
  ArrowRight,
  LogIn,
  UserPlus,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
  Sparkles,
  Server,
  FileText,
  Layers
} from 'lucide-react';
import api from '../../services/api';

const LandingPage = () => {
  const { user, login, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Hero Form States
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [registerRole, setRegisterRole] = useState('student');
  const [registerData, setRegisterData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    roll_number: '',
    department_code: 'CYBER',
    semester: 1,
    section: '1',
    academic_year: '2026-27',
    faculty_id: '',
    designation: 'Assistant Professor',
    highest_degree: 'Ph.D. in Cyber Security',
    specialization: 'Cyber Security & Digital Forensics'
  });

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(loginIdentifier, loginPassword);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'faculty') {
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

  const handleInlineRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = {
        full_name: registerData.full_name.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
        role: registerRole,
        phone: registerData.phone.trim(),
        department_code: 'CYBER'
      };

      if (registerRole === 'student') {
        payload.roll_number = registerData.roll_number.trim().toUpperCase();
        payload.semester = 1;
        payload.section = '1';
        payload.academic_year = '2026-27';
      } else {
        payload.faculty_id = registerData.faculty_id.trim().toUpperCase();
        payload.designation = registerData.designation;
        payload.highest_degree = registerData.highest_degree;
        payload.specialization = registerData.specialization;
      }

      const res = await api.post('/auth/register', payload);
      setSuccessMsg(
        registerRole === 'student'
          ? 'Registration submitted! Please wait for Administrator approval before logging in.'
          : 'Faculty registration submitted! Awaiting administrator approval.'
      );
      setAuthMode('login');
      setLoginIdentifier(payload.email);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#0e387a] selection:text-white">
      {/* 1. Official Gayatri Vidya Parishad Static Photo Header */}
      <HeaderBanner />

      {/* 2. Top Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0e387a] to-[#08224d] flex items-center justify-center text-amber-400 shadow-md shadow-[#0e387a]/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0e387a] block leading-none">
                Gayatri Vidya Parishad • ELC Center
              </span>
              <span className="text-sm font-black text-slate-800 tracking-tight block">
                Department of CSE (Cyber Security)
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-[#0e387a] transition">About Center</a>
            <a href="#features" className="hover:text-[#0e387a] transition">RNS Attendance</a>
            <a href="#curriculum" className="hover:text-[#0e387a] transition">Sem 1 Curriculum</a>
            <a href="#portals" className="hover:text-[#0e387a] transition">Portals</a>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="px-4 py-2 bg-[#0e387a] hover:bg-[#08224d] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                >
                  <span>Dashboard ({user.role?.toUpperCase()})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 font-bold text-[#0e387a] hover:bg-slate-100 rounded-xl border border-slate-300 transition flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 font-bold text-white bg-[#0e387a] hover:bg-[#08224d] rounded-xl shadow-md transition flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION WITH SUITABLE LANDING IMAGE & INLINE LOGIN/REGISTER FORM */}
      <section className="relative bg-gradient-to-b from-slate-100 via-white to-slate-50 py-8 sm:py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: HERO INFORMATION & SUITABLE LANDING IMAGE */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge & Title */}
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0e387a] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>GVPIHLR • Distinct Category under Section 3 of UGC Act, 1956</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Academic Management & Attendance Portal
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  Official institutional gateway for <strong>M.Tech in CSE (Cyber Security)</strong>. Enforces real-time RNS class attendance with mandatory <strong>7:00 PM IST Cutoff compliance</strong>, cloud study materials, lab manuals, and timetable coordination.
                </p>
              </div>

              {/* SUITABLE LANDING IMAGE / VISUAL SHOWCASE CARD */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-gradient-to-br from-[#0e387a] via-[#08224d] to-[#041026] text-white p-6 sm:p-7">
                {/* Background Pattern & Glow */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="relative z-10 space-y-5">
                  {/* Top Bar inside image card */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src="/assets/gvp_emblem.png"
                        alt="Gayatri Vidya Parishad Emblem"
                        className="w-12 h-12 object-contain bg-white/10 p-1 rounded-xl backdrop-blur-xs border border-white/20"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block">
                          Institution of Excellence • Estd. 1988
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                          Gayatri Vidya Parishad Center
                        </h3>
                      </div>
                    </div>

                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Cutoff: 7:00 PM IST</span>
                    </span>
                  </div>

                  {/* Main Visual Banner Graphic */}
                  <div className="rounded-xl overflow-hidden border border-white/20 shadow-md bg-white">
                    <img
                      src="/assets/gvpihlr_website_header_hd.png"
                      alt="Gayatri Vidya Parishad Institute of Higher Learning & Research"
                      className="w-full h-auto object-cover max-h-36 sm:max-h-44"
                    />
                  </div>

                  {/* Feature Badges inside landing visual */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                      <div className="flex items-center space-x-2 text-amber-400 mb-1">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-[11px] font-bold text-white">M.Tech Program</span>
                      </div>
                      <p className="text-[10px] text-slate-300">CSE (Cyber Security) Sem 1 (2026-27)</p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                      <div className="flex items-center space-x-2 text-blue-400 mb-1">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-[11px] font-bold text-white">Study Materials</span>
                      </div>
                      <p className="text-[10px] text-slate-300">ML Lab Manuals & GridFS Cloud Storage</p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 col-span-2 sm:col-span-1">
                      <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                        <Server className="w-4 h-4" />
                        <span className="text-[11px] font-bold text-white">Persistent DB</span>
                      </div>
                      <p className="text-[10px] text-slate-300">MongoDB Atlas Cloud Production Link</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Academic Details Bar */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialization</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">Cyber Security</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Classes</span>
                  <span className="text-xs font-bold text-blue-700 mt-0.5 block">30 Scheduled Slots</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                  <span className="text-xs font-bold text-emerald-700 mt-0.5 block">Visakhapatnam, AP</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INLINE LOGIN / REGISTER FORM IN PLACE */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 border-t-4 border-t-[#0e387a] p-6 sm:p-7">
                
                {/* If already authenticated, show Welcome Card */}
                {isAuthenticated ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Currently Logged In</span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">{user?.full_name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
                      <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800">
                        Role: {user?.role}
                      </span>
                    </div>

                    <div className="pt-4 space-y-2.5">
                      <button
                        onClick={() => navigate(getDashboardPath())}
                        className="w-full py-3 bg-[#0e387a] hover:bg-[#08224d] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                      >
                        <span>Open My Portal Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => logout()}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                      >
                        Switch Account / Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header of Form Card with Mode Toggle */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Academic Portal Access</h2>
                          <p className="text-xs text-slate-500">Sign in with your registered credentials</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e387a] flex items-center justify-center">
                          <Lock className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Tab Buttons: Sign In vs Register */}
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => { setAuthMode('login'); setError(''); }}
                          className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                            authMode === 'login'
                              ? 'bg-white text-[#0e387a] shadow-xs border border-slate-200'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Sign In</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAuthMode('register'); setError(''); }}
                          className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                            authMode === 'register'
                              ? 'bg-white text-[#0e387a] shadow-xs border border-slate-200'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Register</span>
                        </button>
                      </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                      <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2 text-red-700 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2 text-emerald-800 text-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    {/* MODE 1: UNIFIED SIGN IN FORM */}
                    {authMode === 'login' ? (
                      <form onSubmit={handleInlineLogin} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            Email, Roll Number, or Faculty ID
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. 26GVPCYB001 or registered email"
                              value={loginIdentifier}
                              onChange={(e) => setLoginIdentifier(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0e387a] focus:bg-white transition"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Directs automatically to student, faculty, or admin dashboard.
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              Password
                            </label>
                            <Link to="/login" className="text-[11px] text-[#0e387a] hover:underline font-semibold">
                              Forgot Password?
                            </Link>
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              placeholder="Enter your password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0e387a] focus:bg-white transition"
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
                          className="w-full py-3 bg-[#0e387a] hover:bg-[#08224d] disabled:bg-slate-400 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#0e387a]/25 transition flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Authenticating...</span>
                            </>
                          ) : (
                            <>
                              <span>Sign In to ELC Center</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      /* MODE 2: FAST INLINE REGISTRATION FORM */
                      <form onSubmit={handleInlineRegister} className="space-y-3">
                        {/* Student / Faculty Toggle */}
                        <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setRegisterRole('student')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                              registerRole === 'student' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                            }`}
                          >
                            Student Registration
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegisterRole('faculty')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                              registerRole === 'faculty' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600'
                            }`}
                          >
                            Faculty Registration
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 uppercase">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Saikumar Ponnana"
                            value={registerData.full_name}
                            onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 uppercase">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. student@gvp.edu"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                              {registerRole === 'student' ? 'Roll Number' : 'Faculty ID'}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={registerRole === 'student' ? '26GVPCYB001' : 'FAC-CYB-001'}
                              value={registerRole === 'student' ? registerData.roll_number : registerData.faculty_id}
                              onChange={(e) =>
                                registerRole === 'student'
                                  ? setRegisterData({ ...registerData, roll_number: e.target.value })
                                  : setRegisterData({ ...registerData, faculty_id: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 uppercase">Phone Number</label>
                            <input
                              type="tel"
                              placeholder="e.g. 9876543210"
                              value={registerData.phone}
                              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 uppercase">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="At least 6 characters"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                        >
                          {loading ? <span>Submitting...</span> : <span>Submit for Admin Approval</span>}
                        </button>
                      </form>
                    )}

                    {/* Bottom Notice */}
                    <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                      <p className="text-[10px] text-slate-400">
                        Attendance cutoff applies daily at <strong>7:00 PM IST</strong> under Gayatri Vidya Parishad institutional policy.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Portal Access Gateways */}
      <section id="portals" className="py-14 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0e387a] uppercase tracking-wider block">Role Portals</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Gayatri Vidya Parishad Portal Gateways
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Card */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Student Portal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time attendance tracking, Semester 1 weekly timetable schedules, and instant downloads of official laboratory experiment manuals.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-blue-50 text-[#0e387a] font-bold text-xs rounded-xl border border-blue-200 transition flex items-center justify-center space-x-1"
                >
                  <span>Access Student Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Faculty Card */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Faculty Desk</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Take & submit daily class attendance throughout the day before 7:00 PM IST, save drafts, and upload DOCX/PDF course study materials.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-purple-50 text-purple-800 font-bold text-xs rounded-xl border border-purple-200 transition flex items-center justify-center space-x-1"
                >
                  <span>Access Faculty Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Administrator Card */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Administrative Controller</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Institutional oversight, student & faculty registration approvals, cutoff overrides, timetable configuration, and audit logs.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition flex items-center justify-center space-x-1"
                >
                  <span>Access Admin Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Institutional Footer */}
      <footer id="about" className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Gayatri Vidya Parishad</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Institute of Higher Learning and Research (ELC Center)
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Department</h4>
              <p className="text-xs text-slate-400 mt-1">
                Department of Computer Science & Engineering (Cyber Security)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                M.Tech Program • Semester 1 (Academic Year 2026-27)
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Campus Location</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Kommadi, Madhurawada, Visakhapatnam – 530 048, Andhra Pradesh, India.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Timetable Attendance Policy Cutoff: 7:00 PM IST
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>© 2026 Gayatri Vidya Parishad Institute of Higher Learning & Research. All rights reserved.</span>
            <div className="flex space-x-4">
              <Link to="/login" className="hover:text-white transition">Sign In</Link>
              <Link to="/register" className="hover:text-white transition">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
