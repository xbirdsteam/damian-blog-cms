/* eslint-disable @typescript-eslint/no-empty-object-type */
import { createClient } from '@/utils/supabase/client';
import * as React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

export interface UploadedFile {
  key: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
}

const supabase = createClient();

export function useUploadFile({
  onUploadComplete,
  onUploadError,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadToSupabase(file: File) {
    setIsUploading(true);
    setUploadingFile(file);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('post_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post_images')
        .getPublicUrl(filePath);

      const uploadedFile: UploadedFile = {
        key: fileName,
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
      };

      setUploadedFile(uploadedFile);
      setProgress(100);
      onUploadComplete?.(uploadedFile);

      return uploadedFile;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const message = errorMessage.length > 0
        ? errorMessage
        : 'Something went wrong, please try again later.';

      toast.error(message);
      onUploadError?.(error);

      // For development/testing: return a mock file URL if upload fails
      if (process.env.NODE_ENV === 'development') {
        const mockFile = {
          key: 'mock-key-0',
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
        } as UploadedFile;

        setUploadedFile(mockFile);
        return mockFile;
      }

      return null;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadFile: uploadToSupabase,
    uploadedFile,
    uploadingFile,
  };
}

export function getErrorMessage(err: unknown) {
  const unknownError = 'Something went wrong, please try again later.';

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message;
    });
    return errors.join('\n');
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);
  return toast.error(errorMessage);
}
