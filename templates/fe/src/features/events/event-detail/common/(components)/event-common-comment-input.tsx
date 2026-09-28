'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { XIcon } from 'lucide-react';
import { LoadingIcon, IconSendMessage } from '@/shared/components/common/icons';
import { stripHtmlTags } from '@/lib/utils';
import { EventCommonCommentItem, type CommentTree } from './event-common-comment-item';
import type { EventCommonNamespace } from '../(services)/event-common-service';

type Props = {
  namespace: EventCommonNamespace;
  loading: boolean;
  submitting: boolean;
  replying: CommentTree | null;
  onCancelReply: () => void;
  onSubmit: (value: string) => void;
};

export function EventCommonCommentInput({ namespace, loading, submitting, replying, onCancelReply, onSubmit }: Props) {
  const t = useTranslations(namespace);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError('');
    const original = e.target.value;
    const sanitized = stripHtmlTags(original);
    if (sanitized !== original) {
      e.target.value = sanitized;
      e.target.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const value = inputRef.current?.value.trim();
    if (!value) {
      setError(t('errorCommentRequired'));
      return;
    }
    if (inputRef.current) inputRef.current.value = '';
    onSubmit(value);
  };

  return (
    <div className="flex flex-col">
      {replying && (
        <div className="flex flex-col gap-3 p-3 bg-muted w-full rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('replyingTo')}</span>
            <button type="button" onClick={onCancelReply} className="bg-transparent cursor-pointer">
              <XIcon className="size-4 text-primary" />
            </button>
          </div>
          <EventCommonCommentItem comment={replying} namespace={namespace} showChildren={false} />
        </div>
      )}
      <form className="flex items-center gap-3 mt-2" onSubmit={handleSubmit}>
        <div className={`border border-border h-10 w-full flex-1 flex items-center px-4 rounded-lg bg-background ${loading ? 'opacity-75' : ''}`}>
          <input
            type="text"
            disabled={loading || submitting}
            ref={inputRef}
            placeholder={t('typeMessage')}
            className="text-sm flex-1 outline-none bg-transparent placeholder:text-foreground/30"
            onChange={handleInput}
            translate="no"
          />
        </div>
        <button type="submit" disabled={submitting} className="bg-transparent h-10 cursor-pointer disabled:cursor-not-allowed">
          {submitting
            ? <LoadingIcon className="size-5 animate-spin text-primary" />
            : <IconSendMessage fill="var(--color-primary)" width={40} height={40} />}
        </button>
      </form>
      {error && <p className="text-xs text-destructive ps-2 mt-1">{error}</p>}
    </div>
  );
}
