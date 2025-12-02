import Features from "@/components/features-vertical";
import Section from "@/components/section";
import { Download, MousePointerClick, Upload } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Upload Your PDF",
    content:
      "Drag and drop your file or select it from your device. We support PDF, Word, Excel, JPG, and more.",
    image: "/dashboard.png",
    icon: <Upload className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "2. Choose Your Tool",
    content:
      "Select from our wide range of tools to merge, split, compress, convert, or edit your document.",
    image: "/dashboard.png",
    icon: <MousePointerClick className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "3. Download Result",
    content:
      "Your file is processed instantly. Download the high-quality result to your device in seconds.",
    image: "/dashboard.png",
    icon: <Download className="w-6 h-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="How it works" subtitle="Just 3 steps to get started">
      <Features data={data} />
    </Section>
  );
}
