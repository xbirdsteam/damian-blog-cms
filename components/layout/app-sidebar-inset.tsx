"use client";

import { Button } from "@/components/ui/button";
import { MoveUpRight } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function AppSidebarInset() {
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case "/cms/settings":
        return "Layout Settings";
      case "/cms/home":
        return "Home Page";
      case "/cms/about":
        return "About Me";
      case "/cms/posts":
        return "Posts";
      default:
        return "Dashboard";
    }
  };

  return (
    <SidebarInset className="min-h-0 flex-none">
      <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
      </header>
    </SidebarInset>
  );
}
