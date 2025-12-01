import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useHistory } from '../context/HistoryContext';
import { UploadCloud, RefreshCw, RotateCw, Loader2, AlertTriangle, FileText, X, Download, ArrowLeft, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8080/api/tools/rotate";

export default function RotateTool() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const { addToHistory } = useHistory();
  const [file, setFile] = useState(null);
  const [degrees, setDegrees] = useState(90); // Default rotation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + U - Upload file
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        open();
        toast.info('File picker opened');
      }

      // Escape - Clear file
      if (e.key === 'Escape' && file) {
        e.preventDefault();
        setFile(null);
        setError(null);
        setPreviewUrl(null);
        toast.info('File cleared');
      }

      // Ctrl/Cmd + D - Download (if available)
      // Note: Rotate tool auto-downloads or shows preview, but we can add it if previewUrl is available
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && previewUrl) {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = `rotated_${file.name}`;
        link.click();
        toast.success('Download started');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, previewUrl, toast]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setPreviewUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleRotate = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    if (!isAuthenticated) {
      alert("Please log in to use the Rotate feature.");
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('degrees', degrees);

    const token = localStorage.getItem('pdfly_auth_token');

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create preview URL
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPreviewUrl(url);

      // Don't reset file here, keep it for context or re-rotation if needed
      // alert("PDF rotated successfully!"); // Optional: remove alert to make it smoother

      setPreviewUrl(url);
      toast.success('PDF rotated successfully!');

      addToHistory({
        fileName: file.name,
        toolName: 'Rotate PDF',
        status: 'success',
        originalSize: file.size,
      });
    } catch (err) {
      console.error('Rotation failed:', err);
      setError('Failed to rotate PDF. Please try again.');
      toast.error('Rotation failed');

      addToHistory({
        fileName: file.name,
        toolName: 'Rotate PDF',
        status: 'failed',
        originalSize: file.size,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl || !file) return;

    const link = document.createElement('a');
    link.href = previewUrl;
    link.setAttribute('download', `rotated_${degrees}_${file.name}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleStartOver = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setDegrees(90);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 font-sans">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 pt-32">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
          >
            <RefreshCw className="h-8 w-8" />
          </motion.div>
          <motion.h1
            className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Rotate PDF
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-zinc-500 dark:text-zinc-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Permanently rotate all pages in your PDF document.
          </motion.p>

          {(!user || (user.plan !== 'PRO' && user.role !== 'ADMIN')) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex justify-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20">
                <Sparkles className="h-4 w-4" />
                {user ? (
                  <span>
                    <span className="font-bold">{3 - (user.dailyUsageCount || 0)}</span> free tasks remaining today
                  </span>
                ) : (
                  "3 free tasks per day"
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Main Interface */}
        <motion.div
          className="grid gap-8 md:grid-cols-2 items-start"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >

          {/* Left: Upload Zone or Preview */}
          <div className="relative">
            {previewUrl ? (
              <div className="h-[500px] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xl">
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="Rotated PDF Preview"
                />
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`relative h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${isDragActive
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10'
                  : 'border-zinc-300 hover:border-indigo-500 bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-400'
                  }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="text-center p-6 animate-in fade-in zoom-in duration-300">
                    <FileText className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">{file.name}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 block mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                      <UploadCloud className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                      {isDragActive ? "Drop it here!" : "Click or Drag PDF"}
                    </span>
                    <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                      Supports PDF files only
                    </span>
                  </>
                )}
              </div>
            )}

            {file && !previewUrl && (
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right: Settings & Action */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl space-y-6">

            {!previewUrl ? (
              <>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <RotateCw className="h-5 w-5 text-indigo-500" /> Rotation Angle
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Select how much to rotate the pages clockwise.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-4 w-4" /> {error}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {[90, 180, 270].map((angle) => (
                    <button
                      key={angle}
                      onClick={() => setDegrees(angle)}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all ${degrees === angle
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRotate}
                  disabled={!file || loading}
                  className="group mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> ROTATING...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" /> APPLY ROTATION
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Rotation Complete!</h3>
                  <p className="text-sm text-green-600 dark:text-green-500">Your PDF is ready to download.</p>
                </div>

                <button
                  onClick={handleDownload}
                  className="group w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
                >
                  <Download className="h-5 w-5" /> DOWNLOAD PDF
                </button>

                <button
                  onClick={handleStartOver}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-3.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" /> Start Over
                </button>
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="mt-6 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">⌨️ Keyboard Shortcuts</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Ctrl+U</kbd> Upload</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Esc</kbd> Clear</div>
              {previewUrl && (
                <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Ctrl+D</kbd> Download</div>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}