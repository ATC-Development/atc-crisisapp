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

// ✅ Capture the updater function
const updateSW = registerSW({
  immediate: true,
  onOfflineReady() {
    console.log("ATC Crisis App is ready to work offline");
  },
  onNeedRefresh() {
    console.log("New version available (SW). Applying update...");
    // ✅ This forces the waiting SW to activate and reload
    void updateSW(true);
  },
});

// 👇 OPTIONAL but recommended: poke SW on startup (no reload)
void updateSW(false);

// ✅ Version check should only *attempt* when reachable.
// Pass a callback that applies the SW update + reload.
checkAppVersion({
  onUpdateNeeded: () => void updateSW(true),
});

// ✅ Re-check when connectivity returns
window.addEventListener("online", () => {
  void updateSW(false); // 👈 poke SW to check for new version
  checkAppVersion({ onUpdateNeeded: () => void updateSW(true) });
});

// ✅ Re-check when app becomes visible (iOS-friendly)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    void updateSW(false); // 👈 poke SW to check for new version
    checkAppVersion({ onUpdateNeeded: () => void updateSW(true) });
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);
