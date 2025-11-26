import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Check, ShieldCheck, Loader2, Tag } from 'lucide-react';

export default function Checkout() {
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = () => {
    if (!coupon) return;
    if (coupon.toUpperCase() === "STUDENT50") {
      setApplied(true);
    } else {
      alert("Invalid Coupon");
    }
  };

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Payment Successful! (Simulation)");
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <Navbar />
      
      <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left: Order Summary */}
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Order Summary</h2>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">PDFly Pro</h3>
                  <p className="text-sm text-zinc-500">Monthly Subscription</p>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white">₹499.00</span>
              </div>
              
              {applied && (
                <div className="flex justify-between items-center text-emerald-600 text-sm">
                  <span>Coupon (STUDENT50)</span>
                  <span>- ₹249.50</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 text-lg font-bold text-zinc-900 dark:text-white">
                <span>Total</span>
                <span>{applied ? '₹249.50' : '₹499.00'}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Have a coupon?</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-9 py-2 text-sm outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>
                <button 
                  onClick={handleApplyCoupon}
                  disabled={applied}
                  className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {applied ? <Check className="h-4 w-4" /> : 'Apply'}
                </button>
              </div>
              {applied && <p className="text-xs text-emerald-500">Coupon applied successfully!</p>}
            </div>
          </div>

          {/* Right: Payment Form */}
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Payment Details</h2>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase">Cardholder Name</label>
                <input type="text" placeholder="John Doe" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase">Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500 uppercase">Expiry</label>
                  <input type="text" placeholder="MM/YY" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500 uppercase">CVC</label>
                  <input type="text" placeholder="123" className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:text-white" />
                </div>
              </div>

              <button 
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-6 flex items-center justify-center gap-2 rounded-md bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70 transition-all"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading ? 'Processing...' : `Pay ${applied ? '₹249.50' : '₹499.00'}`}
              </button>
              <p className="text-center text-xs text-zinc-500 mt-2">Secure encrypted payment via Stripe</p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}