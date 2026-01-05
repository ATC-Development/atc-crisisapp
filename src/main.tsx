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

// ✅ Version check should only *attempt* when reachable.
// Pass a callback that applies the SW update + reload.
checkAppVersion({
  onUpdateNeeded: () => void updateSW(true),
});

// Optional: re-check when connectivity returns / app becomes visible
window.addEventListener("online", () => {
  checkAppVersion({ onUpdateNeeded: () => void updateSW(true) });
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
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
