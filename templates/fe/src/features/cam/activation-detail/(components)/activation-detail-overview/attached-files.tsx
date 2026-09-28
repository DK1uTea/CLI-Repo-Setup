import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { MediaLightbox } from "@/shared/components/ui/media-lightbox";
import AttachedFileItem, { AttachedFileType } from "./attached-file-item";
import AddAttachmentDialog from "./add-attachment-dialog";
import { useTranslations } from "next-intl";

type Props = {
  activationId: string;
  files: AttachedFileType[];
};

const AttachedFiles = ({ activationId, files }: Props) => {
  const t = useTranslations('activationView');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground/80">{t('drawer.attachedFiles')}</span>
        <Button variant="outline" onClick={() => setAddDialogOpen(true)}>{t('drawer.add')}</Button>
      </div>
      <div className="flex flex-col gap-1">
        {files.map((file, index) => (
          <AttachedFileItem
            key={file.path}
            file={file}
            onPreview={() => setLightboxIndex(index)}
          />
        ))}
      </div>

      <MediaLightbox
        items={files.map((file) => ({ src: file.path }))}
        index={lightboxIndex ?? 0}
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && setLightboxIndex(null)}
        className="cam-attached-file-lightbox"
      />

      <AddAttachmentDialog
        activationId={activationId}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
};

export default AttachedFiles;
