'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileTextIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { MediaLightbox } from '@/shared/components/ui/media-lightbox';
import { isProofImageFile, type ProofFile } from '../(helpers)/event-common-proof-files';
import type { EventCommonNamespace } from '../(services)/event-common-service';

type Props = {
  files: ProofFile[];
  namespace: EventCommonNamespace;
};

export function EventCommonProofFiles({ files, namespace }: Props) {
  const t = useTranslations(namespace);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const imageFiles = files.filter((file) => isProofImageFile(file.name) || isProofImageFile(file.url));

  if (files.length === 0) return null;

  const preview = (file: ProofFile) => {
    const isImage = isProofImageFile(file.name) || isProofImageFile(file.url);
    if (!isImage) {
      window.open(file.url, '_blank', 'noopener,noreferrer');
      return;
    }

    const nextIndex = imageFiles.findIndex((item) => item.url === file.url);
    setGalleryIndex(nextIndex >= 0 ? nextIndex : 0);
    setGalleryOpen(true);
  };

  return (
    <>
      <ul className="flex w-full min-w-0 flex-col self-stretch">
        {files.map((file, index) => {
          const isImage = isProofImageFile(file.name) || isProofImageFile(file.url);
          return (
            <li
              key={`${file.url}-${file.name}`}
              className={index > 0 ? 'border-t border-border hover:rounded-md hover:bg-card' : 'hover:rounded-md hover:bg-card'}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => preview(file)}
                aria-label={t('previewDocument', { name: file.name })}
                className="h-auto w-full justify-start gap-2 rounded-none border-0 px-2 py-1.5 text-sm text-muted-foreground hover:bg-transparent hover:text-muted-foreground dark:hover:bg-transparent"
              >
                {isImage ? (
                  <Image
                    src={file.url}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 shrink-0 rounded-sm object-cover"
                  />
                ) : (
                  <FileTextIcon
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-5 shrink-0 text-muted-foreground opacity-70"
                  />
                )}
                <span className="truncate font-normal" translate="no">{file.name}</span>
              </Button>
            </li>
          );
        })}
      </ul>
      <MediaLightbox
        items={imageFiles.map((file) => ({ src: file.url, alt: file.name }))}
        index={galleryIndex}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />
    </>
  );
}
