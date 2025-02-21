"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar";
import { Briefcase, FileText, Home, LogOut, MessageSquare, Settings, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const items = [
    {
      title: "Layout Settings",
      url: "/settings", 
      icon: Settings,
      isActive: pathname === "/settings",
    },
    {
      title: "Home",
      url: "/home",
      icon: Home,
      isActive: pathname === "/home",
    },
    {
      title: "About Me",
      url: "/about",
      icon: User,
      isActive: pathname === "/about",
    },
    {
      title: "Posts",
      url: "/posts",
      icon: FileText,
      isActive: pathname === "/posts",
    },
    {
      title: "Comments",
      url: "/comments",
      icon: MessageSquare,
      isActive: pathname === "/comments",
    },
    {
      title: "Leads",
      url: "/leads",
      icon: UserPlus,
      isActive: pathname === "/leads",
    },
    {
      title: "Consultancy",
      url: "/consultancy",
      icon: Briefcase,
      isActive: pathname === "/consultancy",
    },
    {
      title: "Users",
      url: "/users",
      icon: User,
      isActive: pathname === "/users",
    },
  ];

  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarGroupContent className="pt-10 flex flex-col h-full">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    className={`hover:bg-accent ${
                      item.isActive ? "bg-accent" : ""
                    }`}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <SidebarMenu className="mt-auto pb-6">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
