'use client';

import { useMutation } from '@tanstack/react-query';
import { apiProxy } from '@/lib/api';

type PresignedUploadUrl = {
  key: string;
  presignedUrl: string;
  cdnUrl: string;
};

async function getPresignedUploadUrl(filename: string) {
  const { data } = await apiProxy.get<{ data: PresignedUploadUrl }>('/cam/activations/presigned-upload-url', {
    params: { filename },
  });
  return data.data;
}

async function uploadFileToPresignedUrl(file: File) {
  const { key, presignedUrl, cdnUrl } = await getPresignedUploadUrl(file.name);

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) throw new Error('Upload failed');

  return { key, cdnUrl };
}

export function usePresignedUpload() {
  return useMutation({
    mutationFn: (file: File) => uploadFileToPresignedUrl(file),
  });
}
