'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { useDeleteEvent } from "../(hooks)/use-delete-event";

type Props = {
  children: React.ReactNode;
  eventId: string;
};

const DeleteEventAlertDialog = ({ children, eventId }: Props) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("reportingTool.deleteEvent");
  const tList = useTranslations("events.list");
  const router = useRouter();
  const { deleteEvent, isDeleting } = useDeleteEvent(eventId);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Radix from closing the dialog automatically
    e.stopPropagation();
    try {
      await deleteEvent();
      toast.success(tList("deleteSuccess"));
      setOpen(false);
      router.push("/reporting-tool/select-event");
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            onClick={(e) => e.stopPropagation()}
          >
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEventAlertDialog;
