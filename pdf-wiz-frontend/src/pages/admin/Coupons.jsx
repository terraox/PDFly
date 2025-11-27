import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Ticket, Plus, Trash2, Ban, CheckCircle2, Loader2, AlertTriangle, X } from 'lucide-react';
import axios from 'axios';

// CRITICAL: Function to retrieve the Authorization Headers
const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('pdfly_auth_token')}`
    }
});

const API_URL = "http://localhost:8080/api/admin/coupons";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
      code: '',
      discountPercent: 0,
      planType: 'PRO',
      maxUses: 100,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] // 1 year default
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
        // PASS HEADERS HERE
        const response = await axios.get(API_URL, getAuthHeaders());
        setCoupons(response.data);
        setError(null);
    } catch (err) {
        // Specifically check for 403 Forbidden which means token is missing or invalid
        if (err.response?.status === 403 || err.response?.status === 401) {
            setError("Authentication failed. Please log in as Admin.");
        } else {
            setError("Failed to fetch coupons. Check server connection.");
        }
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);


  const handleCreateCoupon = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      if (!newCoupon.code || newCoupon.maxUses <= 0 || !newCoupon.planType) {
          setError("Please fill all required fields correctly.");
          setLoading(false);
          return;
      }

      try {
          const now = new Date();
          const expiryDateTime = newCoupon.expiryDate + 'T' + now.toTimeString().split(' ')[0];
          
          await axios.post(API_URL, {
              ...newCoupon,
              expiryDate: expiryDateTime 
          // PASS HEADERS HERE
          }, getAuthHeaders()); 

          await fetchCoupons(); // Refresh the list
          setIsModalOpen(false); // Close modal on success
      } catch (err) {
          if (err.response?.status === 409) {
             setError("Coupon code already exists.");
          } else {
             setError("Creation failed. Are you logged in as Admin?");
          }
      } finally {
          setLoading(false);
      }
  };

  const getStatus = (coupon) => {
    const isExpired = new Date(coupon.expiryDate) < new Date();
    const limitReached = coupon.currentUses >= coupon.maxUses;

    if (limitReached) return { text: "LIMIT REACHED", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
    if (isExpired) return { text: "EXPIRED", color: "text-zinc-500 bg-zinc-500/10 border-zinc-700" };
    return { text: "ACTIVE", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
  };

  if (loading && coupons.length === 0) {
      return <AdminLayout><div className="text-center text-zinc-400 py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" /> Loading Coupons...</div></AdminLayout>;
  }

  // --- REST OF THE JSX REMAINS THE SAME ---
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        {/* ... (Header remains the same) ... */}
      </div>
      {/* ... (Table and Modal JSX remains the same) ... */}
      {/* ... (Form onSubmit is handled by handleCreateCoupon) ... */}
      
      {/* ... (The modal code structure remains the same) ... */}

      {/* REMAINDER OF THE CODE IS OMITTED FOR BREVITY, COPY-PASTE THE ENTIRE FILE */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Coupon Manager</h2>
          <p className="text-zinc-400 text-sm">Create and track marketing campaigns.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 h-10 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create New Coupon
        </button>
      </div>

      {error && <div className="text-red-500 text-sm p-3 rounded-lg border border-red-500/20 bg-red-500/10 mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {error}</div>}


      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Code Name</th>
              <th className="px-6 py-4 font-medium">Discount</th>
              <th className="px-6 py-4 font-medium">Plan Type</th>
              <th className="px-6 py-4 font-medium">Usage</th>
              <th className="px-6 py-4 font-medium">Expires</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {coupons.map((coupon) => {
              const status = getStatus(coupon);
              return (
              <tr key={coupon.id} className="group hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-zinc-200 tracking-wide">{coupon.code}</span>
                </td>
                <td className="px-6 py-4 text-zinc-300 font-medium">{coupon.discountPercent}%</td>
                <td className="px-6 py-4 text-zinc-300 font-medium">{coupon.planType}</td>
                <td className="px-6 py-4 text-zinc-400">{coupon.currentUses} / {coupon.maxUses}</td>
                <td className="px-6 py-4 text-zinc-500">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      
      {/* --- CREATE COUPON MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Coupon</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white p-1"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
                {error && <div className="text-red-500 text-sm mb-3"><AlertTriangle className="h-4 w-4 inline mr-2" />{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Code (e.g., TESTER)</label>
                        <input type="text" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} required className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Discount (%)</label>
                        <input type="number" value={newCoupon.discountPercent} onChange={(e) => setNewCoupon({...newCoupon, discountPercent: parseInt(e.target.value)})} min="0" max="100" required className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Plan Granted</label>
                        <select value={newCoupon.planType} onChange={(e) => setNewCoupon({...newCoupon, planType: e.target.value})} required className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                            <option value="PRO">PRO</option>
                            <option value="FREE">FREE</option>
                            <option value="ADMIN">ADMIN (For Testing)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Max Uses</label>
                        <input type="number" value={newCoupon.maxUses} onChange={(e) => setNewCoupon({...newCoupon, maxUses: parseInt(e.target.value)})} min="1" required className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Expiry Date</label>
                    <input type="date" value={newCoupon.expiryDate} onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})} required className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                </div>
                
                <div className="flex justify-end pt-4 gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">Cancel</button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Create Coupon
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}