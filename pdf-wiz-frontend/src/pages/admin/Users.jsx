import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Search, MoreVertical, Shield, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const MOCK_USERS = [
  { id: 1, name: "Sarah Connor", email: "sarah@skynet.com", role: "ADMIN", plan: "LIFETIME", status: "ACTIVE", joined: "Jan 12, 2024" },
  { id: 2, name: "John Doe", email: "john.doe@gmail.com", role: "USER", plan: "PRO", status: "ACTIVE", joined: "Feb 05, 2025" },
  { id: 3, name: "Spam Bot", email: "cheap-meds@bot.net", role: "USER", plan: "FREE", status: "BANNED", joined: "Nov 20, 2025" },
  { id: 4, name: "Alice Wonderland", email: "alice@agency.com", role: "USER", plan: "FREE", status: "PENDING", joined: "Oct 10, 2025" },
  { id: 5, name: "Enterprise Corp", email: "admin@corp.com", role: "USER", plan: "ENTERPRISE", status: "ACTIVE", joined: "Sep 15, 2025" },
];

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">User Management</h2>
          <p className="text-zinc-400 text-sm">Manage access, roles, and subscription status.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="h-10 w-64 rounded-md border border-zinc-700 bg-zinc-900 pl-9 pr-4 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="h-10 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Plan</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-200">{user.name}</span>
                    <span className="text-xs text-zinc-500">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-zinc-300">{user.plan}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                    user.status === 'ACTIVE' ? 'text-emerald-400' : 
                    user.status === 'BANNED' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {user.status === 'ACTIVE' ? <CheckCircle2 className="h-3 w-3" /> : 
                     user.status === 'BANNED' ? <ShieldAlert className="h-3 w-3" /> : 
                     <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">{user.joined}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}