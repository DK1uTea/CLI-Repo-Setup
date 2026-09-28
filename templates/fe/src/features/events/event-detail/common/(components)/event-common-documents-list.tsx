'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Empty, EmptyHeader, EmptyDescription, EmptyMedia } from '@/shared/components/ui/empty';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog';
import { Pagination } from '@/shared/components/ui/pagination';
import { ProofItemCard, ProofItemSkeleton, PROOF_SERVICES } from './event-common-proof-item';
import { useEventTasks } from '../(hooks)/use-event-tasks';
import { useDeleteEventTask } from '../(hooks)/use-delete-event-task';
import type { EventTask, EventTaskService, EventCommonNamespace } from '../(services)/event-common-service';

const TABS = [{ key: 'all', label: 'All' }, ...PROOF_SERVICES];
const PER_PAGE = 10;

type Props = {
  eventId: string;
  namespace: EventCommonNamespace;
  onScrollToUpload?: () => void;
};

export function EventCommonDocumentsList({ eventId, namespace, onScrollToUpload }: Props) {
  const t = useTranslations(namespace);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<EventTask | null>(null);
  const service = activeTab !== 'all' ? activeTab as EventTaskService : undefined;
  const { data, isFetching } = useEventTasks({ eventId, page, limit: PER_PAGE, service });
  const deleteTask = useDeleteEventTask();
  const tasks = data?.tasks ?? [];
  const totalPages = data?.pagination?.totalPages ?? 0;

  useEffect(() => {
    setPage(1);
  }, [activeTab, eventId]);

  const onDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteTask.mutateAsync({ eventId, taskId: target.id });
    } catch {
      // interceptor handles error toast
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="justify-start">
          {TABS.map((tab) => <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {isFetching && tasks.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => <ProofItemSkeleton key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <Empty>
          <EmptyMedia>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={t('proofOfPerformance')}
              onClick={onScrollToUpload}
              className="size-16 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-500"
            >
              <Download className="size-12" />
            </Button>
          </EmptyMedia>
          <EmptyHeader><EmptyDescription className="text-sm">{t('noProofs')}</EmptyDescription></EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => <ProofItemCard key={task.id} task={task} namespace={namespace} onDelete={setDeleteTarget} />)}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={isFetching}
          className="justify-end"
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent onClose={() => setDeleteTarget(null)}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteProof')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteProofDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDeleteConfirm}>{t('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
