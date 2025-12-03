import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Save, AlertCircle, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Plans() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [freeLimit, setFreeLimit] = useState(3);
  const { user } = useAuth();

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

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/admin/config', {
        configKey: 'FREE_TIER_LIMIT',
        configValue: freeLimit.toString()
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save config', error);
      alert('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Plans & Configuration</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Configure limits for Free and Pro tiers dynamically.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 h-10 rounded-md bg-indigo-600 px-6 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? 'Saving...' : saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* FREE TIER CONFIG */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Free Tier Limits</h3>
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">Default</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Max File Size (MB)</label>
              <input type="number" defaultValue={10} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none shadow-sm" />
              <p className="text-xs text-zinc-500">Files larger than this will be rejected.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Daily Operations Limit</label>
              <input
                type="number"
                value={freeLimit}
                onChange={(e) => setFreeLimit(parseInt(e.target.value))}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Allow Compression</p>
                <p className="text-xs text-zinc-500">CPU intensive task</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-zinc-200 dark:bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
              </label>
            </div>
          </div>
        </div>

        {/* PRO TIER CONFIG */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-white dark:bg-zinc-900 p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle className="h-24 w-24 text-amber-500" />
          </div>
          <div className="mb-6 flex items-center justify-between relative z-10">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Pro Tier Limits</h3>
            <span className="rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-500">Premium</span>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Max File Size (MB)</label>
              <input type="number" defaultValue={100} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Daily Operations Limit</label>
              <input type="text" disabled value="Unlimited" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/50 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed shadow-sm" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">OCR Support</p>
                <p className="text-xs text-zinc-500">Optical Character Recognition</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-zinc-200 dark:bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}