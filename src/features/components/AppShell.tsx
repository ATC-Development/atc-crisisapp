import AuthStatusBanner from "../../auth/AuthStatusBanner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-200">
      <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24">
        <AuthStatusBanner />
        {children}
      </div>
    </div>
  );
}
