"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultancyEditor } from "./consultancy-editor";
import { ConsultancyForm } from "./consultancy-form";
import { ConsultancySuccess } from "./consultancy-success";

export default function Consultancy() {
  return (
    <div className="relative mx-auto space-y-12 px-2 sm:px-4 pb-12 md:space-y-24 md:pb-24">
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Content Editor</TabsTrigger>
          <TabsTrigger value="form">Consultancy Form</TabsTrigger>
          <TabsTrigger value="success">Success Steps</TabsTrigger>
        </TabsList>

        {/* Content Editor Tab */}
        <TabsContent value="content">
          <ConsultancyEditor />
        </TabsContent>

        {/* Consultancy Form Tab */}
        <TabsContent value="form">
          <ConsultancyForm />
        </TabsContent>

        <TabsContent value="success">
          <ConsultancySuccess />
        </TabsContent>
      </Tabs>
    </div>
  );
}
