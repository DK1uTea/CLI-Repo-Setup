"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { apiProxy } from "@/lib/api";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../(helpers)/security-schema";

type ChangePasswordErrorResponse = {
  message?: string | string[];
  error_code?: string;
  status?: number;
};

export function useChangePassword() {
  const t = useTranslations("settings");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      setIsSubmitting(true);

      const res = await apiProxy.patch("/user/change-password", data, {
        _skipToast: true,
      } as object);

      if (res.status === 200) {
        toast.success(t("passwordChangedSuccess"));

        form.setValue("currentPassword", "");
        form.setValue("newPassword", "");
        form.setValue("confirmPassword", "");
      }
    } catch (error) {
      if (axios.isAxiosError<ChangePasswordErrorResponse>(error)) {
        const raw = error.response?.data;
        // Backend returns message as the error code (e.g. "USER.NEW_PASSWORD_SAME_AS_CURRENT")
        const errorCode =
          raw?.error_code ??
          (typeof raw?.message === "string" ? raw.message : undefined);
        const localizedMessage = errorCode
          ? getErrorMessage(errorCode)
          : t("passwordChangedError");

        const targetField =
          errorCode === "USER.CURRENT_PASSWORD_INCORRECT"
            ? "currentPassword"
            : "newPassword";

        form.setError(targetField, {
          type: "manual",
          message: localizedMessage,
        });

        return;
      }

      toast.error(t("passwordChangedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, isSubmitting, onSubmit: form.handleSubmit(onSubmit) };
}
