'use client'

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import { useAddEventLocation } from "../(hooks)/use-add-event-location";
import LocationForm from "../event-address-form/(components)/location-form";
import type { LocationFormData } from "../event-address-form/(helpers)/location-form-schema";

const EventAddressAddDialog = () => {
  const t = useTranslations("events");
  const [open, setOpen] = useState(false);
  const { mutateAsync: addLocation } = useAddEventLocation();

  const onSubmit = async (values: LocationFormData) => {
    try {
      await addLocation({
        name: values.locationName,
        street: values.street,
        city: values.city,
        postalCode: values.postcode,
        state: values.state,
        countryCode: values.countryCode,
        country: values.country,
      });
      setOpen(false);
    } catch {
      // Error handled by global interceptor/mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        className="shrink-0"
        onClick={() => setOpen(true)}
      >
        {t("newAddress")}
        <PlusIcon strokeWidth={3} />
      </Button>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl gap-0 _custom-scroll">
        <DialogHeader>
          <DialogTitle className="font-semibold py-3">{t("newAddress")}</DialogTitle>
        </DialogHeader>
        <Separator className="my-4"/>
        <LocationForm
          onCancel={() => setOpen(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventAddressAddDialog;
