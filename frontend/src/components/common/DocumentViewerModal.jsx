import React, { useState, useEffect, useRef } from 'react';
import { X, Download, FileText, AlertCircle, Loader2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { renderAsync } from 'docx-preview';
import api from '../../services/api';

const DocumentViewerModal = ({ material, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [fileCategory, setFileCategory] = useState('');
  const docxContainerRef = useRef(null);

  const filename = material?.original_filename || material?.title || '';
  const ext = filename.split('.').pop()?.toLowerCase() || material?.file_type?.toLowerCase() || '';

  useEffect(() => {
    if (!isOpen || !material) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setTextContent('');
      setError('');
      setLoading(false);
      return;
    }

    let isMounted = true;
    let createdUrl = null;

    const loadDocument = async () => {
      setLoading(true);
      setError('');
      setTextContent('');

      try {
        const materialId = material._id || material.id;
        const response = await api.get(`/materials/${materialId}/preview`, {
          responseType: 'blob'
        });

        if (!isMounted) return;

        const blob = response.data;

        // Categorize file by extension
        if (ext === 'docx') {
          setFileCategory('docx');
          setLoading(false);

          // Wait for DOM container to mount
          setTimeout(async () => {
            if (docxContainerRef.current) {
              docxContainerRef.current.innerHTML = '';
              try {
                await renderAsync(blob, docxContainerRef.current, null, {
                  className: 'docx-preview-content',
                  inWrapper: true,
                  ignoreWidth: false,
                  ignoreHeight: false
                });
              } catch (renderErr) {
                console.error('DOCX render error:', renderErr);
                setError('Could not parse Word document formatting in-browser. Please use the Download button above.');
              }
            }
          }, 80);

        } else if (ext === 'pdf') {
          setFileCategory('pdf');
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          createdUrl = URL.createObjectURL(pdfBlob);
          setBlobUrl(createdUrl);
          setLoading(false);

        } else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
          setFileCategory('image');
          createdUrl = URL.createObjectURL(blob);
          setBlobUrl(createdUrl);
          setLoading(false);

        } else if (['txt', 'csv', 'md', 'json', 'py', 'c', 'cpp', 'java', 'html', 'log'].includes(ext)) {
          setFileCategory('text');
          const text = await blob.text();
          if (isMounted) {
            setTextContent(text);
            setLoading(false);
          }

        } else {
          setFileCategory('other');
          setLoading(false);
        }

      } catch (err) {
        console.error('Document preview error:', err);
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to load document preview. Please check your network or permissions.');
          setLoading(false);
        }
      }
    };

    loadDocument();

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, material]);

  if (!isOpen || !material) return null;

  const handleDownload = async () => {
    try {
      const materialId = material._id || material.id;
      const response = await api.get(`/materials/${materialId}/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download document: ' + (e.response?.data?.detail || e.message));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[94vh] flex flex-col overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold truncate leading-tight text-slate-100">
                {material.title || filename}
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {material.course_name ? `${material.course_name} (${material.course_code || ''}) • ` : ''}
                Uploaded by {material.faculty_name || 'Faculty'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Download file to device"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-100/90 overflow-hidden relative flex flex-col items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-3 p-8">
              <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">
                Loading {filename}...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-red-200 text-center max-w-md m-4 space-y-4">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{filename}</h4>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Document Directly</span>
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* 1. PDF Viewer */}
              {fileCategory === 'pdf' && blobUrl && (
                <iframe
                  src={blobUrl}
                  title={filename}
                  className="w-full h-full border-none bg-slate-800"
                />
              )}

              {/* 2. Word (.DOCX) Native Viewer */}
              {fileCategory === 'docx' && (
                <div className="w-full h-full overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200/70">
                  <div
                    ref={docxContainerRef}
                    className="w-full max-w-4xl bg-white shadow-xl rounded-xl p-4 sm:p-10 border border-slate-300 min-h-full docx-rendered-container"
                  />
                </div>
              )}

              {/* 3. Image Viewer */}
              {fileCategory === 'image' && blobUrl && (
                <div className="w-full h-full overflow-auto p-4 flex items-center justify-center bg-slate-900/5">
                  <img
                    src={blobUrl}
                    alt={filename}
                    className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
                  />
                </div>
              )}

              {/* 4. Text / Code / CSV / Markdown Viewer */}
              {fileCategory === 'text' && (
                <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-slate-900 text-slate-100 font-mono text-xs">
                  <pre className="whitespace-pre-wrap leading-relaxed max-w-4xl mx-auto bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-inner">
                    {textContent}
                  </pre>
                </div>
              )}

              {/* 5. Fallback for Unsupported Binary Formats (e.g. PPTX, ZIP) */}
              {fileCategory === 'other' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md m-4 space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800 leading-snug">{filename}</h4>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-mono font-bold uppercase">
                      {ext} File
                    </span>
                    <p className="text-xs text-slate-500 mt-2">
                      In-browser viewing is supported for PDF, Word (.docx), Images, and Text files. Click below to download and inspect this document locally.
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-blue-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {ext.toUpperCase()} Document</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-white px-4 py-2 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between shrink-0">
          <span>Gayatri Vidya Parishad • Academic Document Repository</span>
          <span className="font-mono uppercase font-semibold text-slate-600">{ext || 'Document'}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
