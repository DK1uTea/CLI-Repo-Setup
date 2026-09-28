'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';
import { cn } from '@/lib/utils';
import { ChatMessage } from '../../(hooks)/use-chat-socket';
import { ParticipantDetail } from '../../(hooks)/use-get-activation-participants';
import ChatComposer from './chat-composer';
import { ChatMessageContent } from './chat-message-content';

type Props = {
  message: ChatMessage;
  highlighted?: boolean;
  participants: ParticipantDetail[];
  onEdit: (id: string, content: string, mentionedUserIds: string[]) => void;
  onReply: (parentId: string, content: string, mentionedUserIds: string[]) => void;
  onJumpToParent: (parentId: string) => void;
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').trim();

const ChatMessageItem = ({ message, highlighted, participants, onEdit, onReply, onJumpToParent }: Props) => {
  const t = useTranslations('activationView');
  const dateFormat = useDateFormat();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const senderName = message.sender?.name ?? t('communication.anonymous');
  const initials = senderName.charAt(0).toUpperCase();

  return (
    <div
      data-msg-id={message.id}
      data-testid="cam-chat-message"
      data-created-at={message.createdAt}
      data-mentioned-user-ids={message.mentionedUserIds?.join(',') ?? ''}
      data-highlighted={highlighted ? 'true' : 'false'}
      className={cn(
        'rounded-2xl border bg-background p-3 transition-colors duration-300',
        highlighted ? 'border-primary ring-2 ring-primary/30' : 'border-border',
      )}
    >
      {message.parent && (
        <div
          className="mb-2 cursor-pointer rounded-lg border-l-2 border-primary bg-muted/40 px-2.5 py-1.5"
          onClick={() => message.parentId && onJumpToParent(message.parentId)}
        >
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-primary">{message.parent.sender?.name ?? t('communication.anonymous')}</p>
            {message.parent.createdAt && (
              <span className="text-[11px] text-muted-foreground">{formatDate(message.parent.createdAt, dateFormat, true)}</span>
            )}
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground mt-1.5">{stripHtml(message.parent.content) || t('communication.attachment')}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Avatar size="sm">
          {message.sender?.avatar && <AvatarImage src={message.sender.avatar} alt={senderName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{senderName}</span>
            <span className="text-xs text-muted-foreground">{formatDate(message.createdAt, dateFormat, true)}</span>
            {message?.updatedAt !== message?.createdAt && <span className="text-xs italic text-muted-foreground">{t('communication.edited')}</span>}
          </div>

          {isEditing ? (
            <ChatComposer
              participants={participants}
              initialValue={message.content}
              submitLabel={t('communication.save')}
              autoFocus
              onCancel={() => setIsEditing(false)}
              onSubmit={(content, mentionedUserIds) => {
                onEdit(message.id, content, mentionedUserIds);
                setIsEditing(false);
              }}
            />
          ) : (
            <>
              <ChatMessageContent content={message.content} />
              <div className="mt-1.5 flex justify-end gap-2">
                {message.isOwner && (
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs hover:bg-primary hover:text-primary-foreground" onClick={() => setIsEditing(true)}>
                    {t('communication.edit')}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs hover:bg-primary hover:text-primary-foreground" onClick={() => setIsReplying((v) => !v)}>
                  {t('communication.reply')}
                </Button>
              </div>
            </>
          )}

          {isReplying && !isEditing && (
            <div className="mt-2">
              <ChatComposer
                participants={participants}
                placeholder={t('communication.replyTo', { name: senderName })}
                submitLabel={t('communication.save')}
                autoFocus
                onCancel={() => setIsReplying(false)}
                onSubmit={(content, mentionedUserIds) => {
                  onReply(message.id, content, mentionedUserIds);
                  setIsReplying(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
