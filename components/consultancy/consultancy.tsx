"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultancyEditor } from "./consultancy-editor";
import { ConsultancyForm } from "./consultancy-form";
import { ConsultancySuccess } from "./consultancy-success";

export default function Consultancy() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Consultancy Page</h1>
        <p className="text-muted-foreground">
          Manage your consultancy page content and forms
        </p>
      </div>

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
