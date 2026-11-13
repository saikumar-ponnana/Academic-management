import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, Users, FolderArchive, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

const FacultyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faculty/courses')
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Assigned Courses</h2>
          <p className="text-xs text-slate-500 mt-1">
            Official academic teaching assignments approved by the institutional administration.
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Assigned Courses</h3>
          <p className="text-xs text-slate-500 mt-1">
            You do not currently have any active course allocations. Please contact the administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.course_id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                    {c.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Credits: {c.credits}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Dept: {c.department_code} • Sem {c.semester} • Section {c.section}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Students</p>
                    <p className="text-base font-bold text-slate-800">{c.enrolled_students}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Materials</p>
                    <p className="text-base font-bold text-slate-800">{c.materials_count}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Sessions</p>
                    <p className="text-base font-bold text-slate-800">{c.conducted_sessions}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{c.academic_year}</span>
                <Link
                  to={`/faculty/courses/${c.course_id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Open Course Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyCourses;

