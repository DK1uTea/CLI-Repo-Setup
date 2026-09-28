import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { formatDate } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';
import { sanitizeHtmlForEditor } from '@/lib/html-utils';
import { Feedback } from '../../(hooks)/use-get-activation-feedbacks';

type Props = {
  comments: Feedback[];
};

const FeedbackCommentList = ({ comments }: Props) => {
  const t = useTranslations('activationView');
  const dateFormat = useDateFormat();

  if (comments.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground">{t('feedback.previousFeedback')}</p>
      {comments.map((comment) => {
        const displayName = comment.createdBy?.name || t('feedback.someone');
        const initials = displayName.charAt(0).toUpperCase();

        return (
          <div key={comment.id} className="rounded-2xl border border-border bg-background p-3">
            <div className="flex gap-3">
              <Avatar size="sm">
                {comment.createdBy?.avatar && <AvatarImage src={comment.createdBy.avatar} alt={displayName} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt, dateFormat, true)}
                  </span>
                </div>
                <div
                  className="prose prose-sm max-w-none text-sm text-foreground [&_p]:my-1"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtmlForEditor(comment.reason) }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeedbackCommentList;
