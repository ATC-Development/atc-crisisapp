// src/auth/msalConfig.ts
import { LogLevel, type Configuration } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AAD_CLIENT_ID as string;
const tenantId = import.meta.env.VITE_AAD_TENANT_ID as string;

const appRoot = `${window.location.origin}${import.meta.env.BASE_URL}`;

export const msalConfig: Configuration = {
  auth: {
    // TODO: replace with your Entra App Registration values
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: appRoot,
    postLogoutRedirectUri: appRoot,
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
// console.log("MSAL clientId loaded:", import.meta.env.VITE_AAD_CLIENT_ID);
// console.log("appRoot:", appRoot);


export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
  extraQueryParameters: {
    response_mode: "query",
  },
};
// msalConfig.ts
export const flowRequest = {
  scopes: ["api://9796b08e-807e-4aeb-981a-dc24e9421c9a/access_as_user"],
};



