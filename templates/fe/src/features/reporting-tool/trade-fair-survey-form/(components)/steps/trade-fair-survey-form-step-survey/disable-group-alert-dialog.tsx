'use client';

import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

type DisableGroupAlertDialogProps = {
  open: boolean;
  groupName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DisableGroupAlertDialog({
  open,
  groupName,
  onClose,
  onConfirm,
}: DisableGroupAlertDialogProps) {
  const t = useTranslations("reportingTool.tradeFairSurveyForm");

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent
        className="max-w-md sm:max-w-lg"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{t("disableGroupTitle", { name: groupName })}</AlertDialogTitle>
          <AlertDialogDescription className="text-wrap">
            {t("disableGroupContent")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant="destructive">
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
