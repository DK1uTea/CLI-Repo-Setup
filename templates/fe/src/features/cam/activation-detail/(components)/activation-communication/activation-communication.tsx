'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { ArrowUpIcon, MessageSquareIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/components/ui/empty';
import { useChatSocket } from '../../(hooks)/use-chat-socket';
import { useGetActivationParticipants } from '../../(hooks)/use-get-activation-participants';
import ChatComposer from './chat-composer';
import ChatMessageItem from './chat-message-item';

type Props = {
  activationId: string;
};

const ActivationCommunication = ({ activationId }: Props) => {
  const t = useTranslations('activationView');
  const {
    messages, hasMore, hasMoreAfter, isConnected, isLoading, isLoadingMore, jumpTargetId,
    sendMessage, editMessage, loadMore, jumpToMessage, clearJump,
  } = useChatSocket(activationId);

  const { data: participantsData } = useGetActivationParticipants({ activationId });
  const participants = participantsData?.items ?? [];

  const [jumpToMessageId, setJumpToMessageId] = useQueryState('jump_to_message', parseAsString);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const loadCooldownRef = useRef(false);

  const flashHighlight = (id: string) => {
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 2500);
  };

  // Jump to message from a notification link — wait for the socket to connect first.
  useEffect(() => {
    if (jumpToMessageId && isConnected) jumpToMessage(jumpToMessageId);
  }, [jumpToMessageId, isConnected, jumpToMessage]);

  useEffect(() => {
    if (!jumpTargetId) return;
    requestAnimationFrame(() => {
      const el = listRef.current?.querySelector(`[data-msg-id="${jumpTargetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        flashHighlight(jumpTargetId);
      }
      clearJump();
      setJumpToMessageId(null);
    });
  }, [jumpTargetId, clearJump, setJumpToMessageId]);

  // Bottom sentinel — scrolling to it loads older messages.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || loadCooldownRef.current || !hasMore) return;
          const oldest = messages[messages.length - 1];
          if (!oldest) return;
          loadCooldownRef.current = true;
          loadMore({ before: oldest.id });
          setTimeout(() => { loadCooldownRef.current = false; }, 1000);
        });
      },
      { threshold: 0.1 },
    );
    if (bottomSentinelRef.current) observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, messages, loadMore]);

  const handleJumpToParent = (parentId: string) => {
    const el = listRef.current?.querySelector(`[data-msg-id="${parentId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      flashHighlight(parentId);
      return;
    }
    jumpToMessage(parentId);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <ChatComposer
        participants={participants}
        placeholder={t('communication.addComment')}
        submitLabel={t('communication.save')}
        startCollapsed
        onSubmit={(content, mentionedUserIds) => sendMessage({ content, mentionedUserIds })}
      />

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && messages.length === 0 && (
        <Empty>
          <EmptyMedia>
            <MessageSquareIcon className="size-12 text-primary opacity-40" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('communication.noMessagesYet')}</EmptyTitle>
            <EmptyDescription>{t('communication.addComment')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && messages.length > 0 && (
        <div ref={listRef} className="flex flex-col gap-3">
          {hasMoreAfter && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              disabled={isLoadingMore}
              onClick={() => {
                const newest = messages[0];
                if (newest) loadMore({ after: newest.id });
              }}
            >
              <ArrowUpIcon className="size-3.5" />
              {t('communication.loadNewer')}
            </Button>
          )}

          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              highlighted={highlightedId === message.id}
              participants={participants}
              onEdit={(id, content, mentionedUserIds) => editMessage({ messageId: id, content, mentionedUserIds })}
              onReply={(parentId, content, mentionedUserIds) => sendMessage({ content, parentId, mentionedUserIds })}
              onJumpToParent={handleJumpToParent}
            />
          ))}

          <div ref={bottomSentinelRef} className="h-1" />
        </div>
      )}
    </div>
  );
};

export default ActivationCommunication;
