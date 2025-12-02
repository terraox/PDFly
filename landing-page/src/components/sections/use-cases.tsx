"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Scale, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

const useCases = [
    {
        id: "students",
        icon: GraduationCap,
        title: "For Students",
        description: "Streamline your academic workflow with powerful PDF tools.",
        examples: [
            "Merge lecture notes into study guides",
            "Compress large research papers",
            "Annotate and highlight textbooks",
            "Sign permission forms digitally"
        ],
        gradient: "from-blue-500 to-cyan-500",
        bgGradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
        id: "professionals",
        icon: Briefcase,
        title: "For Professionals",
        description: "Boost productivity and manage documents efficiently.",
        examples: [
            "Create polished presentations",
            "Merge client proposals",
            "Watermark confidential docs",
            "Convert formats instantly"
        ],
        gradient: "from-purple-500 to-pink-500",
        bgGradient: "from-purple-500/10 to-pink-500/10"
    },
    {
        id: "legal",
        icon: Scale,
        title: "For Legal",
        description: "Handle sensitive documents with security and precision.",
        examples: [
            "Redact confidential information",
            "Organize case documents",
            "E-sign contracts securely",
            "OCR scanned legal texts"
        ],
        gradient: "from-red-500 to-orange-500",
        bgGradient: "from-red-500/10 to-orange-500/10"
    },
    {
        id: "business",
        icon: Building2,
        title: "For Business",
        description: "Streamline operations and manage workflows seamlessly.",
        examples: [
            "Process invoices efficiently",
            "Compress reports for emails",
            "Create branded documents",
            "Batch process PDFs"
        ],
        gradient: "from-green-500 to-emerald-500",
        bgGradient: "from-green-500/10 to-emerald-500/10"
    }
];

export default function UseCases() {
    return (
        <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-secondary/20">
            <div className="container">
                {/* Use Cases Grid */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                    {useCases.map((useCase, index) => {
                        const Icon = useCase.icon;
                        return (
                            <motion.div
                                key={useCase.id}
                                id={useCase.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative"
                            >
                                {/* Card */}
                                <div className={`relative h-full rounded-2xl border border-border/50 bg-gradient-to-br ${useCase.bgGradient} backdrop-blur-sm p-8 transition-all duration-300 hover:border-border hover:shadow-xl`}>
                                    {/* Icon */}
                                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${useCase.gradient} mb-6 shadow-lg`}>
                                        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold mb-3">{useCase.title}</h3>
                                    <p className="text-muted-foreground mb-6">{useCase.description}</p>

                                    {/* Examples */}
                                    <ul className="space-y-3 mb-6">
                                        {useCase.examples.map((example, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <div className={`mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${useCase.gradient}`} />
                                                <span className="text-muted-foreground">{example}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Link
                                        href="http://localhost:3000"
                                        className="inline-flex items-center gap-2 text-sm font-medium group/btn"
                                    >
                                        <span className={`bg-gradient-to-r ${useCase.gradient} bg-clip-text text-transparent`}>
                                            Get Started
                                        </span>
                                        <ArrowRight className={`w-4 h-4 transition-transform group-hover/btn:translate-x-1 bg-gradient-to-r ${useCase.gradient} text-transparent`} strokeWidth={2.5} style={{ stroke: 'url(#gradient)' }} />
                                    </Link>
                                </div>

                                {/* Hover glow effect */}
                                <div className={`absolute -inset-0.5 bg-gradient-to-r ${useCase.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 -z-10`} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
