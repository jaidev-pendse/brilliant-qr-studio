import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Square, Circle, Heart, Hexagon, RectangleHorizontal } from "lucide-react";

export type ShapeType = "square" | "rounded" | "circle" | "heart" | "hexagon";

interface ShapeMaskProps {
  shape: ShapeType;
  setShape: (shape: ShapeType) => void;
}

const shapes: { value: ShapeType; label: string; icon: typeof Square }[] = [
  { value: "square", label: "Square", icon: Square },
  { value: "rounded", label: "Rounded", icon: RectangleHorizontal },
  { value: "circle", label: "Circle", icon: Circle },
  { value: "heart", label: "Heart", icon: Heart },
  { value: "hexagon", label: "Hexagon", icon: Hexagon },
];

export function ShapeMask({ shape, setShape }: ShapeMaskProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-bold uppercase">QR Shape</Label>
      <div className="grid grid-cols-5 gap-2">
        {shapes.map((s) => {
          const Icon = s.icon;
          return (
            <Button
              key={s.value}
              variant={shape === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setShape(s.value)}
              className="border-2 border-foreground font-bold flex flex-col gap-1 py-3 h-auto"
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] uppercase">{s.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function getClipPath(shape: ShapeType): string {
  switch (shape) {
    case "circle":
      return "circle(50% at 50% 50%)";
    case "rounded":
      return "inset(0 round 12%)";
    case "heart":
      return "path('M 0.5,0.15 C 0.25,-0.1 -0.1,0.2 0.5,0.85 C 1.1,0.2 0.75,-0.1 0.5,0.15')";
    case "hexagon":
      return "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
    case "square":
    default:
      return "none";
  }
}
