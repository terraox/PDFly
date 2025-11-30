import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useHistory } from '../context/HistoryContext';
import { UploadCloud, Hash, Loader2, AlertTriangle, FileText, X, Download, Settings, Sparkles, LayoutTemplate, Type, Palette } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = "http://localhost:8080/api/tools/page-numbers";

export default function PageNumberTool() {
    const { isAuthenticated, user } = useAuth();
    const toast = useToast();
    const { addToHistory } = useHistory();
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [downloadFilename, setDownloadFilename] = useState(null);

    // Customization State
    const [position, setPosition] = useState('bottom-center'); // top-left, top-center, top-right, etc.
    const [margin, setMargin] = useState('recommended'); // small, recommended, big
    const [startPage, setStartPage] = useState(1);
    const [endPage, setEndPage] = useState(null); // null means last page
    const [textTemplate, setTextTemplate] = useState('{n}'); // {n} = page num, {total} = total pages
    const [font, setFont] = useState('HELVETICA');
    const [fontSize, setFontSize] = useState(12);
    const [color, setColor] = useState('#000000');
    const [startNumber, setStartNumber] = useState(1); // The number to start counting from

    const [pdfPageCount, setPdfPageCount] = useState(null);

    const [pdfPreview, setPdfPreview] = useState(null);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                open();
            }
            if (e.key === 'Escape' && file) {
                e.preventDefault();
                setFile(null);
                setError(null);
                setDownloadUrl(null);
                setPdfPageCount(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [file]);

    const generatePreview = async (uploadedFile) => {
        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            const response = await axios.post('http://localhost:8080/api/tools/preview', formData, {
                responseType: 'blob'
            });
            const previewUrl = URL.createObjectURL(response.data);
            setPdfPreview(previewUrl);
        } catch (err) {
            console.error('Preview generation failed:', err);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const uploadedFile = acceptedFiles[0];
            setFile(uploadedFile);
            setError(null);
            setDownloadUrl(null);
            setPdfPageCount(null);
            generatePreview(uploadedFile); // Generate preview on drop

            // Estimate page count
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                const text = new TextDecoder('latin1').decode(arrayBuffer);
                const pageMatches = text.match(/\/Page\b/g);
                const estimatedPages = pageMatches ? pageMatches.length : null;
                setPdfPageCount(estimatedPages);
            };
            reader.readAsArrayBuffer(uploadedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    const handleProcess = async () => {
        if (!file) return;
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('position', position);
        formData.append('margin', margin);
        formData.append('textTemplate', textTemplate);
        formData.append('font', font);
        formData.append('fontSize', fontSize);
        formData.append('color', color);
        formData.append('startNumber', startNumber);
        if (startPage) formData.append('startPage', startPage);
        if (endPage) formData.append('endPage', endPage);

        const token = localStorage.getItem('pdfly_auth_token');

        try {
            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setDownloadUrl(url);
            setDownloadFilename(`numbered_${file.name}`);
            toast.success('Page numbers added successfully!');

            addToHistory({
                fileName: file.name,
                toolName: 'Add Page Numbers',
                status: 'success',
                originalSize: file.size,
            });

        } catch (err) {
            console.error(err);
            setError('Failed to add page numbers. Please try again.');
            toast.error('Processing failed');
            addToHistory({
                fileName: file.name,
                toolName: 'Add Page Numbers',
                status: 'failed',
                originalSize: file.size,
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper to render grid button
    const GridButton = ({ pos, label }) => (
        <button
            onClick={() => setPosition(pos)}
            className={`h-12 w-12 rounded-lg border-2 flex items-center justify-center transition-all ${position === pos
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
            title={label}
        >
            <div className={`h-2 w-2 rounded-full ${position === pos ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
        </button>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 font-sans">
            <Navbar />
            <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">

                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-600 text-white shadow-lg shadow-pink-500/30">
                        <Hash className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white sm:text-5xl">
                        Add Page Numbers
                    </h1>
                    <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                        Insert page numbers into your PDF with full customization.
                    </p>

                    {(!user || (user.plan !== 'PRO' && user.role !== 'ADMIN')) && (
                        <div className="mt-6 flex justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20">
                                <Sparkles className="h-4 w-4" />
                                {user ? (
                                    <span><span className="font-bold">{3 - (user.dailyUsageCount || 0)}</span> free tasks remaining today</span>
                                ) : (
                                    "3 free tasks per day"
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-3 items-start">

                    {/* Left: Upload/Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative">
                            {!file ? (
                                <div
                                    {...getRootProps()}
                                    className={`relative h-96 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${isDragActive
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10'
                                        : 'border-zinc-300 hover:border-indigo-500 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                                        }`}
                                >
                                    <input {...getInputProps()} />
                                    <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                                        <UploadCloud className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
                                    </div>
                                    <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
                                        Click or Drag PDF
                                    </span>
                                </div>
                            ) : (
                                <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden p-8 min-h-[500px]">
                                    {/* Real Preview */}
                                    {pdfPreview ? (
                                        <div className="relative shadow-2xl">
                                            <img src={pdfPreview} alt="PDF Preview" className="max-w-full max-h-[600px] rounded-sm" />

                                            {/* Overlay */}
                                            <div
                                                className="absolute flex items-center justify-center pointer-events-none"
                                                style={{
                                                    left: position.includes('left') ? '5%' : position.includes('right') ? 'auto' : '50%',
                                                    right: position.includes('right') ? '5%' : 'auto',
                                                    top: position.includes('top') ? '5%' : 'auto',
                                                    bottom: position.includes('bottom') ? '5%' : 'auto',
                                                    transform: position.includes('center') ? 'translateX(-50%)' : 'none',
                                                    color: color,
                                                    fontFamily: font === 'HELVETICA' ? 'sans-serif' : font === 'TIMES_ROMAN' ? 'serif' : 'monospace',
                                                    fontSize: `${Math.max(12, fontSize * 0.8)}px`, // Scale slightly for visibility
                                                    fontWeight: 'bold',
                                                    textShadow: '0 0 2px white' // Better visibility on dark docs
                                                }}
                                            >
                                                {textTemplate
                                                    .replace('{n}', startNumber)
                                                    .replace('{total}', () => {
                                                        // Calculate range count
                                                        if (!pdfPageCount) return '...';
                                                        const start = (startPage && startPage > 0) ? startPage - 1 : 0;
                                                        const end = (endPage && endPage > 0 && endPage <= pdfPageCount) ? endPage - 1 : pdfPageCount - 1;
                                                        return Math.max(0, end - start + 1);
                                                    })
                                                    .replace('{pdfTotal}', pdfPageCount || '...')
                                                }
                                            </div>
                                        </div>
                                    ) : (
                                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                    )}

                                    <button
                                        onClick={() => { setFile(null); setDownloadUrl(null); setPdfPreview(null); }}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-red-50 text-zinc-500 hover:text-red-600 transition-colors z-10"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-6">

                            {/* Position Grid */}
                            <div>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 block flex items-center gap-2">
                                    <LayoutTemplate className="h-4 w-4" /> Position
                                </label>
                                <div className="grid grid-cols-3 gap-2 w-max mx-auto">
                                    <GridButton pos="top-left" label="Top Left" />
                                    <GridButton pos="top-center" label="Top Center" />
                                    <GridButton pos="top-right" label="Top Right" />
                                    <div className="h-12 w-12" /> {/* Spacer for middle-left */}
                                    <div className="h-12 w-12 flex items-center justify-center">
                                        <div className="h-16 w-12 border border-zinc-200 rounded-sm bg-zinc-50" />
                                    </div>
                                    <div className="h-12 w-12" /> {/* Spacer for middle-right */}
                                    <GridButton pos="bottom-left" label="Bottom Left" />
                                    <GridButton pos="bottom-center" label="Bottom Center" />
                                    <GridButton pos="bottom-right" label="Bottom Right" />
                                </div>
                            </div>

                            <hr className="border-zinc-100 dark:border-zinc-800" />

                            {/* Text & Style */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Text Format</label>
                                    <input
                                        type="text"
                                        value={textTemplate}
                                        onChange={(e) => setTextTemplate(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm"
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">Use <code>{'{n}'}</code> for number, <code>{'{total}'}</code> for count.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Font</label>
                                        <select
                                            value={font}
                                            onChange={(e) => setFont(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm"
                                        >
                                            <option value="HELVETICA">Helvetica</option>
                                            <option value="TIMES_ROMAN">Times New Roman</option>
                                            <option value="COURIER">Courier</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Size</label>
                                        <input
                                            type="number"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block flex items-center gap-2">
                                        <Palette className="h-4 w-4" /> Color
                                    </label>
                                    <div className="flex gap-2">
                                        {['#000000', '#FF0000', '#0000FF', '#008000', '#808080'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setColor(c)}
                                                className={`h-8 w-8 rounded-full border-2 ${color === c ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-zinc-100 dark:border-zinc-800" />

                            {/* Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">From Page</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={startPage}
                                        onChange={(e) => setStartPage(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">To Page</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Last"
                                        value={endPage || ''}
                                        onChange={(e) => setEndPage(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            {downloadUrl ? (
                                <a
                                    href={downloadUrl}
                                    download={downloadFilename}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-500"
                                >
                                    <Download className="h-5 w-5" /> Download
                                </a>
                            ) : (
                                <button
                                    onClick={handleProcess}
                                    disabled={!file || loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-pink-500/25 transition-all hover:bg-pink-500 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Hash className="h-5 w-5" />}
                                    Add Page Numbers
                                </button>
                            )}

                            {error && (
                                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
