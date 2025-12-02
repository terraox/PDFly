"use client";

import FlickeringGrid from "@/components/magicui/flickering-grid";
import Ripple from "@/components/magicui/ripple";
import Safari from "@/components/safari";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const features = [
  {
    title: "All-in-One Platform",
    description:
      "Merge, split, edit, and sign PDFs in one place. No need to switch between multiple tools for different tasks.",
    className: "hover:bg-red-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <Safari
          src={`/dashboard.png`}
          url="https://pdfly.com"
          className="-mb-32 mt-4 max-h-64 w-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
        />
      </>
    ),
  },
  {
    title: "Secure Processing",
    description:
      "Your files are processed securely and deleted automatically after use. We prioritize your privacy and data security.",
    className:
      "order-3 xl:order-none hover:bg-blue-500/10 transition-all duration-500 ease-out",
    content: (
      <Safari
        src={`/dashboard.png`}
        url="https://pdfly.com"
        className="-mb-32 mt-4 max-h-64 w-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
      />
    ),
  },
  {
    title: "Smart Compression",
    description:
      "Reduce file size significantly without compromising on visual quality. Perfect for sharing via email or web.",
    className:
      "md:row-span-2 hover:bg-orange-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <FlickeringGrid
          className="z-0 absolute inset-0 [mask:radial-gradient(circle_at_center,#fff_400px,transparent_0)]"
          squareSize={4}
          gridGap={6}
          color="#000"
          maxOpacity={0.1}
          flickerChance={0.1}
          height={800}
          width={800}
        />
        <Safari
          src={`/dashboard.png`}
          url="https://pdfly.com"
          className="-mb-48 ml-12 mt-16 h-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-x-[-10px] transition-all duration-300"
        />
      </>
    ),
  },
  {
    title: "Redact & Protect",
    description:
      "Permanently remove sensitive information and password protect your important documents with ease.",
    className:
      "flex-row order-4 md:col-span-2 md:flex-row xl:order-none hover:bg-green-500/10 transition-all duration-500 ease-out",
    content: (
      <>
        <Ripple className="absolute -bottom-full" />
        <Safari
          src={`/dashboard.png`}
          url="https://pdfly.com"
          className="-mb-32 mt-4 max-h-64 w-full px-4 select-none drop-shadow-[0_0_28px_rgba(0,0,0,.1)] group-hover:translate-y-[-10px] transition-all duration-300"
        />
      </>
    ),
  },
];

export default function Component() {
  return (
    <Section
      title="Solution"
      subtitle="Empower Your Workflow with PDFly"
      description="Generic tools won't suffice. Our platform is purpose-built to provide exceptional PDF solutions for your unique needs."
      className="bg-neutral-100 dark:bg-neutral-900"
    >
      <div className="mx-auto mt-16 grid max-w-sm grid-cols-1 gap-6 text-gray-500 md:max-w-3xl md:grid-cols-2 xl:grid-rows-2 md:grid-rows-3 xl:max-w-6xl xl:auto-rows-fr xl:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className={cn(
              "group relative items-start overflow-hidden bg-neutral-50 dark:bg-neutral-800 p-6 rounded-2xl",
              feature.className
            )}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: index * 0.1,
            }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="font-semibold mb-2 text-primary">
                {feature.title}
              </h3>
              <p className="text-foreground">{feature.description}</p>
            </div>
            {feature.content}
            <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
