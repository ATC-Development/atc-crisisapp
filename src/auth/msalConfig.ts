// src/auth/msalConfig.ts
import { LogLevel, type Configuration } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AAD_CLIENT_ID as string;
const tenantId = import.meta.env.VITE_AAD_TENANT_ID as string;

export const msalConfig: Configuration = {
  auth: {
    // TODO: replace with your Entra App Registration values
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: `${window.location.origin}${window.location.pathname}`,
    postLogoutRedirectUri: `${window.location.origin}${window.location.pathname}`,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    // Local storage survives reloads and is best for PWAs.
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: () => {},
    },
  },
};
console.log("MSAL clientId loaded:", import.meta.env.VITE_AAD_CLIENT_ID);

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
  extraQueryParameters: {
    response_mode: "query",
  },
};

