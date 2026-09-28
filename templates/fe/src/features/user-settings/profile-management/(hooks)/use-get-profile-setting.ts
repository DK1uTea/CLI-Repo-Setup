"use client";

import { useQuery } from "@tanstack/react-query";
import { apiProxy } from "@/lib/api";
import { unescapeHTML } from "@/lib/html";
import type { ProfileFormValues } from "../(helpers)/profile-schema";
import type { AddressValue } from "../(components)/setting-address-card/setting-address-dialog";

type ProfileAddressResponse = {
  street?: string | null;
  city?: string | null;
  region?: string | null;
  postcode?: string | null;
  country?: string | null;
} | null;

type ProfileSettingResponse = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  avatar?: string | null;
  primaryAddress?: ProfileAddressResponse;
  billing?: ProfileAddressResponse;
  billingAddress?: ProfileAddressResponse;
  shippingAddress?: ProfileAddressResponse;
  languageRegion?: {
    preferredLanguage?: string;
    timeZone?: string;
    currency?: string;
    dateFormat?: ProfileFormValues["dateFormat"];
  } | null;
  settings?: {
    appearance?: string;
    preferredLanguage?: string;
    timezone?: string;
    currency?: string;
    dateFormat?: ProfileFormValues["dateFormat"];
    enableWelcomeMsg?: boolean;
    enableKeyMetrics?: boolean;
    enableActivityChart?: boolean;
    enableSalesChart?: boolean;
    enableQuickActions?: boolean;
  } | null;
};

export type ProfileSettingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  appearance: string;
  preferredLanguage: string;
  timezone: string;
  currency: string;
  dateFormat: ProfileFormValues["dateFormat"];
  enableWelcomeMsg: boolean;
  enableKeyMetrics: boolean;
  enableActivityChart: boolean;
  enableSalesChart: boolean;
  enableQuickActions: boolean;
  address: AddressValue | null;
  billingAddress: AddressValue | null;
  shippingAddress: AddressValue | null;
};

function toAddressValue(
  address: ProfileAddressResponse | undefined,
): AddressValue | null {
  if (!address) return null;
  const hasAnyValue = [
    address.street,
    address.city,
    address.region,
    address.postcode,
    address.country,
  ].some((v) => v);
  if (!hasAnyValue) return null;

  return {
    address: address.street || "",
    city: address.city || "",
    region: address.region || "",
    country: address.country || "DE",
    postalCode: address.postcode || "",
  };
}

async function fetchProfileSetting(): Promise<ProfileSettingFormData> {
  const response = await apiProxy.get("/user/profile");
  const responseBody = response.data as {
    data?: ProfileSettingResponse;
  } & ProfileSettingResponse;
  const userData = (responseBody.data ?? responseBody) as
    | ProfileSettingResponse
    | undefined;

  return {
    firstName: unescapeHTML(userData?.firstName) || "",
    lastName: unescapeHTML(userData?.lastName) || "",
    email: userData?.email || "",
    phone: userData?.phone || null,
    avatar: userData?.avatar || null,
    appearance: userData?.settings?.appearance || "LIGHT",
    preferredLanguage:
      userData?.languageRegion?.preferredLanguage ||
      userData?.settings?.preferredLanguage ||
      "en",
    timezone:
      userData?.languageRegion?.timeZone ||
      userData?.settings?.timezone ||
      "Europe/Berlin",
    currency:
      userData?.languageRegion?.currency ||
      userData?.settings?.currency ||
      "EUR",
    dateFormat:
      userData?.languageRegion?.dateFormat ||
      userData?.settings?.dateFormat ||
      "DD/MM/YYYY",
    enableWelcomeMsg: userData?.settings?.enableWelcomeMsg || false,
    enableKeyMetrics: userData?.settings?.enableKeyMetrics || false,
    enableActivityChart: userData?.settings?.enableActivityChart || false,
    enableSalesChart: userData?.settings?.enableSalesChart || false,
    enableQuickActions: userData?.settings?.enableQuickActions || false,
    address: toAddressValue(userData?.primaryAddress),
    billingAddress: toAddressValue(
      userData?.billing || userData?.billingAddress,
    ),
    shippingAddress: toAddressValue(userData?.shippingAddress),
  };
}

export function useProfileSetting() {
  return useQuery({
    queryKey: ["setting", "profile"],
    queryFn: fetchProfileSetting,
  });
}
