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

import ProximityProvider from "./features/components/ProximityProvider";

const msalInstance = new PublicClientApplication(msalConfig);

let lastAlertedVersion: string | null = null;
let lastWaitingState = false;

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
  await forceServiceWorkerUpdateCheck();

  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();

    const hasWaiting = !!reg?.waiting;
    const localVersion = __APP_VERSION__;

    // 🔎 Always log when state changes (console only)
    if (hasWaiting !== lastWaitingState) {
      console.log("SW waiting state changed:", {
        waiting: hasWaiting,
        active: reg?.active?.state ?? null,
      });
      lastWaitingState = hasWaiting;
    }

    // 🔔 Alert ONLY when a new SW is waiting AND we haven't alerted for this version
    if (hasWaiting && lastAlertedVersion !== localVersion) {
      lastAlertedVersion = localVersion;

      alert(
        `A new version of the ATC Crisis App is available.\n\n` +
          `The app will update automatically.`
      );
    }
  }

  // Version check decides whether to apply + reload
  checkAppVersion({
    onUpdateNeeded: () => {
      console.log("Version mismatch detected. Applying update...");
      void updateSW(true);
    },
  });
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

// ...everything above stays exactly the same...

// console.log("AUTH RETURN URL (pre-msal):", {
//   href: window.location.href,
//   origin: window.location.origin,
//   pathname: window.location.pathname,
//   search: window.location.search,
//   hash: window.location.hash,
// });

async function bootstrap() {
  // ✅ Let MSAL finish processing the redirect before React Router mounts
  try {
    // ✅ REQUIRED in newer msal-browser
    await msalInstance.initialize();

    // ✅ Now safe to call
    const result = await msalInstance.handleRedirectPromise();
    console.log("MSAL redirect result:", result);
  } catch (e) {
    console.error("MSAL init/redirect error:", e);
  }

  // console.log("AUTH RETURN URL (post-msal):", {
  //   href: window.location.href,
  //   origin: window.location.origin,
  //   pathname: window.location.pathname,
  //   search: window.location.search,
  //   hash: window.location.hash,
  // });

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <ProximityProvider>
          <App />
        </ProximityProvider>
      </MsalProvider>
    </StrictMode>
  );
}

void bootstrap();
