import { createContext, useContext } from "react";
import type { useProximityLocation } from "../../hooks/useProximityLocation";

type ProximityHookReturn = ReturnType<typeof useProximityLocation>;
export type ProximityStatus = ProximityHookReturn["status"];
export type ProximityRefresh = ProximityHookReturn["refresh"];

export type ProximityContextValue = {
  loc: ProximityStatus;
  refreshLoc: ProximityRefresh;
  proximityText: string;
};

export const ProximityContext = createContext<ProximityContextValue | null>(
  null
);

export function useProximity(): ProximityContextValue {
  const ctx = useContext(ProximityContext);
  if (!ctx) {
    throw new Error("useProximity must be used within a ProximityProvider");
  }
  return ctx;
}
