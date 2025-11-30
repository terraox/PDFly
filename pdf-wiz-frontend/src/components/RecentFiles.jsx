import React from 'react';
import { useHistory } from '../context/HistoryContext';
import { FileText, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecentFiles() {
    const { history, removeHistoryItem, clearHistory } = useHistory();

    if (history.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 px-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-500" /> Recent Activity
                </h2>
                <button
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                    <Trash2 className="h-3 w-3" /> Clear History
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-3">File Name</th>
                                <th className="px-6 py-3">Tool</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            <AnimatePresence>
                                {history.slice(0, 5).map((item) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-zinc-400" />
                                            {item.fileName}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            {item.toolName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'success'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {item.status === 'success' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                {item.status === 'success' ? 'Completed' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-500">
                                            {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => removeHistoryItem(item.id)}
                                                className="text-zinc-400 hover:text-red-500 transition-colors"
                                                title="Remove from history"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
