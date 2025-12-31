import { checkAppVersion } from "./version_check"; // 👈 Import FIRST
checkAppVersion(); // 👈 Immediately check for version mismatch

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./styles/ui.css"; // 👈 Import UI styles globally

// 👇 ADD THIS
import { registerSW } from "virtual:pwa-register";

registerSW({
  onOfflineReady() {
    console.log("ATC Crisis App is ready to work offline");
  },
  onNeedRefresh() {
    console.log("New version available; refresh to update");
    // Later we can tie this to your version_check UX if you want
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
