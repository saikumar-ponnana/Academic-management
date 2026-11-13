import React from 'react';
import { X, Download, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const DocumentViewerModal = ({ material, isOpen, onClose }) => {
  if (!isOpen || !material) return null;

  const previewUrl = `/api/materials/${material._id || material.id}/preview`;
  const downloadUrl = `/api/materials/${material._id || material.id}/download`;

  const isPdf = material.file_type === 'pdf' || (material.original_filename && material.original_filename.endsWith('.pdf'));
  const isImage = ['png', 'jpg', 'jpeg'].includes(material.file_type) || /\.(png|jpg|jpeg)$/i.test(material.original_filename);

  const handleDownload = async () => {
    try {
      const response = await api.get(downloadUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.original_filename || material.title || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download document: ' + (e.response?.data?.detail || e.message));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <FileText className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="truncate">
              <h3 className="text-base font-semibold truncate leading-tight">{material.title}</h3>
              <p className="text-xs text-slate-400 truncate">
                {material.course_name} ({material.course_code}) • Uploaded by {material.faculty_name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-100 overflow-hidden flex items-center justify-center p-2">
          {isPdf ? (
            <iframe
              src={previewUrl}
              title={material.title}
              className="w-full h-full rounded border border-slate-300 bg-white"
            />
          ) : isImage ? (
            <div className="max-w-full max-h-full overflow-auto p-4 flex items-center justify-center">
              <img
                src={previewUrl}
                alt={material.title}
                className="max-w-full max-h-[75vh] object-contain rounded shadow"
              />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-slate-800 mb-2">{material.original_filename}</h4>
              <p className="text-sm text-slate-500 mb-6">
                In-browser preview is optimized for PDF and image formats. You can download and inspect this document locally.
              </p>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download {material.file_type?.toUpperCase()} Document</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;

