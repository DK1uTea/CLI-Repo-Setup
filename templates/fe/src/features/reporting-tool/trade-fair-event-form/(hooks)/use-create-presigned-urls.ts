'use client';

import { useMutation } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";

export type PresignedUrlFilePayload = {
  fileName: string;
  contentType: string;
  fileSize: number;
};

export type PresignedUrlItem = {
  key: string;
  presignedUrl: string;
  cdnUrl: string;
};

export type PresignedUrlsResponse = {
  items: PresignedUrlItem[];
};

const createPresignedUrls = async (files: PresignedUrlFilePayload[]): Promise<PresignedUrlItem[]> => {
  const response = await apiProxy.post("tf/events/presigned-urls", { files });
  const data = response.data.data as PresignedUrlsResponse;
  return data?.items ?? [];
};

export const useCreatePresignedUrls = () => {
  return useMutation({
    mutationFn: (files: PresignedUrlFilePayload[]) => createPresignedUrls(files),
  });
};
