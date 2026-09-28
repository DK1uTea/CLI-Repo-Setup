'use client'

import { Card, CardContent } from "@/shared/components/ui/card";
import { ActivationItemCardType } from "../../(hooks)/use-get-activations-group";
import { MessageCircle, Paperclip } from "lucide-react";
import EvaluationBadge from "../../../(components)/evaluation-badge";
import { ActivationStatusBadge } from "../../../(components)/activation-status-badge";
import { Separator } from "@/shared/components/ui/separator";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { LoadingIcon } from "@/shared/components/common/icons";
import ActivationItemCardActionDropdown from "./activation-item-card-action-dropdown";
import { useActivationDetailDrawerUrl } from "@/features/cam/activation-detail/(hooks)/use-activation-detail-drawer-url";
import { useUpdateActivationStatus } from "../../(hooks)/use-update-activation-status";
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { ACTIVATION_STATUS } from '../../../(helpers)/cam-constants'

import { Link, useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/shared/stores/use-user-store";
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from "@/shared/constants/permissions";

type Props = {
  item: ActivationItemCardType;
}

const ActivationItemCard = ({ item }: Props) => {
  const t = useTranslations('activationView')
  const router = useRouter()
  const { openDrawer } = useActivationDetailDrawerUrl();
  const permissions = useUserStore((s) => s.permissions)
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateActivationStatus()

  const isAdmin =
    permissions?.includes(PERMISSION_ALL_WILDCARD) ||
    permissions?.includes(PERMISSIONS.CustomerActivation.InternalAdmin)

  const ownerInitials = item.owner
    ? item.owner
      .split(' ')
      .map((n) => n[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2)
    : 'U'

  const backToParam = encodeURIComponent('/customer-activation?tab=intake-board')

  const handleMoveToNextStatus = (nextStatus: string) => {
    if (
      nextStatus === ACTIVATION_STATUS.APPROVED &&
      (item.evaluation?.score ?? 0) <= 0
    ) {
      toast.error(t('scoring.completeBeforeApprove'))
      router.push(
        `/customer-activation/${item.id}?activationTab=scoring&backTo=${backToParam}`,
      )
      return
    }

    updateStatus({ id: item.id, status: nextStatus })
  }

  return (
    <Card data-testid="cam-intake-card" className="relative shrink-0 transition-colors hover:bg-background py-0">
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2 min-w-0 min-h-8 -mb-2">
          <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
          <div className="relative z-10">
            <ActivationItemCardActionDropdown
              activationId={item.id}
              status={item.status}
              isUpdating={isUpdatingStatus}
              onMoveToNextStatus={handleMoveToNextStatus}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground truncate">{item.storeAddress}</p>
        <div className="flex gap-2">
          <EvaluationBadge evaluation={item.evaluation} />
          <ActivationStatusBadge status={item.status} />
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="size-3.5" />
              <span data-testid="cam-intake-chat-count">{item.chatCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="size-3.5" />
              <span data-testid="cam-intake-file-count">{item.fileCount ?? 0}</span>
            </div>
          </div>
          <Avatar size="sm">
            <AvatarFallback>{ownerInitials}</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>

      {/* Stretched click target — sits BEHIND the dropdown (which gets relative z-10 above)
          so the dropdown's own click/portal never lands on this Link/button. This avoids
          wrapping the whole card in <Link>, which lets clicks on a Radix dropdown (portaled
          to document.body but still nested in the React tree) bubble into the Link and navigate. */}
      {isAdmin ? (
        <Link
          href={`/customer-activation/${item.id}?backTo=${backToParam}`}
          data-testid="cam-intake-card-link"
          className="absolute inset-0 cursor-pointer"
          aria-label={item.name}
        />
      ) : (
        <button
          type="button"
          className="absolute inset-0 cursor-pointer"
          onClick={() => openDrawer(item.id)}
          aria-label={item.name}
        />
      )}

      {/* Busy overlay — sits above everything (including the dropdown's z-10) so the whole
          card is visibly disabled and non-interactive while a status update is in flight. */}
      {isUpdatingStatus && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[12px] bg-card/70 backdrop-blur-[1px]">
          <LoadingIcon className="size-5" />
        </div>
      )}
    </Card>
  )
}

export default ActivationItemCard;
