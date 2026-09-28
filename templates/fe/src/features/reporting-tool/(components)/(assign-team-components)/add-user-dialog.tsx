"use client";

import { Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import type { AddUserFormValues } from "@/features/reporting-tool/(helpers)/add-user-schema";
import { useAddUserForm } from "@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-add-user-form";
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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import UserRoleRadioGroup from "./user-role-radio-group";

type AddUserDialogProps = {
  children: ReactNode;
  onAddUser?: (values: AddUserFormValues) => void;
};

const AddUserDialog = ({ children, onAddUser }: AddUserDialogProps) => {
  const t = useTranslations("reportingTool.tradeFairEventForm.assignTeam.addUserDialog");
  const [open, setOpen] = useState(false);
  const {
    form: {
      register,
      control,
      handleSubmit,
      reset,
      formState: { errors, isValid },
    },
    onSubmit,
  } = useAddUserForm({ onAddUser });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const handleValidSubmit = (values: AddUserFormValues) => {
    onSubmit(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-0 sm:max-w-xl">
        <form onSubmit={handleSubmit(handleValidSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-semibold text-xl">{t("title")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-user-first-name">{t("firstName")}</Label>
                <Input
                  id="add-user-first-name"
                  placeholder={t("firstName")}
                  aria-invalid={!!errors.firstName}
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-user-last-name">{t("lastName")}</Label>
                <Input
                  id="add-user-last-name"
                  placeholder={t("lastName")}
                  aria-invalid={!!errors.lastName}
                  error={errors.lastName?.message}
                  {...register("lastName")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="add-user-email">{t("email")}</Label>
              <Input
                id="add-user-email"
                type="email"
                placeholder={t("email")}
                aria-invalid={!!errors.email}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold">{t("userRoles")}</h3>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <UserRoleRadioGroup
                    idPrefix="add-user-role"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline-primary">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isValid}>{t("submit")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
