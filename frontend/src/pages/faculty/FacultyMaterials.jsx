import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FolderArchive,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  Lock,
  Globe
} from 'lucide-react';
import DocumentViewerModal from '../../components/common/DocumentViewerModal';

const FacultyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [category, setCategory] = useState('Lecture Notes');
  const [visibility, setVisibility] = useState('COURSE_RESTRICTED');
  const [file, setFile] = useState(null);

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
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        api.get('/materials'),
        api.get('/faculty/courses')
      ]);
      setMaterials(mRes.data);
      setCourses(cRes.data);
      if (cRes.data.length > 0) {
        setCourseId(cRes.data[0].course_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setMessage('');
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('course_id', courseId);
      formData.append('category', category);
      formData.append('visibility', visibility);
      formData.append('file', file);

      const res = await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Document uploaded successfully.');
      setTitle('');
      setDescription('');
      setFile(null);
      // Reset input
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';

      // Refresh
      const mRes = await api.get('/materials');
      setMaterials(mRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title || 'this study material'}"?`)) return;
    try {
      await api.delete(`/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
      setMessage('Study material deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed.');
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Faculty Study Material Upload</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload educational documents, lecture slides, assignments, and manuals for student access.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <UploadCloud className="w-5 h-5 text-blue-600" />
          <span>Upload Academic Material</span>
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Unit 2: Object-Oriented Programming in Python"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Subject *</label>
              <select
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              >
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.code} — {c.name} (Sec {c.section})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Material Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Visibility Permission *</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              >
                <option value="COURSE_RESTRICTED">Course Restricted (Only enrolled students)</option>
                <option value="ELC_CENTER_WIDE">ELC Center Wide (All campus students)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Brief Description</label>
              <input
                type="text"
                placeholder="Optional description of the contents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">File Attachment (PDF, Word, PPT, Excel, Images up to 10MB) *</label>
              <input
                id="file-upload-input"
                type="file"
                required
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs shadow transition flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Publish Study Material'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Materials List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800">Uploaded Study Materials Directory ({materials.length})</h3>

        {materials.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No study materials published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map((m) => (
              <div
                key={m._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-800 leading-snug">{m.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 shrink-0">
                      {m.file_type?.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Course: <span className="font-medium text-slate-700">{m.course_name} ({m.course_code})</span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{m.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    {m.visibility === 'ELC_CENTER_WIDE' ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-medium">
                        <Globe className="w-3 h-3" />
                        <span>ELC Wide</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-blue-700 font-medium">
                        <Lock className="w-3 h-3" />
                        <span>Course Only</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMaterial(m)}
                      className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center space-x-1"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(m._id, m.title)}
                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium flex items-center space-x-1 transition"
                      title="Permanently Delete Study Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <DocumentViewerModal
        material={selectedMaterial}
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
      />
    </div>
  );
};

export default FacultyMaterials;

