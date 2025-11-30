import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useHistory } from '../context/HistoryContext';
import { UploadCloud, Scissors, Loader2, AlertTriangle, FileText, X, Download, Settings, Hash, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8080/api/tools/split";

export default function SplitTool() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const { addToHistory } = useHistory();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [splitMode, setSplitMode] = useState('all'); // 'all', 'every', 'range'
  const [pagesPerFile, setPagesPerFile] = useState(1);
  const [pageRanges, setPageRanges] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

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
        setDownloadUrl(null);
        toast.info('File cleared');
      }

      // Ctrl/Cmd + D - Download (if available)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && downloadUrl) {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'pdfly_split.zip';
        link.click();
        toast.success('Download started');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, downloadUrl, toast]);
  const [downloadFilename, setDownloadFilename] = useState(null);
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
    if (acceptedFiles.length > 0) {
      const pdfFile = acceptedFiles[0];
      setFile(pdfFile);
      setError(null);
      setDownloadUrl(null);

      // Try to get page count from file (this is a rough estimate)
      // In a real implementation, you might want to send to backend to get exact count
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        // Simple heuristic: count occurrences of "/Page" in PDF
        const text = new TextDecoder('latin1').decode(arrayBuffer);
        const pageMatches = text.match(/\/Page\b/g);
        const estimatedPages = pageMatches ? pageMatches.length : null;
        setTotalPages(estimatedPages);
      };
      reader.readAsArrayBuffer(pdfFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleSplit = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    if (!isAuthenticated) {
      alert("Please log in to use the Split feature.");
      navigate('/login');
      return;
    }

    // Check usage limit (for free users)
    if (checkLimit()) {
      setError(`Daily limit reached. You have used your ${freeLimit} free daily tasks.`);
      return;
    }

    // Validate split options based on mode
    if (splitMode === 'every' && (!pagesPerFile || pagesPerFile < 1)) {
      setError("Please enter a valid number of pages per file (minimum 1).");
      return;
    }

    if (splitMode === 'range' && (!pageRanges || !pageRanges.trim())) {
      setError("Please enter page ranges (e.g., 1-5, 6-10, 11-15).");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('splitMode', splitMode);

    if (splitMode === 'every') {
      formData.append('pagesPerFile', pagesPerFile.toString());
    } else if (splitMode === 'range') {
      formData.append('pageRanges', pageRanges.trim());
    }

    const token = localStorage.getItem('pdfly_auth_token');

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob',
        validateStatus: function (status) {
          return status >= 200 && status < 600;
        }
      });

      // Check if response is an error
      if (response.status === 500 || response.status >= 400) {
        try {
          const errorText = await response.data.text();
          const cleanError = errorText.startsWith('Error:') ? errorText.substring(7).trim() : errorText.trim();
          setError(cleanError || "Split failed. Please try again.");
          toast.error('Split failed');
          addToHistory({
            fileName: file.name,
            toolName: 'Split PDF',
            status: 'failed',
            originalSize: file.size,
          });
          return;
        } catch (e) {
          setError(`Server error (${response.status}). Please try again.`);
          toast.error('Split failed');
          addToHistory({
            fileName: file.name,
            toolName: 'Split PDF',
            status: 'failed',
            originalSize: file.size,
          });
          return;
        }
      }

      // Check Content-Type to ensure it's a ZIP file
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/zip') && !contentType.includes('application/octet-stream')) {
        // Not a ZIP, might be an error
        try {
          const errorText = await response.data.text();
          setError(errorText || "Invalid response from server. Please try again.");
          return;
        } catch (e) {
          setError("Split failed. Invalid response format.");
          return;
        }
      }

      // Success - create download URL for ZIP file
      // Ensure we're creating a proper ZIP blob
      const blob = new Blob([response.data], {
        type: 'application/zip'
      });

      // Verify blob size
      if (blob.size === 0) {
        setError("Split operation produced an empty file. Please try again.");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const filename = (file.name.replace('.pdf', '') || 'split') + '_split.zip';

      setDownloadUrl(url);
      setDownloadFilename(filename);

      // Record usage (only for FREE users)
      const userPlan = user?.plan || localStorage.getItem('pdfly_user_plan') || 'FREE';
      if (userPlan !== 'PRO' && user?.role !== 'ADMIN') {
        localStorage.setItem('pdfly_last_usage', Date.now().toString());
      }

    } catch (error) {
      let errorMsg = "Split failed. ";

      if (error.response) {
        if (error.response.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            errorMsg = errorText.startsWith('Error:') ? errorText.substring(7).trim() : errorText.trim();
          } catch (e) {
            errorMsg += `Server error (${error.response.status}). Please try again.`;
          }
        } else {
          errorMsg += `Server error (${error.response.status}). Please try again.`;
        }
      } else if (error.request) {
        errorMsg += "No response from server. Please check your connection.";
      } else {
        errorMsg += error.message || "An unexpected error occurred.";
      }

      setError(errorMsg);
      console.error("Split Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPreviewText = () => {
    if (!file) return "Upload a PDF to see split preview";

    switch (splitMode) {
      case 'all':
        return totalPages
          ? `Will create ${totalPages} individual PDF files (one per page)`
          : "Will split into individual PDF files (one per page)";
      case 'every':
        if (!totalPages || !pagesPerFile) return "Will split every N pages";
        const numFiles = Math.ceil(totalPages / pagesPerFile);
        return `Will create ${numFiles} PDF files (${pagesPerFile} pages each)`;
      case 'range':
        if (!pageRanges.trim()) return "Enter page ranges to see preview";
        const ranges = pageRanges.split(',').filter(r => r.trim());
        return `Will create ${ranges.length} PDF file(s) from specified ranges`;
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
          >
            <Scissors className="h-8 w-8" />
          </motion.div>
          <motion.h1
            className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Split PDF
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-zinc-500 dark:text-zinc-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Split your PDF into multiple files with customizable options.
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

        <motion.div
          className="grid gap-8 md:grid-cols-2 items-start"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >

          {/* Left: Upload Zone */}
          <div className="relative">
            <div
              {...getRootProps()}
              className={`relative h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${isDragActive
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10'
                : 'border-zinc-300 hover:border-indigo-500 bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-400'
                }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="text-center p-6">
                  <FileText className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg block">{file.name}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                    {totalPages && ` • ${totalPages} pages`}
                  </span>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                    <UploadCloud className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                    {isDragActive ? "Drop it here!" : "Click or Drag PDF"}
                  </span>
                  <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Supports PDF files only
                  </span>
                </>
              )}
            </div>
            {file && (
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); setDownloadUrl(null); setTotalPages(null); }}
                className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right: Split Options */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-1">
                <Settings className="h-5 w-5 text-indigo-500" /> Split Options
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choose how you want to split your PDF
              </p>
            </div>

            {/* Split Mode Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Split Mode</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSplitMode('all')}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${splitMode === 'all'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                >
                  All Pages
                </button>
                <button
                  onClick={() => setSplitMode('every')}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${splitMode === 'every'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                >
                  Every N
                </button>
                <button
                  onClick={() => setSplitMode('range')}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${splitMode === 'range'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                >
                  Custom Range
                </button>
              </div>
            </div>

            {/* Conditional Inputs Based on Mode */}
            {splitMode === 'every' && (
              <div className="space-y-2">
                <label htmlFor="pagesPerFile" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Pages Per File
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                  <input
                    id="pagesPerFile"
                    type="number"
                    min="1"
                    value={pagesPerFile}
                    onChange={(e) => setPagesPerFile(parseInt(e.target.value) || 1)}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 pl-10 pr-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., 5"
                  />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Split PDF into files with this many pages each
                </p>
              </div>
            )}

            {splitMode === 'range' && (
              <div className="space-y-2">
                <label htmlFor="pageRanges" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Page Ranges
                </label>
                <input
                  id="pageRanges"
                  type="text"
                  value={pageRanges}
                  onChange={(e) => setPageRanges(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., 1-5, 6-10, 11-15"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Enter comma-separated ranges (e.g., "1-5, 6-10, 11-15") or single pages (e.g., "1, 3, 5")
                </p>
              </div>
            )}

            {/* Preview */}
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                Preview: {getPreviewText()}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}

            {downloadUrl && !loading ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-emerald-500 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <FileText className="h-4 w-4" /> Split successful!
                </div>
                <a
                  href={downloadUrl}
                  download={downloadFilename}
                  onClick={() => {
                    setTimeout(() => {
                      window.URL.revokeObjectURL(downloadUrl);
                      setDownloadUrl(null);
                      setDownloadFilename(null);
                      setFile(null);
                      setTotalPages(null);
                    }, 100);
                  }}
                  className="group flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40"
                >
                  <Download className="h-5 w-5" /> DOWNLOAD ZIP FILE
                </a>
                <button
                  onClick={() => {
                    window.URL.revokeObjectURL(downloadUrl);
                    setDownloadUrl(null);
                    setDownloadFilename(null);
                    setFile(null);
                    setTotalPages(null);
                  }}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  Split Another PDF
                </button>
              </div>
            ) : (
              <button
                onClick={handleSplit}
                disabled={!file || loading}
                className="group mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-red-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-500 hover:shadow-red-500/40 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> SPLITTING...
                  </>
                ) : (
                  <>
                    <Scissors className="h-5 w-5" /> SPLIT PDF
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}

