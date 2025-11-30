import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = "http://localhost:8080/api/auth/login";

export default function LoginModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(API_URL, { email, password });

            if (response.status === 200 && response.data.token) {
                const { token, email: userEmail, role, plan, planExpiry, dailyUsageCount } = response.data;
                login(token, userEmail, role, plan, planExpiry, dailyUsageCount);
                onClose(); // Close modal on success
            } else {
                setError("Invalid response from server.");
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Invalid email or access key.");
            } else {
                setError("Login failed. Check server connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Sign in to continue</h2>
                            <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <X className="h-5 w-5 text-zinc-500" />
                            </button>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-500 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <AlertTriangle className="h-4 w-4" /> {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Password</label>
                                    <Link to="/register" onClick={onClose} className="text-xs text-indigo-500 hover:text-indigo-600">Lost access key?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full overflow-hidden rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-70"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                )}
                            </button>

                            <p className="text-center text-xs text-zinc-500 mt-2">
                                Don't have an account? <Link to="/register" onClick={onClose} className="font-medium text-indigo-500 hover:text-indigo-600">Request Access</Link>
                            </p>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
