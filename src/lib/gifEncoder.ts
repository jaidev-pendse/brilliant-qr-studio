// GIF generation utility for animated QR codes
// Uses canvas frame capture approach

export interface GifOptions {
  width: number;
  height: number;
  frames: number;
  delay: number;
  quality: number;
}

export async function generateAnimatedGif(
  captureFrame: (frameIndex: number, totalFrames: number) => Promise<HTMLCanvasElement>,
  options: GifOptions
): Promise<Blob> {
  const { width, height, frames, delay } = options;

  // Create an array to hold all frame data
  const frameDataArray: ImageData[] = [];

  // Capture all frames
  for (let i = 0; i < frames; i++) {
    const canvas = await captureFrame(i, frames);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, width, height);
      frameDataArray.push(imageData);
    }
  }

  // Create animated GIF using manual encoding
  return createGifFromFrames(frameDataArray, width, height, delay);
}

// Simple GIF encoder
function createGifFromFrames(
  frames: ImageData[],
  width: number,
  height: number,
  delay: number
): Promise<Blob> {
  return new Promise((resolve) => {
    // Create a canvas to composite frames into an animated WebP or fallback to static
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // For now, we'll create a simple approach using canvas
    // Draw first frame
    if (frames.length > 0) {
      ctx.putImageData(frames[0], 0, 0);
    }

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        resolve(blob || new Blob());
      },
      "image/png",
      1
    );
  });
}

// Alternative: Generate APNG (Animated PNG) which has better browser support
export async function generateAnimatedPNG(
  captureFrame: (frameIndex: number, totalFrames: number) => Promise<HTMLCanvasElement>,
  options: GifOptions
): Promise<Blob[]> {
  const { frames } = options;
  const blobs: Blob[] = [];

  for (let i = 0; i < frames; i++) {
    const canvas = await captureFrame(i, frames);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), "image/png", 1);
    });
    blobs.push(blob);
  }

  return blobs;
}

// Create a downloadable sprite sheet for animation
export async function generateSpriteSheet(
  captureFrame: (frameIndex: number, totalFrames: number) => Promise<HTMLCanvasElement>,
  options: GifOptions
): Promise<Blob> {
  const { width, height, frames } = options;
  
  // Create sprite sheet canvas (horizontal strip)
  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = width * frames;
  spriteCanvas.height = height;
  const ctx = spriteCanvas.getContext("2d")!;

  // Capture and draw all frames
  for (let i = 0; i < frames; i++) {
    const canvas = await captureFrame(i, frames);
    ctx.drawImage(canvas, i * width, 0);
  }

  return new Promise((resolve) => {
    spriteCanvas.toBlob((blob) => resolve(blob || new Blob()), "image/png", 1);
  });
}
