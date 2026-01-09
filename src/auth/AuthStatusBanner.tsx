import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";
import { useProximityLocation } from "../hooks/useProximityLocation";

function fmtMeters(m: number) {
  if (!Number.isFinite(m)) return "";
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

export default function AuthStatusBanner() {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const { status: loc, refresh: refreshLoc } = useProximityLocation({
    refreshMs: 10 * 60 * 1000,
  });

  const handleLogin = async () => {
    await instance.loginRedirect(loginRequest);
  };

  const handleLogout = async () => {
    if (!account) return;

    const appRoot = `${window.location.origin}${import.meta.env.BASE_URL}`;

    await instance.logoutRedirect({
      account,
      postLogoutRedirectUri: appRoot,
    });
  };

  // Banner text (short + exec-friendly)
  let proximityText = "Locating…";
  if (loc.state === "denied") proximityText = "Location blocked";
  else if (loc.state === "unavailable") proximityText = "Location unavailable";
  else if (loc.state === "error") proximityText = "Location error";
  else if (loc.state === "ok") {
    if (loc.nearest && loc.nearest.withinRadius) {
      proximityText = `Near ${loc.nearest.name}`;
    } else if (loc.nearest) {
      proximityText = `Not at any property • closest ${
        loc.nearest.name
      } (${fmtMeters(loc.nearest.distanceMeters)})`;
    } else {
      proximityText = "Not at any property";
    }
  }

  // Compact floating pill (doesn't consume layout space)
  return (
    <div
      className="fixed z-50"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 6px)",
        left: "10px",
        right: "10px", // allow expansion to the right edge on small screens
      }}
    >
      {account ? (
        <div className="inline-flex max-w-full items-start gap-3 rounded-2xl border border-white/30 bg-black/25 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">
          {/* Text block */}
          <div className="min-w-0 flex-1">
            <div className="max-w-full truncate font-medium">
              {account.name}
            </div>

            {/* Wrap instead of truncate */}
            <div className="mt-0.5 max-w-full text-[11px] leading-snug text-white/80 whitespace-normal break-words">
              {proximityText}
            </div>

            {/* Optional: tiny enable button under the text (stays neat when wrapping) */}
            {loc.state !== "ok" && (
              <button
                onClick={refreshLoc}
                className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-[2px] text-[10px] text-white/80 hover:bg-white/20"
                title="Enable or retry location"
              >
                Enable
              </button>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-full bg-white/15 px-2 py-1 hover:bg-white/25"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="rounded-full border border-white/30 bg-black/55 px-3 py-2 text-xs text-white shadow-lg backdrop-blur hover:bg-black/65"
        >
          Sign in
        </button>
      )}
    </div>
  );
}
