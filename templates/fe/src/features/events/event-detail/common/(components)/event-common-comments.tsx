'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LoadingIcon } from '@/shared/components/common/icons';
import { Card } from '@/shared/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from '@/shared/components/ui/avatar';
import { ComponentGuard } from '@/shared/components/common/component-guard';
import { EVENT_COMMON_COMMENT_PERMISSION } from '../(helpers)/event-common-permissions';
import { useEventComments } from '../(hooks)/use-event-comments';
import { useSendEventComment } from '../(hooks)/use-send-event-comment';
import { EventCommonCommentItem, type CommentTree } from './event-common-comment-item';
import { EventCommonCommentInput } from './event-common-comment-input';
import type { EventComment, EventCommonNamespace } from '../(services)/event-common-service';

const PER_PAGE = 10;

type Props = {
  eventId: string;
  namespace: EventCommonNamespace;
  avatars?: { avatar: string | null; firstName: string; lastName: string }[];
  totalAvatar?: number;
};

function toTree(comments: EventComment[]): CommentTree[] {
  return comments.map((c) => ({ ...c, children: toTree(Array.isArray(c.children) ? c.children : []) }));
}

/** DB only supports 2 levels — replying to a reply must send the top-level comment's id as parentId. */
function findRootId(tree: CommentTree[], commentId: string): string {
  for (const root of tree) {
    if (root.id === commentId) return root.id;
    if (root.children.some((child) => child.id === commentId)) return root.id;
  }
  return commentId;
}

export function EventCommonComments({ eventId, namespace, avatars, totalAvatar }: Props) {
  const t = useTranslations(namespace);
  const [replying, setReplying] = useState<CommentTree | null>(null);
  const comments = useEventComments(eventId, PER_PAGE);
  const sendComment = useSendEventComment();
  const tree = toTree(comments.data?.pages.flatMap((page) => page.comments) ?? []);
  const loading = comments.isFetching;

  const onSubmit = async (value: string) => {
    const currentReplying = replying;
    setReplying(null);
    try {
      const parentId = currentReplying ? findRootId(tree, currentReplying.id) : undefined;
      await sendComment.mutateAsync({ eventId, content: value, parentId });
    } catch {
      // interceptor handles error toast
    }
  };

  const onSetReplying = (comment: CommentTree) => {
    setReplying(comment);
  };

  const avatarCount = avatars?.length ?? 0;
  const remaining = (totalAvatar ?? 0) - avatarCount;

  return (
    <Card className="py-0">
      <Accordion type="single" collapsible defaultValue="open">
        <AccordionItem value="open" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline font-semibold text-lg">
            {t('teamCommunication')}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-5 h-auto!">
            <div className="flex flex-col gap-5">
              {avatarCount > 0 && (
                <AvatarGroup>
                  {avatars?.map((a, i) => {
                    const initials = `${a.firstName?.[0] ?? ''}${a.lastName?.[0] ?? ''}`.toUpperCase();
                    return (
                      <Avatar key={`av-${i}`} size="lg">
                        <AvatarImage src={a.avatar ?? undefined} />
                        <AvatarFallback className="text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {remaining > 0 && (
                    <AvatarGroupCount>
                      {remaining > 99 ? '99' : remaining}+
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              )}

              {tree.length > 0 && (
                <div className="overflow-x-auto">
                  <div className="flex flex-col gap-5">
                    {tree.map((c) => (
                      <EventCommonCommentItem
                        key={c.id}
                        comment={c}
                        namespace={namespace}
                        onReply={onSetReplying}
                      />
                    ))}
                  </div>
                </div>
              )}

              {comments.hasNextPage && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void comments.fetchNextPage()}
                    className="text-sm text-primary cursor-pointer bg-transparent disabled:opacity-75"
                  >
                    {loading
                      ? <LoadingIcon className="size-5 animate-spin text-primary mx-auto" />
                      : t('loadMoreComments')}
                  </button>
                </div>
              )}

              <ComponentGuard requiredKeys={EVENT_COMMON_COMMENT_PERMISSION[namespace]}>
                <EventCommonCommentInput
                  namespace={namespace}
                  loading={loading}
                  submitting={sendComment.isPending}
                  replying={replying}
                  onCancelReply={() => setReplying(null)}
                  onSubmit={onSubmit}
                />
              </ComponentGuard>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
