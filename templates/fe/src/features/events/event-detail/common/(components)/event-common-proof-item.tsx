'use client';

import Image from 'next/image';
import { FileTextIcon, Trash2Icon, MessageSquareIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { dayjs, formatDate } from '@/lib/date-utils';
import { isProofImageFile, toProofFiles } from '../(helpers)/event-common-proof-files';
import { useDateFormat } from '@/shared/stores/use-user-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ComponentGuard } from '@/shared/components/common/component-guard';
import { EVENT_COMMON_MANAGE_FILES_PERMISSION } from '../(helpers)/event-common-permissions';
import { EventCommonProofFiles } from './event-common-proof-files';
import type { EventTask, EventCommonNamespace } from '../(services)/event-common-service';

export const PROOF_SERVICES = [
  { key: 'AUFBAU', label: 'Aufbau' },
  { key: 'ABBAU', label: 'Abbau' },
  { key: 'DEFEKT', label: 'Defekt' },
  { key: 'OTHER', label: 'Other' },
];

export function ProofItemSkeleton() {
  return (
    <div className="flex items-center gap-6 w-full bg-muted rounded-lg p-5">
      <Skeleton className="size-12 shrink-0 rounded" />
      <div className="flex-1 grid grid-cols-[1fr_auto] items-center gap-x-6">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-44 rounded" />
        </div>
        <div className="flex items-center gap-2 w-75">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4">
        <Skeleton className="size-6 rounded" />
      </div>
    </div>
  );
}

type ProofItemCardProps = {
  task: EventTask;
  namespace: EventCommonNamespace;
  onDelete: (t: EventTask) => void;
};

export function ProofItemCard({ task, namespace, onDelete }: ProofItemCardProps) {
  const t = useTranslations(namespace);
  const dateFormat = useDateFormat();
  const files = toProofFiles(task.files);
  const firstImage = files.find((file) => isProofImageFile(file.name) || isProofImageFile(file.url));
  const author = task.createdBy;
  const authorName = author?.name ?? '';
  const initials = authorName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const date = formatDate(task.createdAt, dateFormat);
  const time = dayjs.utc(task.createdAt).format('HH:mm');
  const serviceLabel = PROOF_SERVICES.find((s) => s.key === task.service)?.label;

  return (
    <div className="flex items-start gap-6 w-full bg-background rounded-lg p-5">
      <div className="size-12 shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-muted">
        {firstImage ? (
          <Image src={firstImage.url} alt="" width={48} height={48} className="size-full object-cover" />
        ) : files.length > 0 ? (
          <FileTextIcon aria-hidden="true" strokeWidth={1.5} className="size-5 text-muted-foreground opacity-70" />
        ) : (
          <MessageSquareIcon aria-hidden="true" className="size-5 text-muted-foreground opacity-70" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-x-6 lg:gap-y-2">
        <div className="flex min-w-0 flex-col items-start gap-1">
          {serviceLabel && (
            <span
              className="inline-flex h-5 items-center rounded bg-muted px-2 text-xs font-medium leading-none"
              translate="no"
            >
              {serviceLabel}
            </span>
          )}
          <EventCommonProofFiles files={files} namespace={namespace} />
          {files.length === 0 && task.comment && (
            <p className="px-2 text-xs text-muted-foreground" translate="no">{task.comment}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:w-75">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={author?.avatar ?? undefined} />
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col" translate="no">
            <span className="text-sm font-semibold truncate">{authorName}</span>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>{date}</span>
              <span className="border-l border-border h-3 mx-2" />
              <span>{time}</span>
            </div>
          </div>
        </div>

        {files.length > 0 && task.comment && (
          <>
            <div className="border-t border-border w-full col-span-full" />
            <p className="text-xs text-muted-foreground col-span-full">{task.comment}</p>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 px-4 text-muted-foreground">
        <ComponentGuard requiredKeys={EVENT_COMMON_MANAGE_FILES_PERMISSION[namespace]}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('deleteProof')}
            disabled={!task.canDelete}
            onClick={() => onDelete(task)}
            className="hover:text-destructive disabled:opacity-25"
          >
            <Trash2Icon className="size-5" />
          </Button>
        </ComponentGuard>
      </div>
    </div>
  );
}
