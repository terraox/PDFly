import React from 'react';
import AdminLayout from './AdminLayout';
import { Users, IndianRupee, HardDrive, Cpu, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data for the chart
const trafficData = [
  { name: 'Mon', files: 120 }, { name: 'Tue', files: 250 },
  { name: 'Wed', files: 180 }, { name: 'Thu', files: 310 },
  { name: 'Fri', files: 290 }, { name: 'Sat', files: 100 },
  { name: 'Sun', files: 140 },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* 1. Metric Cards Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Revenue Card (Updated to INR) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Total Revenue</h3>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">₹45,231.89</div>
          <p className="flex items-center text-xs text-emerald-500 mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" /> +20.1% from last month
          </p>
        </div>

        {/* Users Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Active Users</h3>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">+2350</div>
          <p className="text-xs text-zinc-500 mt-1">180 new signups this week</p>
        </div>

        {/* JVM Stats (Java) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">JVM Heap Memory</h3>
            <Cpu className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">312 MB <span className="text-sm text-zinc-500 font-normal">/ 512 MB</span></div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-amber-500" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Temp Storage</h3>
            <HardDrive className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">42% Full</div>
          <p className="text-xs text-zinc-500 mt-1">/tmp directory size: 1.2 GB</p>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Chart Section */}
        <div className="col-span-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-6 text-lg font-semibold text-zinc-100">Files Processed (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#27272a'}}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="files" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Logs Section */}
        <div className="col-span-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-6 text-lg font-semibold text-zinc-100">Recent Admin Activity</h3>
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
                  <p className="text-sm font-medium text-zinc-200">{log.action}</p>
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