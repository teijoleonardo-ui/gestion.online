import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardMain } from "@/components/layout/dashboard-main";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <DashboardMain>{children}</DashboardMain>
    </div>
  );
}
