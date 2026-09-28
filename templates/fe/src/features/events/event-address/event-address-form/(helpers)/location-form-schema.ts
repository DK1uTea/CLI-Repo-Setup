import { z } from "zod";
import { zString } from "@/shared/schemas";

export const locationFormSchema = z.object({
  locationName: zString(["required"]),
  street: zString(["required"]),
  postcode: zString(["required"]),
  city: zString(["required"]),
  state: zString(["required"]),
  countryCode: zString(["required"]),
  country: zString(["required"]),
});

export type LocationFormData = z.infer<typeof locationFormSchema>;

export type CountryOption = {
  value: string;
  label: string;
};

export const DEFAULT_LOCATION_FORM_VALUES: LocationFormData = {
  locationName: "",
  street: "",
  postcode: "",
  city: "",
  state: "",
  countryCode: "",
  country: "",
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { value: "DE", label: "Germany" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Switzerland" },
  { value: "FR", label: "France" },
  { value: "NL", label: "Netherlands" },
  { value: "US", label: "United States" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
];
