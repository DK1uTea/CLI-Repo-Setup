'use client'

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { ComboboxFloat } from "@/shared/components/ui/combobox-float";
import { InputFloat } from "@/shared/components/ui/input-float";
import { SelectGroup, SelectItem } from "@/shared/components/ui/select";
import { SelectFloat } from "@/shared/components/ui/select-float";
import { useLocationForm } from "../(hooks)/use-location-form";
import type { LocationFormData } from "../(helpers)/location-form-schema";

type LocationFormProps = {
  defaultValues?: LocationFormData;
  onCancel?: () => void;
  onSubmit?: (values: LocationFormData) => void;
};

const LocationForm = ({ defaultValues, onCancel, onSubmit: submitHandler }: LocationFormProps) => {
  const t = useTranslations("events.address.form");
  const {
    form,
    onSubmit,
    selectedLocation,
    locationOptions,
    countryOptions,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleLocationChange,
    handleLocationSearch,
    handleCountryChange,
  } = useLocationForm({ defaultValues, onSubmit: submitHandler });
  const { control, formState: { errors } } = form;

  const textFields: Array<{
    name: keyof Pick<LocationFormData, "locationName" | "street" | "postcode" | "city" | "state">;
    label: string;
  }> = [
    { name: "locationName", label: t("venueName") },
    { name: "street", label: t("street") },
    { name: "postcode", label: t("postalCode") },
    { name: "city", label: t("city") },
    { name: "state", label: t("state") },
  ];

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <ComboboxFloat
        label={t("selectLocation")}
        value={selectedLocation}
        onValueChange={handleLocationChange}
        onSearchChange={handleLocationSearch}
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        loadingMore={isFetchingNextPage}
        options={locationOptions}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {textFields.map((textField) => (
          <Controller
            key={textField.name}
            name={textField.name}
            control={control}
            render={({ field }) => (
              <InputFloat
                id={textField.name}
                label={textField.label}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                error={errors[textField.name]?.message}
              />
            )}
          />
        ))}
        <Controller
          name="countryCode"
          control={control}
          render={({ field }) => (
            <SelectFloat
              label={t("selectCountry")}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                handleCountryChange(value);
              }}
              error={errors.countryCode?.message}
            >
              <SelectGroup>
                {countryOptions.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectFloat>
          )}
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
        )}
        <Button type="submit">{t("save")}</Button>
      </div>
    </form>
  );
}

export default LocationForm;
