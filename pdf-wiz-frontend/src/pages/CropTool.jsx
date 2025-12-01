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
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [cropScope, setCropScope] = useState('all'); // 'all' or 'current'
    const [pageIndex, setPageIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [thumbnails, setThumbnails] = useState([]);
    const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
    const imgRef = useRef(null);

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
            setCrop(undefined);
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
                    index: i,
                    url: URL.createObjectURL(res.data)
                });
            } catch (err) {
                console.error(`Failed to load thumbnail for page ${i}`, err);
                newThumbnails.push({ index: i, error: true });
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
            setCrop(undefined);
            if (file) {
                fetchPreview(file, newPage);
            }
        }
    };

    const handleCrop = async () => {
        if (!file || !completedCrop || !imgRef.current) return;

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
            <div className="pt-24 pb-12 px-6 lg:px-8 h-[calc(100vh-6rem)] flex flex-col">
                <div className="max-w-7xl mx-auto w-full h-full flex gap-6">

                    {/* Left: Thumbnails Sidebar */}

                    {/* Left: Thumbnails Sidebar */}
                    {file && (
                        <div className="w-56 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col shadow-xl shrink-0">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="w-3 h-3" /> Pages ({totalPages})
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-zinc-50/30 dark:bg-black/20">
                                {thumbnails.map((thumb) => (
                                    <button
                                        key={thumb.index}
                                        onClick={() => handlePageChange(thumb.index - pageIndex)}
                                        className={`w-full group relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${pageIndex === thumb.index
                                            ? 'border-indigo-600 ring-4 ring-indigo-600/10 shadow-lg scale-[1.02]'
                                            : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        <div className="aspect-[1/1.4] bg-white dark:bg-zinc-800 relative">
                                            {thumb.url ? (
                                                <img
                                                    src={thumb.url}
                                                    alt={`Page ${thumb.index + 1}`}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {thumb.error ? (
                                                        <AlertCircle className="w-6 h-6 text-red-400" />
                                                    ) : (
                                                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md transition-colors ${pageIndex === thumb.index
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-black/50 text-white group-hover:bg-black/70'
                                            }`}>
                                            {thumb.index + 1}
                                        </div>
                                    </button>
                                ))}
                                {isLoadingThumbnails && thumbnails.length < totalPages && (
                                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-zinc-400">
                                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span className="text-xs">Loading thumbnails...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Middle: Preview Area */}
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col relative">
                        {/* Header with Page Nav */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                            <div className="flex items-center gap-2">
                                <ProBadge />
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">PDF Preview</h3>
                            </div>

                            {file && (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handlePageChange(-1)}
                                        disabled={pageIndex === 0}
                                        className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                    </button>
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Page {pageIndex + 1} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={pageIndex === totalPages - 1}
                                        className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
                            {!file ? (
                                <div className="text-center p-12">
                                    <div className="mx-auto h-24 w-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
                                        <Crop className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Upload PDF to Crop</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
                                        Select the area you want to crop and apply it to all pages or just one.
                                    </p>
                                    <label className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-all hover:scale-105">
                                        <span>Select PDF File</span>
                                        <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                    </label>
                                </div>
                            ) : (
                                <div className="relative shadow-2xl">
                                    {previewUrl ? (
                                        <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                                            <img ref={imgRef} src={previewUrl} alt="PDF Preview" className="max-w-full max-h-[70vh] object-contain" />
                                        </ReactCrop>
                                    ) : (
                                        <div className="animate-pulse flex flex-col items-center">
                                            <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4"></div>
                                            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Sidebar Controls */}
                    {file && (
                        <div className="w-80 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col shadow-xl">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                                <Crop className="w-5 h-5 mr-2" />
                                Crop Options
                            </h2>

                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 block">
                                        Apply Crop To:
                                    </label>
                                    <div className="space-y-3">
                                        <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${cropScope === 'all' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                                            <input
                                                type="radio"
                                                name="scope"
                                                value="all"
                                                checked={cropScope === 'all'}
                                                onChange={(e) => setCropScope(e.target.value)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <div className="ml-3">
                                                <span className="block text-sm font-medium text-zinc-900 dark:text-white">All Pages</span>
                                                <span className="block text-xs text-zinc-500">Apply to every page</span>
                                            </div>
                                            <Layers className="ml-auto h-4 w-4 text-zinc-400" />
                                        </label>

                                        <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${cropScope === 'current' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                                            <input
                                                type="radio"
                                                name="scope"
                                                value="current"
                                                checked={cropScope === 'current'}
                                                onChange={(e) => setCropScope(e.target.value)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <div className="ml-3">
                                                <span className="block text-sm font-medium text-zinc-900 dark:text-white">Current Page</span>
                                                <span className="block text-xs text-zinc-500">Apply to page {pageIndex + 1} only</span>
                                            </div>
                                            <FileText className="ml-auto h-4 w-4 text-zinc-400" />
                                        </label>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start">
                                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                                <button
                                    onClick={handleCrop}
                                    disabled={isProcessing || !completedCrop}
                                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isProcessing ? 'Processing...' : 'Crop PDF'}
                                </button>
                                <button
                                    onClick={() => setFile(null)}
                                    className="w-full px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
