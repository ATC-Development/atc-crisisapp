const APP_VERSION = __APP_VERSION__;

export function checkAppVersion() {
  const storedVersion = localStorage.getItem('appVersion');

  if (storedVersion && storedVersion !== APP_VERSION) {
    localStorage.setItem('appVersion', APP_VERSION);

    if (!sessionStorage.getItem('justReloaded')) {
      sessionStorage.setItem('justReloaded', 'true');
      window.location.reload();
    }
  } else {
    localStorage.setItem('appVersion', APP_VERSION);
    sessionStorage.removeItem('justReloaded');
  }
}
