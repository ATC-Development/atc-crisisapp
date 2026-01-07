import { useRef } from "react";
import { blobToDataUrl, compressImageFile } from "../../utils/imageCompression"; // adjust path if needed
import { formatKB } from "../../utils/formatKB"; // adjust path if needed

export type PhotoPayload = {
  id: string;
  name: string;
  contentType: string;
  dataUrl: string; // data:image/...;base64,...
};

const MAX_PHOTO_BYTES = 100 * 1024; // 100KB

function dataUrlSizeBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}

async function toPhotoPayload(
  file: File,
  index: number
): Promise<PhotoPayload> {
  const timestamp = Date.now();

  // Compress to JPEG <= 100KB (best effort if impossible)
  const compressed = await compressImageFile(file, {
    maxBytes: MAX_PHOTO_BYTES,
    mimeType: "image/jpeg",
    maxDimension: 1600,
    minDimension: 640,
    initialQuality: 0.82,
    minQuality: 0.45,
    qualityStep: 0.06,
  });

  const dataUrl = await blobToDataUrl(compressed);

  return {
    id: crypto.randomUUID(),
    name: `photo-${timestamp}-${index + 1}.jpg`,
    contentType: "image/jpeg",
    dataUrl,
  };
}

export function PhotosField({
  value,
  onChange,
  storageKey,
}: {
  value: PhotoPayload[];
  onChange: (next: PhotoPayload[]) => void;
  storageKey: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const persist = (next: PhotoPayload[]) => {
    onChange(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Process sequentially to avoid spiking memory/CPU on mobile
    const nextPayloads: PhotoPayload[] = [];
    const arr = Array.from(files);

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      const payload = await toPhotoPayload(file, i);
      nextPayloads.push(payload);
    }

    persist([...(value ?? []), ...nextPayloads]);
  };

  const removePhoto = (id: string) => {
    const next = (value ?? []).filter((p) => p.id !== id);
    persist(next);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          void addPhotos(e.target.files);
          e.currentTarget.value = ""; // re-select same image
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white font-semibold shadow"
      >
        Add / Take Photo
      </button>

      {(value?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {value.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border bg-white p-2 shadow-sm"
            >
              <img
                src={p.dataUrl}
                alt={p.name}
                className="h-32 w-full rounded-xl object-cover"
              />
              <div className="mt-2 space-y-1">
                <div className="text-xs text-slate-600 truncate">{p.name}</div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {formatKB(dataUrlSizeBytes(p.dataUrl))}
                  </span>

                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    className="text-[11px] font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-600">
        Photos are saved on this device until you submit the form.
      </p>
    </div>
  );
}
