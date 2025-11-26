import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API Call
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter the secure credentials sent to your email."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        
        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
            <input 
              type="email" 
              required 
              placeholder="name@company.com" 
              className="w-full rounded-lg border border-zinc-200 bg-white/50 pl-10 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:focus:border-zinc-700 dark:focus:ring-zinc-800"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Password</label>
            <Link to="/register" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Lost access key?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              className="w-full rounded-lg border border-zinc-200 bg-white/50 pl-10 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:focus:border-zinc-700 dark:focus:ring-zinc-800"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
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

        <p className="text-center text-xs text-zinc-500 mt-4">
          Don't have an account? <Link to="/register" className="font-medium text-zinc-900 underline hover:text-red-600 dark:text-white">Request Access</Link>
        </p>
      </form>
    </AuthLayout>
  );
}