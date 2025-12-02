import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { FileWarning, LayoutGrid, Lock } from "lucide-react";

const problems = [
  {
    title: "File Size Limits",
    description:
      "Large PDF files get rejected by email servers and are difficult to share, slowing down your workflow.",
    icon: FileWarning,
  },
  {
    title: "Uneditable Documents",
    description:
      "Static PDF contracts and forms are impossible to edit without the right tools, leading to frustration.",
    icon: Lock,
  },
  {
    title: "Scattered Tools",
    description:
      "Switching between different websites for merging, converting, and signing documents is inefficient and risky.",
    icon: LayoutGrid,
  },
];

export default function Component() {
  return (
    <Section
      title="Problem"
      subtitle="Managing PDFs shouldn't be a hassle."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {problems.map((problem, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.2} inView>
            <Card className="bg-background border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </Section>
  );
}
