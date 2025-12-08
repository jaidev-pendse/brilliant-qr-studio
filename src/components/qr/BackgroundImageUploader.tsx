import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload, X, ImageIcon } from "lucide-react";

export interface BackgroundConfig {
  enabled: boolean;
  image: string | null;
  opacity: number;
  blur: number;
}

interface BackgroundImageUploaderProps {
  background: BackgroundConfig;
  setBackground: (config: BackgroundConfig) => void;
}

export function BackgroundImageUploader({
  background,
  setBackground,
}: BackgroundImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackground({
          ...background,
          enabled: true,
          image: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setBackground({ ...background, image: null, enabled: false });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold uppercase">Enable Background</Label>
        <Switch
          checked={background.enabled && !!background.image}
          onCheckedChange={(enabled) => setBackground({ ...background, enabled })}
          disabled={!background.image}
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!background.image ? (
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-foreground py-8 flex flex-col gap-2"
        >
          <Upload className="w-6 h-6" />
          <span className="font-bold uppercase text-xs">Upload Background Image</span>
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative border-2 border-foreground">
            <img
              src={background.image}
              alt="Background preview"
              className="w-full h-32 object-cover"
              style={{
                opacity: background.opacity / 100,
                filter: `blur(${background.blur}px)`,
              }}
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-bold uppercase">Opacity</Label>
              <span className="font-mono text-sm border-2 border-foreground px-2 py-1 bg-secondary">
                {background.opacity}%
              </span>
            </div>
            <Slider
              value={[background.opacity]}
              onValueChange={([opacity]) => setBackground({ ...background, opacity })}
              min={10}
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-bold uppercase">Blur</Label>
              <span className="font-mono text-sm border-2 border-foreground px-2 py-1 bg-secondary">
                {background.blur}px
              </span>
            </div>
            <Slider
              value={[background.blur]}
              onValueChange={([blur]) => setBackground({ ...background, blur })}
              min={0}
              max={10}
              step={1}
              className="py-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
