import React from 'react';
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
  FileText,
  Users,
  Building,
  Lock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#0e387a] selection:text-white">
      {/* 1. Official Institutional Header Banner */}
      <HeaderBanner />

      {/* 2. Top Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0e387a] to-[#08224d] flex items-center justify-center text-amber-400 shadow-md shadow-[#0e387a]/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0e387a] block leading-none">
                ELC Academic Center
              </span>
              <span className="text-sm font-black text-slate-800 tracking-tight block">
                CSE (Cyber Security)
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-[#0e387a] transition">About Department</a>
            <a href="#features" className="hover:text-[#0e387a] transition">Portal Features</a>
            <a href="#curriculum" className="hover:text-[#0e387a] transition">M.Tech Curriculum</a>
            <a href="#portals" className="hover:text-[#0e387a] transition">Portals</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="px-4 py-2 bg-[#0e387a] hover:bg-[#08224d] text-white text-xs font-bold rounded-xl shadow-md shadow-[#0e387a]/20 transition flex items-center space-x-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-[#0e387a] hover:bg-slate-100 rounded-xl border border-slate-300 transition flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0e387a] hover:bg-[#08224d] rounded-xl shadow-md shadow-[#0e387a]/20 transition flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-12 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Tagline */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0e387a] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gayatri Vidya Parishad Institute of Higher Learning & Research</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Integrated Academic Portal & Attendance System
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Department of <strong>Computer Science & Engineering (Cyber Security)</strong> • M.Tech Program. Real-time RNS attendance management with authoritative 7:00 PM IST cutoff compliance, official study materials, timetable coordination, and verified institutional workflows.
            </p>

            {/* Hero CTA Box */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#0e387a] hover:bg-[#08224d] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#0e387a]/25 transition flex items-center justify-center space-x-2"
                >
                  <span>Enter My Dashboard ({user.role?.toUpperCase()})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-7 py-3.5 bg-[#0e387a] hover:bg-[#08224d] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#0e387a]/25 transition flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Academic Portal</span>
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4 text-[#0e387a]" />
                    <span>Create Student / Faculty Account</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Stat Badges */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialization</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">CSE (Cyber Security)</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RNS Cutoff</span>
                <span className="text-xs font-bold text-blue-700 font-mono mt-0.5 block">7:00 PM IST Daily</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Semester</span>
                <span className="text-xs font-bold text-emerald-700 mt-0.5 block">M.Tech Sem 1 (2026-27)</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Storage</span>
                <span className="text-xs font-bold text-amber-700 mt-0.5 block">MongoDB Atlas Cloud</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Portal Access Gateways */}
      <section id="portals" className="py-14 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0e387a] uppercase tracking-wider block">Institutional Access</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Select Your Academic Role Gateway
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Sign in with your registered credentials. Our unified portal automatically identifies your role and directs you to your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Card */}
            <div className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Student Portal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  View enrolled Semester 1 courses, inspect daily timetable schedules, monitor real-time class attendance percentages, and download official laboratory manuals.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Real-time Attendance Tracker</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Machine Learning Lab Manual & Course Materials</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Weekly Class Timetable & Room Schedules</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 bg-white hover:bg-blue-50 text-[#0e387a] font-bold text-xs rounded-xl border border-blue-200 transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <span>Student Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Faculty Card */}
            <div className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Faculty Desk</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit daily class attendance, take roll calls before the 7:00 PM IST cutoff, upload study materials and lab manuals, and manage enrolled student rosters.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Full-day Attendance Register with Draft & Submit</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Upload & Manage DOCX/PDF Study Materials</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Department Teaching Timetable Allocations</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 bg-white hover:bg-purple-50 text-purple-800 font-bold text-xs rounded-xl border border-purple-200 transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <span>Faculty Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Administrator Card */}
            <div className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-amber-300 transition duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Administrative Controller</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comprehensive institutional oversight: review and approve new student/faculty registrations, grant late attendance overrides, maintain timetable structures, and audit logs.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Approve Pending Student & Faculty Registrations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Attendance Cutoff Overrides & Audit Reports</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Master Timetable & Course Registry Configuration</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <span>Admin Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Key System Highlights */}
      <section id="features" className="py-14 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0e387a] uppercase tracking-wider block">Operational Rigor</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Built for Institutional Cyber Security Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Authoritative 7:00 PM IST Cutoff</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adheres strictly to the Gayatri Vidya Parishad institutional policy. All faculty class attendance registers must be finalized before 7:00 PM IST, after which sessions lock automatically.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0e387a] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Cloud Study Material Storage</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Backed directly by persistent MongoDB Atlas and GridFS cloud binary storage. All faculty lecture notes, experiment manuals, and syllabi remain permanently available.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Dynamic Timetable Coordination</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                30 weekly timetable schedule slots mapped across Monday through Saturday for M.Tech CSE (Cyber Security) Sem 1, with room assignments and faculty allocations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. M.Tech CSE (Cyber Security) Sem 1 Curriculum Section */}
      <section id="curriculum" className="py-14 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0e387a] uppercase tracking-wider block">Academic Structure</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              M.Tech CSE (Cyber Security) • Semester 1
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gayatri Vidya Parishad Institute of Higher Learning & Research (ELC Center)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">CYB101</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">Advanced Data Structures & Algorithms</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Faculty: Dr. Birender Biswal</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">CYB102</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">Mathematical Foundations of Cyber Security</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Faculty: Dr. P. Prapoorna Roja</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-l-4 border-l-blue-600">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">CYB103</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">ML Applications for Cyber Security</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Faculty: Dr. P. Muralidhar Rao</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">CYB104</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">Network Security & Cryptography</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Faculty: Dr. A. Yashwanth</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">CYB105</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">Operating Systems Security</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Faculty: Dr. K.K. Sandhya Rani</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">CYB106</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">Ethical Hacking & Digital Forensics</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Faculty: Dr. Ch. Sita Kumari</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-l-4 border-l-emerald-600">
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">CYB107L</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">ML Cyber Security Lab</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Faculty: Dr. P. Muralidhar Rao</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">CYB108L</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">Ethical Hacking Laboratory</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Faculty: Dr. Ch. Sita Kumari</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Ready to Sign In CTA Banner */}
      <section className="py-12 bg-gradient-to-r from-[#0e387a] to-[#08224d] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-black">Ready to Access Your Academic Portal?</h3>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Students and faculty can sign in immediately with their registered email address, roll number, or faculty ID.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3 bg-white text-[#0e387a] hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to Sign In Page</span>
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3 bg-transparent hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/40 transition flex items-center justify-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Student / Faculty Registration</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Institutional Footer */}
      <footer id="about" className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
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
