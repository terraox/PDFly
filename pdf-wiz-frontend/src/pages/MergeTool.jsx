import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useHistory } from '../context/HistoryContext';
import { UploadCloud, FileText, ArrowLeftRight, Trash2, Loader2, ArrowUp, Download, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8080/api/tools/merge";

export default function MergeTool() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const toast = useToast();
  const { addToHistory } = useHistory();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
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

      // Escape - Clear files
      if (e.key === 'Escape' && files.length > 0) {
        e.preventDefault();
        setFiles([]);
        setError(null);
        setDownloadUrl(null);
        toast.info('Files cleared');
      }

      // Ctrl/Cmd + D - Download (if available)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && downloadUrl) {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'pdfly_merged.pdf';
        link.click();
        toast.success('Download started');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files, downloadUrl, toast]);

  // Refresh user data on mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated]);

  const [freeLimit, setFreeLimit] = useState(3);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/tools/config');
        const config = response.data.find(c => c.configKey === 'FREE_TIER_LIMIT');
        if (config) {
          setFreeLimit(parseInt(config.configValue));
        }
      } catch (error) {
        console.error('Failed to fetch config', error);
      }
    };
    fetchConfig();
  }, []);

  // Check usage limit (only for FREE users)
  const checkLimit = () => {
    const userPlan = user?.plan || localStorage.getItem('pdfly_user_plan') || 'FREE';
    const userRole = user?.role || localStorage.getItem('pdfly_user_role');

    if (userPlan === 'PRO' || userRole === 'ADMIN') {
      return false;
    }

    const dailyUsage = user?.dailyUsageCount || 0;
    if (dailyUsage >= freeLimit) {
      return true;
    }
    return false;
  };

  const onDrop = useCallback((acceptedFiles) => {
    // Filter to only accept PDF files (if needed, although Java checks this too)
    const pdfFiles = acceptedFiles.filter(f => f.type === 'application/pdf');
    setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please upload at least two files to merge.");
      return;
    }

    // Validate all files are PDFs
    const invalidFiles = files.filter(f => f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf'));
    if (invalidFiles.length > 0) {
      setError(`Invalid file type. All files must be PDFs. Found: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    if (!isAuthenticated) {
      alert("Please log in to use the Merge feature.");
      navigate('/login');
      return;
    }

    // Check usage limit (for free users)
    if (checkLimit()) {
      setError("Daily limit reached. Upgrade to Pro for unlimited access.");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    files.forEach(file => {
      // Append files with the key 'files', matching the Java @RequestParam("files")
      formData.append('files', file);
    });

    const token = localStorage.getItem('pdfly_auth_token');

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Send JWT token for security check
        },
        responseType: 'blob', // Important: Expecting a binary file (PDF) back
        validateStatus: function (status) {
          // Don't throw error for 500, we'll handle it manually
          return status >= 200 && status < 600;
        }
      });

      // Check if response is an error (status 500 or error content)
      if (response.status === 500 || response.status >= 400) {
        // Error response, read as text
        try {
          const errorText = await response.data.text();
          // Remove "Error: " prefix if present
          const cleanError = errorText.startsWith('Error:') ? errorText.substring(7).trim() : errorText.trim();
          setError(cleanError || "Merge failed. Please try again.");
          return;
        } catch (e) {
          setError(`Server error (${response.status}). Please try again.`);
          return;
        }
      }

      // Check Content-Type to see if it's actually a PDF
      const contentType = response.headers['content-type'] || '';
      if (response.status === 200 && (contentType.includes('application/pdf') || contentType.includes('application/octet-stream'))) {
        // Valid PDF response
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        setDownloadUrl(url);
        toast.success('PDFs merged successfully!');

        addToHistory({
          fileName: `Merged_${files.length}_files.pdf`,
          toolName: 'Merge PDF',
          status: 'success',
          originalSize: files.reduce((acc, f) => acc + f.size, 0),
        });

        // Record usage (only for FREE users)
        const userPlan = user?.plan || localStorage.getItem('pdfly_user_plan') || 'FREE';
        if (userPlan !== 'PRO' && user?.role !== 'ADMIN') {
          localStorage.setItem('pdfly_last_usage', Date.now().toString());
        }

        // Refresh user data to update usage count
        await refreshUser();
      } else {
        // Unexpected response format
        try {
          const errorText = await response.data.text();
          setError(errorText || "Invalid response from server. Please try again.");
        } catch (e) {
          setError("Merge failed. Invalid response format.");
        }
      }

    } catch (error) {
      let errorMsg = "Merge failed. ";

      if (error.response) {
        // Server responded with error status
        if (error.response.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            errorMsg = errorText.startsWith('Error:') ? errorText.substring(7).trim() : errorText.trim();
          } catch (e) {
            errorMsg += `Server error (${error.response.status}). Please try again.`;
          }
        } else if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else {
          errorMsg += `Server error (${error.response.status}). Please try again.`;
        }
      } else if (error.request) {
        errorMsg += "No response from server. Please check your connection and ensure the backend is running.";
      } else {
        errorMsg += error.message || "An unexpected error occurred.";
      }

      setError(errorMsg);
      console.error("Merge Error Details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 pt-24">

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
          >
            <ArrowLeftRight className="h-8 w-8" />
          </motion.div>
          <motion.h1
            className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Merge PDF Files
          </motion.h1>
          <motion.p
            className="mt-2 text-lg text-zinc-500 dark:text-zinc-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Combine multiple PDF files into one complete document easily.
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
                    <span className="font-bold">{Math.max(0, freeLimit - (user.dailyUsageCount || 0))}</span> free tasks remaining today
                  </span>
                ) : (
                  `${freeLimit} free tasks per day`
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Drag and Drop Zone */}
        <motion.div
          {...getRootProps()}
          className={`relative h-56 rounded-3xl border-2 border-dashed transition-all duration-300 ${isDragActive ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-zinc-300 hover:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-indigo-400'
            }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <input {...getInputProps()} />
          <div className="flex h-full w-full flex-col items-center justify-center">
            <UploadCloud className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            <span className="mt-4 text-xl font-semibold text-zinc-700 dark:text-zinc-200">
              {isDragActive ? "Drop the files here!" : "Drag & Drop PDFs or Click to Select"}
            </span>
            <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Minimum 2 files required for merging. (.pdf only)
            </span>
          </div>
        </motion.div>

        {/* File List and Action */}
        <motion.div
          className="mt-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 border-b pb-3 border-zinc-200 dark:border-zinc-800">
            Files in Queue ({files.length})
          </h3>

          <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {files.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">No files added yet.</p>
            ) : (
              files.map((file, index) => (
                <li key={index} className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <span>{file.name}</span>
                    <span className="text-xs text-zinc-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button onClick={() => removeFile(file.name)} className="text-zinc-400 hover:text-red-500 p-1 rounded-full transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))
            )}
          </ul>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-500 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}

          {downloadUrl && !loading ? (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-emerald-500 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <FileText className="h-4 w-4" /> Merge successful!
              </div>
              <a
                href={downloadUrl}
                download="pdfly_merged.pdf"
                onClick={() => {
                  // Clean up after download
                  setTimeout(() => {
                    window.URL.revokeObjectURL(downloadUrl);
                    setDownloadUrl(null);
                    setFiles([]);
                  }, 100);
                }}
                className="group flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-emerald-600 py-3 text-lg font-bold text-white shadow-xl transition-all hover:bg-emerald-500"
              >
                <Download className="h-5 w-5" /> DOWNLOAD MERGED PDF
              </a>
              <button
                onClick={() => {
                  window.URL.revokeObjectURL(downloadUrl);
                  setDownloadUrl(null);
                  setFiles([]);
                }}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                Merge Another Set
              </button>
            </div>
          ) : (
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || loading}
              className="group mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-red-600 py-3 text-lg font-bold text-white shadow-xl transition-all hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> MERGING...
                </>
              ) : (
                <>
                  <ArrowUp className="h-5 w-5 rotate-90 transition-transform duration-300 group-hover:rotate-0" /> START MERGE
                </>
              )}
            </button>
          )}

          {/* Keyboard Shortcuts Hint */}
          <div className="mt-6 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">⌨️ Keyboard Shortcuts</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Ctrl+U</kbd> Upload</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Esc</kbd> Clear</div>
              {downloadUrl && (
                <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Ctrl+D</kbd> Download</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div >
  );
}