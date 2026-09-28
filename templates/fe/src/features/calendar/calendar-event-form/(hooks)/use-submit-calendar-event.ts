"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQueryState, parseAsString } from "nuqs";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiProxy } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import { getEventImagePayload, mergeUploadedEventImages } from "@/features/events/event-form/(helpers)/event-image-files";
import { useUploadEventFiles } from "@/features/events/event-form/(hooks)/use-upload-event-files";
import type { CalendarEventFormDto } from "../(helpers)/calendar-event-form-schema";

// Field values now come straight from the shared step-overview UI as the
// backend's real enum keys (events' form was updated to match the API 1:1),
// so no display-label → enum mapping is needed here anymore.
function buildCalendarEventPayload(data: CalendarEventFormDto) {
  return {
    title: data.title,
    mode: data.mode,
    targetAudience: data.targetAudience ?? [],
    customEventId: data.customEventId || undefined,
    eventTypeId: data.eventTypeId,
    shortDescription: data.shortDescription,
    link: data.link || undefined,
    images: getEventImagePayload(data.images ?? []),
    startTime: data.startTime
      ? `${data.startDate}T${data.startTime}:00Z`
      : undefined,
    endTime: data.endTime ? `${data.endDate}T${data.endTime}:00Z` : undefined,
    locationId: data.locationId || undefined,
    isSaveAddress: data.isSaveAddress,
    location: {
      name: data.address,
      street: data.street,
      city: data.city,
      postalCode: data.zipCode,
    },
    adminContact: {
      firstName: data.contactFirstName,
      lastName: data.contactLastName,
      email: data.contactEmail,
      phone: data.contactPhone,
    },
    otherContacts: (data.contacts ?? []).map((c) => ({
      name: c.contactName,
      email: c.contactEmail,
      phone: c.contactPhone,
      role: c.role,
    })),
    isPrivate: data.doNotPublish,
    partnershipTypes: data.partnershipTypes ?? [],
    productPartnerCategories: data.productPartnerCategories ?? [],
  };
}

async function createCalendarEvent(data: CalendarEventFormDto) {
  const payload = buildCalendarEventPayload(data);
  const response = await apiProxy.post("etr/calendar", payload);
  return response.data;
}

async function updateCalendarEvent(eventId: string, data: CalendarEventFormDto) {
  const payload = buildCalendarEventPayload(data);
  const response = await apiProxy.patch(`etr/calendar/${eventId}`, payload);
  return response.data;
}

type Options = {
  redirectHref?: string;
  redirectAfterSubmit?: boolean;
};

export function useSubmitCalendarEvent(options: Options = {}) {
  const methods = useFormContext<CalendarEventFormDto>();
  const router = useRouter();
  const t = useTranslations("eventForm.overview");
  const queryClient = useQueryClient();
  const { uploadFiles, isUploading } = useUploadEventFiles();
  // The real backend id (path param) — distinct from `data.customEventId`,
  // which is the user-facing custom event ID (EVENT-xxxxxxxx) in the payload.
  const [eventId] = useQueryState("eventId", parseAsString);
  const isUpdateMode = !!eventId;
  const redirectHref = options.redirectHref ?? "/calendar-dashboard";
  const redirectAfterSubmit = options.redirectAfterSubmit ?? true;
  const [isPending, setIsPending] = useState(false);

  const submit = async (): Promise<boolean> => {
    let didSubmit = false;
    await methods.handleSubmit(async (data) => {
      const images = data.images ?? [];
      const pendingImages = images.filter((image) => !image.isUploaded && image.file);
      if (pendingImages.length > 0) {
        try {
          const uploaded = await uploadFiles(pendingImages.map((image) => image.file!), "event");
          data.images = mergeUploadedEventImages(images, pendingImages, uploaded);
          methods.setValue("images", data.images, { shouldDirty: true });
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error(t("imageUploadFailed"));
          return;
        }
      }

      setIsPending(true);
      try {
        if (isUpdateMode) {
          await updateCalendarEvent(eventId, data);
        } else {
          await createCalendarEvent(data);
        }
        // Refetch the calendar list so the created/updated event shows up
        // immediately once the user is redirected back to the dashboard, and
        // the detail cache so re-opening the same event shows fresh data
        // instead of the pre-update snapshot (staleTime would otherwise keep
        // serving the cached version for up to a minute).
        await queryClient.invalidateQueries({ queryKey: ["calendar-list"] });
        if (isUpdateMode) {
          await queryClient.invalidateQueries({
            queryKey: ["calendar-event-detail", eventId],
          });
        }
        if (redirectAfterSubmit) {
          router.push(redirectHref);
        }
        didSubmit = true;
      } catch (error) {
        console.error("Submit Calendar event failed:", error);
      } finally {
        setIsPending(false);
      }
    })();
    return didSubmit;
  };

  return { submit, isPending: isPending || isUploading, isUpdateMode };
}
