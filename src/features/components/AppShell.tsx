import AuthStatusBanner from "../../auth/AuthStatusBanner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-slate-200">
      <AuthStatusBanner />
      {children}
    </div>
  );
}
