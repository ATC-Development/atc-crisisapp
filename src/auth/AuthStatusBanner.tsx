import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";
import { useEffect, useRef } from "react";
import { useProximity } from "../features/components/ProximityContext";
import { useLocation } from "react-router-dom";

export default function AuthStatusBanner() {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const { loc, refreshLoc, proximityText } = useProximity();

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

  // Refresh location on first mount
  useEffect(() => {
    void refreshLoc();
  }, [refreshLoc]);

  // Refresh location when switching screens, but throttle so rapid taps don't spam GPS
  const route = useLocation();
  const lastNavRefreshRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const THROTTLE_MS = 15_000;

    if (now - lastNavRefreshRef.current < THROTTLE_MS) return;

    lastNavRefreshRef.current = now;
    void refreshLoc();
  }, [route.pathname, refreshLoc]);

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
