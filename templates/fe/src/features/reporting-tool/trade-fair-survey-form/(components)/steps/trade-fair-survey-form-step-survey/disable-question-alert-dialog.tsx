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

type DisableQuestionAlertDialogProps = {
  open: boolean;
  questionName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DisableQuestionAlertDialog({
  open,
  questionName,
  onClose,
  onConfirm,
}: DisableQuestionAlertDialogProps) {
  const t = useTranslations("reportingTool.tradeFairSurveyForm");

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-md sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("disableQuestionTitle", { name: questionName })}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-wrap">
            {t("disableQuestionContent")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant="destructive">
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
