import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Crop, Download, AlertCircle, Layers, FileText, ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProBadge from '../components/ProBadge';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function CropTool() {
    const { user, isAuthenticated, refreshUser, token } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [cropScope, setCropScope] = useState('all'); // 'all' or 'current'
    const [pageIndex, setPageIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [thumbnails, setThumbnails] = useState([]); // Array of { pageIndex, url }
    const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleCrop();
            }
            if (e.key === 'Escape') {
                setFile(null);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
                e.preventDefault();
                fileInputRef.current?.click();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [completedCrop, file, pageIndex]);

    // Pro Gating Check
    useEffect(() => {
        if (isAuthenticated) {
            refreshUser();
        }
    }, [isAuthenticated]);

    const isPro = user?.plan === 'PRO' || user?.role === 'ADMIN';

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
            setPreviewUrl(null);
            setCompletedCrop(null);
            setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 }); // Reset crop to default
            setPageIndex(0);

            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                // 1. Get Page Count
                const countResponse = await axios.post('http://localhost:8080/api/tools/page-count', formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const count = countResponse.data.count;

                if (typeof count !== 'number') {
                    throw new Error("Invalid page count received");
                }

                setTotalPages(count);

                // 2. Get Preview for Page 0 (Immediate)
                await fetchPreview(selectedFile, 0);

                // 3. Start fetching thumbnails (Non-blocking)
                fetchThumbnails(selectedFile, count);

            } catch (err) {

                console.error("Initialization failed", err);
                const status = err.response ? err.response.status : 'No Status';
                const msg = err.message || 'Unknown Error';
                setError(`DEBUG: ${msg} (${status}). Please check console.`);
            }
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const fetchThumbnails = async (currentFile, count) => {
        setIsLoadingThumbnails(true);
        setThumbnails([]);
        const newThumbnails = [];

        // Fetch thumbnails one by one
        for (let i = 0; i < count; i++) {
            const thumbFormData = new FormData();
            thumbFormData.append('file', currentFile);
            thumbFormData.append('page', i);

            try {
                const res = await axios.post('http://localhost:8080/api/tools/preview-page', thumbFormData, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                });
                newThumbnails.push({
                    pageIndex: i,
                    url: URL.createObjectURL(res.data)
                });
            } catch (err) {
                console.error(`Failed to load thumbnail for page ${i}`, err);
                newThumbnails.push({ pageIndex: i, error: true });
            }
            // Update state incrementally
            setThumbnails([...newThumbnails]);
        }
        setIsLoadingThumbnails(false);
    };


    const fetchPreview = async (currentFile, page) => {
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('page', page);

        try {
            const response = await axios.post('http://localhost:8080/api/tools/preview-page', formData, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });
            setPreviewUrl(URL.createObjectURL(response.data));
        } catch (err) {

            console.error("Preview failed", err);
            const status = err.response ? err.response.status : 'No Status';
            const msg = err.message || 'Unknown Error';
            const tokenStatus = token ? `Token present (${token.substring(0, 10)}...)` : 'No Token';
            setError(`DEBUG PREVIEW: ${msg} (${status}). ${tokenStatus}`);
        }
    };

    const handlePageChange = (delta) => {
        const newPage = Math.max(0, Math.min(totalPages - 1, pageIndex + delta));
        if (newPage !== pageIndex) {
            setPageIndex(newPage);
            setCompletedCrop(null); // Reset crop on page change
            setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 }); // Reset crop to default
            if (file) {
                fetchPreview(file, newPage);
            }
        }
    };

    const handleThumbnailClick = (index) => {
        if (index !== pageIndex) {
            setPageIndex(index);
            setCompletedCrop(null); // Reset crop on page change
            setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 }); // Reset crop to default
            if (file) {
                fetchPreview(file, index);
            }
        }
    };

    const handleCrop = async () => {
        if (!file || !completedCrop || !imgRef.current) {
            setError('Please select a crop area first.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const image = imgRef.current;
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            // Backend assumes 72 DPI (PDF points). Preview is generated at 150 DPI.
            const dpiScale = 72 / 150;

            const x = completedCrop.x * scaleX * dpiScale;
            const y = completedCrop.y * scaleY * dpiScale;
            const width = completedCrop.width * scaleX * dpiScale;
            const height = completedCrop.height * scaleY * dpiScale;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('x', x);
            formData.append('y', y);
            formData.append('width', width);
            formData.append('height', height);
            formData.append('scope', cropScope);
            formData.append('pageIndex', pageIndex);

            const response = await axios.post('http://localhost:8080/api/tools/crop', formData, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'cropped.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            setError('Failed to crop PDF. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // --- PRO GATING UI ---
    if (!isAuthenticated || !isPro) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 font-sans">
                <Navbar />
                <div className="flex h-[80vh] items-center justify-center px-6 pt-20">
                    <div className="max-w-md text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                            <Lock className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">Pro Feature Locked</h2>
                        <p className="mb-8 text-lg text-zinc-500 dark:text-zinc-400">
                            Cropping PDFs is a premium feature. Upgrade to Pro to unlock advanced tools like Crop, Redact, and Organize.
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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 font-sans">
            <Navbar />

            {/* Main Content Area */}
            <div className="pt-24 pb-12 px-6 lg:px-8 h-[calc(100vh-200px)] flex flex-col">
                <div className="max-w-7xl mx-auto w-full h-full flex gap-6">
                    {/* Thumbnail Sidebar */}
                    {file && (
                        <div className="w-64 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    Pages ({totalPages})
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {isLoadingThumbnails && thumbnails.length === 0 ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : (
                                    thumbnails.map((thumb) => (
                                        <button
                                            key={thumb.pageIndex}
                                            onClick={() => handleThumbnailClick(thumb.pageIndex)}
                                            className={`w-full group relative aspect-[1/1.4] rounded-lg border-2 transition-all overflow-hidden ${pageIndex === thumb.pageIndex
                                                ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-lg scale-[1.02]'
                                                : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
                                                }`}
                                        >
                                            <img
                                                src={thumb.url}
                                                alt={`Page ${thumb.pageIndex + 1}`}
                                                className="w-full h-full object-contain bg-white"
                                                loading="lazy"
                                            />
                                            <div className={`absolute bottom-0 inset-x-0 p-1 text-xs font-medium text-center transition-colors ${pageIndex === thumb.pageIndex
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-black/50 text-white backdrop-blur-sm'
                                                }`}>
                                                Page {thumb.pageIndex + 1}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Main Preview Area */}
                    <div className="flex-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    PRO
                                </span>
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    PDF Preview
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handlePageChange(-1)}
                                    disabled={pageIndex === 0}
                                    className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                </button>
                                <span className="text-sm font-medium text-zinc-900 dark:text-white min-w-[80px] text-center">
                                    Page {pageIndex + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={pageIndex === totalPages - 1}
                                    className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-zinc-100/50 dark:bg-black/20">
                            {!file ? (
                                <div className="text-center">
                                    <div className="mt-4 flex justify-center rounded-lg border border-dashed border-zinc-900/25 dark:border-zinc-100/25 px-6 py-10 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="text-center">
                                            <Crop className="mx-auto h-12 w-12 text-zinc-300" aria-hidden="true" />
                                            <div className="mt-4 flex text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                                >
                                                    <span>Upload a file</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        accept=".pdf"
                                                        onChange={handleFileChange}
                                                        ref={fileInputRef}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">PDF up to 10MB</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative shadow-2xl rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                    {previewUrl && (
                                        <ReactCrop
                                            crop={crop}
                                            onChange={(c) => setCrop(c)}
                                            onComplete={(c) => setCompletedCrop(c)}
                                            className="max-h-[60vh]"
                                        >
                                            <img
                                                ref={imgRef}
                                                src={previewUrl}
                                                alt="PDF Preview"
                                                className="max-h-[60vh] w-auto object-contain bg-white"
                                                onLoad={(e) => {
                                                    // Optional: set initial crop
                                                }}
                                            />
                                        </ReactCrop>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Crop Options Panel */}
                    <div className="w-80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                            <Crop className="w-5 h-5" />
                            Crop Options
                        </h3>

                        <div className="space-y-6 flex-1">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                                    Apply Crop To:
                                </label>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setCropScope('all')}
                                        className={`w-full flex items-center p-3 rounded-xl border-2 transition-all ${cropScope === 'all'
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full mr-3 ${cropScope === 'all' ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-sm">All Pages</div>
                                            <div className="text-xs opacity-80">Apply to every page</div>
                                        </div>
                                        {cropScope === 'all' && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600"></div>}
                                    </button>

                                    <button
                                        onClick={() => setCropScope('current')}
                                        className={`w-full flex items-center p-3 rounded-xl border-2 transition-all ${cropScope === 'current'
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full mr-3 ${cropScope === 'current' ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-sm">Current Page</div>
                                            <div className="text-xs opacity-80">Apply to page {pageIndex + 1} only</div>
                                        </div>
                                        {cropScope === 'current' && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600"></div>}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={handleCrop}
                                disabled={isProcessing || !file || !completedCrop?.width || !completedCrop?.height}
                                className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Crop className="w-4 h-4 mr-2" />
                                        Crop PDF
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setFile(null)}
                                className="w-full mt-3 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Shortcuts Section */}
                        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-4 pl-1">
                                Keyboard Shortcuts
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors group">
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">Crop Selection</span>
                                    <div className="flex gap-1.5">
                                        <kbd className="min-w-[20px] h-6 flex items-center justify-center px-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">⌘</kbd>
                                        <kbd className="min-w-[20px] h-6 flex items-center justify-center px-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">Enter</kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors group">
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">Upload PDF</span>
                                    <div className="flex gap-1.5">
                                        <kbd className="min-w-[20px] h-6 flex items-center justify-center px-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">⌘</kbd>
                                        <kbd className="min-w-[20px] h-6 flex items-center justify-center px-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">U</kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors group">
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">Cancel</span>
                                    <kbd className="min-w-[20px] h-6 flex items-center justify-center px-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">Esc</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
