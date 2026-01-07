// src/utils/imageCompression.ts

export type CompressOptions = {
  maxBytes?: number;       // default 100KB
  maxDimension?: number;   // default 1600 (long edge)
  minDimension?: number;   // default 640 (floor)
  initialQuality?: number; // default 0.82
  minQuality?: number;     // default 0.45
  qualityStep?: number;    // default 0.06
  mimeType?: "image/jpeg" | "image/webp"; // default jpeg
};

const DEFAULTS: Required<CompressOptions> = {
  maxBytes: 100 * 1024,
  maxDimension: 1600,
  minDimension: 640,
  initialQuality: 0.82,
  minQuality: 0.45,
  qualityStep: 0.06,
  mimeType: "image/jpeg",
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

function drawToCanvas(img: HTMLImageElement, targetLongEdge: number) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  const longEdge = Math.max(w, h);
  const scale = longEdge > targetLongEdge ? targetLongEdge / longEdge : 1;

  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, tw, th);

  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      mimeType,
      quality
    );
  });
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const o = { ...DEFAULTS, ...options };

  // Already small enough → return as-is (but note: may not be jpeg)
  if (file.size <= o.maxBytes) return file;

  const img = await loadImageFromFile(file);

  let targetDim = o.maxDimension;

  while (targetDim >= o.minDimension) {
    const canvas = drawToCanvas(img, targetDim);

    for (
      let q = o.initialQuality;
      q >= o.minQuality;
      q = Math.max(o.minQuality, q - o.qualityStep)
    ) {
      const blob = await canvasToBlob(canvas, o.mimeType, q);
      if (blob.size <= o.maxBytes) return blob;

      if (q === o.minQuality) break;
    }

    targetDim = Math.round(targetDim * 0.85);
  }

  // Best-effort smallest settings
  const lastCanvas = drawToCanvas(img, o.minDimension);
  return await canvasToBlob(lastCanvas, o.mimeType, o.minQuality);
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

// Add these to the bottom of src/utils/imageCompression.ts

/** data:image/...;base64,XXXX -> "XXXX" */
export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(",")[1] ?? "";
}

/** Blob -> base64 string (no data: prefix) */
export async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await blobToDataUrl(blob);
  return dataUrlToBase64(dataUrl);
}
