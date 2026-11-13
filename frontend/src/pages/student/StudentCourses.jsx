import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, User, Calendar, FolderArchive, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/courses')
      .then((res) => setCourses(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Enrolled Subjects</h2>
        <p className="text-xs text-slate-500 mt-1">
          Courses registered for your current academic curriculum and department.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <div
            key={c.course_id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden"
          >
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                  {c.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">Credits: {c.credits}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800 leading-snug">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Faculty: <span className="font-semibold text-slate-700">{c.faculty_name}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Attendance</p>
                  <p className={`text-base font-bold ${c.attendance_percentage < 75 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {c.attendance_percentage}%
                  </p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Materials</p>
                  <p className="text-base font-bold text-slate-800">{c.materials_count}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                to="/student/materials"
                className="font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span>View Documents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;

