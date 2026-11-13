import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  BookOpen,
  Users,
  Calendar,
  FolderArchive,
  ClipboardCheck,
  Megaphone,
  ArrowLeft,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import DocumentViewerModal from '../../components/common/DocumentViewerModal';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [cRes, sRes, tRes, mRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/students`),
        api.get(`/courses/${courseId}/timetable`),
        api.get(`/courses/${courseId}/materials`)
      ]);
      setCourse(cRes.data);
      setStudents(sRes.data);
      setTimetable(tRes.data);
      setMaterials(mRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '1. Overview', icon: BookOpen },
    { id: 'students', label: '2. Students', icon: Users, count: students.length },
    { id: 'timetable', label: '3. Timetable', icon: Calendar, count: timetable.length },
    { id: 'materials', label: '4. Study Materials', icon: FolderArchive, count: materials.length },
    { id: 'attendance', label: '5. Attendance', icon: ClipboardCheck },
    { id: 'announcements', label: '6. Announcements', icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/faculty/courses" className="hover:text-blue-600 flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-700">{course?.name}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold font-mono">
              {course?.code}
            </span>
            <span className="text-xs text-slate-500">
              Department of {course?.department_code} • Semester {course?.semester}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">{course?.name}</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">{course?.description}</p>
        </div>

        <Link
          to="/faculty/attendance"
          className="self-start md:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow transition flex items-center space-x-2"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Mark Class Attendance</span>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-800">Course Syllabus & Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {course?.description || 'Detailed syllabus and curriculum approved by ELC Academic Council.'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-800">Assigned Sections & Faculty Allocation</h3>
              <div className="space-y-2">
                {course?.assignments?.map((a) => (
                  <div key={a._id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">Section {a.section}</span>
                      <span className="text-slate-500 ml-2">({a.academic_year})</span>
                    </div>
                    <span className="font-semibold text-blue-700">{a.faculty_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800">Course Stats</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Enrolled Students</span>
                <span className="font-bold text-slate-800">{students.length}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Credits</span>
                <span className="font-bold text-slate-800">{course?.credits || 3}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Weekly Classes</span>
                <span className="font-bold text-slate-800">{timetable.length}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Study Materials</span>
                <span className="font-bold text-slate-800">{materials.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Enrolled Students Roster ({students.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Conducted</th>
                  <th className="py-3 px-4">Attended</th>
                  <th className="py-3 px-4">Attendance %</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const pct = s.attendance_percentage ?? 100;
                  const isLow = pct < 75;
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{s.roll_number}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{s.full_name}</td>
                      <td className="py-3 px-4 text-slate-600">{s.section}</td>
                      <td className="py-3 px-4 text-slate-600">{s.conducted_sessions || 0}</td>
                      <td className="py-3 px-4 text-slate-600">{s.attended_sessions || 0}</td>
                      <td className="py-3 px-4 font-bold">
                        <span className={isLow ? 'text-red-600' : 'text-emerald-700'}>{pct}%</span>
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            Low &lt;75%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800">Course Class Timetable Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetable.map((t) => (
              <div key={t._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase">{t.day_of_week}</span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-200 rounded font-medium">Sec {t.section}</span>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {t.start_time} - {t.end_time}
                </div>
                <div className="text-xs text-slate-500">
                  Location: <span className="font-medium text-slate-700">{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDY MATERIALS */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Course Documents & Resources</h3>
            <Link
              to="/faculty/materials"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Upload Material
            </Link>
          </div>

          {materials.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No study materials uploaded for this course yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((m) => (
                <div key={m._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{m.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{m.category} • {m.file_type?.toUpperCase()}</p>
                    <p className="text-[11px] text-slate-600 mt-1">{m.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMaterial(m)}
                    className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center space-x-1 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-center">
          <ClipboardCheck className="w-12 h-12 text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Timetable-Driven Attendance</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Class session attendance is submitted through the timetable-driven Attendance / RNS module with authoritative 7:00 PM cutoff validation.
          </p>
          <Link
            to="/faculty/attendance"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow"
          >
            <span>Open Attendance / RNS</span>
          </Link>
        </div>
      )}

      {/* TAB 6: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800">Subject Announcements</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800">Welcome to {course?.name}</h4>
            <p className="text-xs text-slate-600 mt-1">
              All students are required to maintain a minimum of 75% attendance in this course to be eligible for end-semester examinations.
            </p>
          </div>
        </div>
      )}

      {/* Modal for PDF/Image viewer */}
      <DocumentViewerModal
        material={selectedMaterial}
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
      />
    </div>
  );
};

export default CourseDetail;

