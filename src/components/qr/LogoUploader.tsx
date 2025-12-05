import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, X, Image } from "lucide-react";

interface LogoUploaderProps {
  logo: string | null;
  setLogo: (logo: string | null) => void;
  logoSize: number[];
  setLogoSize: (size: number[]) => void;
}

export function LogoUploader({
  logo,
  setLogo,
  logoSize,
  setLogoSize,
}: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-bold uppercase">Center Logo</Label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {logo ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 border-2 border-foreground bg-secondary">
            <div className="w-12 h-12 border-2 border-foreground bg-background flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo preview" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Logo Added</p>
              <p className="text-xs text-muted-foreground">Click remove to change</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={removeLogo}
              className="border-2 border-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-bold uppercase">Logo Size</Label>
              <span className="font-mono text-sm border-2 border-foreground px-2 py-1 bg-secondary">
                {logoSize[0]}%
              </span>
            </div>
            <Slider
              value={logoSize}
              onValueChange={setLogoSize}
              min={10}
              max={40}
              step={5}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Larger logos may affect scannability
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-6 border-2 border-dashed border-foreground/50 hover:border-foreground transition-colors flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <div className="w-12 h-12 border-2 border-current rounded-lg flex items-center justify-center">
            <Image className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold uppercase">Upload Logo</span>
          <span className="text-xs">PNG, JPG, SVG (max 2MB)</span>
        </button>
      )}
    </div>
  );
}
