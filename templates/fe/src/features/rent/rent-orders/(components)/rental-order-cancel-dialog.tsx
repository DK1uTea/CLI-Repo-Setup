'use client';

import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
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

type RentalOrderCancelDialogProps = {
  orderId: string;
  onConfirm?: () => void;
};

const RentalOrderCancelDialog = ({ orderId, onConfirm }: RentalOrderCancelDialogProps) => {
  const t = useTranslations("rent.rentOrders");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>
          {t("cancel")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("cancelDialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("cancelDialogDescription", { orderId })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t("cancelDialogConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RentalOrderCancelDialog;
