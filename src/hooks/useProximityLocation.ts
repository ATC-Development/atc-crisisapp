import { useCallback, useEffect, useState } from "react";
import type { LocationStatus } from "../services/locationService";
import { resolveLocationStatus } from "../services/locationService";

const LS_KEY = "atc_location_status";
const LS_TIME_KEY = "atc_location_status_time";

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch { return null; }
}

export function useProximityLocation(opts?: { refreshMs?: number }) {
  const refreshMs = opts?.refreshMs ?? 10 * 60 * 1000;

  const [status, setStatus] = useState<LocationStatus>(() => {
    const cached = safeParse<LocationStatus>(localStorage.getItem(LS_KEY));
    return cached ?? { state: "idle" };
  });

  const refresh = useCallback(async () => {
    const next = await resolveLocationStatus();
    setStatus(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    localStorage.setItem(LS_TIME_KEY, String(Date.now()));
  }, []);

  useEffect(() => {
    const lastTime = Number(localStorage.getItem(LS_TIME_KEY) ?? "0");
    const age = Date.now() - lastTime;

    // auto-refresh only if stale
    if (status.state === "idle" || age >= refreshMs) {
      void refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, refresh };
}
