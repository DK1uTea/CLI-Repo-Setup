import { Download } from "lucide-react";
import Image from "next/image";
import { OptionMenu } from "@/shared/components/ui/option-menu";
import { formatDate } from "@/lib/date-utils";
import { getFilename } from "@/lib/file-utils";
import { useDateFormat } from "@/shared/stores/use-user-store";
import { useTranslations } from "next-intl";
import { downloadFile } from "@/lib/download-file";

export type AttachedFileType = {
  path: string;
  createdAt: string;
  marketType: 'AH' | 'H';
};

type Props = {
  file: AttachedFileType;
  onPreview?: () => void;
};

const AttachedFileItem = ({ file, onPreview }: Props) => {
  const t = useTranslations('activationView');
  const dateFormat = useDateFormat();
  const fileName = getFilename(file.path) || 'file';
  const marketLabel = file.marketType === 'AH' ? 'AH Markt' : 'H Markt';
  const formattedDate = formatDate(file.createdAt, dateFormat, true);

  const handleDownload = () => downloadFile(file.path, fileName);

  return (
    <div
      data-testid="cam-attached-file"
      data-file-path={file.path}
      className="flex items-center gap-3 cursor-pointer hover:bg-muted/40 p-2 rounded-lg transition-colors"
      onClick={onPreview}
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        <Image
          src={file.path}
          alt={fileName}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex flex-col gap-1 grow min-w-0">
        <p data-testid="cam-attached-file-name" className="text-sm font-semibold truncate" title={fileName}>
          {fileName}
        </p>
        <span className="text-xs text-muted-foreground/80">
          {marketLabel}
        </span>
        <p data-testid="cam-attached-file-date" data-created-at={file.createdAt} className="text-xs text-muted-foreground/80">
          {t('drawer.addedOn', { date: formattedDate })}
        </p>
      </div>
      <OptionMenu
        items={[
          {
            key: 'download',
            label: <span className="whitespace-nowrap">{t('drawer.downloadImage')}</span>,
            icon: <Download className="size-4" />,
            onClick: handleDownload,
          },
        ]}
      />
    </div>
  );
};

export default AttachedFileItem;
