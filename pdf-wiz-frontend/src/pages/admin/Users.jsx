import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Search, MoreVertical, Shield, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';



import axios from 'axios';

import { useAuth } from '../../context/AuthContext';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const { token } = useAuth();

  React.useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleBanUser = async (userId) => {
    if (window.confirm('Are you sure you want to ban this user? This action cannot be undone.')) {
      try {
        await axios.post(`http://localhost:8080/api/admin/users/${userId}/ban`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers(); // Refresh list
      } catch (error) {
        console.error('Failed to ban user', error);
        alert('Failed to ban user');
      }
    }
  };

  const filteredUsers = users.filter(user =>
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
                    <span className="font-medium text-zinc-200">{user.email}</span>
                    <span className="text-xs text-zinc-500">{user.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                    {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-zinc-300">{user.plan}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${user.active ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {user.active ? <CheckCircle2 className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                    {user.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => handleBanUser(user.id)}
                    className="p-2 text-red-500 hover:text-white hover:bg-red-600 rounded-md transition-colors"
                    title="Ban User"
                  >
                    <ShieldAlert className="h-4 w-4" />
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