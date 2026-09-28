'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { useDeleteAnswer } from "../(hooks)/use-delete-answer";

type Props = {
  children: React.ReactNode;
  answerId: string;
};

const DeleteAnswerAlertDialog = ({ children, answerId }: Props) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("reportingTool.answersOverview");
  const { deleteAnswer, isDeleting } = useDeleteAnswer(answerId);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Radix from closing the dialog automatically
    e.stopPropagation();
    try {
      await deleteAnswer();
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete answer:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDialogDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            onClick={(e) => e.stopPropagation()}
          >
            {t("deleteDialogCancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAnswerAlertDialog;
