import { useRef } from "react";

export type PhotoPayload = {
  id: string;
  name: string;
  contentType: string;
  dataUrl: string; // data:image/...;base64,...
};

function toPhotoPayload(file: File, index: number): Promise<PhotoPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const extension =
        file.name?.split(".").pop() || file.type.split("/").pop() || "jpg";

      const timestamp = Date.now();

      resolve({
        id: crypto.randomUUID(),
        name: `photo-${timestamp}-${index + 1}.${extension}`,
        contentType: file.type || "image/jpeg",
        dataUrl: String(reader.result),
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
    const payloads = await Promise.all(
      Array.from(files).map((file, index) => toPhotoPayload(file, index))
    );
    persist([...(value ?? []), ...payloads]);
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
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-600 truncate">
                  {p.name}
                </span>
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  className="text-xs font-semibold text-red-600"
                >
                  Remove
                </button>
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
