"use client";

import * as React from "react";
import { Home, User, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const items = [
    {
      title: "Layout Settings",
      url: "/cms/settings",
      icon: Settings,
      isActive: pathname === "/cms/settings",
    },
    {
      title: "Home",
      url: "/cms/home",
      icon: Home,
      isActive: pathname === "/cms/home",
    },
    {
      title: "About Me",
      url: "/cms/about",
      icon: User,
      isActive: pathname === "/cms/about",
    },
  ];

  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarHeader>
        <h2 className="text-lg font-semibold">CMS</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
