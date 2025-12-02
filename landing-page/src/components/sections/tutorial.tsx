"use client";

import { motion } from "framer-motion";
import { Upload, Wand2, Download, Play, Check } from "lucide-react";
import { useState } from "react";

const steps = [
    {
        icon: Upload,
        title: "Upload Your PDF",
        description: "Drag & drop or click to select your document",
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: Wand2,
        title: "Choose Your Tool",
        description: "Select from 15+ PDF tools available",
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: Check,
        title: "Process Instantly",
        description: "Lightning-fast processing in seconds",
        color: "from-orange-500 to-red-500"
    },
    {
        icon: Download,
        title: "Download Result",
        description: "Get your processed PDF immediately",
        color: "from-green-500 to-emerald-500"
    }
];

export default function Tutorial() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section className="py-20 lg:py-32 bg-background">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl lg:text-5xl font-bold mb-4">
                        See{" "}
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            PDFly
                        </span>{" "}
                        in Action
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Watch how easy it is to transform your PDFs in just a few clicks.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Video Demo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative group"
                    >
                        {/* Video placeholder */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
                            {/* Thumbnail/Demo area */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {!isPlaying ? (
                                    <div className="text-center">
                                        {/* Play button */}
                                        <motion.button
                                            onClick={() => setIsPlaying(true)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="group/play relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/50 transition-all hover:shadow-indigo-500/70"
                                        >
                                            <Play className="w-8 h-8 text-white ml-1" fill="white" />

                                            {/* Pulse rings */}
                                            <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20" />
                                        </motion.button>

                                        <p className="mt-6 text-sm font-medium text-muted-foreground">
                                            Watch 30-second demo
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black/90">
                                        {/* Simulated video - replace with actual video embed */}
                                        <div className="text-center p-8">
                                            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-white/80 text-sm">
                                                Video demo coming soon!
                                                <br />
                                                <span className="text-xs">Or embed your actual demo video here</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                                0:30
                            </div>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 -z-10" />
                    </motion.div>

                    {/* Steps */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <h3 className="text-2xl font-bold mb-8">How It Works</h3>

                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="flex gap-4 group/step"
                                >
                                    {/* Step number & icon */}
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover/step:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                                        </div>
                                        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pt-1">
                                        <h4 className="font-semibold text-lg mb-1">{step.title}</h4>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="pt-6"
                        >
                            <a
                                href="http://localhost:3000"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105"
                            >
                                Try It Now - It's Free
                                <Play className="w-4 h-4" fill="white" />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
