import { checkAppVersion } from "./version_check"; // 👈 Import FIRST
checkAppVersion(); // 👈 Immediately check for version mismatch

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
