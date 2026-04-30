import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardMain } from "@/components/layout/dashboard-main";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="box-border flex h-dvh max-h-dvh min-h-0 overflow-hidden pt-[env(safe-area-inset-top,0px)]">
      <AppSidebar />
      <DashboardMain>{children}</DashboardMain>
    </div>
  );
}
