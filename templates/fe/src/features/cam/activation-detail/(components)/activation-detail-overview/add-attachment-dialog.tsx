'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { MediaUpload, type MediaUploadKind } from '@/shared/components/ui/media-upload';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { useAddAttachmentDialog } from '../../(hooks)/use-add-attachment-dialog';

type Props = {
  activationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddAttachmentDialog = ({ activationId, open, onOpenChange }: Props) => {
  const t = useTranslations('activationView');
  const { marketType, setMarketType, files, addFiles, removeFile, save, reset, isPending } =
    useAddAttachmentDialog(activationId, () => onOpenChange(false));

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] min-w-0 overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('drawer.addAttachmentDialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto _custom-scroll">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground/80">
              {t('drawer.addAttachmentDialog.marketType')}
            </span>
            <RadioGroup
              className="grid-flow-col justify-start gap-6"
              value={marketType}
              onValueChange={(value) => setMarketType(value as 'AH' | 'H')}
            >
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="AH" />
                {t('drawer.addAttachmentDialog.ahMarket')}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="H" />
                {t('drawer.addAttachmentDialog.hMarket')}
              </label>
            </RadioGroup>
          </div>

          <MediaUpload
            value={files.map(({ preview }) => preview)}
            fileNames={files.map(({ file }) => file.name)}
            fileKinds={files.map(({ file }) =>
              (file.type.startsWith('video/') ? 'video' : 'image') as MediaUploadKind
            )}
            fileMeta={files.map(({ marketType: fileMarketType }, index) => (
              <p key={`${fileMarketType}-${index}`} className="text-xs text-muted-foreground/80">
                {fileMarketType === 'AH'
                  ? t('drawer.addAttachmentDialog.ahMarket')
                  : t('drawer.addAttachmentDialog.hMarket')}
              </p>
            ))}
            onDrop={addFiles}
            onRemove={removeFile}
            uploading={isPending}
            accept={{ 'image/*': [], 'video/*': [] }}
            dropText={t('drawer.addAttachmentDialog.dropText')}
            browseText=""
            hintText={t('drawer.addAttachmentDialog.hintText')}
          />
        </div>

        <DialogFooter>
          <Button variant="outline-primary" onClick={() => handleOpenChange(false)} disabled={isPending}>
            {t('drawer.addAttachmentDialog.cancel')}
          </Button>
          <Button onClick={save} disabled={files.length === 0 || isPending}>
            {t('drawer.addAttachmentDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAttachmentDialog;
