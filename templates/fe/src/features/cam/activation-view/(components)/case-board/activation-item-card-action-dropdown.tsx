'use client'

import { OptionMenu } from "@/shared/components/ui/option-menu";
import { useUserStore } from "@/shared/stores/use-user-store";
import { PERMISSIONS, PERMISSION_ALL_WILDCARD } from "@/shared/constants/permissions";
import { ACTIVATION_NEXT_STATUS, ACTIVATION_STATUS, getActivationStatusTranslationKey } from "../../../(helpers)/cam-constants";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from '@/i18n/navigation'
import { Ellipsis } from 'lucide-react'

type Props = {
  activationId: string;
  status: string;
  activeTab?: 'dashboard' | 'intake-board';
  isUpdating: boolean;
  onMoveToNextStatus: (nextStatus: string) => void;
}

export function ActivationItemCardActionDropdown({
  activationId,
  status,
  activeTab = 'intake-board',
  isUpdating,
  onMoveToNextStatus,
}: Props) {
  const t = useTranslations('activationView')
  const router = useRouter()
  const pathname = usePathname()
  const permissions = useUserStore((s) => s.permissions)

  const isAdmin =
    permissions?.includes(PERMISSION_ALL_WILDCARD) ||
    permissions?.includes(PERMISSIONS.CustomerActivation.InternalAdmin)

  const nextStatus = ACTIVATION_NEXT_STATUS[status as keyof typeof ACTIVATION_NEXT_STATUS] ?? null

  const showDropdown =
    nextStatus !== null &&
    status !== ACTIVATION_STATUS.CLARIFICATION &&
    (!!isAdmin || status === ACTIVATION_STATUS.DRAFT)

  const nextStatusKey = nextStatus ? getActivationStatusTranslationKey(nextStatus) : null
  const nextStatusLabel = nextStatusKey ? t(nextStatusKey) : ''

  const openRequestChange = () => {
    if (isAdmin) {
      const detailParams = new URLSearchParams()
      detailParams.set('feedback_drawer', 'open')
      detailParams.set('backTo', `${pathname}${window.location.search}`)
      router.push(`/customer-activation/${activationId}?${detailParams.toString()}`)
      return
    }

    const params = new URLSearchParams(window.location.search)
    params.set('tab', activeTab)
    params.set('activation_drawer', 'open')
    params.set('activation_id', activationId)
    params.set('feedback_drawer', 'open')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <OptionMenu
        triggerIcon={<Ellipsis className="size-4" />}
        triggerClassName="p-0 shink-0"
        items={[
          {
            key: 'move-to-next-status',
            label: t('moveTo', { status: nextStatusLabel }),
            hidden: !showDropdown,
            disabled: isUpdating,
            onClick: () => nextStatus && onMoveToNextStatus(nextStatus),
          },
          {
            key: 'edit-case',
            label: t('editCase'),
            href: `/customer-activation/update-activation?activation_id=${activationId}&step=2`,
            hidden: status !== ACTIVATION_STATUS.DRAFT,
          },
          {
            key: 'request-change',
            label: t('footer.requestChange'),
            onClick: openRequestChange,
            hidden: status !== ACTIVATION_STATUS.REVIEW || !isAdmin,
          },
        ]}
      />
    </div>
  )
}

export default ActivationItemCardActionDropdown;
