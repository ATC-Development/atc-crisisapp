import { useMsal } from "@azure/msal-react";

function decodeJwtPayload(token: string) {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(json);
}

type ScopeSet = {
  label: string;
  scopes: string[];
};

export function TokenDebugButton({ scopeSets }: { scopeSets: ScopeSet[] }) {
  const { instance, accounts } = useMsal();

  const run = async () => {
    const account = accounts?.[0];
    if (!account) {
      console.warn("No signed-in account found.");
      return;
    }

    for (const set of scopeSets) {
      try {
        const res = await instance.acquireTokenSilent({
          account,
          scopes: set.scopes,
        });

        const claims = decodeJwtPayload(res.accessToken);

        console.log(`=== TOKEN DEBUG (${set.label}) ===`);
        console.log("scopes requested:", set.scopes.join(" "));
        console.log("aud:", claims.aud);
        console.log("scp:", claims.scp);
        console.log("oid:", claims.oid);
        console.log("upn:", claims.upn ?? claims.preferred_username);
        console.log("tid:", claims.tid);
        console.log("exp:", claims.exp);
      } catch (e) {
        console.error(`Token debug failed (${set.label}):`, e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      className="px-3 py-2 rounded-lg border bg-white"
    >
      Debug Tokens (console)
    </button>
  );
}
