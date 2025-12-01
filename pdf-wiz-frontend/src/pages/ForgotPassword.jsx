import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Key, Mail, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Request Key, 2: Reset Password
    const [email, setEmail] = useState('');
    const [resetKey, setResetKey] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRequestKey = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            setSuccess('If an account exists, a reset key has been sent to your email.');
            setTimeout(() => {
                setStep(2);
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError('Failed to send reset key. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', {
                email,
                resetKey,
                newPassword
            });
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data || 'Failed to reset password. Invalid or expired key.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 font-sans selection:bg-indigo-500/30">
            <Navbar />

            <div className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-10">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/20 dark:border-white/5 p-8">
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                            >
                                <Key className="h-8 w-8" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {step === 1 ? 'Lost Access Key?' : 'Reset Password'}
                            </h2>
                            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                {step === 1
                                    ? 'Enter your email to receive a temporary reset key.'
                                    : 'Enter the key from your email and set a new password.'}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
                                >
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </motion.div>
                            )}

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3"
                                >
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {step === 1 ? (
                            <form onSubmit={handleRequestKey} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-zinc-900 dark:text-white placeholder-zinc-400"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send Reset Key
                                            <ArrowLeft className="h-4 w-4 rotate-180" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                        Reset Key
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                        <input
                                            type="text"
                                            required
                                            value={resetKey}
                                            onChange={(e) => setResetKey(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-zinc-900 dark:text-white placeholder-zinc-400 font-mono tracking-widest text-center uppercase"
                                            placeholder="000000"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-zinc-900 dark:text-white placeholder-zinc-400"
                                            placeholder="••••••••"
                                            minLength={8}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-zinc-900 dark:text-white placeholder-zinc-400"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1.5" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
