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
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300 overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-zinc-950 dark:via-black dark:to-zinc-900 animate-gradient opacity-80" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center lg:py-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto max-w-5xl space-y-8"
        >
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-zinc-900 dark:text-white leading-tight">
            Every tool you need to work with PDFs in <span className="text-gradient">one place</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            All the tools you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
          </p>

          {/* Usage Limit Badge for Free Users */}
          {user && (user.plan !== 'PRO' && user.role !== 'ADMIN') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/50 backdrop-blur-sm border border-indigo-200 px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm dark:bg-white/5 dark:border-indigo-500/30 dark:text-indigo-400">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>
                  <span className="font-bold">{Math.max(0, freeLimit - (user.dailyUsageCount || 0))}</span> free tasks remaining today
                </span>
              </div>
            </motion.div>
          )}

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/register" className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-zinc-800 hover:scale-105 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
              Get Started
              <ArrowLeftRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm px-8 py-4 text-base font-bold text-zinc-900 shadow-lg ring-1 ring-zinc-200 hover:bg-white hover:scale-105 dark:bg-white/10 dark:text-white dark:ring-zinc-700 dark:hover:bg-white/20 transition-all">
              View Pricing
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Tools Grid Section */}
      <section className="mx-auto max-w-[1600px] px-6 pb-32">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.5 }}
            >
              <Link to={`/${tool.id}`}>
                <ToolCard {...tool} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/50 backdrop-blur-xl py-12 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-6 text-center text-zinc-500 dark:text-zinc-400">
          <p>&copy; 2025 PDFly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}