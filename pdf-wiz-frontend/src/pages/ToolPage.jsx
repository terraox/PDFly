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

  // Signature customization states
  const [pdfPreview, setPdfPreview] = useState(null);
  const [signaturePosition, setSignaturePosition] = useState(null);
  const [signatureColor, setSignatureColor] = useState('#0000FF');
  const [signatureFontName, setSignatureFontName] = useState('HELVETICA_BOLD');
  const [signatureFontSize, setSignatureFontSize] = useState(18);

  // Watermark customization states
  const [watermarkType, setWatermarkType] = useState('text'); // 'text' or 'image'
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState(null); // For preview display
  const [watermarkPosition, setWatermarkPosition] = useState(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkRotation, setWatermarkRotation] = useState(45);
  const [watermarkScale, setWatermarkScale] = useState(1.0);
  const [isFeatureDisabled, setIsFeatureDisabled] = useState(false);
  const [checkingFeatureStatus, setCheckingFeatureStatus] = useState(false);

  React.useEffect(() => {
    const checkConfig = async () => {
      if (title === "Compress PDF") {
        console.log('[ToolPage] Checking if compression is disabled...');
        setCheckingFeatureStatus(true);
        try {
          const response = await axios.get('http://localhost:8080/api/tools/config');
          console.log('[ToolPage] Config response:', response.data);
          const config = response.data.find(c => c.configKey === 'DISABLE_COMPRESSION');
          if (config && config.configValue === 'true') {
            console.log('[ToolPage] Compression is DISABLED');
            setIsFeatureDisabled(true);
          } else {
            console.log('[ToolPage] Compression is ENABLED');
          }
        } catch (error) {
          console.error("[ToolPage] Failed to check feature config:", error);
        } finally {
          setCheckingFeatureStatus(false);
        }
      }
    };
    checkConfig();
  }, [title]);

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
        return `${baseUrl}/convert/pdf-to-word`; // Output is Word (.docx)
      case "PDF to PowerPoint":
        return `${baseUrl}/convert/ppt`; // Output is PPT (.pptx) - toolId contains "ppt"
      case "PDF to Excel":
        return `${baseUrl}/convert/excel`; // Output is Excel (.xlsx) - toolId contains "excel"
      case "PDF to JPG":
        return `${baseUrl}/convert/jpg`; // Output is JPG - toolId contains "jpg"
      case "Word to PDF":
        console.log("Using endpoint: word-to-pdf-fix");
        return `${baseUrl}/convert/word-to-pdf-fix`; // Output is PDF (Cache buster)
      case "PowerPoint to PDF":
        return `${baseUrl}/convert/to-pdf`; // Output is PDF
      case "Excel to PDF":
        return `${baseUrl}/convert/to-pdf`; // Output is PDF
      case "JPG to PDF":
        return `${baseUrl}/convert/to-pdf`; // Output is PDF
      case "Sign PDF":
        return `${baseUrl}/sign`;
      case "Watermark":
        return `${baseUrl}/watermark`;
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
  const needsWatermark = title === "Watermark";

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      setError(null);

      // If this is Sign PDF or Watermark tool, fetch preview
      if (title === "Sign PDF" || title === "Watermark") {
        console.log('Fetching PDF preview...');
        try {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          console.log('Sending preview request for file:', uploadedFile.name);
          const response = await axios.post('http://localhost:8080/api/tools/preview', formData, {
            responseType: 'blob'
          });
          console.log('Preview response received:', response.status, response.data.size);
          const previewUrl = URL.createObjectURL(response.data);
          setPdfPreview(previewUrl);
          setSignaturePosition(null); // Reset position when new file is uploaded
          setWatermarkPosition(null);
          console.log('Preview loaded successfully');
        } catch (err) {
          console.error('Preview generation failed:', err);
          console.error('Error response:', err.response);
          console.error('Error message:', err.message);
          setError('Failed to generate PDF preview: ' + (err.response?.data || err.message));
        }
      }
    }
  }, [title]);

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
      // Add signature customization parameters
      if (signaturePosition) {
        formData.append('xPosition', signaturePosition.x);
        formData.append('yPosition', signaturePosition.y);
      }
      formData.append('color', signatureColor);
      formData.append('fontName', signatureFontName);
      formData.append('fontSize', signatureFontSize);
    }

    if (needsWatermark) {
      if (watermarkType === 'text' && watermarkText) {
        formData.append('text', watermarkText);
      } else if (watermarkType === 'image' && watermarkImage) {
        formData.append('watermarkImage', watermarkImage);
      }
      if (watermarkPosition) {
        formData.append('xPosition', watermarkPosition.x);
        formData.append('yPosition', watermarkPosition.y);
      }
      formData.append('opacity', watermarkOpacity);
      formData.append('rotation', watermarkRotation);
      formData.append('scale', watermarkScale);
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
      } else if (title === "PDF to JPG") {
        // Only PDF to JPG outputs a .jpg file
        blobType = 'image/jpeg';
        filename = 'pdfly_converted.jpg';
      } else if (title === "PDF to Word") {
        // Only PDF to Word outputs a .docx file
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

  // --- UI: CHECKING FEATURE STATUS ---
  if (checkingFeatureStatus) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <Loader2 className="h-12 w-12 text-indigo-500 mx-auto mb-4 animate-spin" />
            <p className="text-lg text-zinc-500 dark:text-zinc-400">Checking availability...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- UI: FEATURE DISABLED STATE ---
  if (isFeatureDisabled) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
        <Navbar />
        <div className="flex h-[80vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">Feature Temporarily Disabled</h2>
            <p className="mb-8 text-lg text-zinc-500 dark:text-zinc-400">
              This tool has been temporarily disabled by the administrator for maintenance. Please try again later.
            </p>

            <Link
              to="/"
              className="block text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Upload your {fileType.prompt} to get started. {(!user || (user.plan !== 'PRO' && user.role !== 'ADMIN')) && "1 free task available today."}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-start">
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
              <div className="space-y-4">
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
                </div>

                {/* PDF Preview with Click-to-Position */}
                {pdfPreview && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Click on preview to position signature
                    </label>
                    <div
                      className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden cursor-crosshair"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const img = e.currentTarget.querySelector('img');
                        if (img) {
                          // Calculate position relative to actual PDF page (A4: 595x842 points)
                          const scaleX = 595 / img.width;
                          const scaleY = 842 / img.height;
                          const pdfX = x * scaleX;
                          const pdfY = 842 - (y * scaleY); // Flip Y coordinate (PDF origin is bottom-left)
                          setSignaturePosition({ x: pdfX, y: pdfY });
                        }
                      }}
                    >
                      <img src={pdfPreview} alt="PDF Preview" className="w-full" />
                      {signaturePosition && signatureText && (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: `${(signaturePosition.x / 595) * 100}%`,
                            top: `${(1 - signaturePosition.y / 842) * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            color: signatureColor,
                            fontSize: `${signatureFontSize * 0.75}px`, // Scale for preview
                            fontFamily: signatureFontName.includes('HELVETICA') ? 'Arial, sans-serif' :
                              signatureFontName.includes('TIMES') ? 'Times New Roman, serif' :
                                signatureFontName.includes('COURIER') ? 'Courier New, monospace' : 'Arial',
                            fontWeight: signatureFontName.includes('BOLD') ? 'bold' : 'normal',
                            textShadow: '0 0 3px rgba(255,255,255,0.8), 0 0 6px rgba(255,255,255,0.5)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {signatureText}
                        </div>
                      )}
                    </div>
                    {signaturePosition && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        ✓ Signature preview shown on PDF - click again to reposition
                      </p>
                    )}
                  </div>
                )}

                {/* Color Picker */}
                <div className="space-y-2">
                  <label htmlFor="sigColor" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Signature Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="sigColor"
                      type="color"
                      value={signatureColor}
                      onChange={(e) => setSignatureColor(e.target.value)}
                      className="h-10 w-20 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{signatureColor}</span>
                  </div>
                </div>

                {/* Font Selector */}
                <div className="space-y-2">
                  <label htmlFor="sigFont" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Font Style
                  </label>
                  <select
                    id="sigFont"
                    value={signatureFontName}
                    onChange={(e) => setSignatureFontName(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="HELVETICA">Helvetica</option>
                    <option value="HELVETICA_BOLD">Helvetica Bold</option>
                    <option value="TIMES_ROMAN">Times Roman</option>
                    <option value="TIMES_BOLD">Times Bold</option>
                    <option value="COURIER">Courier</option>
                    <option value="COURIER_BOLD">Courier Bold</option>
                  </select>
                </div>

                {/* Font Size Slider */}
                <div className="space-y-2">
                  <label htmlFor="sigSize" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Font Size: {signatureFontSize}pt
                  </label>
                  <input
                    id="sigSize"
                    type="range"
                    min="12"
                    max="36"
                    value={signatureFontSize}
                    onChange={(e) => setSignatureFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
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

            {needsWatermark && (
              <div className="space-y-4">
                {/* Watermark Type Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Watermark Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWatermarkType('text')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${watermarkType === 'text'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setWatermarkType('image')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${watermarkType === 'image'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                      Image
                    </button>
                  </div>
                </div>

                {/* Text Input or Image Upload */}
                {watermarkType === 'text' ? (
                  <div className="space-y-2">
                    <label htmlFor="watermarkText" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Watermark Text
                    </label>
                    <input
                      id="watermarkText"
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g., CONFIDENTIAL, DRAFT, © 2024"
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2 text-base text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label htmlFor="watermarkImg" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Watermark Image
                    </label>
                    <input
                      id="watermarkImg"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setWatermarkImage(file);
                          // Create preview URL for the image
                          const previewUrl = URL.createObjectURL(file);
                          setWatermarkImagePreview(previewUrl);
                        }
                      }}
                      className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/20 dark:file:text-indigo-400"
                    />
                    {watermarkImage && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        ✓ {watermarkImage.name}
                      </p>
                    )}
                  </div>
                )}

                {/* PDF Preview with Click-to-Position */}
                {pdfPreview && (watermarkText || watermarkImage) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Click on preview to position watermark
                    </label>
                    <div
                      className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden cursor-crosshair"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const img = e.currentTarget.querySelector('img');
                        if (img) {
                          const scaleX = 595 / img.width;
                          const scaleY = 842 / img.height;
                          const pdfX = x * scaleX;
                          const pdfY = 842 - (y * scaleY);
                          setWatermarkPosition({ x: pdfX, y: pdfY });
                        }
                      }}
                    >
                      <img src={pdfPreview} alt="PDF Preview" className="w-full" />
                      {watermarkPosition && watermarkType === 'text' && watermarkText && (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: `${(watermarkPosition.x / 595) * 100}%`,
                            top: `${(1 - watermarkPosition.y / 842) * 100}%`,
                            transform: `translate(-50%, -50%) rotate(${watermarkRotation}deg)`,
                            opacity: watermarkOpacity,
                            color: '#808080',
                            fontSize: `${60 * watermarkScale * 0.5}px`,
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {watermarkText}
                        </div>
                      )}
                      {watermarkPosition && watermarkType === 'image' && watermarkImagePreview && (
                        <img
                          src={watermarkImagePreview}
                          alt="Watermark preview"
                          className="absolute pointer-events-none"
                          style={{
                            left: `${(watermarkPosition.x / 595) * 100}%`,
                            top: `${(1 - watermarkPosition.y / 842) * 100}%`,
                            transform: `translate(-50%, -50%) rotate(${watermarkRotation}deg) scale(${watermarkScale * 0.3})`,
                            opacity: watermarkOpacity,
                            maxWidth: '200px',
                            maxHeight: '200px'
                          }}
                        />
                      )}
                    </div>
                    {watermarkPosition && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        ✓ Watermark preview shown - click again to reposition
                      </p>
                    )}
                  </div>
                )}

                {/* Opacity Slider */}
                <div className="space-y-2">
                  <label htmlFor="wmOpacity" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Opacity: {Math.round(watermarkOpacity * 100)}%
                  </label>
                  <input
                    id="wmOpacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Rotation Slider */}
                <div className="space-y-2">
                  <label htmlFor="wmRotation" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Rotation: {watermarkRotation}°
                  </label>
                  <input
                    id="wmRotation"
                    type="range"
                    min="0"
                    max="360"
                    value={watermarkRotation}
                    onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Scale Slider */}
                <div className="space-y-2">
                  <label htmlFor="wmScale" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Size: {Math.round(watermarkScale * 100)}%
                  </label>
                  <input
                    id="wmScale"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={watermarkScale}
                    onChange={(e) => setWatermarkScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
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
