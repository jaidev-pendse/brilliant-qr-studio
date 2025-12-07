import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { DotStyle, CornerStyle } from "./DotStyleSelector";
import type { FrameType } from "./FrameSelector";

export interface QRTemplate {
  id: string;
  name: string;
  category: "business" | "fun" | "minimal" | "colorful";
  config: {
    fgColor: string;
    bgColor: string;
    dotStyle: DotStyle;
    cornerStyle: CornerStyle;
    frameType: FrameType;
    frameColor: string;
  };
}

const templates: QRTemplate[] = [
  {
    id: "classic-business",
    name: "Classic Business",
    category: "business",
    config: {
      fgColor: "#1a1a1a",
      bgColor: "#ffffff",
      dotStyle: "square",
      cornerStyle: "square",
      frameType: "simple",
      frameColor: "#1a1a1a",
    },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    category: "minimal",
    config: {
      fgColor: "#374151",
      bgColor: "#f9fafb",
      dotStyle: "rounded",
      cornerStyle: "dot",
      frameType: "none",
      frameColor: "#374151",
    },
  },
  {
    id: "vibrant-pop",
    name: "Vibrant Pop",
    category: "colorful",
    config: {
      fgColor: "#7c3aed",
      bgColor: "#fef3c7",
      dotStyle: "dots",
      cornerStyle: "dot",
      frameType: "rounded",
      frameColor: "#7c3aed",
    },
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    category: "colorful",
    config: {
      fgColor: "#0891b2",
      bgColor: "#ecfeff",
      dotStyle: "classy-rounded",
      cornerStyle: "extra-rounded",
      frameType: "scanme",
      frameColor: "#0891b2",
    },
  },
  {
    id: "playful-fun",
    name: "Playful",
    category: "fun",
    config: {
      fgColor: "#ea580c",
      bgColor: "#fff7ed",
      dotStyle: "dots",
      cornerStyle: "dot",
      frameType: "circle",
      frameColor: "#ea580c",
    },
  },
  {
    id: "elegant-dark",
    name: "Elegant Dark",
    category: "business",
    config: {
      fgColor: "#d4af37",
      bgColor: "#1a1a1a",
      dotStyle: "classy",
      cornerStyle: "extra-rounded",
      frameType: "banner",
      frameColor: "#d4af37",
    },
  },
];

const categoryColors: Record<QRTemplate["category"], string> = {
  business: "bg-secondary",
  fun: "bg-accent",
  minimal: "bg-muted",
  colorful: "bg-primary/10",
};

interface QRTemplatesProps {
  onApply: (template: QRTemplate) => void;
}

export const QRTemplates = ({ onApply }: QRTemplatesProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-bold uppercase flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Quick Templates
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            className="h-auto py-3 px-3 border-2 border-foreground flex flex-col items-start gap-1 hover:bg-accent/50"
            onClick={() => onApply(template)}
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className="w-6 h-6 border border-foreground flex-shrink-0"
                style={{ backgroundColor: template.config.bgColor }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(45deg, ${template.config.fgColor} 25%, transparent 25%, transparent 75%, ${template.config.fgColor} 75%), linear-gradient(45deg, ${template.config.fgColor} 25%, transparent 25%, transparent 75%, ${template.config.fgColor} 75%)`,
                    backgroundSize: "8px 8px",
                    backgroundPosition: "0 0, 4px 4px",
                  }}
                />
              </div>
              <span className="text-xs font-bold uppercase truncate">{template.name}</span>
            </div>
            <span className={`text-[10px] uppercase px-1.5 py-0.5 ${categoryColors[template.category]}`}>
              {template.category}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
