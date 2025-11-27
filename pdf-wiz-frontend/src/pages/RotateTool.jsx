import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, RefreshCw, RotateCw, Loader2, AlertTriangle, FileText, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_URL = "http://localhost:8080/api/tools/rotate";

export default function RotateTool() {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState(null);
  const [degrees, setDegrees] = useState(90); // Default rotation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rotated_${degrees}_${file.name}`); 
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Reset
      setFile(null);
      alert("PDF rotated successfully!");
      
    } catch (error) {
      const errorMsg = error.response?.data ? new TextDecoder().decode(error.response.data) : error.message;
      setError(`Rotation failed: ${errorMsg}`);
      console.error("Rotate Error:", error);
    } finally {
      setLoading(false);
    }
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
            
            {/* Left: Upload Zone */}
            <div className="relative">
                <div 
                    {...getRootProps()} 
                    className={`relative h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                        isDragActive 
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
                {file && (
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Right: Settings & Action */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl space-y-6">
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
                            className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                degrees === angle 
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
            </div>
        </div>

      </div>
    </div>
  );
}