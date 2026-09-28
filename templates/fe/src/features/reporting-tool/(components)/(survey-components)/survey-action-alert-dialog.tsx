'use client';

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
import { useTranslations } from "next-intl";

export type SurveyAction = "duplicate" | "delete" | "assign" | "unassign";

type Props = {
  surveyName: string;
  action?: SurveyAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  isPending?: boolean;
};

const SurveyActionAlertDialog = ({
  surveyName,
  action,
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: Props) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.survey.actionDialog");
  const isDestructiveAction = action === "delete" || action === "unassign";
  const actionContent = {
    duplicate: {
      title: t("duplicateTitle"),
      description: t("duplicateDescription", { name: surveyName }),
      action: t("duplicate"),
    },
    delete: {
      title: t("deleteTitle"),
      description: t("deleteDescription", { name: surveyName }),
      action: t("delete"),
    },
    assign: {
      title: t("assignTitle"),
      description: t("assignDescription", { name: surveyName }),
      action: t("assign"),
    },
    unassign: {
      title: t("unassignTitle"),
      description: t("unassignDescription", { name: surveyName }),
      action: t("unassign"),
    },
  }[action ?? "duplicate"];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionContent.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionContent.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant={isDestructiveAction ? "destructive" : "default"}
            disabled={isPending}
            isLoading={isPending}
            onClick={(event) => {
              event.stopPropagation();
              onConfirm?.();
            }}
          >
            {actionContent.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SurveyActionAlertDialog;
