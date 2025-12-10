import JSZip from "jszip";
import QRCodeStyling from "qr-code-styling";

export interface BatchQRConfig {
  fgColor: string;
  bgColor: string;
  dotStyle: string;
  cornerStyle: string;
  size: number;
  errorLevel: string;
  gradient?: {
    enabled: boolean;
    type: string;
    color1: string;
    color2: string;
    rotation: number;
  };
}

export interface BatchQRItem {
  id: string;
  data: string;
  name: string;
  selected: boolean;
}

const createQRCodeInstance = (data: string, config: BatchQRConfig) => {
  const dotsOptions = config.gradient?.enabled
    ? {
        gradient: {
          type: config.gradient.type as "linear" | "radial",
          rotation: config.gradient.rotation * (Math.PI / 180),
          colorStops: [
            { offset: 0, color: config.gradient.color1 },
            { offset: 1, color: config.gradient.color2 },
          ],
        },
        type: config.dotStyle as any,
      }
    : {
        color: config.fgColor,
        type: config.dotStyle as any,
      };

  return new QRCodeStyling({
    width: config.size,
    height: config.size,
    data,
    qrOptions: {
      errorCorrectionLevel: config.errorLevel as "L" | "M" | "Q" | "H",
    },
    dotsOptions,
    backgroundOptions: {
      color: config.bgColor,
    },
    cornersSquareOptions: config.gradient?.enabled
      ? {
          gradient: {
            type: config.gradient.type as "linear" | "radial",
            rotation: config.gradient.rotation * (Math.PI / 180),
            colorStops: [
              { offset: 0, color: config.gradient.color1 },
              { offset: 1, color: config.gradient.color2 },
            ],
          },
          type: config.cornerStyle as any,
        }
      : {
          color: config.fgColor,
          type: config.cornerStyle as any,
        },
  });
};

export const generateBatchZip = async (
  items: BatchQRItem[],
  config: BatchQRConfig,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> => {
  const zip = new JSZip();
  const selectedItems = items.filter((item) => item.selected);

  for (let i = 0; i < selectedItems.length; i++) {
    const item = selectedItems[i];
    const qrCode = createQRCodeInstance(item.data, config);
    
    const blob = await qrCode.getRawData("png");
    if (blob instanceof Blob) {
      const arrayBuffer = await blob.arrayBuffer();
      const fileName = sanitizeFileName(item.name || `qr-${i + 1}`) + ".png";
      zip.file(fileName, arrayBuffer);
    }

    if (onProgress) {
      onProgress(i + 1, selectedItems.length);
    }
  }

  return zip.generateAsync({ type: "blob" });
};

const sanitizeFileName = (name: string): string => {
  return name
    .slice(0, 50)
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase();
};

export const downloadZip = async (blob: Blob, filename: string = "qr-codes.zip") => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
