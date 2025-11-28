import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ArrowLeftRight, Minimize2, FileText, Type, Presentation, FileSpreadsheet, Image as ImageIcon, PenTool, Stamp, RefreshCw, Unlock, Shield, Hash, Scissors } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Checkout from './pages/Checkout';
import ToolPage from './pages/ToolPage';
import Profile from './pages/Profile';
import MergeTool from './pages/MergeTool';
import SplitTool from './pages/SplitTool';
import ProtectTool from './pages/ProtectTool';
import WatermarkTool from './pages/WatermarkTool'; // Need to ensure this is imported if you created it
import RotateTool from './pages/RotateTool'; // <--- NEW IMPORT

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Plans from './pages/admin/Plans';
import Coupons from './pages/admin/Coupons';
import Finance from './pages/admin/Finance';
import Health from './pages/admin/Health';
import Security from './pages/admin/Security';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* --------------------------------- */}
        {/* PUBLIC ROUTES (Always Accessible) */}
        {/* --------------------------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* --------------------------------- */}
        {/* PROTECTED ROUTES (Requires Login) */}
        {/* --------------------------------- */}
        <Route element={<ProtectedRoute />}>
          {/* User Profile Route */}
          <Route path="/profile" element={<Profile />} />

          {/* Core Tool Implementations */}
          <Route path="/merge" element={<MergeTool />} />
          <Route path="/split" element={<SplitTool />} />
          <Route path="/protect" element={<ProtectTool />} />
          {/* Assuming you created WatermarkTool based on previous chat, otherwise remove this line */}
          {/* <Route path="/watermark" element={<WatermarkTool />} />  */}
          <Route path="/rotate" element={<RotateTool />} /> {/* <--- NEW ROTATE UI */}

          {/* Remaining Tool Routes using the generic ToolPage component */}
          <Route path="/compress" element={<ToolPage title="Compress PDF" icon={Minimize2} />} />
          <Route path="/pdf-to-word" element={<ToolPage title="PDF to Word" icon={FileText} />} />
          <Route path="/pdf-to-ppt" element={<ToolPage title="PDF to PowerPoint" icon={Presentation} />} />
          <Route path="/pdf-to-excel" element={<ToolPage title="PDF to Excel" icon={FileSpreadsheet} />} />
          <Route path="/word-to-pdf" element={<ToolPage title="Word to PDF" icon={FileText} />} />
          <Route path="/pdf-to-jpg" element={<ToolPage title="PDF to JPG" icon={ImageIcon} />} />
          <Route path="/jpg-to-pdf" element={<ToolPage title="JPG to PDF" icon={ImageIcon} />} />
          <Route path="/sign" element={<ToolPage title="Sign PDF" icon={PenTool} />} />
          <Route path="/watermark" element={<ToolPage title="Watermark" icon={Stamp} />} /> {/* Kept generic if dedicated not created yet */}
          <Route path="/unlock" element={<ToolPage title="Unlock PDF" icon={Unlock} />} />
          <Route path="/page-numbers" element={<ToolPage title="Add Page Numbers" icon={Hash} />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/plans" element={<Plans />} />
          <Route path="/admin/coupons" element={<Coupons />} />
          <Route path="/admin/finance" element={<Finance />} />
          <Route path="/admin/health" element={<Health />} />
          <Route path="/admin/security" element={<Security />} />
        </Route>
        {/* --------------------------------- */}
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <ToastContainer />
            <AnimatedRoutes />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;