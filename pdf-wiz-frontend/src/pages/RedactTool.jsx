import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Eraser, Download, AlertCircle, Trash2, Lock, Sparkles, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProBadge from '../components/ProBadge';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RedactTool() {
    const { user, isAuthenticated, refreshUser, token } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [redactions, setRedactions] = useState([]); // Array of {x, y, w, h, page}
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState(null);
    const imgRef = useRef(null);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                setRedactions(prev => prev.slice(0, -1));
            }
            if (e.key === 'Backspace' || e.key === 'Delete') {
                // If we had selection, we'd delete selected. For now, delete last.
                setRedactions(prev => prev.slice(0, -1));
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
    }, []);

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
            setRedactions([]);

            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await axios.post('http://localhost:8080/api/tools/preview', formData, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                });
                setPreviewUrl(URL.createObjectURL(response.data));
            } catch (err) {
                console.error("Preview failed", err);
                setError("Failed to load PDF preview.");
            }
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const getMousePos = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e) => {
        if (!previewUrl) return;
        setIsDrawing(true);
        const pos = getMousePos(e);
        setStartPos(pos);
        setCurrentRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const pos = getMousePos(e);
        const w = pos.x - startPos.x;
        const h = pos.y - startPos.y;
        setCurrentRect({
            x: w > 0 ? startPos.x : pos.x,
            y: h > 0 ? startPos.y : pos.y,
            w: Math.abs(w),
            h: Math.abs(h)
        });
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentRect && currentRect.w > 5 && currentRect.h > 5) {
            setRedactions([...redactions, { ...currentRect, page: 0 }]); // Assuming page 0 for now
        }
        setCurrentRect(null);
    };

    const removeRedaction = (index) => {
        setRedactions(redactions.filter((_, i) => i !== index));
    };

    const handleRedact = async () => {
        if (!file || redactions.length === 0 || !imgRef.current) return;

        setIsProcessing(true);
        setError('');

        try {
            const image = imgRef.current;
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            // Convert to PDF coordinates (assuming 72 DPI vs 150 DPI preview)
            const dpiScale = 72 / 150;

            const formattedRedactions = redactions.map(r => ({
                page: r.page,
                x: r.x * scaleX * dpiScale,
                y: (image.height - (r.y + r.h)) * scaleY * dpiScale, // Flip Y for PDF bottom-left origin
                width: r.w * scaleX * dpiScale,
                height: r.h * scaleY * dpiScale
            }));

            const formData = new FormData();
            formData.append('file', file);
            formData.append('redactions', JSON.stringify(formattedRedactions));

            const response = await axios.post('http://localhost:8080/api/tools/redact', formData, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'redacted.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            setError('Failed to redact PDF. Please try again.');
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
                            Redacting PDFs is a premium feature. Upgrade to Pro to unlock advanced tools like Crop, Redact, and Organize.
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
            <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 pt-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                            Redact PDF
                        </h1>
                        <ProBadge size="lg" />
                    </div>
                    <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                        Permanently remove sensitive information from your PDF.
                    </p>
                </motion.div>

                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-zinc-200 dark:border-zinc-800">
                    {!file ? (
                        <div className="text-center">
                            <div className="mt-4 flex justify-center rounded-lg border border-dashed border-zinc-900/25 dark:border-zinc-100/25 px-6 py-10">
                                <div className="text-center">
                                    <Eraser className="mx-auto h-12 w-12 text-zinc-300" aria-hidden="true" />
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
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div
                                    ref={containerRef}
                                    className="relative inline-block cursor-crosshair"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    {previewUrl && (
                                        <img
                                            ref={imgRef}
                                            src={previewUrl}
                                            alt="PDF Preview"
                                            className="max-h-[600px] border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                            draggable={false}
                                        />
                                    )}

                                    {/* Render existing redactions */}
                                    {redactions.map((r, i) => (
                                        <div
                                            key={i}
                                            className="absolute bg-black/80 border border-red-500 group"
                                            style={{
                                                left: r.x,
                                                top: r.y,
                                                width: r.w,
                                                height: r.h
                                            }}
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeRedaction(i); }}
                                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Render current drawing rect */}
                                    {isDrawing && currentRect && (
                                        <div
                                            className="absolute bg-black/50 border border-red-500"
                                            style={{
                                                left: currentRect.x,
                                                top: currentRect.y,
                                                width: currentRect.w,
                                                height: currentRect.h
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                        {redactions.length} area{redactions.length !== 1 ? 's' : ''} marked
                                    </p>
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setFile(null)}
                                        className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRedact}
                                        disabled={isProcessing || redactions.length === 0}
                                        className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-4 h-4 mr-2" />
                                                Redact PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Shortcuts Section - Always Visible */}
                    <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-left">
                        <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-4 pl-1">
                            Keyboard Shortcuts
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors group">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">Undo Action</span>
                                <div className="flex gap-1.5">
                                    <kbd className="min-w-[20px] h-6 flex items-center justify-center px-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">⌘</kbd>
                                    <kbd className="min-w-[20px] h-6 flex items-center justify-center px-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">Z</kbd>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors group">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">Delete Selected</span>
                                <kbd className="min-w-[20px] h-6 flex items-center justify-center px-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">⌫</kbd>
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
