import React from 'react';
import AdminLayout from './AdminLayout';
import { Download, IndianRupee, ArrowUpRight, ArrowDownRight, CreditCard, MoreHorizontal } from 'lucide-react';

const TRANSACTIONS = [
  { id: "INV-001", user: "sarah@skynet.com", amount: "₹999.00", date: "Today, 10:42 AM", status: "SUCCESS" },
  { id: "INV-002", user: "john.doe@gmail.com", amount: "₹499.00", date: "Today, 09:15 AM", status: "SUCCESS" },
  { id: "INV-003", user: "alice@agency.com", amount: "₹1,999.00", date: "Yesterday, 4:30 PM", status: "FAILED" },
  { id: "INV-004", user: "bob@builder.com", amount: "₹999.00", date: "Yesterday, 2:15 PM", status: "REFUNDED" },
  { id: "INV-005", user: "admin@corp.com", amount: "₹4,999.00", date: "Nov 24, 2025", status: "SUCCESS" },
];

export default function Finance() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Transactions & Revenue</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Monitor incoming payments and handle refunds.</p>
        </div>
        <button className="flex items-center gap-2 h-10 rounded-md bg-white dark:bg-zinc-800 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Gross Revenue</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-2 flex items-center">
            <IndianRupee className="h-5 w-5 mr-1" /> 45,231
          </div>
          <span className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center mt-1"><ArrowUpRight className="h-3 w-3 mr-1" /> 12% vs last month</span>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Net Revenue</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-2 flex items-center">
            <IndianRupee className="h-5 w-5 mr-1" /> 38,450
          </div>
          <span className="text-xs text-zinc-500 mt-1">After fees & refunds</span>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Failed Payments</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">12</div>
          <span className="text-xs text-red-500 dark:text-red-400 flex items-center mt-1"><ArrowDownRight className="h-3 w-3 mr-1" /> Action required</span>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Avg Order Value</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-2 flex items-center">
            <IndianRupee className="h-5 w-5 mr-1" /> 850
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Invoice ID</th>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {TRANSACTIONS.map((tx) => (
              <tr key={tx.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-300">{tx.id}</td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{tx.user}</td>
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{tx.amount}</td>
                <td className="px-6 py-4 text-zinc-500">{tx.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${tx.status === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10' :
                      tx.status === 'FAILED' ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10' :
                        'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-400/10'
                    }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${tx.status === 'SUCCESS' ? 'bg-emerald-500 dark:bg-emerald-400' :
                        tx.status === 'FAILED' ? 'bg-red-500 dark:bg-red-400' : 'bg-zinc-500 dark:bg-zinc-400'
                      }`} />
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
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