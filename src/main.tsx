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

// Helper: always poke SW, then do version check (apply if mismatch)
const runUpdateChecks = (updateSW: (reloadPage?: boolean) => Promise<void>) => {
  void updateSW(false); // ask SW to check (no reload)
  checkAppVersion({ onUpdateNeeded: () => void updateSW(true) }); // apply + reload if mismatch
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

  // ✅ Key change: only run initial checks once SW is actually registered
  onRegistered() {
    runUpdateChecks(updateSW);
  },
});

// ✅ Also re-check on common “app is active again” signals
window.addEventListener("online", () => runUpdateChecks(updateSW));

// iOS PWA sometimes behaves better with these than visibilitychange alone
window.addEventListener("focus", () => runUpdateChecks(updateSW));
window.addEventListener("pageshow", () => runUpdateChecks(updateSW));

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    runUpdateChecks(updateSW);
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);
