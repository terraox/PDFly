"use client";

import Marquee from "@/components/magicui/marquee";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "bg-primary/20 p-1 py-0.5 font-bold text-primary dark:bg-primary/20 dark:text-primary",
        className
      )}
    >
      {children}
    </span>
  );
};

export interface TestimonialCardProps {
  name: string;
  role: string;
  img?: string;
  description: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const TestimonialCard = ({
  description,
  name,
  img,
  role,
  className,
  ...props // Capture the rest of the props
}: TestimonialCardProps) => (
  <div
    className={cn(
      "mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4",
      // light styles
      " border border-neutral-200 bg-white",
      // dark styles
      "dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className
    )}
    {...props} // Spread the rest of the props here
  >
    <div className="select-none text-sm font-normal text-neutral-700 dark:text-neutral-400">
      {description}
      <div className="flex flex-row py-1">
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
      </div>
    </div>

    <div className="flex w-full select-none items-center justify-start gap-5">
      <Image
        width={40}
        height={40}
        src={img || ""}
        alt={name}
        className="h-10 w-10 rounded-full ring-1 ring-border ring-offset-4"
      />

      <div>
        <p className="font-medium text-neutral-500">{name}</p>
        <p className="text-xs font-normal text-neutral-400">{role}</p>
      </div>
    </div>
  </div>
);

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "CTO at TechBharat",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    description: (
      <p>
        PDFly has completely transformed how we handle documentation.
        <Highlight>
          Merging and compressing reports is now instant.
        </Highlight>{" "}
        A game-changer for Indian tech companies.
      </p>
    ),
  },
  {
    name: "Priya Patel",
    role: "Marketing Director at DesiSolutions",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    description: (
      <p>
        We use PDFly daily for our marketing assets.
        <Highlight>The compression quality is unmatched.</Highlight> Highly
        recommend it for keeping file sizes low without losing clarity.
      </p>
    ),
  },
  {
    name: "Rohan Gupta",
    role: "Founder & CEO at StartupIndia",
    img: "https://randomuser.me/api/portraits/men/22.jpg",
    description: (
      <p>
        As a startup, we need efficient tools. PDFly&apos;s e-signature feature
        is a lifesaver.
        <Highlight>Contracts are signed and secured in minutes.</Highlight> Essential tool
        for any startup.
      </p>
    ),
  },
  {
    name: "Ananya Singh",
    role: "Product Manager at DigitalWaves",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
    description: (
      <p>
        PDFly&apos;s interface is so intuitive.
        <Highlight>Organizing pages and splitting PDFs is effortless.</Highlight> A
        must-have for product teams managing specs.
      </p>
    ),
  },
  {
    name: "Vikram Malhotra",
    role: "Data Scientist at FinTechIndia",
    img: "https://randomuser.me/api/portraits/men/11.jpg",
    description: (
      <p>
        Security is paramount in fintech. PDFly&apos;s local processing gives us peace of mind.
        <Highlight>
          Our sensitive financial data never leaves our control.
        </Highlight>{" "}
        Transformative for the finance industry.
      </p>
    ),
  },
  {
    name: "Meera Reddy",
    role: "VP of Operations at LogiChain India",
    img: "https://randomuser.me/api/portraits/women/33.jpg",
    description: (
      <p>
        PDFly has streamlined our invoicing process.
        <Highlight>
          Batch processing hundreds of invoices saves us hours every week.
        </Highlight>{" "}
      </p>
    ),
  },
  {
    name: "Arjun Nair",
    role: "Head of R&D at EcoInnovate",
    img: "https://randomuser.me/api/portraits/men/55.jpg",
    description: (
      <p>
        We love that PDFly is lightweight and fast.
        <Highlight>
          No bulky software installation required.
        </Highlight>{" "}
        It just works perfectly in the browser.
      </p>
    ),
  },
  {
    name: "Sana Khan",
    role: "Chief Marketing Officer at FashionHub",
    img: "https://randomuser.me/api/portraits/women/29.jpg",
    description: (
      <p>
        Converting our lookbooks to PDF has never been easier.
        <Highlight>
          The watermarking feature protects our designs beautifully.
        </Highlight>{" "}
        Revolutionizing how we share portfolios.
      </p>
    ),
  },
  {
    name: "Aditya Verma",
    role: "Director of IT at HealthTech Solutions",
    img: "https://randomuser.me/api/portraits/men/64.jpg",
    description: (
      <p>
        PDFly helps us manage patient records securely.
        <Highlight>
          Redacting sensitive information is quick and reliable.
        </Highlight>{" "}
        Technology and healthcare working hand in hand.
      </p>
    ),
  },
  {
    name: "Kavita Iyer",
    role: "CEO at EduTech Innovations",
    img: "https://randomuser.me/api/portraits/women/91.jpg",
    description: (
      <p>
        Students love PDFly for organizing their study materials.
        <Highlight>
          Merging lecture notes into a single PDF is a favorite feature.
        </Highlight>{" "}
        Transforming the educational landscape.
      </p>
    ),
  },
  {
    name: "Rahul Das",
    role: "CTO at SecureNet India",
    img: "https://randomuser.me/api/portraits/men/76.jpg",
    description: (
      <p>
        The password protection feature on PDFly is top-notch.
        <Highlight>Ensuring client data remains confidential.</Highlight>{" "}
        Redefining document security standards.
      </p>
    ),
  },
  {
    name: "Neha Kapoor",
    role: "Product Manager at CreativeMinds",
    img: "https://randomuser.me/api/portraits/women/52.jpg",
    description: (
      <p>
        PDFly allows us to easily extract images from PDFs.
        <Highlight>Great for repurposing content for our campaigns.</Highlight> A
        game-changer for creative industries.
      </p>
    ),
  },
  {
    name: "Kabir Singh",
    role: "Founder at Startup Hub",
    img: "https://randomuser.me/api/portraits/men/88.jpg",
    description: (
      <p>
        The OCR feature is fantastic for digitizing old documents.
        <Highlight>Searchable PDFs make our archives actually useful.</Highlight> A
        catalyst for efficiency.
      </p>
    ),
  },
];

export default function Testimonials() {
  return (
    <Section
      title="Testimonials"
      subtitle="What our customers are saying"
      className="max-w-8xl"
    >
      <div className="relative mt-6 max-h-screen overflow-hidden">
        <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
          {Array(Math.ceil(testimonials.length / 3))
            .fill(0)
            .map((_, i) => (
              <Marquee
                vertical
                key={i}
                className={cn({
                  "[--duration:60s]": i === 1,
                  "[--duration:30s]": i === 2,
                  "[--duration:70s]": i === 3,
                })}
              >
                {testimonials.slice(i * 3, (i + 1) * 3).map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: Math.random() * 0.8,
                      duration: 1.2,
                    }}
                  >
                    <TestimonialCard {...card} />
                  </motion.div>
                ))}
              </Marquee>
            ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-background from-20%"></div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-background from-20%"></div>
      </div>
    </Section>
  );
}
