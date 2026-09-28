"use client";

import { useMutation } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

type PresignResponse = {
  key: string;
  presignedUrl: string;
  cdnUrl: string;
};

type PresignAndUploadParams = {
  filename: string;
  blob: Blob;
};

async function presignAndUploadToS3({
  filename,
  blob,
}: PresignAndUploadParams): Promise<{ key: string; cdnUrl: string }> {
  const response = await apiProxy.get<{ data: PresignResponse }>(
    "/user/presigned-upload-url",
    { params: { filename } },
  );

  const { key, presignedUrl, cdnUrl } = response.data.data;

  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": blob.type },
    body: blob,
  });

  if (!res.ok) throw new Error("S3 upload failed");

  return { key, cdnUrl };
}

export function usePresignAvatar() {
  return useMutation({
    mutationFn: presignAndUploadToS3,
  });
}
