"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Briefcase, FileText, Home, Settings, User, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

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
    {
      title: "Posts",
      url: "/cms/posts",
      icon: FileText,
      isActive: pathname === "/cms/posts",
    },
    {
      title: "Post Comments",
      url: "/cms/comments",
      icon: MessageSquare,
      isActive: pathname === "/cms/comments",
    },
    {
      title: "Consultancy",
      url: "/cms/consultancy",
      icon: Briefcase,
      isActive: pathname === "/cms/consultancy",
    },
  ];

  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-10">
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
