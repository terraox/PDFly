import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ToolCard from "../components/ToolCard";
import {
  ArrowLeftRight, Minimize2, FileText, Type, Presentation,
  FileSpreadsheet, Image as ImageIcon, PenTool, Stamp,
  RefreshCw, Unlock, Shield, Hash, Scissors, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const tools = [
  { id: "merge", title: "Merge PDF", desc: "Combine PDFs in the order you want with the easiest PDF merger available.", icon: ArrowLeftRight, color: "red" },
  { id: "split", title: "Split PDF", desc: "Separate one page or a whole set for easy conversion into independent PDF files.", icon: Scissors, color: "red" },
  { id: "compress", title: "Compress PDF", desc: "Reduce file size while optimizing for maximal PDF quality.", icon: Minimize2, color: "green" },
  { id: "pdf-to-word", title: "PDF to Word", desc: "Easily convert your PDF files into easy to edit DOC and DOCX documents.", icon: Type, color: "blue" },
  { id: "pdf-to-ppt", title: "PDF to PowerPoint", desc: "Turn your PDF files into easy to edit PPT and PPTX slideshows.", icon: Presentation, color: "orange" },
  { id: "pdf-to-excel", title: "PDF to Excel", desc: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.", icon: FileSpreadsheet, color: "green" },
  { id: "word-to-pdf", title: "Word to PDF", desc: "Make DOC and DOCX files easy to read by converting them to PDF.", icon: Type, color: "blue" },
  { id: "pdf-to-jpg", title: "PDF to JPG", desc: "Convert each PDF page into a JPG or extract all images contained in a PDF.", icon: ImageIcon, color: "yellow" },
  { id: "jpg-to-pdf", title: "JPG to PDF", desc: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.", icon: ImageIcon, color: "yellow" },
  { id: "sign", title: "Sign PDF", desc: "Sign yourself or request electronic signatures from others.", icon: PenTool, color: "purple" },
  { id: "watermark", title: "Watermark", desc: "Stamp an image or text over your PDF in seconds.", icon: Stamp, color: "red" },
  { id: "rotate", title: "Rotate PDF", desc: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!", icon: RefreshCw, color: "blue" },
  { id: "unlock", title: "Unlock PDF", desc: "Remove PDF password security, giving you the freedom to use your PDFs as you want.", icon: Unlock, color: "gray" },
  { id: "protect", title: "Protect PDF", desc: "Encrypt your PDF with a password to keep sensitive data confidential.", icon: Shield, color: "gray" },
  { id: "page-numbers", title: "Page Numbers", desc: "Add page numbers into your PDFs with ease.", icon: Hash, color: "green" },
];

import axios from 'axios';

export default function Home() {
  const { user } = useAuth();
  const [freeLimit, setFreeLimit] = useState(3);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/tools/config');
        const config = response.data.find(c => c.configKey === 'FREE_TIER_LIMIT');
        if (config) {
          setFreeLimit(parseInt(config.configValue));
        }
      } catch (error) {
        console.error('Failed to fetch config', error);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="px-6 py-16 text-center lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl space-y-6"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-zinc-900 dark:text-white">
            Every tool you need to work with PDFs in one place
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-zinc-500 dark:text-zinc-400">
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
          </p>

          {/* Usage Limit Badge for Free Users */}
          {user && (user.plan !== 'PRO' && user.role !== 'ADMIN') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20">
                <Sparkles className="h-4 w-4" />
                <span>
                  <span className="font-bold">{Math.max(0, freeLimit - (user.dailyUsageCount || 0))}</span> free tasks remaining today
                </span>
              </div>
            </motion.div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Link to="/register" className="rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all hover:-translate-y-1">
              Get Started
            </Link>
            <Link to="/pricing" className="rounded-full bg-white px-8 py-3 text-base font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 dark:bg-white/10 dark:text-white dark:ring-zinc-700 dark:hover:bg-white/20 transition-all">
              View Pricing
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Recent Files Section Removed - Moved to /history */}

      {/* Tools Grid Section */}
      <section className="mx-auto max-w-[1440px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/${tool.id}`}>
                <ToolCard {...tool} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 text-center text-zinc-500 dark:text-zinc-400">
          <p>&copy; 2025 PDFly. All rights reserved.</p>
        </div>
      </footer>
    </div >
  );
}