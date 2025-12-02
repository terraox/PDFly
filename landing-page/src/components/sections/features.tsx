import Features from "@/components/features-horizontal";
import Section from "@/components/section";
import { ArrowLeftRight, Minimize2, PenTool, Shield } from "lucide-react";

const data = [
  {
    id: 1,
    title: "Merge & Split",
    content: "Combine multiple PDFs into one or extract specific pages with ease.",
    image: "/dashboard.png",
    icon: <ArrowLeftRight className="h-6 w-6 text-primary" />,
  },
  {
    id: 2,
    title: "Compress & Convert",
    content: "Reduce file size while maintaining quality and convert to/from various formats.",
    image: "/dashboard.png",
    icon: <Minimize2 className="h-6 w-6 text-primary" />,
  },
  {
    id: 3,
    title: "Edit & Sign",
    content: "Add text, images, and electronic signatures to your documents.",
    image: "/dashboard.png",
    icon: <PenTool className="h-6 w-6 text-primary" />,
  },
  {
    id: 4,
    title: "Secure & Protect",
    content: "Encrypt your files with passwords and redact sensitive information.",
    image: "/dashboard.png",
    icon: <Shield className="h-6 w-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="Features" subtitle="Everything you need to manage PDFs">
      <Features collapseDelay={5000} linePosition="bottom" data={data} />
    </Section>
  );
}
