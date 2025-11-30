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
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300 overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed inset-0 -z-10 aurora-bg opacity-50 dark:opacity-30 animate-gradient" style={{ backgroundSize: '400% 400%', animationDuration: '20s' }} />
      <div className="fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 text-center lg:pt-40 lg:pb-32 overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
          }}
          className="relative mx-auto max-w-5xl space-y-8"
        >
          <div className="overflow-hidden">
            <motion.h1
              className="text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-zinc-900 dark:text-white leading-[1.1]"
              variants={{
                hidden: { y: 100, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
              }}
            >
              Every tool you need to <br />
              work with <span className="relative inline-block px-4">
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 blur-2xl opacity-50 animate-pulse"></span>
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-gradient bg-[length:200%_auto] drop-shadow-2xl">
                  PDFs
                </span>
              </span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient" style={{ backgroundSize: '200% auto' }}>
                in one place.
              </span>
            </motion.h1>
          </div>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="mx-auto max-w-2xl text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed"
          >
            Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks. 100% FREE and easy to use.
          </motion.p>

          {/* Usage Limit Badge for Free Users */}
          {user && (user.plan !== 'PRO' && user.role !== 'ADMIN') && (
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/50 backdrop-blur-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-xl shadow-indigo-500/10 dark:bg-white/5 dark:border-white/10 dark:text-indigo-300">
                <Sparkles className="h-4 w-4 animate-pulse text-indigo-500" />
                <span>
                  <span className="font-bold">{Math.max(0, freeLimit - (user.dailyUsageCount || 0))}</span> free tasks remaining today
                </span>
              </div>
            </motion.div>
          )}

          {/* Buttons Logic:
              - Guest: Show Both
              - Free User: Show Pricing Only
              - Pro User: Show None
          */}
          {(!user || user.plan !== 'PRO') && (
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-6 pt-8"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              {!user && (
                <Link to="/register" className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-zinc-900 px-8 font-medium text-white transition-all duration-300 hover:bg-zinc-800 hover:scale-105 hover:ring-2 hover:ring-zinc-900 hover:ring-offset-2 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:hover:ring-white dark:hover:ring-offset-zinc-950">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ArrowLeftRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 -z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:animate-[shimmer_1.5s_infinite]" />
                </Link>
              )}

              <Link to="/pricing" className="group inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-transparent px-8 font-medium text-zinc-900 transition-all duration-300 hover:bg-zinc-100 hover:scale-105 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-800">
                View Pricing
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Tools Grid Section */}
      <section className="mx-auto max-w-[1600px] px-6 pb-32">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
            >
              <Link to={`/${tool.id}`}>
                <ToolCard {...tool} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/30 backdrop-blur-xl py-12 dark:border-zinc-800 dark:bg-black/30">
        <div className="mx-auto max-w-7xl px-6 text-center text-zinc-500 dark:text-zinc-400">
          <p>&copy; 2025 PDFly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}