import { AppSidebar } from "@/components/layout/app-sidebar";
import AppSidebarInset from "@/components/layout/app-sidebar-inset";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function CMSLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppSidebarInset />
          <main className="relative flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
