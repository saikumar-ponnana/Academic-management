import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FolderArchive,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  User,
  Globe,
  Lock,
  Calendar
} from 'lucide-react';
import DocumentViewerModal from '../../components/common/DocumentViewerModal';

const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Filters
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'Lecture Notes',
    'Classroom Material',
    'Assignments',
    'Lab Manuals',
    'Reference Documents',
    'Presentations',
    'Previous Question Papers',
    'Other'
  ];

  useEffect(() => {
    fetchMaterials();
  }, [selectedFaculty, selectedCourse, selectedCategory]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let url = '/materials?';
      if (selectedCourse) url += `course_id=${selectedCourse}&`;
      if (selectedFaculty) url += `faculty_user_id=${selectedFaculty}&`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      const res = await api.get(url);
      setMaterials(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/students/courses')
      .then((res) => setCourses(res.data))
      .catch((e) => console.error(e));
  }, []);

  // Extract unique faculty from courses
  const facultyList = Array.from(
    new Set(materials.map((m) => JSON.stringify({ id: m.faculty_user_id, name: m.faculty_name })))
  ).map((str) => JSON.parse(str));

  const handleDownload = async (mat) => {
    try {
      const response = await api.get(`/materials/${mat._id}/download`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', mat.original_filename || mat.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download: ' + (e.response?.data?.detail || e.message));
    }
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Study Materials & Documents</h2>
        <p className="text-xs text-slate-500 mt-1">
          Browse, preview, and download educational resources uploaded by your faculty members.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[220px]">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Search Keyword</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Filter by Faculty */}
        <div className="w-48">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter by Faculty</label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
          >
            <option value="">All Faculty</option>
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Course */}
        <div className="w-52">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter by Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
          >
            <option value="">All Enrolled Courses</option>
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Category */}
        <div className="w-48">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-700">No Documents Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            No study materials matched your selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-200">
                    {m.course_code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600">
                    {m.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Course: {m.course_name}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{m.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{m.faculty_name}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {m.visibility === 'ELC_CENTER_WIDE' ? (
                      <span className="text-emerald-700 font-medium flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>ELC Wide</span>
                      </span>
                    ) : (
                      <span className="text-blue-700 font-medium flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>Enrolled Only</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono uppercase">
                  {m.file_type?.toUpperCase()}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedMaterial(m)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleDownload(m)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Document Viewer Modal */}
      <DocumentViewerModal
        material={selectedMaterial}
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
      />
    </div>
  );
};

export default StudentMaterials;

