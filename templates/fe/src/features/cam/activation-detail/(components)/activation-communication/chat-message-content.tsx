'use client';

import { DownloadIcon, FileTextIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { parseChatContent } from '../../(helpers)/chat-attachment-utils';
import { sanitizeHtmlForEditor } from '@/lib/html-utils';
import { downloadFile } from '@/lib/download-file';
import { Button } from '@/shared/components/ui/button';
import { MediaLightbox } from '@/shared/components/ui/media-lightbox';

type Props = {
  content: string;
};

export function ChatMessageContent({ content }: Props) {
  const t = useTranslations('activationView.communication');
  const parsed = parseChatContent(content);
  const images = parsed.attachments.filter((attachment) => attachment.kind === 'image');
  const documents = parsed.attachments.filter((attachment) => attachment.kind === 'document');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openImage = (id: string) => {
    setLightboxIndex(Math.max(0, images.findIndex((image) => image.id === id)));
    setLightboxOpen(true);
  };

  return (
    <>
      {images.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {images.map((image) => (
            <div key={image.id} className="group relative size-16 shrink-0">
              <button
                type="button"
                aria-label={t('previewAttachment', { fileName: image.fileName })}
                onClick={() => openImage(image.id)}
                className="size-full rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <img src={image.src} alt="" className="size-full rounded-md object-cover" />
              </button>
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                aria-label={t('downloadAttachment', { fileName: image.fileName })}
                onClick={() => downloadFile(image.src, image.fileName)}
                className="absolute right-1 top-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              >
                <DownloadIcon aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className="mb-2 flex flex-col gap-2">
          {documents.map((document) => (
            <Button
              key={document.id}
              type="button"
              variant="outline"
              size="default"
              aria-label={t('downloadAttachment', { fileName: document.fileName })}
              onClick={() => downloadFile(document.src, document.fileName)}
              className="w-full justify-start"
            >
              <FileTextIcon aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-left">{document.fileName}</span>
              <span className="text-muted-foreground">
                {t('fileType', { type: document.fileName.split('.').pop()?.toUpperCase() ?? '' })}
              </span>
              <DownloadIcon aria-hidden="true" />
            </Button>
          ))}
        </div>
      )}

      <div
        className="prose prose-sm max-w-none text-sm text-foreground [&_p]:my-1"
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlForEditor(parsed.content) }}
      />
      <MediaLightbox
        items={images.map((image) => ({ src: image.src, alt: image.fileName }))}
        index={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}
