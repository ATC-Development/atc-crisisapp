import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/ui.css";

import App from "./App.tsx";

import { registerSW } from "virtual:pwa-register";
import { checkAppVersion } from "./version_check";

// MSAL
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/msalConfig";

const msalInstance = new PublicClientApplication(msalConfig);

/** Force the browser to re-check the service worker script right now. */
async function forceServiceWorkerUpdateCheck() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    await reg?.update();
  } catch {
    // ignore; app should still run offline
  }
}

// Helper: always poke SW, then do version check (apply if mismatch)
const runUpdateChecks = async (
  updateSW: (reloadPage?: boolean) => Promise<void>
) => {
  // 1) Force an actual SW update check at the browser level
  await forceServiceWorkerUpdateCheck();

  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();

    const swState = {
      hasReg: !!reg,
      installing: reg?.installing?.state ?? null,
      waiting: reg?.waiting?.state ?? null,
      active: reg?.active?.state ?? null,
    };

    // 🖥 Console (desktop / remote debug)
    console.log("SW state:", swState);

    // 🔔 Alert (iOS quick visibility)
    alert(`SW state:\n${JSON.stringify(swState, null, 2)}`);
  }

  // 2) Ask the register helper to check (no reload yet)
  void updateSW(false);

  // 3) Version check decides whether to apply + reload
  checkAppVersion({ onUpdateNeeded: () => void updateSW(true) });
};

const updateSW = registerSW({
  immediate: true,

  onOfflineReady() {
    console.log("ATC Crisis App is ready to work offline");
  },

  onNeedRefresh() {
    console.log("New version available (SW). Applying update...");
    void updateSW(true);
  },

  // ✅ This exists in your installed typings
  onRegistered() {
    void runUpdateChecks(updateSW);
  },

  onRegisterError(error) {
    console.error("Service Worker registration error:", error);
  },
});

// ✅ Also run once on initial boot (don’t rely only on onRegistered)
void runUpdateChecks(updateSW);

// ✅ Re-check on common “app is active again” signals
window.addEventListener("online", () => void runUpdateChecks(updateSW));
window.addEventListener("focus", () => void runUpdateChecks(updateSW));
window.addEventListener("pageshow", () => void runUpdateChecks(updateSW));

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    void runUpdateChecks(updateSW);
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);
