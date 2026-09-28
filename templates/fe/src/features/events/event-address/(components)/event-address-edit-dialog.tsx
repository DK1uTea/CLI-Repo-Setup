'use client'

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import type { EventLocation } from "../(hooks)/use-event-location-pagination";
import { useUpdateEventLocation } from "../(hooks)/use-update-event-location";
import LocationForm from "../event-address-form/(components)/location-form";
import type { LocationFormData } from "../event-address-form/(helpers)/location-form-schema";

type EventAddressEditDialogProps = {
  address: EventLocation;
};

function mapAddressToFormValues(address: EventLocation): LocationFormData {
  return {
    locationName: address.name,
    street: address.street,
    postcode: address.postalCode,
    city: address.city,
    state: address.state ?? "",
    countryCode: address.countryCode ?? "DE",
    country: address.country ?? "Germany",
  };
}

const EventAddressEditDialog = ({ address }: EventAddressEditDialogProps) => {
  const t = useTranslations("events.address");
  const [open, setOpen] = useState(false);
  const { mutateAsync: updateLocation } = useUpdateEventLocation();

  const onSubmit = async (values: LocationFormData) => {
    try {
      await updateLocation({
        id: address.id,
        payload: {
          name: values.locationName,
          street: values.street,
          city: values.city,
          postalCode: values.postcode,
          state: values.state,
          countryCode: values.countryCode,
          country: values.country,
        },
      });
      setOpen(false);
    } catch {
      // Error handled by mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground/80"
        aria-label={t("editAddress", { addressName: address.name })}
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-5" />
      </Button>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl gap-0 _custom-scroll">
        <DialogHeader>
          <DialogTitle className="font-semibold py-3">
            {t("editAddress", { addressName: address.name })}
          </DialogTitle>
        </DialogHeader>
        <Separator className="my-4"/>
        <LocationForm
          defaultValues={mapAddressToFormValues(address)}
          onCancel={() => setOpen(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventAddressEditDialog;
