"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEventLocation } from "@/features/events/event-form/(hooks)/use-event-location";
import {
  COUNTRY_OPTIONS,
  DEFAULT_LOCATION_FORM_VALUES,
  locationFormSchema,
  type LocationFormData,
} from "../(helpers)/location-form-schema";

type UseLocationFormProps = {
  defaultValues?: LocationFormData;
  onSubmit?: (values: LocationFormData) => void;
};

const countryNameMap = new Map(COUNTRY_OPTIONS.map((country) => [country.value, country.label]));

export const useLocationForm = ({
  defaultValues = DEFAULT_LOCATION_FORM_VALUES,
  onSubmit: submitHandler,
}: UseLocationFormProps = {}) => {
  const form = useForm<LocationFormData>({
    mode: "onChange",
    resolver: zodResolver(locationFormSchema),
    defaultValues,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const {
    locations,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useEventLocation({ search: searchQuery });

  const [selectedLocation, setSelectedLocation] = useState("");

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  function handleLocationChange(value: string) {
    setSelectedLocation(value);
    const location = locations.find((option) => option.id === value);

    if (!location) {
      return;
    }

    form.reset(
      {
        locationName: location.name,
        street: location.street,
        postcode: location.postalCode,
        city: location.city,
        state: location.state ?? "",
        countryCode: location.countryCode ?? "DE",
        country: location.country ?? "Germany",
      },
      { keepDefaultValues: true },
    );
  }

  function handleLocationSearch(query: string) {
    setSearchQuery(query);
  }

  function handleCountryChange(countryCode: string) {
    form.setValue("countryCode", countryCode, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("country", countryNameMap.get(countryCode) ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    submitHandler?.(values);
  });

  return {
    form,
    onSubmit,
    selectedLocation,
    locationOptions,
    countryOptions: COUNTRY_OPTIONS,
    searching: isLoading || isFetchingNextPage,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    handleLocationChange,
    handleLocationSearch,
    handleCountryChange,
  };
};
