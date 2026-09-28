"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";
import { escapeHTML } from "@/lib/html";
import type { ProfileFormValues } from "../(helpers)/profile-schema";
import type {
  AddressType,
  AddressValue,
} from "../(components)/setting-address-card/setting-address-dialog";

export type ProfileAddressState = Record<AddressType, AddressValue | null>;

type SubmitProfileSettingParams = {
  data: ProfileFormValues;
  addressState: ProfileAddressState;
  onSuccess?: () => void;
};

type AddressPayload = {
  street: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
};

function normalizeAppearance(data: ProfileFormValues) {
  const appearance = data.appearance || data.theme || "LIGHT";
  return appearance.toUpperCase();
}

function toAddressPayload(address: AddressValue | null): AddressPayload | undefined {
  if (!address) return undefined;

  const payload = {
    street: address.address?.trim() ?? "",
    city: address.city?.trim() ?? "",
    region: address.region?.trim() ?? "",
    postcode: address.postalCode?.trim() ?? "",
    country: address.country?.trim() ?? "",
  };

  // BE requires every field to be non-empty. Old data may contain a country
  // with the rest blank (e.g. { country: "DE", city: "", ... }) — sending that
  // triggers "should not be empty" errors. Only send a fully-filled address;
  // an incomplete one is skipped entirely.
  const isComplete = Object.values(payload).every(Boolean);
  return isComplete ? payload : undefined;
}

async function submitProfileSetting({
  data,
  addressState,
}: SubmitProfileSettingParams) {
  const primaryAddress = toAddressPayload(addressState.primary);
  const billing = toAddressPayload(addressState.billing);
  const shippingAddress = toAddressPayload(addressState.shipping);

  const formData = {
    firstName: escapeHTML(data.firstName),
    lastName: escapeHTML(data.lastName),
    ...(data.phone ? { phone: data.phone } : {}),
    appearance: normalizeAppearance(data),
    enableWelcomeMsg: data.enableWelcomeMsg,
    enableKeyMetrics: data.enableKeyMetrics,
    enableActivityChart: data.enableActivityChart,
    enableSalesChart: data.enableSalesChart,
    enableQuickActions: data.enableQuickActions,
    ...(primaryAddress ? { primaryAddress } : {}),
    ...(billing ? { billing } : {}),
    ...(shippingAddress ? { shippingAddress } : {}),
    languageRegion: {
      preferredLanguage: data.preferredLanguage,
      timeZone: data.timezone,
      currency: data.currency,
      dateFormat: data.dateFormat,
    },
  };

  return apiProxy.put("/user/profile", formData);
}

function setCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function reloadWithLocale(locale: string) {
  const pathWithoutLocale =
    window.location.pathname.replace(/^\/(en|de)(?=\/|$)/, "") || "";
  window.location.assign(
    `/${locale}${pathWithoutLocale}${window.location.search}${window.location.hash}`,
  );
}

export function useSubmitProfileSetting() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitProfileSetting,
    onSuccess: async (_response, variables) => {
      const { data, onSuccess } = variables;
      const preferredLanguage = data.preferredLanguage || locale;
      const appearance = normalizeAppearance(data).toLowerCase();

      toast.success(t("profileUpdateSuccess"));
      setCookie("preferredLanguage", preferredLanguage);
      setCookie("NEXT_LOCALE", preferredLanguage, 60 * 60 * 24 * 365 * 10);
      setCookie("appearance", appearance);

      onSuccess?.();

      if (preferredLanguage !== locale) {
        reloadWithLocale(preferredLanguage);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["setting", "profile"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
