import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, Ticket,
  Activity, Settings, ShieldAlert, LogOut, Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Settings, label: 'Plans & Config', href: '/admin/plans' },
  { icon: Ticket, label: 'Coupons', href: '/admin/coupons' },
  { icon: CreditCard, label: 'Transactions', href: '/admin/finance' },
  { icon: Activity, label: 'System Health', href: '/admin/health' },
  { icon: ShieldAlert, label: 'Security & Logs', href: '/admin/security' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role !== 'ADMIN') {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading Admin Panel...</div>;
  }

  return (
    <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl transition-colors duration-300">
        <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link to="/" className="flex items-center gap-2 group">
            <Send className="h-5 w-5 text-indigo-600 dark:text-indigo-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-lg font-bold tracking-tighter text-zinc-900 dark:text-white">
              PDF<span className="text-indigo-600 dark:text-indigo-500">ly</span>
              <span className="text-zinc-500 dark:text-zinc-600 text-[10px] ml-2 align-top tracking-widest font-medium">ADMIN</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-col gap-1 p-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <button
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 
                    ${isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/50'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-500' : 'text-zinc-500'}`} />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-64 w-full flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-8 transition-colors duration-300">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-200">
            {sidebarItems.find(i => i.href === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.email}</p>
              <p className="text-xs text-zinc-500">Super Admin</p>
            </div>
            <ThemeToggle />
            <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 space-y-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}