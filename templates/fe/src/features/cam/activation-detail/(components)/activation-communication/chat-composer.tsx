'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Editor } from '@/shared/components/ui/editor';
import { extractMentionedUserIds } from '@/lib/html-utils';
import { useActivationMediaUpload } from '@/features/cam/activation-form/(hooks)/use-activation-media-upload';
import { ParticipantDetail } from '../../(hooks)/use-get-activation-participants';
import {
  CHAT_ATTACHMENT_ACCEPT,
  classifyChatAttachment,
  hasChatContent,
  parseChatContent,
  serializeChatContent,
  validateChatAttachmentSelection,
  type ChatAttachment,
} from '../../(helpers)/chat-attachment-utils';
import { PendingChatAttachments } from './pending-chat-attachments';

type Props = {
  participants: ParticipantDetail[];
  initialValue?: string;
  placeholder?: string;
  submitLabel: string;
  autoFocus?: boolean;
  /** Renders as a plain input-like button first — clicking it reveals the editor, matching the old site. */
  startCollapsed?: boolean;
  onSubmit: (content: string, mentionedUserIds: string[]) => void;
  onCancel?: () => void;
};

const ChatComposer = ({
  participants, initialValue = '', placeholder, submitLabel, autoFocus, startCollapsed, onSubmit, onCancel,
}: Props) => {
  const t = useTranslations('activationView');
  const initial = parseChatContent(initialValue);
  const [expanded, setExpanded] = useState(!startCollapsed);
  const [content, setContent] = useState(initial.content);
  const [attachments, setAttachments] = useState<ChatAttachment[]>(initial.attachments);
  const attachmentsRef = useRef(attachments);
  const { uploadFiles, isUploading } = useActivationMediaUpload();

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => () => {
    attachmentsRef.current.forEach((attachment) => {
      if (attachment.file) URL.revokeObjectURL(attachment.src);
    });
  }, []);

  const clearComposer = () => {
    attachments.forEach((attachment) => {
      if (attachment.file) URL.revokeObjectURL(attachment.src);
    });
    attachmentsRef.current = [];
    setContent('');
    setAttachments([]);
  };

  const handleSubmit = async () => {
    if (isUploading) return;

    try {
      const pendingAttachments = attachments.filter((attachment): attachment is ChatAttachment & { file: File } => Boolean(attachment.file));
      const uploaded = await uploadFiles(pendingAttachments.map((attachment) => attachment.file));
      let uploadIndex = 0;
      const uploadedAttachments = attachments.map((attachment) => {
        if (!attachment.file) return attachment;
        const result = uploaded[uploadIndex++];
        if (!result.cdnUrl) throw new Error('Attachment CDN URL is missing');
        return { ...attachment, src: result.cdnUrl, file: undefined };
      });
      const finalContent = serializeChatContent(content, uploadedAttachments);

      onSubmit(finalContent, extractMentionedUserIds(finalContent));
      clearComposer();
      if (startCollapsed) setExpanded(false);
    } catch (error) {
      console.error('Chat image upload failed:', error);
      toast.error(t('communication.attachmentUploadFailed'));
    }
  };

  const handleCancel = () => {
    clearComposer();
    if (startCollapsed) {
      setExpanded(false);
    } else {
      onCancel?.();
    }
  };

  const isEmpty = !hasChatContent(serializeChatContent(content, attachments));

  const handleFilesSelected = (files: File[]) => {
    const { accepted, rejected } = validateChatAttachmentSelection(files, attachments.length);
    new Set(rejected.map(({ reason }) => reason)).forEach((reason) => {
      const rejectedFile = rejected.find((item) => item.reason === reason)?.file;
      if (reason === 'unsupported' && rejectedFile) toast.error(t('communication.unsupportedFile', { fileName: rejectedFile.name }));
      if (reason === 'too-large' && rejectedFile) toast.error(t('communication.fileTooLarge', { fileName: rejectedFile.name }));
      if (reason === 'too-many') toast.error(t('communication.tooManyFiles'));
    });
    setAttachments((current) => [
      ...current,
      ...accepted.map((file) => ({
        id: crypto.randomUUID(),
        kind: classifyChatAttachment(file)!,
        fileName: file.name,
        mimeType: file.type,
        src: URL.createObjectURL(file),
        file,
      })),
    ]);
  };

  const handleAttachmentRemove = (id: string) => {
    setAttachments((current) => {
      const removed = current.find((attachment) => attachment.id === id);
      if (removed?.file) URL.revokeObjectURL(removed.src);
      return current.filter((attachment) => attachment.id !== id);
    });
  };

  if (!expanded) {
    return (
      <button
        type="button"
        data-testid="cam-chat-composer-trigger"
        onClick={() => setExpanded(true)}
        className="w-full rounded-input border border-input bg-background px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary"
      >
        {placeholder}
      </button>
    );
  }

  const mentionItems = participants.map((p) => ({ id: p.user.id, label: p.user.name, avatarUrl: p.user.avatar }));

  return (
    <div className="flex flex-col gap-2">
      <Editor
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        showHeadings
        autoFocus={autoFocus}
        mentionItems={mentionItems}
        attachmentContent={attachments.length > 0 ? (
          <PendingChatAttachments attachments={attachments} onRemove={handleAttachmentRemove} disabled={isUploading} />
        ) : undefined}
        onFilesSelected={handleFilesSelected}
        fileAccept={CHAT_ATTACHMENT_ACCEPT}
        fileInputLabel={t('communication.selectAttachments')}
        disabled={isUploading}
      />

      <div className="flex items-center justify-end gap-2">
        {(onCancel || startCollapsed) && (
          <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={handleCancel}>
            {t('communication.cancel')}
          </Button>
        )}
        <Button type="button" size="sm" disabled={isEmpty || isUploading} onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default ChatComposer;
