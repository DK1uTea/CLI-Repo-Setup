'use client';

import { useState } from 'react';
import axios from 'axios';
import { useCreatePresignedUrls } from './use-create-presigned-urls';

export type UploadedAttachment = {
  filename: string;
  url: string; // This is the S3 key
  mimeType: string;
  size: number;
};

export function useUploadAttachments() {
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: createPresignedUrls } = useCreatePresignedUrls();

  const uploadFiles = async (files: File[]): Promise<UploadedAttachment[]> => {
    setIsUploading(true);
    try {
      const payload = files.map((file) => ({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      }));

      const presignedUrls = await createPresignedUrls(payload);

      const uploadPromises = files.map(async (file, index) => {
        const matchedPresigned = presignedUrls[index];

        if (!matchedPresigned) {
          throw new Error(`Failed to get presigned URL for file: ${file.name}`);
        }

        // Upload directly to S3 via PUT.
        await axios.put(matchedPresigned.presignedUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
        });

        return {
          filename: file.name,
          url: matchedPresigned.key, // S3 key
          mimeType: file.type,
          size: file.size,
        };
      });

      return await Promise.all(uploadPromises);
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFiles, isUploading };
}
