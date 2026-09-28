'use client';

import Image from 'next/image';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { DownloadIcon, FileIcon, FolderOpenIcon } from 'lucide-react';
import { downloadFile } from '@/lib/download-file';
import type { EventFormDto } from '../../../(helpers)/event-form-schema';
import type { ImageFile } from '@/shared/components/ui/upload-dropzone';
import { Button } from '@/shared/components/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/shared/components/ui/empty';

const IMAGE_EXTENSION_PATTERN = /\.(gif|heic|heif|jpe?g|png|webp)$/i;

function isImageFile(file: ImageFile) {
  if (file.file) return file.file.type.startsWith('image/');
  return IMAGE_EXTENSION_PATTERN.test(file.name) || IMAGE_EXTENSION_PATTERN.test(file.preview);
}

function FileGroup({ title, files }: { title: string; files: ImageFile[] }) {
  if (!files.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-2 pl-4">
        {files.map((file) => {
          const source = file.url ?? file.preview;
          const isImage = isImageFile(file);
          return (
            <Button
              key={file.name}
              type="button"
              variant="outline"
              aria-label={file.name}
              onClick={() => downloadFile(source, file.name)}
              className="h-40 w-60 gap-2 overflow-hidden rounded-xl px-3 py-1.5 text-xs"
            >
              {isImage ? (
                <Image
                  src={source}
                  alt={file.name}
                  width={176}
                  height={128}
                  className="h-32 w-44 rounded-lg object-cover"
                />
              ) : (
                <>
                  <FileIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate" translate="no">{file.name}</span>
                </>
              )}
              {!isImage && <DownloadIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function SummaryFilesSection() {
  const t = useTranslations('eventForm');
  const { control } = useFormContext<EventFormDto>();
  const values = useWatch({ control }) as Partial<EventFormDto>;

  const groups = [
    { title: t('logistics.accessPermits'), files: (values.accessPermit as ImageFile[]) ?? [] },
    { title: t('logistics.certifications'), files: (values.certifications as ImageFile[]) ?? [] },
    { title: t('logistics.uploadDocuments'), files: (values.eventDocuments as ImageFile[]) ?? [] },
    { title: t('logistics.venueLayouts'), files: (values.venueLayouts as ImageFile[]) ?? [] },
    { title: t('helpingHands.assemblyPlanTitle'), files: (values.assemblyPlanograms as ImageFile[]) ?? [] },
  ].filter((g) => g.files.length > 0);

  if (groups.length === 0) {
    return (
      <Empty>
        <EmptyMedia>
          <FolderOpenIcon className="size-24 text-primary opacity-40" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t('summary.noFiles')}</EmptyTitle>
          <EmptyDescription>{t('summary.noFilesDescription')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <FileGroup key={g.title} title={g.title} files={g.files} />
      ))}
    </div>
  );
}
