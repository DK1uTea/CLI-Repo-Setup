'use client';

import { useTranslations } from "next-intl";
import { ActivationDetail } from "../../../(hooks)/use-activation-detail";
import { formatDate } from "@/lib/date-utils";
import { useDateFormat } from "@/shared/stores/use-user-store";
import AttachedFiles from "./attached-files";

type Props = {
  activationDetail: ActivationDetail;
}

const ActivationDetailOverview = ({ activationDetail }: Props) => {
  const t = useTranslations('activationView');
  const { store } = activationDetail;
  const dateFormat = useDateFormat();

  const contactInfo = [store.contactName, store.contactPhone, store.contactEmail]
    .filter(Boolean)
    .join(', ');

  const formattedCreatedDate = activationDetail.createdAt
    ? formatDate(activationDetail.createdAt, dateFormat)
    : '—';

  const attachedFiles = [
    ...(activationDetail.ahMarketMediaUrls?.map((m) => ({
      path: m.path,
      createdAt: m.createdAt,
      marketType: 'AH' as const,
    })) ?? []),
    ...(activationDetail.aMarketMediaUrls?.map((m) => ({
      path: m.path,
      createdAt: m.createdAt,
      marketType: 'H' as const,
    })) ?? []),
  ];

  const rows = [
    { label: t('drawer.overview.contactPerson'), value: contactInfo || '—' },
    { label: t('drawer.overview.caseId'), value: activationDetail.code || '—' },
    { label: t('drawer.overview.created'), value: formattedCreatedDate },
  ];

  return (
    <div className="flex flex-col">
      {rows.map((row, index) => (
        <div key={row.label}>
          <div className="flex flex-col gap-2 py-2.5">
            <span className="line-clamp-2 text-xs font-normal text-muted-foreground">{row.label}</span>
            <p
              data-testid={index === 0 ? 'cam-case-contact' : index === 1 ? 'cam-case-id' : 'cam-case-created'}
              data-created-at={index === 2 ? activationDetail.createdAt : undefined}
              aria-readonly="true"
              className="text-base font-normal text-foreground"
            >
              {row.value}
            </p>
          </div>
          {index < rows.length - 1 && <div className="border-t border-border" />}
        </div>
      ))}
      <div className="border-t border-border" />
      <AttachedFiles activationId={activationDetail.id} files={attachedFiles} />
    </div>
  );
}

export default ActivationDetailOverview;
