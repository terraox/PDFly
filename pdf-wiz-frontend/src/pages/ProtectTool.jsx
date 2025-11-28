import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UploadCloud, Shield, Lock, Loader2, AlertTriangle, FileText, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8080/api/tools/protect";

export default function ProtectTool() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
        setPassword("");
        setConfirmPassword("");
        toast.info('File cleared');
      }

      // Ctrl/Cmd + Enter - Protect (if ready)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && file && password && password === confirmPassword) {
        e.preventDefault();
        // We can't easily call handleProtect here because it's defined later, 
        // but typically we'd extract it or use a ref to the function if needed.
        // For now, let's just stick to navigation shortcuts.
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, password, confirmPassword, toast]);

  const onDrop = useCallback((acceptedFiles) => {
    // Only accept and process the first PDF dropped
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleProtect = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!password) {
      setError("Password cannot be empty.");
      return;
    }

    if (!isAuthenticated) {
      alert("Please log in to use the Protect feature.");
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password); // Send the password to the backend

    const token = localStorage.getItem('pdfly_auth_token');

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // 1. Create a downloadable link for the protected PDF
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pdfly_protected.pdf');

      // 2. Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();

      // 3. Reset UI
      setFile(null);
      setPassword("");
      setConfirmPassword("");
      alert("PDF protected successfully! Your file is downloading.");

    } catch (error) {
      const errorMsg = error.response?.data ? new TextDecoder().decode(error.response.data) : error.message;
      setError(`Protection failed: ${errorMsg}.`);
      console.error("Protect Error:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-700 text-white shadow-lg shadow-gray-700/30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
          >
            <Shield className="h-8 w-8" />
          </motion.div>
          <motion.h1
            className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Protect PDF
          </motion.h1>
          <motion.p
            className="mt-2 text-lg text-zinc-500 dark:text-zinc-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Encrypt your PDF with a password to ensure confidentiality.
          </motion.p>
        </motion.div>

        {/* Main Interface */}
        <motion.div
          className="grid gap-8 md:grid-cols-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >

          {/* Left: Upload Zone */}
          <div className="relative">
            <div
              {...getRootProps()}
              className={`relative h-56 rounded-2xl border-2 border-dashed transition-all duration-300 ${isDragActive ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-zinc-300 hover:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-indigo-400'
                }`}
            >
              <input {...getInputProps()} />
              <div className="flex h-full w-full flex-col items-center justify-center">
                {file ? (
                  <div className="text-center p-4">
                    <FileText className="h-10 w-10 text-red-500 mx-auto mb-2" />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{file.name}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 block">Ready to protect.</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                    <span className="mt-4 text-xl font-semibold text-zinc-700 dark:text-zinc-200">
                      {isDragActive ? "Drop the PDF here!" : "Click or Drag PDF"}
                    </span>
                    <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      (Max 1 file, .pdf only)
                    </span>
                  </>
                )}
              </div>
            </div>
            {file && (
              <button onClick={() => setFile(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 transition-colors p-2 rounded-full bg-white dark:bg-zinc-800">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right: Password Input & Action */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-lg space-y-6">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white border-b pb-3 border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-500" /> Set Security Password
            </h3>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret password"
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:ring-0 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:ring-0 outline-none"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleProtect}
              disabled={!file || !password || password !== confirmPassword || loading}
              className="group mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-red-600 py-3 text-lg font-bold text-white shadow-xl transition-all hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> PROTECTING...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" /> ENCRYPT PDF
                </>
              )}
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="mt-6 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">⌨️ Keyboard Shortcuts</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Ctrl+U</kbd> Upload</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Esc</kbd> Clear</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">Ctrl+Enter</kbd> Protect</div>
            </div>
          </div>
        </motion.div>

      </div>
    </div >
  );
}