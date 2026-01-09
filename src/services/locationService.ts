import locations from "../data/propertyLocations.json";
import { haversineMeters } from "../features/utils/geo";

type PropertyLocation = {
  code: string;
  name: string;
  lat: number;
  lon: number;
  radiusMeters?: number;
};

type LocationsFile = {
  defaultRadiusMeters: number;
  properties: PropertyLocation[];
};

const cfg = locations as LocationsFile;

function getErrorNumber(e: unknown, key: string): number | undefined {
  if (typeof e !== "object" || e === null) return undefined;
  if (!(key in e)) return undefined;
  const v = (e as Record<string, unknown>)[key];
  return typeof v === "number" ? v : undefined;
}

function getErrorString(e: unknown, key: string): string | undefined {
  if (typeof e !== "object" || e === null) return undefined;
  if (!(key in e)) return undefined;
  const v = (e as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
}


export type LocationStatus =
  | { state: "idle" }
  | { state: "unavailable"; reason: string }
  | { state: "denied"; reason: string }
  | { state: "error"; reason: string }
  | {
      state: "ok";
      coords: { lat: number; lon: number; accuracyMeters?: number };
      nearest: {
        code: string;
        name: string;
        distanceMeters: number;
        withinRadius: boolean;
        radiusMeters: number;
      } | null;
    };

export async function getCurrentPositionAsync(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
): Promise<GeolocationPosition> {
  if (!("geolocation" in navigator)) {
    throw new Error("Geolocation not supported by this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export function matchNearestProperty(lat: number, lon: number) {
  const here = { lat, lon };
  let best:
    | {
        prop: PropertyLocation;
        distanceMeters: number;
        radiusMeters: number;
        withinRadius: boolean;
      }
    | null = null;

  for (const prop of cfg.properties) {
    const radiusMeters = prop.radiusMeters ?? cfg.defaultRadiusMeters;
    const distanceMeters = haversineMeters(here, { lat: prop.lat, lon: prop.lon });
    const withinRadius = distanceMeters <= radiusMeters;

    if (!best || distanceMeters < best.distanceMeters) {
      best = { prop, distanceMeters, radiusMeters, withinRadius };
    }
  }

  if (!best) return null;

  return {
    code: best.prop.code,
    name: best.prop.name,
    distanceMeters: best.distanceMeters,
    withinRadius: best.withinRadius,
    radiusMeters: best.radiusMeters
  };
}

export async function resolveLocationStatus(): Promise<LocationStatus> {
  // Fast-fail if unsupported
  if (!("geolocation" in navigator)) {
    return { state: "unavailable", reason: "Geolocation not supported." };
  }

  // If Permissions API exists, check it (not perfect on iOS Safari, but safe)
  try {
    if ("permissions" in navigator && navigator.permissions?.query) {
      const p = await navigator.permissions.query({ name: "geolocation" });
      if (p.state === "denied") {
        return { state: "denied", reason: "Location permission denied." };
      }
    }
  } catch {
    // Ignore (Safari can be weird here)
  }

  try {
    const pos = await getCurrentPositionAsync();
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const nearest = matchNearestProperty(lat, lon);

    return {
      state: "ok",
      coords: {
        lat,
        lon,
        accuracyMeters: typeof pos.coords.accuracy === "number" ? pos.coords.accuracy : undefined
      },
      nearest
    };
} catch (e: unknown) {
  const code = getErrorNumber(e, "code");
  const message = getErrorString(e, "message");

  // Standard geolocation error codes: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
  if (code === 1) return { state: "denied", reason: "Location permission denied." };
  if (code === 2) return { state: "unavailable", reason: "Position unavailable." };
  if (code === 3) return { state: "error", reason: "Location request timed out." };

  return { state: "error", reason: message ?? "Unknown location error." };
}

}
