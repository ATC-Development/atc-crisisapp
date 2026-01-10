import { useCallback, useEffect, useRef, useState } from "react";
import type { LocationStatus } from "../services/locationService";
import { resolveLocationStatus } from "../services/locationService";

const LS_KEY = "atc_location_status";
const LS_TIME_KEY = "atc_location_status_time";

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function useProximityLocation(opts?: {
  refreshMs?: number;          // normal refresh while visible (driving)
  refreshOnFocus?: boolean;    // refresh when returning to app/tab
}) {
  const refreshMs = opts?.refreshMs ?? 2 * 60 * 1000; // 2 minutes
  const refreshOnFocus = opts?.refreshOnFocus ?? true;

  const [status, setStatus] = useState<LocationStatus>(() => {
    const cached = safeParse<LocationStatus>(localStorage.getItem(LS_KEY));
    return cached ?? { state: "idle" };
  });

  const timerRef = useRef<number | null>(null);

  const persist = useCallback((next: LocationStatus) => {
    setStatus(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    localStorage.setItem(LS_TIME_KEY, String(Date.now()));
  }, []);

  const refresh = useCallback(async () => {
    const next = await resolveLocationStatus();
    persist(next);
  }, [persist]);

  useEffect(() => {
    // start/stop interval based on visibility
    const start = () => {
      if (timerRef.current != null) return;
      timerRef.current = window.setInterval(() => {
        // only refresh while visible
        if (!document.hidden) void refresh();
      }, refreshMs);
    };

    const stop = () => {
      if (timerRef.current == null) return;
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        // refresh immediately when coming back
        if (refreshOnFocus) void refresh();
        start();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    // initial behavior
    if (!document.hidden) {
      void refresh();
      start();
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [refresh, refreshMs, refreshOnFocus]);

  return { status, refresh };
}
