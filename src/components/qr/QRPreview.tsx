import { useEffect, useRef } from "react";
import QRCodeStyling, { type Options } from "qr-code-styling";
import type { FrameType } from "./FrameSelector";
import type { DotStyle, CornerStyle } from "./DotStyleSelector";

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
}: QRPreviewProps) {
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options: Options = {
      width: size,
      height: size,
      data: value,
      dotsOptions: {
        color: fgColor,
        type: dotStyle,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: fgColor,
        type: cornerStyle,
      },
      cornersDotOptions: {
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
  }, [value, size, fgColor, bgColor, dotStyle, cornerStyle, logo, logoSize]);

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

  return (
    <div
      ref={qrRef}
      className="flex flex-col items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      {/* Top banner text */}
      {frameType === "scanme" && (
        <div
          className="w-full py-2 text-center font-bold uppercase text-sm tracking-wider"
          style={{ backgroundColor: frameColor, color: bgColor }}
        >
          {frameText || "SCAN ME"}
        </div>
      )}

      <div
        className={`${getFrameClasses()} ${getPadding()}`}
        style={{
          borderColor: frameType !== "none" ? frameColor : "transparent",
          backgroundColor: bgColor,
        }}
      >
        <div ref={containerRef} className="flex items-center justify-center" />
      </div>

      {/* Bottom banner text */}
      {frameType === "banner" && (
        <div
          className="w-full py-2 text-center font-bold uppercase text-sm tracking-wider"
          style={{ backgroundColor: frameColor, color: bgColor }}
        >
          {frameText || "SCAN ME"}
        </div>
      )}
    </div>
  );
}
