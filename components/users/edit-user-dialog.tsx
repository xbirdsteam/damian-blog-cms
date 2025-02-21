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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User, userService } from "@/services/user-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { uploadImage, deleteFile, getPathFromUrl } from "@/services";

const formSchema = z.object({
  fullname: z.string().min(1, "Name is required"),
  avatar_url: z.string().optional(),
});

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: user?.fullname || "",
      avatar_url: user?.avatar_url || "",
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        fullname: user.fullname || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user, form]);

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

      // Delete old image if exists
      const oldImageUrl = form.getValues("avatar_url");
      if (oldImageUrl) {
        const oldImagePath = getPathFromUrl(oldImageUrl, 'images');
        if (oldImagePath) {
          await deleteFile(oldImagePath, 'images');
        }
      }

      // Upload new image
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
    if (!user?.id) return;

    try {
      setIsSaving(true);
      await userService.updateUser(user.id, values);
      toast.success("User updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update user");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Email cannot be changed
              </FormDescription>
            </FormItem>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSaving || isUploading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 