import React from 'react';
import AdminLayout from './AdminLayout';
import { Activity, Cpu, HardDrive, Trash2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock live data for the chart
const MEMORY_DATA = [
  { time: '10:00', usage: 120 }, { time: '10:05', usage: 140 },
  { time: '10:10', usage: 180 }, { time: '10:15', usage: 160 },
  { time: '10:20', usage: 250 }, { time: '10:25', usage: 310 }, // Spike!
  { time: '10:30', usage: 280 }, { time: '10:35', usage: 240 },
];

import { useTheme } from 'next-themes';

export default function Health() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartGridColor = isDark ? "#27272a" : "#e4e4e7";
  const chartAxisColor = isDark ? "#71717a" : "#a1a1aa";
  const tooltipBg = isDark ? "#18181b" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
  const tooltipText = isDark ? "#fff" : "#000";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">System Health</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Real-time server metrics and resource management.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-pulse">
            <Activity className="h-3 w-3" /> System Operational
          </div>
          <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* JVM HEAP CARD */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">JVM Heap Memory</h3>
            <Cpu className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">312 MB</div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mb-2">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-zinc-500">Render Limit: 512 MB</p>
        </div>

        {/* DISK USAGE CARD */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Temp Storage (/tmp)</h3>
            <HardDrive className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">1.2 GB</div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mb-2">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '42%' }}></div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-zinc-500">Auto-clears every 1h</p>
            <button className="text-xs flex items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
              <Trash2 className="h-3 w-3" /> Purge Now
            </button>
          </div>
        </div>

        {/* ACTIVE THREADS */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Threads</h3>
            <Activity className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">18</div>
          <p className="text-xs text-zinc-500">SpringBoot Worker Threads</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Memory Usage (Last 30 Mins)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MEMORY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
              <XAxis dataKey="time" stroke={chartAxisColor} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={chartAxisColor} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ stroke: isDark ? '#27272a' : '#e4e4e7' }}
                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }}
              />
              <Line type="monotone" dataKey="usage" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}