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
  Layers,
  Award,
  BarChart3,
  Bell,
  Cpu,
  Database,
  Globe,
  Radio,
  ExternalLink
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
    highest_degree: 'Ph.D.',
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
        department_code: registerData.department_code
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

  const scrollToHeroForm = (mode) => {
    setAuthMode(mode);
    setError('');
    window.scrollTo({ top: 110, behavior: 'smooth' });
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
              <Building className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0e387a] block leading-none">
                Gayatri Vidya Parishad (GVPIHLR)
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight block">
                Integrated University Academic Portal
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#services" className="hover:text-[#0e387a] transition">Student Services</a>
            <a href="#departments" className="hover:text-[#0e387a] transition">Academic Departments</a>
            <a href="#attendance-policy" className="hover:text-[#0e387a] transition">Attendance (7 PM Cutoff)</a>
            <a href="#portals" className="hover:text-[#0e387a] transition">Portals</a>
            <a href="#about" className="hover:text-[#0e387a] transition">About University</a>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="px-4 py-2 bg-[#0e387a] hover:bg-[#08224d] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
              >
                <span>Dashboard ({user.role?.toUpperCase()})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => scrollToHeroForm('login')}
                  className="px-3.5 py-2 font-bold text-[#0e387a] hover:bg-slate-100 rounded-xl border border-slate-300 transition flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => scrollToHeroForm('register')}
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

      {/* 3. HERO SECTION WITH INSTITUTIONAL LANDING VISUAL & INLINE LOGIN/REGISTER FORM */}
      <section className="relative bg-gradient-to-b from-slate-100 via-white to-slate-50 py-8 sm:py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: HERO INFORMATION & SUITABLE LANDING IMAGE */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge & Title */}
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0e387a] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gayatri Vidya Parishad Institute of Higher Learning & Research (GVPIHLR)</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Unified University Academic & Student Lifecycle Portal
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  Centralized academic management system for <strong>all departments and programs</strong> across Gayatri Vidya Parishad. Empowering students with real-time class attendance (RNS), digital course materials, weekly timetables, laboratory manuals, and institutional examinations.
                </p>
              </div>

              {/* SUITABLE LANDING VISUAL SHOWCASE CARD */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-gradient-to-br from-[#0e387a] via-[#08224d] to-[#041026] text-white p-6 sm:p-7">
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
                          Gayatri Vidya Parishad University Campus
                        </h3>
                      </div>
                    </div>

                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      <Clock className="w-3.5 h-3.5" />
                      <span>RNS Cutoff: 7:00 PM IST</span>
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

                  {/* Feature Badges across all college disciplines */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                      <div className="flex items-center space-x-1.5 text-amber-400 mb-0.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold text-white">All Programs</span>
                      </div>
                      <p className="text-[10px] text-slate-300">Undergraduate & M.Tech Programs</p>
                    </div>

                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                      <div className="flex items-center space-x-1.5 text-blue-400 mb-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold text-white">Smart RNS</span>
                      </div>
                      <p className="text-[10px] text-slate-300">7:00 PM Cutoff Attendance</p>
                    </div>

                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                      <div className="flex items-center space-x-1.5 text-purple-400 mb-0.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold text-white">Digital Library</span>
                      </div>
                      <p className="text-[10px] text-slate-300">Lab Manuals & Course Notes</p>
                    </div>

                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                      <div className="flex items-center space-x-1.5 text-emerald-400 mb-0.5">
                        <Server className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold text-white">Atlas Cloud</span>
                      </div>
                      <p className="text-[10px] text-slate-300">Persistent Cloud Database</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Institutional Overview Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Scope</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">Entire College & University</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Departments</span>
                  <span className="text-xs font-bold text-blue-700 mt-0.5 block">CSE, Cyber, AIML, DS, ECE</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus</span>
                  <span className="text-xs font-bold text-emerald-700 mt-0.5 block">Kommadi, Visakhapatnam</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INLINE LOGIN / REGISTER FORM IN PLACE */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 border-t-4 border-t-[#0e387a] p-6 sm:p-7">
                
                {/* Authenticated View */}
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
                    {/* Form Card Header with Mode Toggle */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">University Portal Access</h2>
                          <p className="text-xs text-slate-500">Sign in with your registered college credentials</p>
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
                              placeholder="e.g. 26GVPCYB001, faculty ID, or email"
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
                              <span>Sign In to Academic Portal</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      /* MODE 2: FAST INLINE REGISTRATION FORM ACROSS ALL DEPARTMENTS */
                      <form onSubmit={handleInlineRegister} className="space-y-3">
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
                          <label className="block text-[11px] font-semibold text-slate-700 uppercase">Department</label>
                          <select
                            value={registerData.department_code}
                            onChange={(e) => setRegisterData({ ...registerData, department_code: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white"
                          >
                            <option value="CYBER">CSE (Cyber Security) • M.Tech</option>
                            <option value="AIML">CSE (AI & Machine Learning)</option>
                            <option value="CSE">Computer Science & Engineering (Core)</option>
                            <option value="DS">Data Science & Analytics</option>
                            <option value="ECE">Electronics & Communication Engineering</option>
                          </select>
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

      {/* 4. COMPLETE STUDENT ACADEMIC ECOSYSTEM (NOT ONLY ATTENDANCE) */}
      <section id="services" className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#0e387a] uppercase tracking-wider block">Comprehensive Student Lifecycle</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              All Essential Academic Services for Students
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Beyond attendance: an integrated portal engineered to manage every aspect of the student journey from admission to graduation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1: Curriculum & Courses */}
            <div className="p-6 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 transition duration-150 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Course Catalog & Syllabi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full course matrices across semesters, credit breakdowns, course learning objectives (CLOs), outcome-based education (OBE) mapping, and prerequisites.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 pt-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Interactive course enrollments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Official syllabus documents</span>
                </li>
              </ul>
            </div>

            {/* Service 2: Smart Attendance & RNS */}
            <div className="p-6 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-300 transition duration-150 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Smart Attendance & RNS System</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Live session-by-session class attendance tracking with subject-wise percentages, 75% statutory minimum threshold alerts, and 7:00 PM IST strict cutoff enforcement.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 pt-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Subject-wise & overall attendance %</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Administrative late override tracking</span>
                </li>
              </ul>
            </div>

            {/* Service 3: Digital Library & Lab Manuals */}
            <div className="p-6 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-purple-300 transition duration-150 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Digital Library & Lab Manuals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct access to laboratory experiment manuals (e.g. Dr. P. Muralidhar Rao's ML Lab Manual), faculty lecture slides, reference guides, and research archives via GridFS.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 pt-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Instant DOCX and PDF document viewing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Persistent MongoDB Atlas binary storage</span>
                </li>
              </ul>
            </div>

            {/* Service 4: Dynamic Timetable & Rooms */}
            <div className="p-6 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition duration-150 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Dynamic Timetables & Schedules</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                30 weekly scheduled timetable slots mapped Monday through Saturday, featuring classroom numbers (B4-404), laboratory complexes, lecture hours, and faculty assignments.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 pt-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Personalized student weekly timetable</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time period indicator</span>
                </li>
              </ul>
            </div>

            {/* Service 5: Examinations & Progress */}
            <div className="p-6 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-cyan-300 transition duration-150 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Examinations & Academic Progress</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Continuous internal evaluation (CIE), mid-term examinations, semester-end assessment, grading rubrics, and GPA / CGPA progression analytics.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 pt-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                  <span>Internal assessment marks transparency</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                  <span>Academic performance metrics</span>
                </li>
              </ul>
            </div>

            {/* Service 6: Notices & Placement News */}
            <div className="p-6 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-rose-300 transition duration-150 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Announcements & Campus Circulars</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant university notices, holiday notifications, seminar invitations, coding hackathons, technical symposiums, and institutional placement drives.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 pt-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Official administrative circulars</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Student technical activities & workshops</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOTAL COLLEGE DEPARTMENTS & SPECIALIZATIONS */}
      <section id="departments" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#0e387a] uppercase tracking-wider block">Academic Programs</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Gayatri Vidya Parishad Academic Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Offering undergraduate, postgraduate, and specialized research programs with modern outcome-based education.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Dept 1: Cyber Security */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs border-t-4 border-t-blue-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  CODE: CYBER
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Flagship ELC Center
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Department of CSE (Cyber Security)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                M.Tech & Advanced Research in Network Intrusion Detection, Cryptography, Reverse Engineering, Machine Learning for Security, and Ethical Hacking.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Faculty: Dr. P. Muralidhar Rao & Team</span>
                <span className="font-bold text-blue-700">Sem 1 Active</span>
              </div>
            </div>

            {/* Dept 2: AIML */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs border-t-4 border-t-purple-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  CODE: AIML
                </span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Advanced Computing
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">CSE (AI & Machine Learning)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deep Learning, Natural Language Processing, Computer Vision, Autonomous Systems, Predictive Analytics, and High-Performance Neural Networks.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Specialized AI Compute Labs</span>
                <span className="font-bold text-purple-700">Enrolling</span>
              </div>
            </div>

            {/* Dept 3: Core CSE */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs border-t-4 border-t-indigo-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  CODE: CSE
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Foundation
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Computer Science & Engineering</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Core Software Engineering, Distributed Systems, Cloud Computing Architectures, Advanced Data Structures, and Compiler Design.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Full Undergraduate & PG</span>
                <span className="font-bold text-indigo-700">Active</span>
              </div>
            </div>

            {/* Dept 4: Data Science */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs border-t-4 border-t-emerald-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  CODE: DS
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Analytics
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Data Science & Big Data Systems</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Big Data Analytics, Statistical Inference, Cloud Pipelines, Business Intelligence, Data Warehousing, and Real-Time Stream Processing.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Analytics Laboratory</span>
                <span className="font-bold text-emerald-700">Active</span>
              </div>
            </div>

            {/* Dept 5: ECE */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs border-t-4 border-t-amber-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  CODE: ECE
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Hardware & Telecom
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Electronics & Communication</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                VLSI Design, Embedded Systems, Internet of Things (IoT), Wireless Signal Processing, Microwave Engineering, and Robotics.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>VLSI & IoT Complex</span>
                <span className="font-bold text-amber-700">Active</span>
              </div>
            </div>

            {/* Dept 6: ELC Research Center */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs border-t-4 border-t-cyan-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                  CODE: ELC-CTR
                </span>
                <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                  Innovation
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">ELC Learning & Research Center</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Center for advanced research publications, patent filings, faculty development programs, and interdisciplinary applied engineering projects.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Interdisciplinary Center</span>
                <span className="font-bold text-cyan-700">Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INSTITUTIONAL ATTENDANCE POLICY (RNS CUTOFF: 7:00 PM IST) */}
      <section id="attendance-policy" className="py-12 bg-gradient-to-r from-[#0e387a] to-[#08224d] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-300" />
                <span className="text-xs uppercase font-bold tracking-wider text-amber-300">
                  Statutory University Attendance Policy
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">Daily 7:00 PM IST Attendance Cutoff Rule</h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                In compliance with Gayatri Vidya Parishad institutional governance, all faculty must submit attendance for scheduled classes on the same day before <strong>7:00 PM IST</strong>. After 7:00 PM, sessions lock strictly and require an administrative override.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
              <span className="text-[11px] text-amber-300 font-bold uppercase block">Official Deadline</span>
              <span className="text-2xl font-black text-white font-mono mt-0.5 block">19:00:00 IST</span>
              <span className="text-[10px] text-slate-300 mt-1 block">Asia/Kolkata Clock</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PORTAL ACCESS GATEWAYS (Student, Faculty, Admin) */}
      <section id="portals" className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0e387a] uppercase tracking-wider block">Access Gateways</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Role-Specific Portal Gateways
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
                  Real-time attendance percentage tracking, weekly timetables, course syllabi, and direct downloads of official laboratory manuals across all departments.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => scrollToHeroForm('login')}
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
                  Take & submit daily class attendance throughout the day before 7:00 PM IST, save drafts, manage enrolled student rosters, and upload study materials.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => scrollToHeroForm('login')}
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
                  Institutional oversight: approve pending student & faculty registrations across all departments, grant late attendance overrides, and audit logs.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => scrollToHeroForm('login')}
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

      {/* 8. INSTITUTIONAL FOOTER */}
      <footer id="about" className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Gayatri Vidya Parishad</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Institute of Higher Learning and Research (GVPIHLR)
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Deemed to be University under Distinct Category under Section 3 of the UGC Act, 1956.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Academic Disciplines</h4>
              <p className="text-xs text-slate-400 mt-1">
                Computer Science & Engineering • Cyber Security • AI & Machine Learning • Data Science • Electronics & Communication
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Academic Year 2026-27 • Integrated Academic Management
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
              <button onClick={() => scrollToHeroForm('login')} className="hover:text-white transition">Sign In</button>
              <button onClick={() => scrollToHeroForm('register')} className="hover:text-white transition">Register</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
