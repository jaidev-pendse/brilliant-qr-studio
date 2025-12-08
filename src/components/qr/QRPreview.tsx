import { useEffect, useRef } from "react";
import QRCodeStyling, { type Options } from "qr-code-styling";
import type { FrameType } from "./FrameSelector";
import type { DotStyle, CornerStyle } from "./DotStyleSelector";
import type { ErrorCorrectionLevel } from "./ExportOptions";
import type { GradientConfig } from "./GradientPicker";
import type { BackgroundConfig } from "./BackgroundImageUploader";
import type { CornerBadgeConfig } from "./CornerBadge";
import type { ShapeType } from "./ShapeMask";
import type { AnimationConfig } from "./AnimationOptions";
import { getClipPath } from "./ShapeMask";
import { getAnimationStyle } from "./AnimationOptions";

interface QRPreviewProps {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  logo: string | null;
  logoSize: number;
  frameType: FrameType;
  frameColor: string;
  frameText: string;
  qrRef: React.RefObject<HTMLDivElement>;
  errorLevel: ErrorCorrectionLevel;
  transparentBg: boolean;
  gradient?: GradientConfig;
  background?: BackgroundConfig;
  cornerBadge?: CornerBadgeConfig;
  shapeMask?: ShapeType;
  animation?: AnimationConfig;
}

export function QRPreview({
  value,
  size,
  fgColor,
  bgColor,
  dotStyle,
  cornerStyle,
  logo,
  logoSize,
  frameType,
  frameColor,
  frameText,
  qrRef,
  errorLevel,
  transparentBg,
  gradient,
  background,
  cornerBadge,
  shapeMask = "square",
  animation,
}: QRPreviewProps) {
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options: Options = {
      width: size,
      height: size,
      data: value,
      qrOptions: {
        errorCorrectionLevel: errorLevel,
      },
      dotsOptions: gradient?.enabled
        ? {
            gradient: {
              type: gradient.type,
              rotation: gradient.rotation * (Math.PI / 180),
              colorStops: [
                { offset: 0, color: gradient.color1 },
                { offset: 1, color: gradient.color2 },
              ],
            },
            type: dotStyle,
          }
        : {
            color: fgColor,
            type: dotStyle,
          },
      backgroundOptions: {
        color: transparentBg ? "transparent" : bgColor,
      },
      cornersSquareOptions: gradient?.enabled
        ? {
            gradient: {
              type: gradient.type,
              rotation: gradient.rotation * (Math.PI / 180),
              colorStops: [
                { offset: 0, color: gradient.color1 },
                { offset: 1, color: gradient.color2 },
              ],
            },
            type: cornerStyle,
          }
        : {
            color: fgColor,
            type: cornerStyle,
          },
      cornersDotOptions: gradient?.enabled
        ? {
            gradient: {
              type: gradient.type,
              rotation: gradient.rotation * (Math.PI / 180),
              colorStops: [
                { offset: 0, color: gradient.color1 },
                { offset: 1, color: gradient.color2 },
              ],
            },
            type: cornerStyle === "square" ? "square" : "dot",
          }
        : {
            color: fgColor,
            type: cornerStyle === "square" ? "square" : "dot",
          },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: logoSize / 100,
      },
    };

    if (logo) {
      options.image = logo;
    }

    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling(options);
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        qrCodeRef.current.append(containerRef.current);
      }
    } else {
      qrCodeRef.current.update(options);
    }
  }, [value, size, fgColor, bgColor, dotStyle, cornerStyle, logo, logoSize, errorLevel, transparentBg, gradient]);

  const getFrameClasses = () => {
    const base = "relative";
    switch (frameType) {
      case "simple":
        return `${base} border-4`;
      case "rounded":
        return `${base} border-4 rounded-2xl overflow-hidden`;
      case "banner":
        return `${base} border-4`;
      case "scanme":
        return `${base} border-4`;
      case "circle":
        return `${base} border-4 rounded-full overflow-hidden`;
      default:
        return base;
    }
  };

  const getPadding = () => {
    if (frameType === "none") return "p-0";
    if (frameType === "circle") return "p-6";
    return "p-4";
  };

  const clipPath = getClipPath(shapeMask);
  const animationStyle = animation ? getAnimationStyle(animation) : {};

  const getCornerBadgePosition = () => {
    if (!cornerBadge?.enabled || !cornerBadge.image) return null;
    const badgeSize = size * (cornerBadge.size / 100);
    const positions: Record<typeof cornerBadge.position, React.CSSProperties> = {
      "top-left": { top: 4, left: 4 },
      "top-right": { top: 4, right: 4 },
      "bottom-left": { bottom: 4, left: 4 },
      "bottom-right": { bottom: 4, right: 4 },
    };
    return {
      ...positions[cornerBadge.position],
      width: badgeSize,
      height: badgeSize,
    };
  };

  const badgeStyle = getCornerBadgePosition();

  return (
    <div
      ref={qrRef}
      className="flex flex-col items-center justify-center relative"
      style={{ backgroundColor: transparentBg ? "transparent" : bgColor }}
    >
      {/* Background Image */}
      {background?.enabled && background.image && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${background.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: background.opacity / 100,
            filter: `blur(${background.blur}px)`,
          }}
        />
      )}

      {/* Top banner text */}
      {frameType === "scanme" && (
        <div
          className="w-full py-2 text-center font-bold uppercase text-sm tracking-wider z-10"
          style={{ backgroundColor: frameColor, color: bgColor }}
        >
          {frameText || "SCAN ME"}
        </div>
      )}

      <div
        className={`${getFrameClasses()} ${getPadding()} z-10`}
        style={{
          borderColor: frameType !== "none" ? frameColor : "transparent",
          backgroundColor: background?.enabled ? "transparent" : bgColor,
          clipPath: clipPath !== "none" ? clipPath : undefined,
          ...animationStyle,
        }}
      >
        <div ref={containerRef} className="flex items-center justify-center relative">
          {/* Corner Badge */}
          {badgeStyle && cornerBadge?.image && (
            <img
              src={cornerBadge.image}
              alt="Corner badge"
              className="absolute z-20"
              style={badgeStyle}
            />
          )}
        </div>
      </div>

      {/* Bottom banner text */}
      {frameType === "banner" && (
        <div
          className="w-full py-2 text-center font-bold uppercase text-sm tracking-wider z-10"
          style={{ backgroundColor: frameColor, color: bgColor }}
        >
          {frameText || "SCAN ME"}
        </div>
      )}
    </div>
  );
}
