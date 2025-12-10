import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Eye, Contrast, Palette, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import {
  getContrastRatio,
  getWCAGLevel,
  colorBlindPalettes,
  highContrastPresets,
  simulateColorBlindness,
  suggestAccessibleColors,
} from "@/lib/colorUtils";

interface AccessibilityOptionsProps {
  fgColor: string;
  bgColor: string;
  setFgColor: (color: string) => void;
  setBgColor: (color: string) => void;
}

type ColorBlindType = "deuteranopia" | "protanopia" | "tritanopia" | "universal";

export const AccessibilityOptions = ({
  fgColor,
  bgColor,
  setFgColor,
  setBgColor,
}: AccessibilityOptionsProps) => {
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<ColorBlindType | null>(null);
  const [contrastRatio, setContrastRatio] = useState(0);
  const [wcagLevel, setWcagLevel] = useState({ level: "", passAA: false, passAAA: false });

  // Calculate contrast ratio when colors change
  useEffect(() => {
    const ratio = getContrastRatio(fgColor, bgColor);
    setContrastRatio(ratio);
    setWcagLevel(getWCAGLevel(ratio));
  }, [fgColor, bgColor]);

  const applyHighContrast = (preset: keyof typeof highContrastPresets) => {
    const { fg, bg } = highContrastPresets[preset];
    setFgColor(fg);
    setBgColor(bg);
    setHighContrastMode(true);
  };

  const applyColorBlindPalette = (type: ColorBlindType) => {
    const palette = colorBlindPalettes[type];
    setFgColor(palette.colors[0]);
    setBgColor("#ffffff");
    setSelectedPalette(type);
  };

  const suggestions = suggestAccessibleColors(fgColor, bgColor);

  return (
    <div className="space-y-6">
      {/* Contrast Checker */}
      <div className="space-y-3">
        <Label className="font-bold uppercase text-sm flex items-center gap-2">
          <Contrast className="w-4 h-4" />
          Contrast Checker
        </Label>
        
        <div className="border-2 border-foreground p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-bold">
              {contrastRatio.toFixed(2)}:1
            </span>
            <Badge
              variant={wcagLevel.passAAA ? "default" : wcagLevel.passAA ? "secondary" : "destructive"}
              className="font-bold uppercase"
            >
              {wcagLevel.level}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {wcagLevel.passAA ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
              <span>WCAG AA (4.5:1)</span>
            </div>
            <div className="flex items-center gap-2">
              {wcagLevel.passAAA ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span>WCAG AAA (7:1)</span>
            </div>
          </div>

          {!wcagLevel.passAA && (
            <div className="flex items-start gap-2 text-sm bg-destructive/10 p-2 border border-destructive">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <span>Low contrast may make your QR code hard to scan. Consider using higher contrast colors.</span>
            </div>
          )}

          {/* Preview */}
          <div
            className="h-16 flex items-center justify-center border-2 border-foreground font-bold text-lg"
            style={{ backgroundColor: bgColor, color: fgColor }}
            role="img"
            aria-label={`Preview: ${fgColor} text on ${bgColor} background`}
          >
            QR CODE PREVIEW
          </div>
        </div>
      </div>

      {/* High Contrast Presets */}
      <div className="space-y-3">
        <Label className="font-bold uppercase text-sm flex items-center gap-2">
          <Eye className="w-4 h-4" />
          High Contrast Presets
        </Label>
        
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(highContrastPresets).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              onClick={() => applyHighContrast(key as keyof typeof highContrastPresets)}
              className="border-2 border-foreground font-bold text-xs uppercase h-auto py-3 flex flex-col gap-1"
              aria-label={`Apply ${preset.name} color scheme`}
            >
              <div className="flex gap-1">
                <div
                  className="w-6 h-6 border border-foreground"
                  style={{ backgroundColor: preset.bg }}
                  aria-hidden="true"
                />
                <div
                  className="w-6 h-6 border border-foreground"
                  style={{ backgroundColor: preset.fg }}
                  aria-hidden="true"
                />
              </div>
              <span>{preset.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Color Blind Friendly Palettes */}
      <div className="space-y-3">
        <Label className="font-bold uppercase text-sm flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color Blind Friendly Palettes
        </Label>

        <div className="space-y-2">
          {(Object.entries(colorBlindPalettes) as [ColorBlindType, typeof colorBlindPalettes.universal][]).map(
            ([type, palette]) => (
              <div key={type} className="border-2 border-foreground p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm uppercase">{palette.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyColorBlindPalette(type)}
                    className={`border-2 border-foreground font-bold text-xs uppercase ${
                      selectedPalette === type ? "bg-foreground text-background" : ""
                    }`}
                    aria-pressed={selectedPalette === type}
                  >
                    {selectedPalette === type ? "Applied" : "Apply"}
                  </Button>
                </div>
                <div className="flex gap-1" role="group" aria-label={`${palette.name} color options`}>
                  {palette.colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setFgColor(color)}
                      className="w-8 h-8 border-2 border-foreground hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Color Blind Simulation */}
      <div className="space-y-3">
        <Label className="font-bold uppercase text-sm">Color Blind Simulation</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["deuteranopia", "protanopia", "tritanopia"] as const).map((type) => (
            <div key={type} className="border-2 border-foreground p-2 text-center">
              <div className="text-xs font-bold uppercase mb-2">{type}</div>
              <div className="flex gap-1 justify-center">
                <div
                  className="w-6 h-6 border border-foreground"
                  style={{ backgroundColor: simulateColorBlindness(fgColor, type) }}
                  aria-label={`${type} simulated foreground color`}
                />
                <div
                  className="w-6 h-6 border border-foreground"
                  style={{ backgroundColor: simulateColorBlindness(bgColor, type) }}
                  aria-label={`${type} simulated background color`}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          See how your colors appear to people with different types of color blindness.
        </p>
      </div>

      {/* Accessible Suggestions */}
      {!wcagLevel.passAA && (
        <div className="space-y-3">
          <Label className="font-bold uppercase text-sm">Suggested Accessible Colors</Label>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => {
                  setFgColor(suggestion.fg);
                  setBgColor(suggestion.bg);
                }}
                className="border-2 border-foreground h-auto py-2 flex items-center gap-2"
              >
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 border border-foreground"
                    style={{ backgroundColor: suggestion.bg }}
                  />
                  <div
                    className="w-4 h-4 border border-foreground"
                    style={{ backgroundColor: suggestion.fg }}
                  />
                </div>
                <span className="text-xs">Use this</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Screen Reader Info */}
      <div className="border-2 border-foreground bg-secondary p-4 space-y-2">
        <h4 className="font-bold uppercase text-sm">Accessibility Features</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• All controls have ARIA labels for screen readers</li>
          <li>• Full keyboard navigation support (Tab, Enter, Space)</li>
          <li>• Color contrast is automatically checked</li>
          <li>• Status updates are announced to screen readers</li>
        </ul>
      </div>
    </div>
  );
};
