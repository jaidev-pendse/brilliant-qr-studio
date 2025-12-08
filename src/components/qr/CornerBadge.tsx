import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload, X } from "lucide-react";

export type CornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface CornerBadgeConfig {
  enabled: boolean;
  image: string | null;
  position: CornerPosition;
  size: number;
}

interface CornerBadgeProps {
  badge: CornerBadgeConfig;
  setBadge: (config: CornerBadgeConfig) => void;
}

const positionLabels: { value: CornerPosition; label: string }[] = [
  { value: "top-left", label: "↖ TL" },
  { value: "top-right", label: "↗ TR" },
  { value: "bottom-left", label: "↙ BL" },
  { value: "bottom-right", label: "↘ BR" },
];

export function CornerBadge({ badge, setBadge }: CornerBadgeProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBadge({
          ...badge,
          enabled: true,
          image: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBadge = () => {
    setBadge({ ...badge, image: null, enabled: false });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold uppercase">Enable Corner Badge</Label>
        <Switch
          checked={badge.enabled && !!badge.image}
          onCheckedChange={(enabled) => setBadge({ ...badge, enabled })}
          disabled={!badge.image}
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!badge.image ? (
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-foreground py-6 flex flex-col gap-2"
        >
          <Upload className="w-5 h-5" />
          <span className="font-bold uppercase text-xs">Upload Badge Icon</span>
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 border-2 border-foreground flex-shrink-0">
              <img
                src={badge.image}
                alt="Badge preview"
                className="w-full h-full object-contain"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={removeBadge}
              className="border-2 border-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>

          <div>
            <Label className="text-sm font-bold uppercase mb-2 block">Position</Label>
            <div className="grid grid-cols-4 gap-2">
              {positionLabels.map((pos) => (
                <Button
                  key={pos.value}
                  variant={badge.position === pos.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBadge({ ...badge, position: pos.value })}
                  className="border-2 border-foreground font-bold text-xs"
                >
                  {pos.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-bold uppercase">Size</Label>
              <span className="font-mono text-sm border-2 border-foreground px-2 py-1 bg-secondary">
                {badge.size}%
              </span>
            </div>
            <Slider
              value={[badge.size]}
              onValueChange={([size]) => setBadge({ ...badge, size })}
              min={5}
              max={15}
              step={1}
              className="py-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
