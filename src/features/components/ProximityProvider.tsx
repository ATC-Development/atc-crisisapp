import { useMemo } from "react";
import { useProximityLocation } from "../../hooks/useProximityLocation";
import { ProximityContext } from "./ProximityContext";

function fmtDistanceUS(meters: number) {
  if (!Number.isFinite(meters)) return "";

  const miles = meters / 1609.344;

  if (miles < 0.1) {
    const feet = meters * 3.28084;
    return `${Math.round(feet)}ft`;
  }

  return `${miles.toFixed(miles < 1 ? 2 : 1)}mi`;
}

export default function ProximityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status: loc, refresh: refreshLoc } = useProximityLocation({
    refreshMs: 2 * 60 * 1000,
  });

  const proximityText = useMemo(() => {
    let text = "Locating…";
    if (loc.state === "denied") text = "Location blocked";
    else if (loc.state === "unavailable") text = "Location unavailable";
    else if (loc.state === "error") text = "Location error";
    else if (loc.state === "ok") {
      if (loc.nearest && loc.nearest.withinRadius) {
        text = `${loc.nearest.name}`;
      } else if (loc.nearest) {
        text = `Not at any property • closest ${
          loc.nearest.name
        } (${fmtDistanceUS(loc.nearest.distanceMeters)})`;
      } else {
        text = "Not at any property";
      }
    }
    return text;
  }, [loc]);

  const value = useMemo(
    () => ({ loc, refreshLoc, proximityText }),
    [loc, refreshLoc, proximityText]
  );

  return (
    <ProximityContext.Provider value={value}>
      {children}
    </ProximityContext.Provider>
  );
}
