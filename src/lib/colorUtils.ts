// Convert hex color to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate WCAG contrast ratio
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Get WCAG compliance level
export const getWCAGLevel = (ratio: number): { level: string; passAA: boolean; passAAA: boolean } => {
  return {
    level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail",
    passAA: ratio >= 4.5,
    passAAA: ratio >= 7,
  };
};

// Color blindness simulation matrices
const colorBlindMatrices = {
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
};

// Simulate color blindness
export const simulateColorBlindness = (
  hex: string,
  type: "deuteranopia" | "protanopia" | "tritanopia"
): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const matrix = colorBlindMatrices[type];
  const r = Math.round(matrix[0][0] * rgb.r + matrix[0][1] * rgb.g + matrix[0][2] * rgb.b);
  const g = Math.round(matrix[1][0] * rgb.r + matrix[1][1] * rgb.g + matrix[1][2] * rgb.b);
  const b = Math.round(matrix[2][0] * rgb.r + matrix[2][1] * rgb.g + matrix[2][2] * rgb.b);

  return `#${[r, g, b].map((c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, "0")).join("")}`;
};

// Color blind friendly palettes
export const colorBlindPalettes = {
  deuteranopia: {
    name: "Deuteranopia Safe",
    colors: ["#000000", "#0072B2", "#E69F00", "#56B4E9", "#009E73", "#F0E442"],
  },
  protanopia: {
    name: "Protanopia Safe",
    colors: ["#000000", "#0072B2", "#CC79A7", "#56B4E9", "#009E73", "#F0E442"],
  },
  tritanopia: {
    name: "Tritanopia Safe",
    colors: ["#000000", "#D55E00", "#CC79A7", "#009E73", "#0072B2", "#E69F00"],
  },
  universal: {
    name: "Universal Safe",
    colors: ["#000000", "#0072B2", "#D55E00", "#009E73", "#CC79A7", "#56B4E9"],
  },
};

// High contrast presets
export const highContrastPresets = {
  blackOnWhite: { fg: "#000000", bg: "#ffffff", name: "Black on White" },
  whiteOnBlack: { fg: "#ffffff", bg: "#000000", name: "White on Black" },
  yellowOnBlack: { fg: "#ffff00", bg: "#000000", name: "Yellow on Black" },
  blueOnWhite: { fg: "#0000aa", bg: "#ffffff", name: "Blue on White" },
};

// Suggest accessible alternatives
export const suggestAccessibleColors = (
  fgColor: string,
  bgColor: string
): { fg: string; bg: string }[] => {
  const suggestions: { fg: string; bg: string }[] = [];

  // Always suggest high contrast options
  Object.values(highContrastPresets).forEach((preset) => {
    suggestions.push({ fg: preset.fg, bg: preset.bg });
  });

  return suggestions.slice(0, 4);
};
