'use client';

import { useTranslations } from 'next-intl';
import { PlusIcon } from 'lucide-react';
import { useGetActivationParticipants } from "../(hooks)/use-get-activation-participants";
import { useParticipantsDrawerUrl } from "../(hooks)/use-participants-drawer-url";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/shared/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useUserStore } from "@/shared/stores/use-user-store";
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from "@/shared/constants/permissions";

type Props = {
  activationId: string;
}

const MAX_VISIBLE = 3;

export function ActivationDetailParticipants({ activationId }: Props) {
  const t = useTranslations('activationView');
  const { data: activationParticipantsData } = useGetActivationParticipants({ activationId });
  const { openDrawer } = useParticipantsDrawerUrl();
  const permissions = useUserStore((s) => s.permissions);
  const isAdmin =
    permissions?.includes(PERMISSION_ALL_WILDCARD) ||
    permissions?.includes(PERMISSIONS.CustomerActivation.InternalAdmin);

  const participants = activationParticipantsData?.items ?? [];
  const total = activationParticipantsData?.pagination?.total ?? 0;
  const displayedCount = Math.min(participants.length, MAX_VISIBLE);
  const remainingCount = total - displayedCount;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground/80 text-xs">{t('participants.title')}</span>
      <div className="flex items-center">
        {participants.length === 0 && !isAdmin && (
          <span className="text-xs text-muted-foreground italic">{t('participants.noParticipants')}</span>
        )}
        {(participants.length > 0 || isAdmin) && (
          <AvatarGroup className="items-center">
            {participants.slice(0, MAX_VISIBLE).map((participant) => {
              const name = participant.user.name || "";
              const initials = name
                ? name
                    .split(' ')
                    .map((n) => n[0]?.toUpperCase() || '')
                    .join('')
                    .slice(0, 2)
                : 'U';

              return (
                <Tooltip key={participant.id}>
                  <TooltipTrigger asChild>
                    <Avatar data-testid="cam-participant-avatar" role="img" tabIndex={0} aria-label={name}>
                      {participant.user.avatar && (
                        <AvatarImage src={participant.user.avatar} alt={name} />
                      )}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{name}</TooltipContent>
                </Tooltip>
              );
            })}
            {remainingCount > 0 && (
              <AvatarGroupCount>
                <span className="font-semibold">+{remainingCount}</span>
              </AvatarGroupCount>
            )}
            {isAdmin && (
              <button
                data-slot="avatar"
                type="button"
                title={t('participants.add')}
                onClick={openDrawer}
                className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <PlusIcon className="size-4" />
              </button>
            )}
          </AvatarGroup>
        )}
      </div>
    </div>
  );
}

export default ActivationDetailParticipants;
