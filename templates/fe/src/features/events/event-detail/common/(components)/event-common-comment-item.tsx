'use client';

import { useLocale, useTranslations } from 'next-intl';
import { dayjs } from '@/lib/date-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { ComponentGuard } from '@/shared/components/common/component-guard';
import { EVENT_COMMON_COMMENT_PERMISSION } from '../(helpers)/event-common-permissions';
import type { EventComment, EventCommonNamespace } from '../(services)/event-common-service';

export type CommentTree = Omit<EventComment, 'children'> & { children: CommentTree[] };

type Props = {
  comment: CommentTree;
  namespace: EventCommonNamespace;
  isReply?: boolean;
  showChildren?: boolean;
  onReply?: (comment: CommentTree) => void;
};

export function EventCommonCommentItem({ comment, namespace, isReply, showChildren = true, onReply }: Props) {
  const t = useTranslations(namespace);
  const locale = useLocale();

  const authorName = comment.createdBy?.name ?? '';
  const initials = authorName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const avatarSize = isReply ? 'sm' : 'lg';
  const avatarSizeClass = isReply ? 'size-7.5!' : 'size-11!';

  const timeAgo = dayjs.utc(comment.createdAt).locale(locale === 'de' ? 'de' : 'en').fromNow();

  const countChildren = comment.children?.length ?? 0;

  return (
    <div>
      <div className="flex gap-3 py-2.5 min-w-0" id={comment.id}>
        <Avatar size={avatarSize} className={`${avatarSizeClass} shrink-0`}>
          <AvatarImage src={comment.createdBy?.avatar ?? undefined} />
          <AvatarFallback className="text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col text-sm">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground" translate="no">
              {authorName}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <p className="my-2 min-w-75 wrap-break-word text-sm text-foreground" translate="no">{comment.content}</p>

          {onReply && (
            <ComponentGuard requiredKeys={EVENT_COMMON_COMMENT_PERMISSION[namespace]}>
              <div className="flex items-center gap-3">
                <span
                  role="button"
                  onClick={() => onReply(comment)}
                  className="text-xs cursor-pointer hover:text-primary select-none text-muted-foreground transition-colors"
                >
                  {t('reply')}
                </span>
              </div>
            </ComponentGuard>
          )}
        </div>
      </div>

      {showChildren && countChildren > 0 && (
        <div className="ps-3 sm:ps-10">
          <div className="ps-2 sm:ps-4 border-l-2 border-border flex flex-col gap-5">
            {comment.children.map((child) => (
              <EventCommonCommentItem
                key={child.id}
                comment={child}
                namespace={namespace}
                isReply
                onReply={onReply}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
