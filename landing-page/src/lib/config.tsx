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
            href: "/merge",
            title: "Merge & Split",
            description: "Combine multiple PDFs or extract pages.",
          },
          {
            href: "/compress",
            title: "Convert & Compress",
            description: "Transform formats and reduce file size.",
          },
          {
            href: "/sign",
            title: "Edit & Sign",
            description: "Add text, images, and signatures to your docs.",
          },
        ],
      },
    },

  ],
  pricing: [
    {
      name: "FREE",
      href: "#",
      price: "₹0",
      period: "month",
      yearlyPrice: "₹0",
      features: [
        "3 Tasks per day",
        "10MB Max File Size",
        "Standard Processing Speed",
        "Ads Supported",
      ],
      description: "Perfect for quick, one-off tasks.",
      buttonText: "Get Started Free",
      isPopular: false,
    },
    {
      name: "PRO",
      href: "#",
      price: "₹499",
      period: "month",
      yearlyPrice: "₹4999",
      features: [
        "Unlimited Tasks",
        "100MB Max File Size",
        "Priority Processing (3x Faster)",
        "AI-Powered OCR PDF",
        "No Ads",
      ],
      description: "For power users who need professional tools.",
      buttonText: "Upgrade to Pro",
      isPopular: true,
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
