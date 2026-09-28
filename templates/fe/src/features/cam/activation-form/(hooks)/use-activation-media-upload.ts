"use client";

import { useState } from "react";
import { apiProxy } from "@/lib/api";

type PresignedResponse = {
  key: string;
  presignedUrl: string;
  cdnUrl: string;
};

export type UploadedActivationMedia = {
  key: string;
  cdnUrl: string;
};

async function presignAndUpload(file: File): Promise<UploadedActivationMedia> {
  const { data } = await apiProxy.get<{ data: PresignedResponse }>(
    "/cam/activations/presigned-upload-url",
    {
      params: { filename: file.name },
    },
  );
  const { key, presignedUrl, cdnUrl } = data.data;

  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) throw new Error("Upload failed");

  return { key, cdnUrl };
}

export function useActivationMediaUpload() {
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: File[]): Promise<UploadedActivationMedia[]> {
    if (!files.length) return [];
    setUploading(true);
    try {
      return await Promise.all(files.map(presignAndUpload));
    } finally {
      setUploading(false);
    }
  }

  return { uploadFiles, isUploading: uploading };
}
