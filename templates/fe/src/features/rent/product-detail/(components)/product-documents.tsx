'use client';

import Image from 'next/image';
import { DownloadIcon, FileTextIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useProductDocuments } from '../(hooks)/use-product-documents';
import type { ProductDocument } from '../(hooks)/use-product-documents';

const DOCUMENT_GROUPS = [
  { bucket: 'instructions', titleKey: 'assemblyInstructions' },
  { bucket: 'manufacturer', titleKey: 'manufacturerData' },
] as const;

type Props = {
  sku: string;
};

function isImageDocument(document: ProductDocument) {
  return document.fileType.startsWith('image/');
}

function ProductDocumentsSkeleton({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label={loadingLabel}>
      {DOCUMENT_GROUPS.map((group) => (
        <div key={group.bucket} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

async function downloadProductDocument(file: ProductDocument) {
  const downloadUrl =
    `/api/proxy-download?url=${encodeURIComponent(file.url)}` +
    `&filename=${encodeURIComponent(file.fileName)}`;
  const response = await fetch(downloadUrl);
  if (!response.ok) throw new Error('Failed to download file');

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = window.document.createElement('a');
  link.href = objectUrl;
  link.download = file.fileName;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function ProductDocumentItem({ file, downloadLabel }: { file: ProductDocument; downloadLabel: string }) {
  const isImage = isImageDocument(file);

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={downloadLabel}
      onClick={() => {
        void downloadProductDocument(file).catch(() => undefined);
      }}
      className="group h-auto min-h-16 w-full justify-between rounded-lg border border-border bg-transparent px-4 py-2.5 text-left text-sm font-normal hover:border-primary hover:bg-transparent"
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {isImage ? (
            <Image src={file.url} alt="" width={44} height={44} className="size-full object-cover" />
          ) : (
            <FileTextIcon aria-hidden="true" className="size-5 text-muted-foreground" strokeWidth={1.5} />
          )}
        </span>
        <span className="truncate text-foreground transition-colors group-hover:text-primary" translate="no">
          {file.fileName}
        </span>
      </span>
      <DownloadIcon aria-hidden="true" className="shrink-0 text-primary" data-icon="inline-end" />
    </Button>
  );
}

export function ProductDocuments({ sku }: Props) {
  const t = useTranslations('common');
  const { data, isLoading } = useProductDocuments(sku);
  const documents = Array.isArray(data) ? data : [];

  if (isLoading) return <ProductDocumentsSkeleton loadingLabel={t('productDocuments.loading')} />;

  return (
    <div className="flex flex-col gap-6">
      {DOCUMENT_GROUPS.map((group) => {
        const groupDocuments = documents.filter((document) => document.bucket === group.bucket);

        return (
          <section key={group.bucket} className="flex flex-col gap-3" aria-labelledby={`product-documents-${group.bucket}`}>
            <h2 id={`product-documents-${group.bucket}`} className="text-sm font-semibold">
              {t(`productDocuments.${group.titleKey}`)}
            </h2>
            {groupDocuments.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t('productDocuments.noDocumentsAvailable')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {groupDocuments.map((document) => (
                  <ProductDocumentItem
                    key={`${document.bucket}-${document.url}`}
                    file={document}
                    downloadLabel={t('productDocuments.downloadDocument', { name: document.fileName })}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
