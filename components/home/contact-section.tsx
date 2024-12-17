/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { useHomeSettings } from "@/hooks/use-home-settings";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormValues } from "./types";

interface ContactSectionProps {
  form: UseFormReturn<FormValues>;
}

export function ContactSection({ form }: ContactSectionProps) {
  const { data, isSaving, handleSectionUpdate } = useHomeSettings();
  const [updatingSection, setUpdatingSection] = useState<boolean>(false);

  const isContactFormDirty = () => {
    const dirtyFields = form.formState.dirtyFields;

    return !!(
      dirtyFields.contact?.title ||
      dirtyFields.contact?.description ||
      dirtyFields.contact?.receiver_email ||
      dirtyFields.contact?.industries
    );
  };

  const handleContactUpdate = async () => {
    if (!data?.id || !isContactFormDirty()) return;

    try {
      setUpdatingSection(true);

      const contactData = form.getValues("contact");

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactData.receiver_email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Ensure industries is an array
      const industries = Array.isArray(contactData.industries)
        ? contactData.industries
        : [];

      await handleSectionUpdate(data.id, "contact", {
        contact_title: contactData.title,
        contact_description: contactData.description,
        contact_receiver_email: contactData.receiver_email,
        contact_industries: industries,
      });

      // Reset form with current values to clear dirty state
      form.reset(form.getValues());
      toast.success("Contact section updated successfully");
    } catch (error) {
      console.error("Failed to update Contact section:", error);
      toast.error("Failed to update Contact section");
    } finally {
      setUpdatingSection(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Contact Form Settings</CardTitle>
          <CardDescription>Configure your contact form section</CardDescription>
        </div>
        <Button
          type="button"
          onClick={handleContactUpdate}
          disabled={!isContactFormDirty() || isSaving || updatingSection}
        >
          {updatingSection ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Section"
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="contact.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter contact section title"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter contact section description"
                  {...field}
                  disabled={isSaving}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.receiver_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receiver Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter receiver email address"
                  {...field}
                  disabled={isSaving}
                />
              </FormControl>
              <FormDescription>
                Contact form submissions will be sent to this email address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="contact.industries"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Industry Options</FormLabel>
                </div>
                <FormControl>
                  <TagInput
                    placeholder="Type an industry and press Enter..."
                    tags={field.value}
                    setTags={(newTags) => field.onChange(newTags)}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormDescription>
                  Type an industry name and press Enter to add it to the list.
                  These options will appear in the industry dropdown of the
                  contact form.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
