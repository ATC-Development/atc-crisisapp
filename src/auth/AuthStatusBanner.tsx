import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";
import { useProximityLocation } from "../hooks/useProximityLocation";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";


// function fmtMeters(m: number) {
//   if (!Number.isFinite(m)) return "";
//   if (m < 1000) return `${Math.round(m)}m`;
//   return `${(m / 1000).toFixed(1)}km`;
// }

function fmtDistanceUS(meters: number) {
  if (!Number.isFinite(meters)) return "";

  const miles = meters / 1609.344;

  // Under 0.1 mi, show feet (more intuitive)
  if (miles < 0.1) {
    const feet = meters * 3.28084;
    return `${Math.round(feet)}ft`;
  }

  // Otherwise show miles
  return `${miles.toFixed(miles < 1 ? 2 : 1)}mi`;
}


export default function AuthStatusBanner() {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const { status: loc, refresh: refreshLoc } = useProximityLocation({
    refreshMs: 2 * 60 * 1000,
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

    const route = useLocation();
  const lastNavRefreshRef = useRef(0);

  useEffect(() => {
    // Refresh location when switching screens, but throttle so rapid taps don't spam GPS
    const now = Date.now();
    const THROTTLE_MS = 15_000;

    if (now - lastNavRefreshRef.current < THROTTLE_MS) return;

    lastNavRefreshRef.current = now;
    void refreshLoc();
  }, [route.pathname, refreshLoc]);

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
      } (${fmtDistanceUS(loc.nearest.distanceMeters)})`;
    } else {
      proximityText = "Not at any property";
    }
  }

  // Compact floating pill (doesn't consume layout space)
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 6px)",
        left: "10px",
        right: "10px",
      }}
    >
      <div className="pointer-events-auto inline-flex max-w-full items-start gap-3 rounded-2xl border border-white/30 bg-black/25 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">

        {/* Text block */}
        <div className="min-w-0 flex-1">
          {/* Top line: account name OR signed-out label */}
          <div className="max-w-full truncate font-medium">
            {account ? account.name : "Not signed in"}
          </div>

          {/* Always show proximity */}
          <div className="mt-0.5 max-w-full text-[11px] leading-snug text-white/80 whitespace-normal break-words">
            {proximityText}
          </div>

          {/* Optional: enable/retry location */}
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

        {/* Action button: Sign out OR Sign in */}
        {account ? (
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-full bg-white/15 px-2 py-1 hover:bg-white/25"
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="shrink-0 rounded-full bg-white/15 px-2 py-1 hover:bg-white/25"
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}
