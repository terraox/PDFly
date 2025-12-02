"use client";

import { motion } from "framer-motion";
import { Check, X, Zap, Shield, DollarSign, Sparkles } from "lucide-react";

const features = [
    { name: "Free Tier Available", pdfly: true, adobe: false, smallpdf: true },
    { name: "Unlimited File Size (Pro)", pdfly: "100MB", adobe: "2GB", smallpdf: "5GB" },
    { name: "Local Processing", pdfly: true, adobe: false, smallpdf: false },
    { name: "Files Auto-Deleted", pdfly: "24hrs", adobe: "Stored", smallpdf: "1hr" },
    { name: "All Tools Included", pdfly: true, adobe: false, smallpdf: true },
    { name: "No Installation Required", pdfly: true, adobe: false, smallpdf: true },
    { name: "Batch Processing", pdfly: true, adobe: true, smallpdf: true },
    { name: "E-Signature", pdfly: true, adobe: true, smallpdf: true },
    { name: "OCR Text Recognition", pdfly: true, adobe: true, smallpdf: true },
    { name: "Price (Monthly)", pdfly: "₹499", adobe: "$22.99", smallpdf: "$12" },
];

const products = [
    {
        name: "PDFly",
        logo: "🚀",
        tagline: "Fast, Secure, Affordable",
        highlight: true,
        color: "from-indigo-600 to-purple-600",
        bgColor: "from-indigo-500/10 to-purple-500/10"
    },
    {
        name: "Adobe Acrobat",
        logo: "📄",
        tagline: "Industry Standard",
        highlight: false,
        color: "from-red-600 to-orange-600",
        bgColor: "from-gray-500/5 to-gray-500/5"
    },
    {
        name: "Smallpdf",
        logo: "📋",
        tagline: "Popular Choice",
        highlight: false,
        color: "from-blue-600 to-cyan-600",
        bgColor: "from-gray-500/5 to-gray-500/5"
    },
];

const CheckIcon = ({ value, isHighlight }: { value: boolean | string, isHighlight: boolean }) => {
    if (value === true) {
        return (
            <div className={`flex items-center justify-center ${isHighlight ? 'text-green-500' : 'text-green-600'}`}>
                <Check className="w-5 h-5" strokeWidth={2.5} />
            </div>
        );
    }
    if (value === false) {
        return (
            <div className="flex items-center justify-center text-red-500/60">
                <X className="w-5 h-5" strokeWidth={2.5} />
            </div>
        );
    }
    return (
        <div className={`text-center text-sm font-medium ${isHighlight ? 'text-foreground' : 'text-muted-foreground'}`}>
            {value}
        </div>
    );
};

export default function FeatureComparison() {
    return (
        <section className="py-20 lg:py-32 bg-gradient-to-b from-secondary/20 to-background">
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
                        Why Choose{" "}
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            PDFly
                        </span>
                        ?
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Compare PDFly with industry leaders and see why we're the smarter choice for your PDF needs.
                    </p>
                </motion.div>

                {/* Mobile View (Cards) */}
                <div className="lg:hidden space-y-6">
                    {products.map((product, pIndex) => (
                        <motion.div
                            key={product.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: pIndex * 0.1 }}
                            className={`rounded-2xl border ${product.highlight ? 'border-indigo-500/50 shadow-xl shadow-indigo-500/10' : 'border-border/50'} bg-gradient-to-br ${product.bgColor} backdrop-blur-sm p-6`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">{product.logo}</span>
                                <div>
                                    <h3 className="font-bold text-lg">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground">{product.tagline}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {features.map((feature, fIndex) => (
                                    <div key={fIndex} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                                        <span className="text-sm text-muted-foreground">{feature.name}</span>
                                        <CheckIcon
                                            value={pIndex === 0 ? feature.pdfly : pIndex === 1 ? feature.adobe : feature.smallpdf}
                                            isHighlight={product.highlight}
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Desktop View (Table) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:block overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left p-6 font-semibold text-muted-foreground w-2/5">
                                        Features
                                    </th>
                                    {products.map((product) => (
                                        <th key={product.name} className={`p-6 ${product.highlight ? 'relative' : ''}`}>
                                            {product.highlight && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                                            )}
                                            <div className="relative flex flex-col items-center gap-2">
                                                <span className="text-4xl">{product.logo}</span>
                                                <div className="text-center">
                                                    <div className={`font-bold text-lg ${product.highlight ? 'bg-gradient-to-r ' + product.color + ' bg-clip-text text-transparent' : ''}`}>
                                                        {product.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{product.tagline}</div>
                                                </div>
                                                {product.highlight && (
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium">
                                                        <Sparkles className="w-3 h-3" />
                                                        Recommended
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((feature, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="p-6 font-medium text-sm">{feature.name}</td>
                                        <td className="p-6 relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                                            <div className="relative">
                                                <CheckIcon value={feature.pdfly} isHighlight={true} />
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <CheckIcon value={feature.adobe} isHighlight={false} />
                                        </td>
                                        <td className="p-6">
                                            <CheckIcon value={feature.smallpdf} isHighlight={false} />
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center mt-12"
                >
                    <a
                        href="http://localhost:3000/register"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105"
                    >
                        Start with PDFly for Free
                        <Zap className="w-5 h-5" fill="white" />
                    </a>
                    <p className="text-sm text-muted-foreground mt-4">
                        No credit card required • Upgrade anytime
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
