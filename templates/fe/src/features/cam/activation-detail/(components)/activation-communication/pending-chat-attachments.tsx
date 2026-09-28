'use client';

import { FileTextIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ChatAttachment } from '../../(helpers)/chat-attachment-utils';
import { Button } from '@/shared/components/ui/button';

type Props = {
  attachments: ChatAttachment[];
  onRemove: (id: string) => void;
  disabled?: boolean;
};

export function PendingChatAttachments({ attachments, onRemove, disabled }: Props) {
  const t = useTranslations('activationView.communication');

  return (
    <div className="flex flex-wrap gap-2 px-3 pt-3">
      {attachments.map((attachment) => (
        attachment.kind === 'image' ? (
          <div key={attachment.id} className="group relative size-16 shrink-0">
            <img
              src={attachment.src}
              alt={attachment.fileName}
              className="size-full rounded-md object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              disabled={disabled}
              aria-label={t('removeAttachment', { fileName: attachment.fileName })}
              onClick={() => onRemove(attachment.id)}
              className="absolute -right-1 -top-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            >
              <XIcon aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <div key={attachment.id} className="flex h-16 min-w-48 max-w-64 items-center gap-2 rounded-md border border-border px-2">
            <FileTextIcon aria-hidden="true" className="shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={attachment.fileName}>{attachment.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {t('fileType', { type: attachment.fileName.split('.').pop()?.toUpperCase() ?? '' })}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={disabled}
              aria-label={t('removeAttachment', { fileName: attachment.fileName })}
              onClick={() => onRemove(attachment.id)}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </div>
        )
      ))}
    </div>
  );
}
