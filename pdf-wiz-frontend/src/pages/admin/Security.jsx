import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { ShieldAlert, Lock, Unlock, AlertTriangle, FileText } from 'lucide-react';

export default function Security() {
  const [maintenance, setMaintenance] = useState(false);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security & Logs</h2>
          <p className="text-zinc-400 text-sm">Audit trail and global access controls.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setMaintenance(!maintenance)}
             className={`flex items-center gap-2 h-10 rounded-md px-4 text-sm font-medium transition-colors ${
               maintenance ? 'bg-red-500/10 text-red-400 border border-red-500/50' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
             }`}
           >
             {maintenance ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
             {maintenance ? 'Maintenance Mode ON' : 'Maintenance Mode OFF'}
           </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
               <ShieldAlert className="h-5 w-5 text-indigo-500" /> IP Blacklist
            </h3>
            <div className="flex gap-2 mb-4">
               <input type="text" placeholder="Enter IP Address (e.g. 192.168.1.1)" className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" />
               <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-md text-sm font-medium">Block</button>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-md bg-zinc-950 border border-zinc-800 text-sm">
                   <span className="text-zinc-300 font-mono">203.0.113.45</span>
                   <span className="text-xs text-zinc-500">Blocked 2 days ago</span>
                </div>
                 <div className="flex items-center justify-between p-3 rounded-md bg-zinc-950 border border-zinc-800 text-sm">
                   <span className="text-zinc-300 font-mono">198.51.100.2</span>
                   <span className="text-xs text-zinc-500">Blocked 5 hours ago</span>
                </div>
            </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
               <AlertTriangle className="h-5 w-5 text-amber-500" /> Feature Flags
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-white">Disable PDF Compression</p>
                        <p className="text-xs text-zinc-500">High CPU Load Protection</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-white">Disable Sign Ups</p>
                        <p className="text-xs text-zinc-500">Stop new registrations</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                    </label>
                </div>
            </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
           <FileText className="h-4 w-4 text-zinc-400" />
           <h3 className="text-sm font-semibold text-white">System Audit Log</h3>
        </div>
        <div className="divide-y divide-zinc-800 max-h-[300px] overflow-y-auto">
           {[
               { action: "Admin 'Sarah' purged temp files", time: "10:45 AM", ip: "192.168.1.5" },
               { action: "User 'John' failed login (3 attempts)", time: "10:30 AM", ip: "10.0.0.42" },
               { action: "System Auto-Backup completed", time: "09:00 AM", ip: "LOCALHOST" },
               { action: "Admin 'Sarah' updated Free Tier Limits", time: "Yesterday", ip: "192.168.1.5" },
           ].map((log, i) => (
               <div key={i} className="px-6 py-3 flex items-center justify-between text-sm hover:bg-zinc-800/50">
                   <span className="text-zinc-300">{log.action}</span>
                   <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                       <span>{log.ip}</span>
                       <span>{log.time}</span>
                   </div>
               </div>
           ))}
        </div>
      </div>
    </AdminLayout>
  );
}