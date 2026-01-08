// Print utilities for QR code generation
import html2canvas from 'html2canvas';

export interface CropMarkOptions {
  enabled: boolean;
  length: number; // in mm
  offset: number; // distance from edge in mm
}

export interface BleedOptions {
  enabled: boolean;
  size: number; // in mm (typically 3mm)
}

export const PAPER_DIMENSIONS = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
  a5: { width: 148, height: 210 },
  a6: { width: 105, height: 148 },
} as const;

export const BUSINESS_CARD_SIZE = {
  width: 88.9, // 3.5 inches
  height: 50.8, // 2 inches
};

export const TABLE_TENT_SIZE = {
  width: 101.6, // 4 inches
  height: 152.4, // 6 inches (folded)
};

export const BADGE_SIZE = {
  width: 85.6, // ID-1 standard
  height: 53.98,
};

export const LABEL_SIZE = {
  width: 63.5, // 2.5 inches
  height: 38.1, // 1.5 inches
};

export function getPaperDimensions(
  paperSize: keyof typeof PAPER_DIMENSIONS,
  orientation: 'portrait' | 'landscape'
) {
  const paper = PAPER_DIMENSIONS[paperSize];
  return orientation === 'landscape'
    ? { width: paper.height, height: paper.width }
    : paper;
}

export function mmToPx(mm: number, dpi: number = 96): number {
  return (mm / 25.4) * dpi;
}

export function pxToMm(px: number, dpi: number = 96): number {
  return (px * 25.4) / dpi;
}

export function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: CropMarkOptions,
  dpi: number = 96
): void {
  if (!options.enabled) return;

  const length = mmToPx(options.length, dpi);
  const offset = mmToPx(options.offset, dpi);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.5;

  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(x - offset - length, y);
  ctx.lineTo(x - offset, y);
  ctx.moveTo(x, y - offset - length);
  ctx.lineTo(x, y - offset);
  ctx.stroke();

  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(x + width + offset, y);
  ctx.lineTo(x + width + offset + length, y);
  ctx.moveTo(x + width, y - offset - length);
  ctx.lineTo(x + width, y - offset);
  ctx.stroke();

  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(x - offset - length, y + height);
  ctx.lineTo(x - offset, y + height);
  ctx.moveTo(x, y + height + offset);
  ctx.lineTo(x, y + height + offset + length);
  ctx.stroke();

  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(x + width + offset, y + height);
  ctx.lineTo(x + width + offset + length, y + height);
  ctx.moveTo(x + width, y + height + offset);
  ctx.lineTo(x + width, y + height + offset + length);
  ctx.stroke();
}

export async function getHighResQRDataURL(
  qrRef: React.RefObject<HTMLDivElement>,
  scale: number = 3
): Promise<string | null> {
  if (!qrRef.current) {
    return null;
  }

  try {
    // Use html2canvas to capture the entire styled QR container including frames, colors, backgrounds
    const canvas = await html2canvas(qrRef.current, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Preserve transparency if set
      logging: false,
    });

    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Failed to capture QR code:', error);
    
    // Fallback to basic canvas capture
    const innerCanvas = qrRef.current.querySelector('canvas');
    if (innerCanvas) {
      return innerCanvas.toDataURL('image/png');
    }
    return null;
  }
}

export function formatFileName(template: string, extension: string): string {
  const date = new Date();
  const timestamp = date.toISOString().slice(0, 10);
  return `qr-${template}-${timestamp}.${extension}`;
}
