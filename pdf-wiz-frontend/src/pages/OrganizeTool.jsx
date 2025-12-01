import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Layers, Download, AlertCircle, Trash2, GripVertical, Lock, Sparkles, LayoutGrid, UploadCloud, FileText, X, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProBadge from '../components/ProBadge';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

export default function OrganizeTool() {
    const { user, isAuthenticated, refreshUser, token } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [pages, setPages] = useState([]); // Array of { id, pageIndex, previewUrl }
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
    const [error, setError] = useState('');
    const [draggedIndex, setDraggedIndex] = useState(null);
    const fileInputRef = useRef(null);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleOrganize();
            }
            if (e.key === 'Escape') {
                if (pages.length > 0) {
                    setFile(null);
                    setPages([]);
                } else if (file) {
                    setFile(null);
                }
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
                e.preventDefault();
                if (pages.length === 0) {
                    open();
                } else {
                    setFile(null);
                    setPages([]);
                    setTimeout(() => open(), 100);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pages, file]);

    // Pro Gating Check
    useEffect(() => {
        if (isAuthenticated) {
            refreshUser();
        }
    }, [isAuthenticated]);

    const isPro = user?.plan === 'PRO' || user?.role === 'ADMIN';

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            const selectedFile = acceptedFiles[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError('');
            } else {
                setError('Please upload a valid PDF file.');
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        noClick: !!file
    });

    const loadDocument = async () => {
        if (!file) return;

        setPages([]);
        setIsLoadingPreviews(true);
        setError('');

        try {
            // 1. Get Page Count
            const formData = new FormData();
            formData.append('file', file);
            const countRes = await axios.post('http://localhost:8080/api/tools/page-count', formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const totalPages = countRes.data.count;

            // 2. Fetch Previews (Parallel-ish)
            const newPages = [];
            for (let i = 0; i < totalPages; i++) {
                const previewFormData = new FormData();
                previewFormData.append('file', file);
                previewFormData.append('page', i);

                try {
                    const previewRes = await axios.post('http://localhost:8080/api/tools/preview-page', previewFormData, {
                        headers: { 'Authorization': `Bearer ${token}` },
                        responseType: 'blob'
                    });
                    newPages.push({
                        id: `page-${i}`,
                        originalIndex: i + 1, // 1-based for display/backend
                        previewUrl: URL.createObjectURL(previewRes.data)
                    });
                } catch (err) {
                    console.error(`Failed to load preview for page ${i}`, err);
                    newPages.push({
                        id: `page-${i}`,
                        originalIndex: i + 1,
                        previewUrl: null,
                        error: true
                    });
                }
                // Update state incrementally to show progress
                setPages([...newPages]);
            }
        } catch (err) {
            console.error("Failed to load pages", err);
            setError("Failed to load PDF pages. Please try again.");
        } finally {
            setIsLoadingPreviews(false);
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newPages = [...pages];
        const draggedItem = newPages[draggedIndex];
        newPages.splice(draggedIndex, 1);
        newPages.splice(index, 0, draggedItem);

        setPages(newPages);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleDeletePage = (index) => {
        const newPages = pages.filter((_, i) => i !== index);
        setPages(newPages);
    };

    const handleOrganize = async () => {
        if (!file || pages.length === 0) return;

        setIsProcessing(true);
        setError('');

        try {
            // Construct page order string (e.g., "1,3,2")
            const pageOrder = pages.map(p => p.originalIndex).join(',');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('pageOrder', pageOrder);

            const response = await axios.post('http://localhost:8080/api/tools/organize', formData, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'organized.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            setError('Failed to organize PDF. Please try again.');
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
                            Organizing PDFs is a premium feature. Upgrade to Pro to unlock advanced tools like Crop, Redact, and Organize.
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

    // --- EDITOR UI (When pages are loaded) ---
    if (pages.length > 0 || isLoadingPreviews) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 font-sans">
                <Navbar />
                <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 pt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                                Organize PDF
                            </h1>
                            <ProBadge size="lg" />
                        </div>
                        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                            Rearrange, delete, and organize your PDF pages.
                        </p>
                    </motion.div>

                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800">
                        <div className="space-y-6">
                            {isLoadingPreviews && pages.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading pages...</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                <AnimatePresence>
                                    {pages.map((page, index) => (
                                        <motion.div
                                            key={page.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`relative group bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2 border-2 cursor-move transition-colors ${draggedIndex === index
                                                ? 'border-indigo-500 opacity-50'
                                                : 'border-transparent hover:border-indigo-500/50'
                                                }`}
                                        >
                                            <div className="aspect-[1/1.4] relative bg-white rounded shadow-sm overflow-hidden">
                                                {page.previewUrl ? (
                                                    <img
                                                        src={page.previewUrl}
                                                        alt={`Page ${page.originalIndex}`}
                                                        className="w-full h-full object-contain"
                                                        draggable={false}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                        {page.error ? <AlertCircle /> : '...'}
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                                    {page.originalIndex}
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePage(index)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                                                <GripVertical className="w-4 h-4 mr-1 opacity-50" />
                                                Page {index + 1}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                <div className="flex flex-col">
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                        {pages.length} pages remaining
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => { setFile(null); setPages([]); }}
                                        className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleOrganize}
                                        disabled={isProcessing || pages.length === 0}
                                        className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <LayoutGrid className="w-4 h-4 mr-2" />
                                                Save PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- UPLOAD UI (Split Card Layout) ---
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 font-sans">
            <Navbar />
            <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 pt-32">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    >
                        <Layers className="h-8 w-8" />
                    </motion.div>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <motion.h1
                            className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            Organize PDF
                        </motion.h1>
                        <ProBadge size="lg" />
                    </div>
                    <motion.p
                        className="mx-auto max-w-2xl text-lg text-zinc-500 dark:text-zinc-400"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Rearrange, delete, and organize your PDF pages.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid gap-8 md:grid-cols-2 items-start"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    {/* Left: Upload Zone */}
                    <div className="relative">
                        <motion.div
                            {...getRootProps()}
                            className={`relative h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${isDragActive
                                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10'
                                : 'border-zinc-300 hover:border-indigo-500 bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-400'
                                }`}
                            animate={isDragActive ? {
                                scale: [1, 1.02, 1],
                                boxShadow: [
                                    '0 0 0 0 rgba(99, 102, 241, 0)',
                                    '0 0 0 10px rgba(99, 102, 241, 0.1)',
                                    '0 0 0 0 rgba(99, 102, 241, 0)',
                                ],
                            } : {}}
                            transition={{ duration: 1, repeat: isDragActive ? Infinity : 0 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={open}
                        >
                            <input {...getInputProps()} />
                            {file ? (
                                <div className="text-center p-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30"
                                    >
                                        <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                    </motion.div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] mx-auto">{file.name}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <>
                                    <motion.div
                                        className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4"
                                        animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
                                    >
                                        <UploadCloud className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
                                    </motion.div>
                                    <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                                        {isDragActive ? "Drop it here!" : "Click or Drag File"}
                                    </span>
                                    <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        Supports .pdf
                                    </span>
                                </>
                            )}
                        </motion.div>
                        {file && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700"
                                title="Remove file"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Right: Action Panel */}
                    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl space-y-6">
                        <div className="space-y-4">
                            <button
                                onClick={loadDocument}
                                disabled={!file}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingPreviews ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <Layers className="h-5 w-5" />
                                        Load Document
                                    </>
                                )}
                            </button>

                            {!file && (
                                <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                                    Files are automatically deleted after 1 hour
                                </p>
                            )}
                        </div>

                        {/* Shortcuts Section */}
                        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                            <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-4 pl-1">
                                Keyboard Shortcuts
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-200">Upload PDF</span>
                                    <div className="flex gap-1">
                                        <kbd className="min-w-[18px] h-5 flex items-center justify-center px-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">⌘</kbd>
                                        <kbd className="min-w-[18px] h-5 flex items-center justify-center px-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">U</kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-200">Clear File</span>
                                    <kbd className="min-w-[18px] h-5 flex items-center justify-center px-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">Esc</kbd>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center text-sm">
                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
