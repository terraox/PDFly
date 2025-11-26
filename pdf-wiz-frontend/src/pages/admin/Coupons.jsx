import React from 'react';
import AdminLayout from './AdminLayout';
import { Ticket, Plus, Trash2, Ban, CheckCircle2 } from 'lucide-react';

const MOCK_COUPONS = [
  { id: 1, code: "STUDENT50", discount: "50%", uses: "45/100", status: "ACTIVE", expiry: "Dec 31, 2025" },
  { id: 2, code: "WELCOME10", discount: "10%", uses: "120/500", status: "ACTIVE", expiry: "Jun 30, 2025" },
  { id: 3, code: "BLACKFRIDAY", discount: "70%", uses: "1000/1000", status: "EXPIRED", expiry: "Nov 29, 2024" },
  { id: 4, code: "LAUNCH25", discount: "25%", uses: "0/50", status: "PAUSED", expiry: "Jan 15, 2026" },
];

export default function Coupons() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Coupon Manager</h2>
          <p className="text-zinc-400 text-sm">Create and track marketing campaigns.</p>
        </div>
        <button className="flex items-center gap-2 h-10 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" /> Create New Coupon
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-zinc-400 text-sm font-medium">Active Campaigns</div>
          <div className="text-2xl font-bold text-white mt-2">3 Running</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-zinc-400 text-sm font-medium">Total Redemptions</div>
          <div className="text-2xl font-bold text-white mt-2">1,165</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-zinc-400 text-sm font-medium">Discount Value Given</div>
          <div className="text-2xl font-bold text-white mt-2">₹12,450</div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Code Name</th>
              <th className="px-6 py-4 font-medium">Discount</th>
              <th className="px-6 py-4 font-medium">Usage</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Expires</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {MOCK_COUPONS.map((coupon) => (
              <tr key={coupon.id} className="group hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <span className="font-mono font-bold text-zinc-200 tracking-wide">{coupon.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-300 font-medium">{coupon.discount}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">{coupon.uses}</span>
                    <div className="h-1.5 w-16 rounded-full bg-zinc-800">
                      <div 
                        className="h-full rounded-full bg-indigo-500" 
                        style={{ width: `${(parseInt(coupon.uses.split('/')[0]) / parseInt(coupon.uses.split('/')[1])) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                    coupon.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 
                    coupon.status === 'EXPIRED' ? 'text-zinc-500 bg-zinc-500/10 border border-zinc-700' : 
                    'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                  }`}>
                    {coupon.status === 'ACTIVE' && <CheckCircle2 className="h-3 w-3" />}
                    {coupon.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">{coupon.expiry}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-md transition-colors" title="Pause">
                      <Ban className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}