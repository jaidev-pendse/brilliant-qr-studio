import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Zap, Eye, Radio, Star } from "lucide-react";

export type AnimationType = "none" | "pulse" | "fade" | "glow" | "scan";

export interface AnimationConfig {
  enabled: boolean;
  type: AnimationType;
  speed: "slow" | "medium" | "fast";
}

interface AnimationOptionsProps {
  animation: AnimationConfig;
  setAnimation: (config: AnimationConfig) => void;
}

const animations: { value: AnimationType; label: string; icon: typeof Sparkles }[] = [
  { value: "none", label: "None", icon: Star },
  { value: "pulse", label: "Pulse", icon: Radio },
  { value: "fade", label: "Fade", icon: Eye },
  { value: "glow", label: "Glow", icon: Sparkles },
  { value: "scan", label: "Scan", icon: Zap },
];

const speeds = [
  { value: "slow" as const, label: "Slow", duration: "3s" },
  { value: "medium" as const, label: "Medium", duration: "1.5s" },
  { value: "fast" as const, label: "Fast", duration: "0.75s" },
];

export function AnimationOptions({ animation, setAnimation }: AnimationOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold uppercase">Enable Animation</Label>
        <Switch
          checked={animation.enabled}
          onCheckedChange={(enabled) =>
            setAnimation({ ...animation, enabled, type: enabled ? "pulse" : "none" })
          }
        />
      </div>

      {animation.enabled && (
        <>
          <div>
            <Label className="text-sm font-bold uppercase mb-2 block">Animation Type</Label>
            <div className="grid grid-cols-5 gap-2">
              {animations.slice(1).map((anim) => {
                const Icon = anim.icon;
                return (
                  <Button
                    key={anim.value}
                    variant={animation.type === anim.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnimation({ ...animation, type: anim.value })}
                    className="border-2 border-foreground font-bold flex flex-col gap-1 py-3 h-auto"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] uppercase">{anim.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm font-bold uppercase mb-2 block">Speed</Label>
            <div className="grid grid-cols-3 gap-2">
              {speeds.map((s) => (
                <Button
                  key={s.value}
                  variant={animation.speed === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAnimation({ ...animation, speed: s.value })}
                  className="border-2 border-foreground font-bold"
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-2 border-foreground p-3 bg-secondary">
            <strong>Note:</strong> Animations are preview-only. Use "Download GIF" to export animated QR codes.
          </div>
        </>
      )}
    </div>
  );
}

export function getAnimationDuration(speed: AnimationConfig["speed"]): string {
  switch (speed) {
    case "slow":
      return "3s";
    case "fast":
      return "0.75s";
    default:
      return "1.5s";
  }
}

export function getAnimationStyle(
  animation: AnimationConfig
): React.CSSProperties {
  if (!animation.enabled || animation.type === "none") return {};

  const duration = getAnimationDuration(animation.speed);

  switch (animation.type) {
    case "pulse":
      return {
        animation: `qr-pulse ${duration} ease-in-out infinite`,
      };
    case "fade":
      return {
        animation: `qr-fade ${duration} ease-in-out infinite`,
      };
    case "glow":
      return {
        animation: `qr-glow ${duration} ease-in-out infinite`,
      };
    case "scan":
      return {
        animation: `qr-scan ${duration} linear infinite`,
      };
    default:
      return {};
  }
}
