import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Mail, ArrowRight, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_URL = "http://localhost:8080/api/auth/register";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send only email and a placeholder password (Backend ignores this, but request body needs it)
      const response = await axios.post(API_URL, {
        email: email,
        password: "generated_password" // Required by LoginRequest DTO, but ignored by backend logic
      });

      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("This email is already registered. Please login.");
      } else {
        setError("Registration failed. Please check server logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={success ? "Check your inbox" : "Request Access"}
      subtitle={success ? "Your secure access key has been sent." : "Enter your professional email to get started."}
    >
      {success ? (
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            We have generated a secure password and emailed it to **{email}**.
          </p>
          <Link to="/login" className="block w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] dark:bg-white dark:text-black">
            Proceed to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <Loader2 className="h-4 w-4 animate-spin" /> Generating Keys...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Get Secure Access Key <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </button>

          <p className="text-center text-xs text-zinc-500 mt-4">
            Already have an account? <Link to="/login" className="relative z-50 font-medium text-zinc-900 underline hover:text-red-600 dark:text-white cursor-pointer">Sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}