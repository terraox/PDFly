import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Lock, Sparkles, FileText, AlertCircle, Loader2, AlertTriangle, X, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function ToolPage({ title, icon: Icon }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [pageNumberPosition, setPageNumberPosition] = useState('bottom-center');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState(null);

  // Function to determine the expected file type and prompt based on the tool title
  const getAcceptedFileType = (toolTitle) => {
    switch (toolTitle) {
      case "Merge PDF":
      case "Split PDF":
      case "Compress PDF":
      case "Rotate PDF":
      case "Sign PDF":
      case "Watermark":
      case "Add Page Numbers":
      case "Protect PDF":
      case "Unlock PDF":
        return { extension: ".pdf", prompt: "PDF File", accept: { 'application/pdf': ['.pdf'] } };

      case "PDF to Word":
      case "PDF to PowerPoint":
      case "PDF to Excel":
      case "PDF to JPG":
        return { extension: ".pdf", prompt: "PDF File", accept: { 'application/pdf': ['.pdf'] } };

      case "Word to PDF":
        return { extension: ".docx, .doc", prompt: "Word Doc", accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] } };
      case "PowerPoint to PDF":
        return { extension: ".ppt, .pptx", prompt: "PowerPoint File", accept: { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'], 'application/vnd.ms-powerpoint': ['.ppt'] } };
      case "Excel to PDF":
        return { extension: ".xls, .xlsx", prompt: "Excel Spreadsheet", accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] } };
      case "JPG to PDF":
        return { extension: ".jpg, .jpeg, .png", prompt: "Image", accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] } };
        
      default:
        return { extension: ".*", prompt: "File", accept: '*/*' };
    }
  };

  // Map tool titles to API endpoints
  const getApiEndpoint = (toolTitle) => {
    const baseUrl = "http://localhost:8080/api/tools";
    
    switch (toolTitle) {
      case "Split PDF":
        return `${baseUrl}/split`;
      case "Compress PDF":
        return `${baseUrl}/compress`;
      case "Unlock PDF":
        return `${baseUrl}/unlock`;
      case "PDF to Word":
        return `${baseUrl}/convert/word`; // Output is Word (.docx) - toolId contains "word"
      case "PDF to PowerPoint":
        return `${baseUrl}/convert/ppt`; // Output is PPT (.pptx) - toolId contains "ppt"
      case "PDF to Excel":
        return `${baseUrl}/convert/excel`; // Output is Excel (.xlsx) - toolId contains "excel"
      case "PDF to JPG":
        return `${baseUrl}/convert/jpg`; // Output is JPG - toolId contains "jpg"
      case "Word to PDF":
        return `${baseUrl}/convert/to-pdf`; // Output is PDF - toolId doesn't match any format, defaults to .pdf
      case "PowerPoint to PDF":
        return `${baseUrl}/convert/to-pdf`; // Output is PDF
      case "Excel to PDF":
        return `${baseUrl}/convert/to-pdf`; // Output is PDF
      case "JPG to PDF":
        return `${baseUrl}/convert/to-pdf`; // Output is PDF
      case "Sign PDF":
        return `${baseUrl}/sign`;
      case "Add Page Numbers":
        return `${baseUrl}/page-numbers`;
      default:
        return null;
    }
  };

  const fileType = getAcceptedFileType(title);
  const apiEndpoint = getApiEndpoint(title);
  const needsPassword = title === "Unlock PDF";
  const needsSignature = title === "Sign PDF";
  const needsPageNumberPosition = title === "Add Page Numbers";

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileType.accept,
    maxFiles: 1,
  });

  // Check usage limit (only for FREE users)
  const checkLimit = () => {
    // PRO users and ADMINs have unlimited access
    const userPlan = user?.plan || localStorage.getItem('pdfly_user_plan') || 'FREE';
    const userRole = user?.role || localStorage.getItem('pdfly_user_role');
    
    if (userPlan === 'PRO' || userRole === 'ADMIN') {
      return false; // No limit for PRO/ADMIN
    }
    
    // Check daily limit for FREE users
    const lastUsage = localStorage.getItem('pdfly_last_usage');
    if (lastUsage) {
      const hours = (Date.now() - parseInt(lastUsage)) / 1000 / 60 / 60;
      if (hours < 24) {
        return true;
      }
    }
    return false;
  };

  const handleProcess = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    if (needsPassword && !password.trim()) {
      setError("Please enter the PDF password.");
      return;
    }

    if (needsSignature && !signatureText.trim()) {
      setError("Please enter signature text.");
      return;
    }

    if (!isAuthenticated) {
      alert("Please log in to use this feature.");
      navigate('/login');
      return;
    }

    // Check usage limit (for free users)
    if (checkLimit()) {
      setLimitReached(true);
      return;
    }

    // If no backend endpoint exists, show message
    if (!apiEndpoint) {
      setError(`${title} is coming soon! This feature is under development.`);
      return;
    }

    setProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    
    if (needsPassword) {
      formData.append('password', password);
    }
    
    if (needsSignature) {
      formData.append('signatureText', signatureText);
    }
    
    if (needsPageNumberPosition) {
      formData.append('position', pageNumberPosition);
    }

    const token = localStorage.getItem('pdfly_auth_token');

    try {
      const response = await axios.post(apiEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // All tools return binary files - show download button instead of auto-download
      // Check Content-Type to determine file type
      const contentType = response.headers['content-type'] || '';
      
      let blobType = 'application/pdf';
      let filename = `pdfly_${title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
      
      if (title === "Split PDF" && contentType.includes('application/zip')) {
        // Split PDF returns a ZIP file
        blobType = 'application/zip';
        filename = (file?.name?.replace('.pdf', '') || 'split') + '_split.zip';
      } else if (title.includes("JPG")) {
        blobType = 'image/jpeg';
        filename = 'pdfly_converted.jpg';
      } else if (title.includes("Word")) {
        blobType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = 'pdfly_converted.docx';
      } else if (title.includes("Excel")) {
        blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = 'pdfly_converted.xlsx';
      } else if (title.includes("PowerPoint") || title.includes("PPT")) {
        blobType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        filename = 'pdfly_converted.pptx';
      }
      
      const blob = new Blob([response.data], { type: blobType });
      
      // Verify blob size
      if (blob.size === 0) {
        setError("Processing produced an empty file. Please try again.");
        return;
      }
      
      const url = window.URL.createObjectURL(blob);
      
      // Store download URL and filename for download button
      setDownloadUrl(url);
      setDownloadFilename(filename);
      }

      // Record usage (only for FREE users)
      const userPlan = user?.plan || localStorage.getItem('pdfly_user_plan') || 'FREE';
      if (userPlan !== 'PRO' && user?.role !== 'ADMIN') {
        localStorage.setItem('pdfly_last_usage', Date.now().toString());
      }
      
    } catch (error) {
      let errorMsg = "Processing failed. ";
      if (error.response?.status === 401 && title === "Unlock PDF") {
        errorMsg += "Invalid password provided.";
      } else if (error.response?.data) {
        if (error.response.data instanceof Blob) {
          const text = await error.response.data.text();
          errorMsg += text;
        } else {
          errorMsg += error.response.data;
        }
      } else {
        errorMsg += error.message;
      }
      setError(errorMsg);
      console.error("Processing Error:", error);
    } finally {
      setProcessing(false);
    }
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
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            {Icon ? <Icon className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
            Upload your {fileType.prompt} to get started. 1 free task available today.
          </p>
        </div>

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
                <div className="text-center p-6">
                  <FileText className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg block">{file.name}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                    <UploadCloud className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                    {isDragActive ? "Drop it here!" : "Click or Drag File"}
                  </span>
                  <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Supports {fileType.extension} files
                  </span>
                </>
              )}
            </div>
            {file && (
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }} 
                className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right: Action Panel */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl space-y-6">
            {needsPassword && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  PDF Password
                </label>
                <input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PDF password"
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {needsSignature && (
              <div className="space-y-2">
                <label htmlFor="signature" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Signature Text
                </label>
                <input 
                  id="signature"
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="e.g., John Doe, Approved, Signed"
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This text will be added at the bottom right of each page.
                </p>
              </div>
            )}

            {needsPageNumberPosition && (
              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Page Number Position
                </label>
                <select
                  id="position"
                  value={pageNumberPosition}
                  onChange={(e) => setPageNumberPosition(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                </select>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Page numbers will appear as "Page X of Y" at the selected position.
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}

            {downloadUrl && !processing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-emerald-500 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <FileText className="h-4 w-4" /> File processed successfully!
                </div>
                <a
                  href={downloadUrl}
                  download={downloadFilename}
                  onClick={() => {
                    // Clean up after download
                    setTimeout(() => {
                      window.URL.revokeObjectURL(downloadUrl);
                      setDownloadUrl(null);
                      setDownloadFilename(null);
                      setFile(null);
                      setPassword('');
                      setSignatureText('');
                      setPageNumberPosition('bottom-center');
                    }, 100);
                  }}
                  className="group flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40"
                >
                  <Download className="h-5 w-5" /> DOWNLOAD FILE
                </a>
                <button
                  onClick={() => {
                    window.URL.revokeObjectURL(downloadUrl);
                    setDownloadUrl(null);
                    setDownloadFilename(null);
                    setFile(null);
                    setPassword('');
                    setSignatureText('');
                    setPageNumberPosition('bottom-center');
                  }}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  Process Another File
                </button>
              </div>
            ) : (
              <button 
                onClick={handleProcess}
                disabled={!file || (needsPassword && !password.trim()) || (needsSignature && !signatureText.trim()) || processing}
                className="group mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:shadow-none"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> PROCESSING...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-5 w-5" /> PROCESS FILE
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-2 text-sm text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <AlertCircle className="h-4 w-4" />
              <span>Files are automatically deleted after 1 hour</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
