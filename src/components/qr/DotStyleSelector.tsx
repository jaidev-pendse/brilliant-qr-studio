import { Label } from "@/components/ui/label";

export type DotStyle = "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";
export type CornerStyle = "square" | "dot" | "extra-rounded";

interface DotStyleSelectorProps {
  dotStyle: DotStyle;
  setDotStyle: (style: DotStyle) => void;
  cornerStyle: CornerStyle;
  setCornerStyle: (style: CornerStyle) => void;
}

const dotOptions: { style: DotStyle; label: string; preview: React.ReactNode }[] = [
  { style: "square", label: "Square", preview: (
    <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
      {[...Array(9)].map((_, i) => <div key={i} className="bg-foreground" />)}
    </div>
  )},
  { style: "rounded", label: "Rounded", preview: (
    <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
      {[...Array(9)].map((_, i) => <div key={i} className="bg-foreground rounded-sm" />)}
    </div>
  )},
  { style: "dots", label: "Dots", preview: (
    <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
      {[...Array(9)].map((_, i) => <div key={i} className="bg-foreground rounded-full" />)}
    </div>
  )},
  { style: "classy", label: "Classy", preview: (
    <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
      {[...Array(9)].map((_, i) => <div key={i} className="bg-foreground" style={{ clipPath: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)' }} />)}
    </div>
  )},
  { style: "classy-rounded", label: "Diamond", preview: (
    <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
      {[...Array(9)].map((_, i) => <div key={i} className="bg-foreground rounded-sm" style={{ transform: 'rotate(45deg) scale(0.7)' }} />)}
    </div>
  )},
  { style: "extra-rounded", label: "Pill", preview: (
    <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
      {[...Array(9)].map((_, i) => <div key={i} className="bg-foreground rounded-full" style={{ transform: 'scaleX(0.6)' }} />)}
    </div>
  )},
];

const cornerOptions: { style: CornerStyle; label: string; preview: React.ReactNode }[] = [
  { style: "square", label: "Square", preview: (
    <div className="w-6 h-6 border-[3px] border-foreground flex items-center justify-center">
      <div className="w-2 h-2 bg-foreground" />
    </div>
  )},
  { style: "dot", label: "Dot", preview: (
    <div className="w-6 h-6 border-[3px] border-foreground rounded flex items-center justify-center">
      <div className="w-2 h-2 bg-foreground rounded-full" />
    </div>
  )},
  { style: "extra-rounded", label: "Rounded", preview: (
    <div className="w-6 h-6 border-[3px] border-foreground rounded-lg flex items-center justify-center">
      <div className="w-2 h-2 bg-foreground rounded" />
    </div>
  )},
];

export function DotStyleSelector({
  dotStyle,
  setDotStyle,
  cornerStyle,
  setCornerStyle,
}: DotStyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-bold uppercase">Dot Style</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {dotOptions.map((option) => (
            <button
              key={option.style}
              onClick={() => setDotStyle(option.style)}
              className={`flex flex-col items-center gap-2 p-3 border-2 transition-all ${
                dotStyle === option.style
                  ? "border-foreground bg-secondary"
                  : "border-foreground/30 hover:border-foreground/60"
              }`}
            >
              {option.preview}
              <span className="text-[10px] font-bold uppercase">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-bold uppercase">Corner Style</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {cornerOptions.map((option) => (
            <button
              key={option.style}
              onClick={() => setCornerStyle(option.style)}
              className={`flex flex-col items-center gap-2 p-3 border-2 transition-all ${
                cornerStyle === option.style
                  ? "border-foreground bg-secondary"
                  : "border-foreground/30 hover:border-foreground/60"
              }`}
            >
              {option.preview}
              <span className="text-[10px] font-bold uppercase">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
