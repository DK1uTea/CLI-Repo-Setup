import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { formatDate } from '@/lib/date-utils';
import { useDateFormat } from '@/shared/stores/use-user-store';
import { ActivityItem as ActivityItemType } from '../../(hooks)/use-activation-activity';
import { getActivationStatusTranslationKey } from '../../../(helpers)/cam-constants';

type Props = {
  activity: ActivityItemType;
};

const ActivityItem = ({ activity }: Props) => {
  const t = useTranslations('activationView');
  const dateFormat = useDateFormat();
  const initials = activity.causerName.charAt(0).toUpperCase();

  const description = (() => {
    switch (activity.type) {
      case 'CREATED':
        return t('activity.created');
      case 'STATUS_UPDATED': {
        const statusKey = activity.toStatus ? getActivationStatusTranslationKey(activity.toStatus) : null;
        return t('activity.statusUpdated', {
          status: statusKey ? t(statusKey) : '',
        });
      }
      case 'MEMBER_ADDED':
        return t('activity.memberAdded', { names: activity.addedUserNames?.join(', ') ?? '' });
      case 'MEMBER_REMOVED':
        return t('activity.memberRemoved', { names: activity.removedUserNames?.join(', ') ?? '' });
      case 'ASSIGNED_TO':
        return t('activity.assignedTo', { name: activity.assignedToName ?? '' });
      case 'DUE_DATE_CHANGED':
        return t('activity.dueDateChanged', {
          date: activity.newDueDate ? formatDate(activity.newDueDate, dateFormat) : '',
        });
      default:
        return '';
    }
  })();

  return (
    <div
      data-testid="cam-activity-item"
      data-activity-id={activity.id}
      data-activity-type={activity.type}
      data-created-at={activity.createdAt}
      className="flex gap-3"
    >
      <Avatar>
        {activity.causerAvatar && <AvatarImage src={activity.causerAvatar} alt={activity.causerName} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p data-testid="cam-activity-description" className="text-sm text-muted-foreground">
          <span data-testid="cam-activity-actor" className="font-medium text-foreground">{activity.causerName}</span> {description}
        </p>
        <p data-testid="cam-activity-timestamp" className="mt-1 text-xs text-muted-foreground">
          {formatDate(activity.createdAt, dateFormat, true)}
        </p>
      </div>
    </div>
  );
};

export default ActivityItem;
