'use client';

import { useState } from 'react';
import axios from 'axios';
import { apiProxy } from '@/lib/api';

export type PresignedUrlResponse = {
  presignedUrl: string;
  key: string;
  cdnUrl: string;
};

export type UploadedEventFile = {
  filename: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
};

// 1. Fetch Presigned URL from Backend API
export const getPresignedUrl = async (fileName: string, folder = 'general'): Promise<PresignedUrlResponse> => {
  const response = await apiProxy.post('/etr/uploads/presigned-url', {
    fileName,
    folder,
  });
  const presignedData = response.data.data as PresignedUrlResponse;
  if (!presignedData || !presignedData.presignedUrl) {
    throw new Error(`Failed to get presigned URL for file: ${fileName}`);
  }
  return presignedData;
};

// 2. Put File directly to AWS S3
export const uploadToS3 = async (presignedUrl: string, file: File): Promise<void> => {
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
};

// 3. Process Single File Upload Flow
export const uploadSingleFile = async (file: File, folder = 'general'): Promise<UploadedEventFile> => {
  const presignedData = await getPresignedUrl(file.name, folder);
  await uploadToS3(presignedData.presignedUrl, file);
  return {
    filename: file.name,
    url: presignedData.cdnUrl || presignedData.key,
    key: presignedData.key,
    mimeType: file.type,
    size: file.size,
  };
};

// 4. Process Multiple Files Upload Flow
export const uploadMultipleFiles = async (files: File[], folder = 'general'): Promise<UploadedEventFile[]> => {
  const uploadPromises = files.map((file) => uploadSingleFile(file, folder));
  return Promise.all(uploadPromises);
};

// Hook for components needing loading/uploading state
export function useUploadEventFiles() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (files: File[], folder = 'general'): Promise<UploadedEventFile[]> => {
    setIsUploading(true);
    try {
      return await uploadMultipleFiles(files, folder);
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFiles, isUploading };
}
