import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export type GradientType = "linear" | "radial";

export interface GradientConfig {
  enabled: boolean;
  type: GradientType;
  color1: string;
  color2: string;
  rotation: number;
}

interface GradientPickerProps {
  gradient: GradientConfig;
  setGradient: (gradient: GradientConfig) => void;
}

const rotationPresets = [
  { label: "→", value: 0 },
  { label: "↘", value: 45 },
  { label: "↓", value: 90 },
  { label: "↙", value: 135 },
  { label: "←", value: 180 },
  { label: "↖", value: 225 },
  { label: "↑", value: 270 },
  { label: "↗", value: 315 },
];

export function GradientPicker({ gradient, setGradient }: GradientPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold uppercase">Enable Gradient</Label>
        <Switch
          checked={gradient.enabled}
          onCheckedChange={(enabled) => setGradient({ ...gradient, enabled })}
        />
      </div>

      {gradient.enabled && (
        <>
          <div>
            <Label className="text-sm font-bold uppercase mb-2 block">Type</Label>
            <div className="flex gap-2">
              {(["linear", "radial"] as GradientType[]).map((type) => (
                <Button
                  key={type}
                  variant={gradient.type === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGradient({ ...gradient, type })}
                  className="border-2 border-foreground font-bold uppercase flex-1"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-bold uppercase">Color 1</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={gradient.color1}
                  onChange={(e) => setGradient({ ...gradient, color1: e.target.value })}
                  className="w-10 h-10 border-2 border-foreground cursor-pointer"
                />
                <Input
                  value={gradient.color1}
                  onChange={(e) => setGradient({ ...gradient, color1: e.target.value })}
                  className="border-2 border-foreground bg-background font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-bold uppercase">Color 2</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={gradient.color2}
                  onChange={(e) => setGradient({ ...gradient, color2: e.target.value })}
                  className="w-10 h-10 border-2 border-foreground cursor-pointer"
                />
                <Input
                  value={gradient.color2}
                  onChange={(e) => setGradient({ ...gradient, color2: e.target.value })}
                  className="border-2 border-foreground bg-background font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {gradient.type === "linear" && (
            <div>
              <Label className="text-sm font-bold uppercase mb-2 block">Direction</Label>
              <div className="grid grid-cols-4 gap-2">
                {rotationPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={gradient.rotation === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGradient({ ...gradient, rotation: preset.value })}
                    className="border-2 border-foreground font-bold text-lg"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div
            className="h-8 border-2 border-foreground"
            style={{
              background:
                gradient.type === "linear"
                  ? `linear-gradient(${gradient.rotation}deg, ${gradient.color1}, ${gradient.color2})`
                  : `radial-gradient(circle, ${gradient.color1}, ${gradient.color2})`,
            }}
          />
        </>
      )}
    </div>
  );
}
