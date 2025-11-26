import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { UploadCloud, Lock, Sparkles, FileText, AlertCircle } from 'lucide-react';

export default function ToolPage({ title, icon: Icon }) {
  const [limitReached, setLimitReached] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Check usage limit on mount (optional) or on action
  const checkLimit = () => {
    const lastUsage = localStorage.getItem('pdfly_last_usage');
    if (lastUsage) {
      const hours = (Date.now() - parseInt(lastUsage)) / 1000 / 60 / 60;
      // If used within the last 24 hours, block access
      if (hours < 24) {
        return true;
      }
    }
    return false;
  };

  const handleUpload = () => {
    // Check if user has already used a service today
    if (checkLimit()) {
      setLimitReached(true);
      return;
    }

    // Simulate Processing
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      // Record the usage timestamp
      localStorage.setItem('pdfly_last_usage', Date.now().toString());
      alert(`${title} processed successfully! (1/1 Free Daily Tasks Used)`);
    }, 2000);
  };

  // --- UI: LIMIT REACHED STATE ---
  if (limitReached) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Lock className="h-10 w-10 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">Daily Limit Reached</h2>
            <p className="mb-8 text-lg text-zinc-500 dark:text-zinc-400">
              You have used your 1 free daily task. Please wait 24 hours or upgrade to Pro for unlimited access.
            </p>
            
            <div className="space-y-4">
              <Link 
                to="/pricing" 
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4 animate-pulse" /> Upgrade to Pro
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              
              <Link 
                to="/" 
                className="block text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- UI: NORMAL UPLOAD STATE ---
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            {Icon ? <Icon className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
            Upload your file to get started. 1 free task available today.
          </p>
        </div>
        
        <div 
          onClick={handleUpload}
          className={`group relative flex h-64 w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 ${
            processing 
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' 
              : 'border-zinc-300 hover:border-indigo-500 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-indigo-400 dark:hover:bg-zinc-900'
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform duration-300">
            {processing ? (
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400" />
            ) : (
              <UploadCloud className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <span className="mt-4 text-xl font-semibold text-zinc-700 dark:text-zinc-200">
            {processing ? "Processing your file..." : "Click to Upload PDF"}
          </span>
          <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {processing ? "Please wait a moment" : "or drag and drop it here"}
          </span>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm text-zinc-400">
          <AlertCircle className="h-4 w-4" />
          <span>Files are automatically deleted after 1 hour</span>
        </div>
      </div>
    </div>
  );
}