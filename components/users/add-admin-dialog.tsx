"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth-service";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { uploadImage } from "@/services";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullname: z.string().min(1, "Name is required"),
  avatar_url: z.string().optional(),
});

interface AddAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddAdminDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAdminDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullname: "",
      avatar_url: "",
    },
  });

  // Cleanup preview URL when dialog closes
  useEffect(() => {
    if (!open && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  }, [open, previewUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create and set preview immediately
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Start upload
      setIsUploading(true);
      const imageUrl = await uploadImage(file, 'avatars');
      
      // Set the actual URL after successful upload
      form.setValue("avatar_url", imageUrl, { shouldDirty: true });
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
      // Clear preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsCreating(true);
      
      // Sign up the user and get the user data
      const { user } = await authService.signUp(values.email, values.password);
      
      if (!user?.id) {
        throw new Error("Failed to create user authentication");
      }

      // Create user record with the auth user id
      const supabase = createClient();
      await supabase.from('users').insert({
        id: user.id,
        email: values.email,
        fullname: values.fullname,
        avatar_url: values.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast.success("Admin user created successfully");
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create admin user");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Admin User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
            {/* Avatar Upload */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center space-y-4">
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24 border">
                        <AvatarImage src={previewUrl || field.value || ""} />
                        <AvatarFallback className="text-2xl bg-primary/10">
                          {form.watch("fullname")?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="avatar-upload"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("avatar-upload")?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              {field.value ? "Change Avatar" : "Upload Avatar"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      autoComplete="new-email"
                      placeholder="Enter email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password" 
                      autoComplete="new-password"
                      placeholder="Enter password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter full name"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Admin'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 