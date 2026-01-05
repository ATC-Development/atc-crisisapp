import { checkAppVersion } from "./version_check"; // 👈 Import FIRST
checkAppVersion(); // 👈 Immediately check for version mismatch

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./styles/ui.css"; // 👈 Import UI styles globally

import { registerSW } from "virtual:pwa-register";

registerSW({
  onOfflineReady() {
    console.log("ATC Crisis App is ready to work offline");
  },
  onNeedRefresh() {
    console.log("New version available; refresh to update");
  },
});

// ✅ ADD THESE TWO IMPORTS
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/msalConfig";

// ✅ CREATE INSTANCE
const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* ✅ WRAP APP */}
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);
