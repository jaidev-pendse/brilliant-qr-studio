import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type Resolution = 1 | 2 | 3 | 4;

interface ExportOptionsProps {
  errorLevel: ErrorCorrectionLevel;
  setErrorLevel: (level: ErrorCorrectionLevel) => void;
  transparentBg: boolean;
  setTransparentBg: (transparent: boolean) => void;
  resolution: Resolution;
  setResolution: (resolution: Resolution) => void;
}

const errorLevelInfo: Record<ErrorCorrectionLevel, { label: string; description: string }> = {
  L: { label: "L (7%)", description: "Low - 7% error correction. Best for clean environments." },
  M: { label: "M (15%)", description: "Medium - 15% error correction. Good balance." },
  Q: { label: "Q (25%)", description: "Quartile - 25% error correction. Better reliability." },
  H: { label: "H (30%)", description: "High - 30% error correction. Best for logos & printing." },
};

export function ExportOptions({
  errorLevel,
  setErrorLevel,
  transparentBg,
  setTransparentBg,
  resolution,
  setResolution,
}: ExportOptionsProps) {
  return (
    <div className="space-y-6">
      {/* Error Correction Level */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-sm font-bold uppercase">Error Correction</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[280px] border-2 border-foreground">
                <p className="text-sm">
                  Higher error correction allows the QR code to be scanned even if partially damaged or obscured (e.g., with a logo). Use "H" when adding logos.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(["L", "M", "Q", "H"] as ErrorCorrectionLevel[]).map((level) => (
            <TooltipProvider key={level}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={errorLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setErrorLevel(level)}
                    className="border-2 border-foreground font-bold"
                  >
                    {level}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-2 border-foreground">
                  <p className="text-sm">{errorLevelInfo[level].description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Resolution Selector */}
      <div>
        <Label className="text-sm font-bold uppercase mb-3 block">Export Resolution</Label>
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as Resolution[]).map((res) => (
            <Button
              key={res}
              variant={resolution === res ? "default" : "outline"}
              size="sm"
              onClick={() => setResolution(res)}
              className="border-2 border-foreground font-bold"
            >
              {res}x
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Higher resolution = larger file size. 2x recommended for print.
        </p>
      </div>

      {/* Transparent Background */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-bold uppercase">Transparent Background</Label>
          <p className="text-xs text-muted-foreground">Remove background color (PNG only)</p>
        </div>
        <Switch
          checked={transparentBg}
          onCheckedChange={setTransparentBg}
          className="data-[state=checked]:bg-foreground"
        />
      </div>
    </div>
  );
}
