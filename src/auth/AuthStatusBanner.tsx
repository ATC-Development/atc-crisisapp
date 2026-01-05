import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";

export default function AuthStatusBanner() {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const handleLogin = async () => {
    await instance.loginRedirect(loginRequest);
  };

  const handleLogout = async () => {
    if (!account) return;
    await instance.logoutRedirect({
      account,
      postLogoutRedirectUri: window.location.origin,
    });
  };

  // Compact floating pill (doesn't consume layout space)
  return (
    <div className="fixed right-3 top-3 z-50">
      {account ? (
        <div className="flex items-center gap-2 rounded-full border border-white/30 bg-black/55 px-3 py-2 text-xs text-white shadow-lg backdrop-blur">
          <div className="max-w-[160px] truncate">{account.name}</div>

          <button
            onClick={handleLogout}
            className="rounded-full bg-white/15 px-2 py-1 hover:bg-white/25"
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
