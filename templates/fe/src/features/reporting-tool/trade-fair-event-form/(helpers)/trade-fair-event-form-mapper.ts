import { dayjs } from "@/lib/date-utils";
import type { ImageFile } from "@/shared/components/ui/upload-dropzone";
import type { TradeFairEvent } from "../../(helpers)/trade-fair-event-type";
import type { TradeFairEventFormDto } from "./trade-fair-event-form-schema";

export function mapTradeFairEventToFormValues(
  event: TradeFairEvent
): Partial<TradeFairEventFormDto> {
  const startDate = dayjs.utc(event.startDate);
  const endDate = dayjs.utc(event.endDate);

  return {
    title: event.name,
    eventMode: event.mode,
    targetAudience: event.targetAudience ? [event.targetAudience] : [],
    eventType: event.type,
    description: event.description,
    participation: event.participation ?? "",
    eventId: event.eventCode,
    images: (Array.isArray(event.attachments) ? event.attachments : []).map<ImageFile>((attachment) => ({
      name: attachment.filename,
      size: attachment.size,
      preview: attachment.url,
    })),
    startDate: startDate.format("YYYY-MM-DD"),
    startTime: startDate.format("HH:mm"),
    endDate: endDate.format("YYYY-MM-DD"),
    endTime: endDate.format("HH:mm"),
    eventLocation: event.location?.id || "",
    locationId: event.location?.id,
    address: event.location?.locationName,
    street: event.location?.street,
    zipCode: event.location?.postcode,
    city: event.location?.city,
    isSaveLocation: false,
    surveys: event.surveys?.map((eventSurvey) => ({
      surveyId: eventSurvey.id,
      requiredLogin: eventSurvey.requiredLogin ?? true,
    })) ?? [],
  };
}

export function mapTradeFairEventFormToPayload(data: TradeFairEventFormDto) {
  return {
    name: data.title,
    description: data.description,
    type: data.eventType,
    leadTarget: 0,
    startDate: dayjs.utc(`${data.startDate}T${data.startTime}`).toISOString(),
    endDate: dayjs.utc(`${data.endDate}T${data.endTime}`).toISOString(),
    mode: data.eventMode,
    eventCode: data.eventId,
    targetAudience: data.targetAudience[0] ?? "",
    participation: data.participation,
    isSaveLocation: data.isSaveLocation,
    locationId: data.locationId || undefined,
    location: {
      locationName: data.address,
      street: data.street,
      postcode: data.zipCode,
      city: data.city,
    },
    attachments: data.images.map((image) => ({
      url: image.url || image.preview,
      filename: image.name,
      mimeType: image.file?.type ?? "",
      size: image.size,
    })),
  };
}
