import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, RefreshCw, RotateCw, Loader2, AlertTriangle, FileText, X, Download, ArrowLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_URL = "http://localhost:8080/api/tools/rotate";

export default function RotateTool() {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState(null);
  const [degrees, setDegrees] = useState(90); // Default rotation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setPreviewUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: !!previewUrl, // Disable dropzone when preview is shown
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

    } catch (error) {
      const errorMsg = error.response?.data ? new TextDecoder().decode(error.response.data) : error.message;
      setError(`Rotation failed: ${errorMsg}`);
      console.error("Rotate Error:", error);
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
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <RefreshCw className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Rotate PDF
          </h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            Permanently rotate all pages in your PDF document.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid gap-8 md:grid-cols-2 items-start">

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
        </div>

      </div>
    </div>
  );
}