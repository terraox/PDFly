import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Shield, Lock, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_URL = "http://localhost:8080/api/tools/protect";

export default function ProtectTool() {
  const { isAuthenticated, user } = useAuth();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    // Only accept and process the first PDF dropped
    if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleProtect = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }
    if (password.length < 5) {
      setError("Password must be at least 5 characters long.");
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
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-700 text-white shadow-lg shadow-gray-700/30">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Protect PDF
          </h1>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
            Encrypt your PDF with a password to ensure confidentiality.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid gap-8 md:grid-cols-2">
            
            {/* Left: Upload Zone */}
            <div className="relative">
                <div 
                    {...getRootProps()} 
                    className={`relative h-56 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                        isDragActive ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-zinc-300 hover:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-indigo-400'
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

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        New Password (Required)
                    </label>
                    <input 
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter secret password"
                        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:ring-0 outline-none"
                        minLength="5"
                        required
                    />
                </div>

                <button 
                    onClick={handleProtect}
                    disabled={!file || password.length < 5 || loading}
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
        </div>

      </div>
    </div>
  );
}