// src/pwaUpdater.ts
import { Workbox } from "workbox-window";

export function registerPWAUpdater(opts?: {
  onUpdateReady?: (applyUpdate: () => void) => void;
  onUpdated?: () => void;
}) {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    const wb = new Workbox("/sw.js"); // this must match your SW path (sometimes /service-worker.js)

    // When a new SW is waiting to activate
    wb.addEventListener("waiting", () => {
      const applyUpdate = () => {
        // Tell the waiting SW to activate now
        wb.messageSkipWaiting();
      };

      opts?.onUpdateReady?.(applyUpdate);
    });

    // When the new SW takes control, reload to get fresh assets
    wb.addEventListener("controlling", () => {
      opts?.onUpdated?.();
      window.location.reload();
    });

    await wb.register();
  });
}
