import { useEffect } from "react";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function LeadershipResendModal({
  open,
  onConfirm,
  onCancel,
}: Props) {
  // ESC to cancel
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Close modal"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="absolute inset-x-0 top-[20%] mx-auto w-[min(520px,92vw)]">
        <div className="rounded-2xl border border-white/10 bg-slate-900 text-white shadow-2xl">
          <div className="p-6 text-center">
            <div className="text-base font-semibold">
              Leadership alert already sent
            </div>

            <div className="mt-2 text-sm text-white/70">
              A message to company leadership has already been sent.
              <br />
              Do you want to send another?
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={onCancel}
                className="rounded-full bg-white/10 px-5 py-2 text-sm text-white/80 hover:bg-white/20"
              >
                No
              </button>

              <button
                onClick={onConfirm}
                className="rounded-full bg-red-500/90 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
