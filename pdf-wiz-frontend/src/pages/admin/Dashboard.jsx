import React from 'react';
import AdminLayout from './AdminLayout';
import { Users, IndianRupee, HardDrive, Cpu, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// Mock Data for the chart
const trafficData = [
  { name: 'Mon', files: 120 }, { name: 'Tue', files: 250 },
  { name: 'Wed', files: 180 }, { name: 'Thu', files: 310 },
  { name: 'Fri', files: 290 }, { name: 'Sat', files: 100 },
  { name: 'Sun', files: 140 },
];

import { useAuth } from '../../context/AuthContext';

import { useTheme } from 'next-themes';

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({ activeUsers: 0, totalRevenue: 0, revenueGrowth: 0 });
  const { token } = useAuth();
  const { theme } = useTheme();

  React.useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const isDark = theme === 'dark';
  const chartGridColor = isDark ? "#27272a" : "#e4e4e7";
  const chartAxisColor = isDark ? "#71717a" : "#a1a1aa";
  const tooltipBg = isDark ? "#18181b" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
  const tooltipText = isDark ? "#fff" : "#000";

  return (
    <AdminLayout>
      {/* 1. Metric Cards Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {/* Revenue Card (Updated to INR) */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Revenue</h3>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">₹{stats.totalRevenue || 0}</div>
          <p className={`flex items-center text-xs mt-1 ${stats.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <ArrowUpRight className={`h-3 w-3 mr-1 ${stats.revenueGrowth < 0 ? 'rotate-180' : ''}`} />
            {stats.revenueGrowth ? `${stats.revenueGrowth.toFixed(1)}%` : '0%'} from last month
          </p>
        </div>

        {/* Users Card */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Users</h3>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{stats.activeUsers}</div>
          <p className="text-xs text-zinc-500 mt-1">Total registered users</p>
        </div>

        {/* JVM Stats (Java) */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">JVM Heap Memory</h3>
            <Cpu className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">312 MB <span className="text-sm text-zinc-500 font-normal">/ 512 MB</span></div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full rounded-full bg-amber-500" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Temp Storage</h3>
            <HardDrive className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">42% Full</div>
          <p className="text-xs text-zinc-500 mt-1">/tmp directory size: 1.2 GB</p>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7">

        {/* Chart Section */}
        <div className="col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Files Processed (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="name" stroke={chartAxisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={chartAxisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: isDark ? '#27272a' : '#f4f4f5' }}
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', color: tooltipText }}
                />
                <Bar dataKey="files" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Logs Section */}
        <div className="col-span-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Admin Activity</h3>
          <div className="space-y-6">
            {[
              { action: "Purged Temp Files", user: "You", time: "2 min ago", color: "bg-amber-500" },
              { action: "Banned User: spambot@gmail.com", user: "You", time: "15 min ago", color: "bg-red-500" },
              { action: "Created Coupon: SAVE20", user: "System", time: "1 hour ago", color: "bg-emerald-500" },
              { action: "Updated Free Tier Limits", user: "You", time: "3 hours ago", color: "bg-blue-500" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={`h-2 w-2 rounded-full ${log.color}`} />
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{log.action}</p>
                  <p className="text-xs text-zinc-500">{log.user} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}