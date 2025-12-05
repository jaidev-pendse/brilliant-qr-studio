import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type FrameType = "none" | "simple" | "rounded" | "banner" | "scanme" | "circle";

interface FrameSelectorProps {
  frameType: FrameType;
  setFrameType: (type: FrameType) => void;
  frameText: string;
  setFrameText: (text: string) => void;
  frameColor: string;
  setFrameColor: (color: string) => void;
}

const frameOptions: { type: FrameType; label: string; preview: React.ReactNode }[] = [
  { type: "none", label: "None", preview: <div className="w-8 h-8 border border-foreground/30 bg-muted" /> },
  { type: "simple", label: "Simple", preview: <div className="w-8 h-8 border-2 border-foreground bg-muted" /> },
  { type: "rounded", label: "Rounded", preview: <div className="w-8 h-8 border-2 border-foreground bg-muted rounded-lg" /> },
  { type: "banner", label: "Banner", preview: (
    <div className="w-8 h-10 border-2 border-foreground bg-muted flex flex-col">
      <div className="flex-1" />
      <div className="h-2 bg-foreground" />
    </div>
  )},
  { type: "scanme", label: "Scan Me", preview: (
    <div className="w-8 h-10 border-2 border-foreground bg-muted flex flex-col">
      <div className="h-2 bg-foreground flex items-center justify-center">
        <span className="text-[3px] text-background font-bold">SCAN</span>
      </div>
      <div className="flex-1" />
    </div>
  )},
  { type: "circle", label: "Circle", preview: <div className="w-8 h-8 border-2 border-foreground bg-muted rounded-full" /> },
];

export function FrameSelector({
  frameType,
  setFrameType,
  frameText,
  setFrameText,
  frameColor,
  setFrameColor,
}: FrameSelectorProps) {
  const showTextInput = frameType === "banner" || frameType === "scanme";

  return (
    <div className="space-y-4">
      <Label className="text-sm font-bold uppercase">Frame Style</Label>
      <div className="grid grid-cols-3 gap-2">
        {frameOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => setFrameType(option.type)}
            className={`flex flex-col items-center gap-2 p-3 border-2 transition-all ${
              frameType === option.type
                ? "border-foreground bg-secondary"
                : "border-foreground/30 hover:border-foreground/60"
            }`}
          >
            {option.preview}
            <span className="text-xs font-bold uppercase">{option.label}</span>
          </button>
        ))}
      </div>

      {showTextInput && (
        <div className="space-y-2">
          <Label className="text-sm font-bold uppercase">Frame Text</Label>
          <Input
            value={frameText}
            onChange={(e) => setFrameText(e.target.value)}
            placeholder="SCAN ME"
            className="border-2 border-foreground bg-background"
            maxLength={20}
          />
        </div>
      )}

      {frameType !== "none" && (
        <div>
          <Label className="text-sm font-bold uppercase">Frame Color</Label>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="color"
              value={frameColor}
              onChange={(e) => setFrameColor(e.target.value)}
              className="w-10 h-10 border-2 border-foreground cursor-pointer"
            />
            <Input
              value={frameColor}
              onChange={(e) => setFrameColor(e.target.value)}
              className="border-2 border-foreground bg-background font-mono text-sm flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
