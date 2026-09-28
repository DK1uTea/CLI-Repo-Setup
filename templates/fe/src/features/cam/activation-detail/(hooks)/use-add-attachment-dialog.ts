'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { usePresignedUpload } from '../../(hooks)/use-presigned-upload';
import { useAddAttachmentMedia, AttachmentMediaType } from './use-add-attachment-media';

type MarketType = 'AH' | 'H';

type PendingFile = {
  file: File;
  marketType: MarketType;
  preview: string;
};

const MARKET_TYPE_TO_MEDIA_TYPE: Record<MarketType, AttachmentMediaType> = {
  AH: 'ahMarketMediaUrls',
  H: 'aMarketMediaUrls',
};

export function useAddAttachmentDialog(activationId: string, onSaved: () => void) {
  const t = useTranslations('activationView');
  const [marketType, setMarketType] = useState<MarketType>('AH');
  const [files, setFiles] = useState<PendingFile[]>([]);
  const { mutateAsync: uploadFile, isPending: isUploading } = usePresignedUpload();
  const { mutateAsync: addAttachmentMedia, isPending: isSaving } = useAddAttachmentMedia(activationId);

  const addFiles = (accepted: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...accepted.map((file) => ({ file, marketType, preview: URL.createObjectURL(file) })),
    ]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const reset = () => {
    files.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setMarketType('AH');
    setFiles([]);
  };

  const save = async () => {
    if (files.length === 0) return;

    const uploaded = await Promise.all(
      files.map(async ({ file, marketType }) => ({
        marketType,
        key: (await uploadFile(file)).key,
      }))
    );

    const keysByMarketType = uploaded.reduce(
      (acc, { marketType, key }) => {
        acc[marketType] = [...(acc[marketType] ?? []), key];
        return acc;
      },
      {} as Record<MarketType, string[]>
    );

    await Promise.all(
      Object.entries(keysByMarketType).map(([type, keys]) =>
        addAttachmentMedia({ type: MARKET_TYPE_TO_MEDIA_TYPE[type as MarketType], urls: keys })
      )
    );

    toast.success(t('drawer.addAttachmentDialog.uploadSuccess'));
    reset();
    onSaved();
  };

  return {
    marketType,
    setMarketType,
    files,
    addFiles,
    removeFile,
    save,
    reset,
    isPending: isUploading || isSaving,
  };
}
