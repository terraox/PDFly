import { Icons } from "@/components/icons";
import { FaTwitter } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "PDFly",
  description: "The Ultimate All-in-One PDF Solution",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["PDF", "Editor", "Converter", "Merge", "Split", "Compress"],
  links: {
    email: "support@pdfly.com",
    twitter: "https://twitter.com/pdfly",
    discord: "https://discord.gg/pdfly",
    github: "https://github.com/pdfly",
    instagram: "https://instagram.com/pdfly/",
  },
  header: [
    {
      trigger: "Features",
      content: {
        main: {
          icon: <Icons.logo className="h-6 w-6" />,
          title: "PDF Tools",
          description: "Everything you need to manage your PDF files.",
          href: "#",
        },
        items: [
          {
            href: "#",
            title: "Merge & Split",
            description: "Combine multiple PDFs or extract pages.",
          },
          {
            href: "#",
            title: "Convert & Compress",
            description: "Transform formats and reduce file size.",
          },
          {
            href: "#",
            title: "Edit & Sign",
            description: "Add text, images, and signatures to your docs.",
          },
        ],
      },
    },
    {
      trigger: "Solutions",
      content: {
        items: [
          {
            title: "For Students",
            href: "#",
            description: "Manage assignments and research papers easily.",
          },
          {
            title: "For Professionals",
            href: "#",
            description: "Streamline document workflows and contracts.",
          },
          {
            title: "For Legal",
            href: "#",
            description: "Securely handle sensitive legal documents.",
          },
          {
            title: "For Business",
            href: "#",
            description: "Efficiently manage invoices and reports.",
          },
        ],
      },
    },
    {
      href: "/blog",
      label: "Blog",
    },
  ],
  pricing: [
    {
      name: "FREE",
      href: "#",
      price: "$0",
      period: "month",
      yearlyPrice: "$0",
      features: [
        "3 PDF Conversions/day",
        "Basic Merge & Split",
        "Watermark Tools",
        "Standard Support",
      ],
      description: "Essential tools for casual users",
      buttonText: "Get Started",
      isPopular: false,
    },
    {
      name: "PRO",
      href: "#",
      price: "$12",
      period: "month",
      yearlyPrice: "$10",
      features: [
        "Unlimited Conversions",
        "OCR Text Recognition",
        "eSignatures",
        "Priority Support",
        "No Ads",
      ],
      description: "Power features for professionals",
      buttonText: "Upgrade to Pro",
      isPopular: true,
    },
    {
      name: "TEAM",
      href: "#",
      price: "$29",
      period: "month",
      yearlyPrice: "$25",
      features: [
        "Everything in Pro",
        "Team Management",
        "Shared Templates",
        "API Access",
        "Dedicated Account Manager",
      ],
      description: "Collaborative tools for teams",
      buttonText: "Contact Sales",
      isPopular: false,
    },
  ],
  faqs: [
    {
      question: "Is PDFly free to use?",
      answer: (
        <span>
          Yes, PDFly offers a free tier with access to essential PDF tools like merging, splitting, and basic conversions. For advanced features like OCR and unlimited usage, we offer affordable Pro plans.
        </span>
      ),
    },
    {
      question: "Is my data secure?",
      answer: (
        <span>
          Absolutely. We use industry-standard encryption to protect your files. Your documents are automatically deleted from our servers after processing to ensure your privacy.
        </span>
      ),
    },
    {
      question: "Can I use PDFly on mobile?",
      answer: (
        <span>
          Yes! PDFly is fully responsive and works seamlessly on smartphones and tablets, so you can manage your PDFs on the go.
        </span>
      ),
    },
    {
      question: "Do you offer an API?",
      answer: (
        <span>
          Yes, we provide a robust API for developers to integrate PDFly's powerful processing capabilities into their own applications. Check our documentation for more details.
        </span>
      ),
    },
  ],
  footer: [
    {
      title: "Product",
      links: [
        { href: "#", text: "Features", icon: null },
        { href: "#", text: "Pricing", icon: null },
        { href: "#", text: "API", icon: null },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "#", text: "About Us", icon: null },
        { href: "#", text: "Blog", icon: null },
        { href: "#", text: "Contact", icon: null },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "#", text: "Privacy Policy", icon: null },
        { href: "#", text: "Terms of Service", icon: null },
      ],
    },
    {
      title: "Social",
      links: [
        {
          href: "#",
          text: "Twitter",
          icon: <FaTwitter />,
        },
        {
          href: "#",
          text: "Instagram",
          icon: <RiInstagramFill />,
        },
        {
          href: "#",
          text: "Youtube",
          icon: <FaYoutube />,
        },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
