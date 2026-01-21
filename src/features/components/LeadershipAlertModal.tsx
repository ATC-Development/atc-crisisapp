// src/features/components/LeadershipAlertModal.tsx
import { useEffect, useMemo, useState } from "react";

type LeadershipAlertPayload = {
  categoryLabel: string;
  reporterName: string;
  reporterEmail?: string;
  locationText: string;
  note?: string;
  dontAskAgain?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSend: (payload: LeadershipAlertPayload) => void;

  categoryLabel: string;
  reporterName: string;
  reporterEmail?: string;
  locationText: string;
  defaultNote?: string;
  onNotNow: () => void;

  // Future enhancement: voice-to-text
  allowVoiceNote?: boolean;
};

export default function LeadershipAlertModal({
  open,
  onClose,
  onSend,
  categoryLabel,
  reporterName,
  reporterEmail,
  locationText,
  defaultNote = "",
  onNotNow,
}: Props) {
  const [note, setNote] = useState(defaultNote);
  // const [dontAskAgain, setDontAskAgain] = useState(false);
  const [sending, setSending] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setNote(defaultNote || "");
      // setDontAskAgain(false);
    }
  }, [open, defaultNote]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const previewLines = useMemo(() => {
    const lines = [
      { label: "Category", value: categoryLabel },
      {
        label: "From",
        value: reporterEmail
          ? `${reporterName} (${reporterEmail})`
          : reporterName,
      },
      { label: "Location", value: locationText },
    ];
    return lines;
  }, [categoryLabel, reporterName, reporterEmail, locationText]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Close modal"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute inset-x-0 top-[12%] mx-auto w-[min(560px,92vw)]">
        <div className="rounded-2xl border border-white/10 bg-slate-900 text-white shadow-2xl">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">
                  Notify Company Leadership?
                </div>
                <div className="mt-1 text-sm text-white/70">
                  You marked “Call 911” complete. Send an alert now?
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 hover:bg-white/20"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Preview */}
            <div className="mt-4 rounded-xl bg-white/5 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Alert preview
              </div>

              <div className="mt-2 space-y-2">
                {previewLines.map((row) => (
                  <div key={row.label} className="flex gap-3">
                    <div className="w-20 shrink-0 text-xs text-white/60">
                      {row.label}
                    </div>
                    <div className="min-w-0 flex-1 text-sm text-white/90 break-words">
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional note */}
            <div className="mt-4">
              <div className="text-sm font-medium">Short note (optional)</div>
              <div className="mt-1 text-xs text-white/60">
                1–2 sentences for leadership (what happened / what’s happening
                now).
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Example: Fire alarm in Building C. FD en route. Evacuating now."
              />
            </div>

            {/* Don't ask again */}
            {/* <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10"
              />
              Don’t ask again during this incident
            </label> */}

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={onNotNow}
                className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20"
              >
                Not now
              </button>

              <button
                onClick={async () => {
                  if (sending) return;
                  setSending(true);
                  try {
                    await onSend({
                      categoryLabel,
                      reporterName,
                      reporterEmail,
                      locationText,
                      note: note.trim() ? note.trim() : undefined,
                      // dontAskAgain,
                    });
                  } finally {
                    setSending(false);
                  }
                }}
                disabled={sending}
                className="rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                {sending ? "Sending..." : "Send alert"}
              </button>
            </div>
          </div>
        </div>

        {/* Small hint below panel */}
        <div className="mt-3 text-center text-xs text-white/60">
          Tip: If location looks wrong, use the “Enable” button in the banner.
        </div>
      </div>
    </div>
  );
}
