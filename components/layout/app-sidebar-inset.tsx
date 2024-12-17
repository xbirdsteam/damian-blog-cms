"use client";

import { Button } from "@/components/ui/button";
import { MoveUpRight } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppSidebarInset() {
  return (
    <SidebarInset className="min-h-0 flex-none">
      <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <h2 className="text-lg font-semibold">About Me</h2>
        <div className="ml-auto">
          <Button className="gap-2">
            <MoveUpRight className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </header>
    </SidebarInset>
  );
}
