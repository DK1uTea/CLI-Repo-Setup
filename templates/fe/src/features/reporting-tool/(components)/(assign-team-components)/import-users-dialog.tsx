"use client";

import { CircleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { useImportUsersForm } from "@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-import-users-form";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import ImportUsersDropzone from "./import-users-dropzone";

type ImportUsersDialogProps = {
  children: ReactNode;
  onImportUsers?: (file: File) => void;
};

const requiredFields = ["firstName", "lastName", "email", "role"] as const;

const ImportUsersDialog = ({ children, onImportUsers }: ImportUsersDialogProps) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam.importUsersDialog");
  const [open, setOpen] = useState(false);
  const {
    file,
    dropzone,
    reset,
    onSubmit,
  } = useImportUsersForm({ onImportUsers });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const handleSubmit = () => {
    if (onSubmit()) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-0 sm:max-w-xl">
        <form onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}>
          <DialogHeader>
            <DialogTitle className="font-semibold text-xl">{t("title")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-5">
            <ImportUsersDropzone
              dropzone={dropzone}
              file={file}
              dropText={t("dropText")}
              browseText={t("browseText")}
            />

            <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <CircleAlertIcon />
                <span>{t("requiredFields")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {requiredFields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground"
                  >
                    {t(field)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline-primary">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!file}>
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportUsersDialog;
