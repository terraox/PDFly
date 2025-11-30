import React from 'react';
import Navbar from '../components/Navbar';
import { useHistory } from '../context/HistoryContext';
import { FileText, Clock, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function History() {
    const { history, removeHistoryItem, clearHistory } = useHistory();

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">
            <Navbar />

            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            <Clock className="h-8 w-8 text-indigo-500" />
                            History
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            View your recent PDF processing activity.
                        </p>
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear History
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900 mb-4">
                            <Clock className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No history yet</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                            Your processed files will appear here. Start by using one of our PDF tools.
                        </p>
                        <Link
                            to="/"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go to Tools
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">File Name</th>
                                        <th className="px-6 py-4 font-medium">Tool</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    <AnimatePresence mode='popLayout'>
                                        {history.map((item) => (
                                            <motion.tr
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                                            >
                                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <span className="truncate max-w-[200px] sm:max-w-[300px]" title={item.fileName}>
                                                            {item.fileName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                    {item.toolName}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'success'
                                                            ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20'
                                                            : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20'
                                                        }`}>
                                                        {item.status === 'success' ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                        {item.status === 'success' ? 'Completed' : 'Failed'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-500 whitespace-nowrap">
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                    <span className="text-zinc-400 dark:text-zinc-600 mx-1">•</span>
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => removeHistoryItem(item.id)}
                                                        className="p-2 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                        title="Remove from history"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
