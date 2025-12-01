import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Layers, Download, AlertCircle, Trash2, GripVertical, Lock, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProBadge from '../components/ProBadge';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function OrganizeTool() {
    const { user, isAuthenticated, refreshUser, token } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [pages, setPages] = useState([]); // Array of { id, pageIndex, previewUrl }
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
    const [error, setError] = useState('');
    const [draggedIndex, setDraggedIndex] = useState(null);

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
            setPages([]);
            setIsLoadingPreviews(true);

            try {
                // 1. Get Page Count
                const formData = new FormData();
                formData.append('file', selectedFile);
                const countRes = await axios.post('http://localhost:8080/api/tools/page-count', formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const totalPages = countRes.data.count;

                // 2. Fetch Previews (Parallel-ish)
                const newPages = [];
                for (let i = 0; i < totalPages; i++) {
                    const previewFormData = new FormData();
                    previewFormData.append('file', selectedFile);
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
                        // Push a placeholder or skip? Better to show error placeholder.
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
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Transparent drag image or custom? Default is fine for now.
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

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
                    {!file ? (
                        <div className="text-center">
                            <div className="mt-4 flex justify-center rounded-lg border border-dashed border-zinc-900/25 dark:border-zinc-100/25 px-6 py-10">
                                <div className="text-center">
                                    <Layers className="mx-auto h-12 w-12 text-zinc-300" aria-hidden="true" />
                                    <div className="mt-4 flex text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                        >
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">PDF up to 10MB</p>
                                </div>
                            </div>
                        </div>
                    ) : (
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
                                <div className="text-sm text-zinc-500">
                                    {pages.length} pages remaining
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setFile(null)}
                                        className="px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleOrganize}
                                        disabled={isProcessing || pages.length === 0}
                                        className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isProcessing ? 'Processing...' : (
                                            <>
                                                <Layers className="w-4 h-4 mr-2" />
                                                Save PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
