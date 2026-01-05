type VersionCheckOptions = {
  onUpdateNeeded?: () => void;
  timeoutMs?: number;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("version check timeout")), timeoutMs);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export async function checkAppVersion(opts: VersionCheckOptions = {}) {
  const { onUpdateNeeded, timeoutMs = 2500 } = opts;

  // If browser thinks it’s offline, don’t even try.
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  try {
    const url = `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`;

    const res = await withTimeout(
      fetch(url, { cache: "no-store" }),
      timeoutMs
    );

    if (!res.ok) return;

    const data = (await res.json()) as { version?: string };
    const remote = data?.version;
    const local = __APP_VERSION__;

    if (!remote || !local) return;

    if (remote !== local) {
      console.log(`Version mismatch. Local=${local}, Remote=${remote}`);
      onUpdateNeeded?.();
    }
  } catch {
    // Offline / captive portal / slow network / DNS issues:
    // do nothing so app continues working.
    return;
  }
}
