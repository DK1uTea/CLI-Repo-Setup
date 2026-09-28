"use client";

import { flushSync } from "react-dom";
import { profileSchema, type ProfileFormValues } from "../(helpers)/profile-schema";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfileSetting } from "./use-get-profile-setting";
import { useSubmitProfileSetting, type ProfileAddressState } from "./use-submit-profile-setting";
import type { AddressType, AddressValue } from "../(components)/setting-address-card/setting-address-dialog";

const EMPTY_ADDRESS_STATE: ProfileAddressState = {
  primary: null,
  billing: null,
  shipping: null,
};

export function useProfileManagement() {
  const { theme, setTheme } = useTheme()
  const [addressState, setAddressState] = useState<ProfileAddressState>(EMPTY_ADDRESS_STATE)
  const { data: profileSetting, dataUpdatedAt } = useProfileSetting()
  const lastSyncedProfileAt = useRef(0)
  const submitProfileSetting = useSubmitProfileSetting()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profileImage: "",
      appearance: "LIGHT",
      preferredLanguage: "en",
      timezone: "Europe/Berlin",
      currency: "EUR",
      dateFormat: "DD/MM/YYYY",
      enableWelcomeMsg: false,
      enableKeyMetrics: false,
      enableActivityChart: false,
      enableSalesChart: false,
      enableQuickActions: false,
      address: "",
      billingAddress: "",
      shippingAddress: "",
      theme: theme ?? 'dark',
      defaultTheme: theme ?? 'dark',
    },
  })

  const handleAddressChange = (type: AddressType, values: AddressValue) => {
    setAddressState((prev) => ({ ...prev, [type]: values }))
  }

  useEffect(() => {
    if (!profileSetting) return
    if (!dataUpdatedAt || lastSyncedProfileAt.current === dataUpdatedAt) return

    lastSyncedProfileAt.current = dataUpdatedAt

    const nextTheme = normalizeTheme(profileSetting.appearance)

    const { address: _address, billingAddress: _billingAddress, shippingAddress: _shippingAddress, ...profileFields } = profileSetting

    profileForm.reset({
      ...profileForm.getValues(),
      ...profileFields,
      phone: profileSetting.phone ?? '',
      profileImage: profileSetting.avatar ?? '',
      theme: nextTheme,
      defaultTheme: nextTheme,
    })
    setAddressState({
      primary: profileSetting.address,
      billing: profileSetting.billingAddress,
      shipping: profileSetting.shippingAddress,
    })
    applyThemeClass(nextTheme)
    setTheme(nextTheme)
  }, [dataUpdatedAt, profileForm, profileSetting, setTheme])

  const handleSaveSettings = async () => {
    await profileForm.handleSubmit(async (data: ProfileFormValues) => {
      try {
        await submitProfileSetting.mutateAsync({
          data,
          addressState,
          onSuccess: () => {
            flushSync(() => {
              profileForm.reset(data);
              profileForm.setValue("defaultTheme", data.theme);
            });
          },
        });
      } catch {
        // Toast is handled by the mutation hook.
      }
    })();
  };

  return {
    profileForm,
    profileSetting,
    addressState,
    handleAddressChange,
    handleSaveSettings,
    isSavingSettings: submitProfileSetting.isPending,
  };
}

function applyThemeClass(theme: string) {
  document.documentElement.classList.remove("light", "dark")
  document.documentElement.classList.add(theme)
  document.documentElement.style.colorScheme = theme
}

function normalizeTheme(appearance?: string) {
  return appearance?.toLowerCase() === "dark" ? "dark" : "light"
}
