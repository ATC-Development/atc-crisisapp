import { useMemo, useState } from "react";
import {
  blobToDataUrl,
  compressImageFile,
  dataUrlToBase64,
} from "../utils/imageCompression";
import { formatKB } from "../utils/formatKB";

export type CompressedPhoto = {
  originalName: string;
  contentType: string;
  originalBytes: number;
  compressedBytes: number;
  blob: Blob;
  previewUrl: string;
  base64: string; // just the base64 (no data: prefix)
};

type Props = {
  maxKB?: number; // default 100
  onChange: (photos: CompressedPhoto[]) => void;
  multiple?: boolean;
  label?: string;
};

export default function CompressedPhotoPicker({
  maxKB = 100,
  onChange,
  multiple = true,
  label = "Add Photos",
}: Props) {
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<CompressedPhoto[]>([]);

  const maxBytes = useMemo(() => maxKB * 1024, [maxKB]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setBusy(true);
    try {
      const files = Array.from(fileList);

      const results: CompressedPhoto[] = [];
      for (const f of files) {
        const compressedBlob = await compressImageFile(f, {
          maxBytes,
          mimeType: "image/jpeg",
          maxDimension: 1600,
          minDimension: 640,
          initialQuality: 0.82,
          minQuality: 0.45,
          qualityStep: 0.06,
        });

        const previewUrl = URL.createObjectURL(compressedBlob);

        // Single read → dataUrl, then derive base64
        const dataUrl = await blobToDataUrl(compressedBlob);
        const base64 = dataUrlToBase64(dataUrl);

        results.push({
          originalName: f.name,
          contentType: "image/jpeg",
          originalBytes: f.size,
          compressedBytes: compressedBlob.size,
          blob: compressedBlob,
          previewUrl,
          base64,
        });
      }

      const next = multiple ? [...items, ...results] : results;

      if (!multiple) {
        items.forEach((x) => URL.revokeObjectURL(x.previewUrl));
      }

      setItems(next);
      onChange(next);
    } finally {
      setBusy(false);
    }
  }

  function removeAt(idx: number) {
    const copy = [...items];
    const [removed] = copy.splice(idx, 1);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    setItems(copy);
    onChange(copy);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{label}</label>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple={multiple}
        disabled={busy}
        onChange={(e) => handleFiles(e.target.files)}
        className="block w-full text-sm"
      />

      {busy && <div className="text-sm text-gray-600">Compressing photos…</div>}

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((p, idx) => (
            <div
              key={`${p.originalName}-${idx}`}
              className="rounded-xl border bg-white p-3 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <img
                  src={p.previewUrl}
                  alt={p.originalName}
                  className="h-20 w-20 rounded-lg object-cover border"
                />

                <div className="flex-1">
                  <div className="text-sm font-semibold">{p.originalName}</div>
                  <div className="text-xs text-gray-600">
                    Original: {formatKB(p.originalBytes)} • Compressed:{" "}
                    {formatKB(p.compressedBytes)}
                  </div>

                  <div className="text-xs text-gray-600">
                    Original: {(p.originalBytes / 1024).toFixed(1)} KB •
                    Compressed: {(p.compressedBytes / 1024).toFixed(1)} KB
                  </div>
                  {p.compressedBytes > maxBytes && (
                    <div className="text-xs text-red-600 mt-1">
                      Note: could not reach {maxKB}KB; best effort applied.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
