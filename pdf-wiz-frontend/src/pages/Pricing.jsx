import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Check, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NumberTicker from '../components/ui/NumberTicker';
import axios from 'axios';

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [freeLimit, setFreeLimit] = useState(3);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tools/config');
      const config = response.data.find(c => c.configKey === 'FREE_TIER_LIMIT');
      if (config) {
        setFreeLimit(parseInt(config.configValue));
      }
    } catch (error) {
      console.error('Failed to fetch config', error);
    }
  };

  const isPro = user?.plan === 'PRO';
  const isFree = user?.plan === 'FREE' || !isAuthenticated;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Simple, transparent pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Choose the plan that's right for you. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="mt-8 flex justify-center items-center gap-4">
          <span className={`text-sm font-semibold ${!isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isAnnual ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
          >
            <span
              className={`${isAnnual ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
          <span className={`text-sm font-semibold ${isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
            Yearly <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">Save 17%</span>
          </span>
        </div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8 sm:mt-10 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">

          {/* FREE TIER */}
          <div className={`rounded-3xl p-8 ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-xl ${isFree && isAuthenticated ? 'ring-2 ring-indigo-500' : ''}`}>
            <h3 className="text-lg font-semibold leading-8 text-zinc-900 dark:text-white">Free</h3>
            <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Perfect for quick, one-off tasks.</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">₹0</span>
              <span className="text-sm font-semibold leading-6 text-zinc-600 dark:text-zinc-400">/{isAnnual ? 'year' : 'month'}</span>
            </p>
            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-indigo-600" /> {freeLimit} Tasks per day</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-indigo-600" /> 10MB Max File Size</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-indigo-600" /> Standard Processing Speed</li>
              <li className="flex gap-x-3 text-zinc-400 dark:text-zinc-600"><X className="h-6 w-5 flex-none" /> No OCR Support</li>
              <li className="flex gap-x-3 text-zinc-400 dark:text-zinc-600"><X className="h-6 w-5 flex-none" /> Ads Supported</li>
            </ul>
            {isAuthenticated && isFree ? (
              <button disabled className="mt-8 block w-full rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 text-zinc-500 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed">
                Current Plan
              </button>
            ) : (
              <Link to="/register" className="mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 dark:ring-indigo-900 dark:hover:ring-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Get Started Free
              </Link>
            )}
          </div>

          {/* PRO TIER */}
          <div className={`relative rounded-3xl p-8 ring-1 ring-indigo-600 bg-zinc-900 dark:bg-black shadow-2xl ${isPro ? 'ring-2 ring-green-500' : ''}`}>
            {isPro && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Active Plan
              </div>
            )}
            {!isPro && (
              <div className="absolute -top-4 right-8 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Most Popular
              </div>
            )}
            <h3 className="flex items-center gap-2 text-lg font-semibold leading-8 text-white">
              Pro <Sparkles className="h-4 w-4 text-indigo-400" />
            </h3>
            <p className="mt-4 text-sm leading-6 text-zinc-300">For power users who need professional tools.</p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-white">
                ₹<NumberTicker value={isAnnual ? 4999 : 499} className="text-white" />
              </span>
              <span className="text-sm font-semibold leading-6 text-zinc-300">/{isAnnual ? 'year' : 'month'}</span>
            </p>
            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-zinc-300">
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-indigo-400" /> Unlimited Tasks</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-indigo-400" /> 100MB Max File Size</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-indigo-400" /> Priority Processing (3x Faster)</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-indigo-400" /> AI-Powered OCR PDF</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-indigo-400" /> No Ads</li>
            </ul>
            {isPro ? (
              <button disabled className="mt-8 block w-full rounded-md bg-green-600/20 py-2 px-3 text-center text-sm font-semibold leading-6 text-green-400 cursor-not-allowed border border-green-500/30">
                Current Plan
              </button>
            ) : (
              <Link to="/checkout" className="mt-8 block rounded-md bg-indigo-600 py-2 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Upgrade to Pro
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}