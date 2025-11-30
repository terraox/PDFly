// Location: src/pages/Profile.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
    Mail, Shield, Zap, Calendar, LogOut, Gem, Hourglass, CreditCard, Lock, ArrowRight, Copy, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useState } from 'react';

export default function Profile() {
    const { user, token, isAuthenticated, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
    const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordStatus({ loading: true, error: '', success: '' });
        try {
            await axios.post('http://localhost:8080/api/auth/change-password', passwordForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPasswordStatus({ loading: false, error: '', success: 'Password changed successfully!' });
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordForm({ oldPassword: '', newPassword: '' });
                setPasswordStatus({ loading: false, error: '', success: '' });
            }, 2000);
        } catch (err) {
            setPasswordStatus({ loading: false, error: err.response?.data || 'Failed to change password', success: '' });
        }
    };


    if (loading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading User Data...</div>;
    }

    if (!isAuthenticated) {
        return navigate('/login');
    }

    // --- LOGIC FOR PLAN DISPLAY ---
    // Priority: ADMIN > PRO > FREE
    let planType = "FREE";
    if (user.role === 'ADMIN') planType = "ADMIN";
    else if (user.plan === 'PRO') planType = "PRO";

    const planConfig = {
        ADMIN: {
            label: "Administrator",
            badgeColor: "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]",
            icon: Shield,
            borderColor: "border-red-500/50"
        },
        PRO: {
            label: "Pro Member",
            badgeColor: "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]",
            icon: Gem,
            borderColor: "border-indigo-500/50"
        },
        FREE: {
            label: "Free Plan",
            badgeColor: "bg-zinc-800 text-zinc-400 border border-zinc-700",
            icon: Zap,
            borderColor: "border-zinc-800"
        }
    };

    const currentConfig = planConfig[planType];

    // Helper function to format the date
    const getExpiryDisplay = (dateString) => {
        if (planType === 'FREE') return { text: "Unlimited", color: "text-zinc-500" };
        if (!dateString) return { text: "Lifetime", color: "text-emerald-400" };

        const expiryDate = new Date(dateString);
        const now = new Date();

        if (expiryDate < now) {
            return { text: "Expired", color: "text-red-500" };
        }

        return {
            text: expiryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
            color: "text-emerald-400"
        };
    };

    const expiryDisplay = getExpiryDisplay(user.planExpiry);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const copyToken = () => {
        navigator.clipboard.writeText(token);
        alert("Token copied to clipboard!");
    };

    // Display details
    const displayEmail = user.email || 'Unknown User';
    const displayInitials = displayEmail.substring(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 font-sans">
            <Navbar />

            <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 pt-24">

                <div className="grid md:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN: USER IDENTITY CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`md:col-span-1 relative overflow-hidden rounded-3xl border ${currentConfig.borderColor} bg-white dark:bg-zinc-900/80 p-8 shadow-2xl`}
                    >
                        {/* Background Glow */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${planType === 'ADMIN' ? 'red' : planType === 'PRO' ? 'indigo' : 'zinc'}-500 to-transparent opacity-50`} />

                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold text-white ${planType === 'ADMIN' ? 'bg-red-600' : planType === 'PRO' ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                                    {displayInitials}
                                </div>
                                {/* Badge Overlay */}
                                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap ${currentConfig.badgeColor}`}>
                                    {currentConfig.label}
                                </div>
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white truncate w-full" title={displayEmail}>
                                {displayEmail}
                            </h3>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800">
                                <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400"><Hourglass className="h-4 w-4" /> Expiry</span>
                                <span className={`font-medium ${expiryDisplay.color}`}>
                                    {expiryDisplay.text}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800">
                                <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400"><Calendar className="h-4 w-4" /> Daily Usage</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-200">
                                    {planType === 'FREE' ? '1 / 1' : 'Unlimited'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full mt-8 flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 py-3 text-sm font-semibold text-red-600 dark:text-red-400 transition-all hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </motion.div>

                    {/* RIGHT COLUMN: ACTIONS & SETTINGS */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="md:col-span-2 space-y-6"
                    >

                        {/* Quick Actions Grid */}
                        <div className="grid gap-4">
                            <div className="group cursor-pointer flex items-center justify-between p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-zinc-900 dark:text-white">Manage Subscription</h4>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Update payment method or cancel plan</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors" />
                            </div>

                            <div onClick={() => setIsPasswordModalOpen(true)} className="group cursor-pointer flex items-center justify-between p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Lock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-zinc-900 dark:text-white">Security Settings</h4>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Change password or enable 2FA</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </div>

                        {/* Change Password Modal */}
                        <AnimatePresence>
                            {isPasswordModalOpen && (
                                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                                    >
                                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Change Password</h3>
                                            <button onClick={() => setIsPasswordModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                                            {passwordStatus.error && (
                                                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                    {passwordStatus.error}
                                                </div>
                                            )}
                                            {passwordStatus.success && (
                                                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    {passwordStatus.success}
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Current Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordForm.oldPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">New Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div className="pt-2 flex justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPasswordModalOpen(false)}
                                                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={passwordStatus.loading}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    {passwordStatus.loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                                    Update Password
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Token Section (Simplified) */}
                        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Session Token</h4>
                                <button onClick={copyToken} className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                                    <Copy className="h-3 w-3" /> Copy
                                </button>
                            </div>
                            <div className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 break-all bg-white dark:bg-black/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                {token || "No active token"}
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
}