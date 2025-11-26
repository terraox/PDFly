import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Scissors, Minimize2, FileText, ArrowLeftRight } from 'lucide-react';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Checkout from './pages/Checkout';
import ToolPage from './pages/ToolPage'; // <--- New Tool Component

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Plans from './pages/admin/Plans';
import Coupons from './pages/admin/Coupons';
import Finance from './pages/admin/Finance';
import Health from './pages/admin/Health';
import Security from './pages/admin/Security';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* Active Tools with Usage Limits */}
          <Route path="/merge" element={<ToolPage title="Merge PDF" icon={ArrowLeftRight} />} />
          <Route path="/split" element={<ToolPage title="Split PDF" icon={Scissors} />} />
          <Route path="/compress" element={<ToolPage title="Compress PDF" icon={Minimize2} />} />
          <Route path="/pdf-to-word" element={<ToolPage title="PDF to Word" icon={FileText} />} />
          
          {/* Placeholder Routes for tools we haven't built specific logic for yet */}
          <Route path="/convert-pdf" element={<ToolPage title="Convert PDF" icon={FileText} />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/plans" element={<Plans />} />
          <Route path="/admin/coupons" element={<Coupons />} />
          <Route path="/admin/finance" element={<Finance />} />
          <Route path="/admin/health" element={<Health />} />
          <Route path="/admin/security" element={<Security />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;