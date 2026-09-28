"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { parseAsString, useQueryState } from "nuqs";
import { useRouter } from "@/i18n/navigation";
import type { TradeFairEventFormDto } from "../(helpers)/trade-fair-event-form-schema";
import { useCreateEvent } from "./use-create-event";
import { useUpdateEvent } from "./use-update-event";
import { useTradeFairEventActions } from "./use-trade-fair-event-action";
import { useAddSurveyToEvent } from "@/features/reporting-tool/(hooks)/(survey-hooks)/use-add-survey-to-event";
import { useEventDetail } from "@/features/reporting-tool/(hooks)/use-event-detail";
import { useUploadAttachments } from "./use-upload-attachments";
import { useLaunchEvent } from "./use-launch-event";

type Options = {
  redirectHref?: string;
};

export function useSubmitTradeFairEvent(options: Options = {}) {
  const methods = useFormContext<TradeFairEventFormDto>();
  const router = useRouter();
  const t = useTranslations("reportingTool.tradeFairEventForm");
  const redirectHref = options.redirectHref ?? "/reporting-tool";
  const [id] = useQueryState("id", parseAsString);
  const { currentStep } = useTradeFairEventActions();
  const { eventDetail } = useEventDetail(id || "");

  const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent(
    id || "",
  );
  const { addSurveyToEvent, isAdding: isAddingSurvey } = useAddSurveyToEvent(
    id || "",
  );
  const { uploadFiles, isUploading: isUploadingAttachments } =
    useUploadAttachments();
  const { mutateAsync: launchEvent, isPending: isLaunching } = useLaunchEvent(
    id || "",
  );

  const isPending =
    isCreating ||
    isUpdating ||
    isAddingSurvey ||
    isLaunching ||
    isUploadingAttachments;

  const moveToReportingTool = () => {
    router.push(id ? `/reporting-tool?eventId=${id}` : "/reporting-tool");
  };

  const saveDraft = async (): Promise<void> => {
    try {
      if (currentStep === "general-info") {
        const images = methods.getValues("images") || [];
        const pendingUpload = images.filter(
          (img) => !img.isUploaded && img.file,
        );

        if (pendingUpload.length > 0) {
          const filesToUpload = pendingUpload.map((img) => img.file!);
          const uploaded = await uploadFiles(filesToUpload);

          const mergedImages = images.map((img) => {
            const matched = uploaded.find((att) => att.filename === img.name);
            if (!matched) return img;
            return {
              ...img,
              url: matched.url,
              preview: img.preview,
              isUploaded: true,
            };
          });

          methods.setValue("images", mergedImages, { shouldDirty: true });
        }

        const finalData = methods.getValues();

        if (id) {
          await updateEvent({ data: finalData, status: "DRAFT" });
          toast.success(t("draftSaved"));
          moveToReportingTool();
        } else {
          await createEvent({ data: finalData, status: "DRAFT" });
          toast.success(t("draftSaved"));
          moveToReportingTool();
        }
      } else if (currentStep === "survey") {
        const surveys = methods.getValues("surveys") || [];
        if (id) {
          await addSurveyToEvent({ surveys });
          toast.success(t("draftSaved"));
          moveToReportingTool();
        }
      } else {
        toast.success(t("draftSaved"));
        moveToReportingTool();
      }
    } catch (error) {
      console.error("Saving draft failed:", error);
    }
  };

  const launch = async (): Promise<void> => {
    try {
      if (id && eventDetail?.status === "DRAFT") {
        await launchEvent();
      }
      toast.success(t("eventLaunched"));
      router.push(redirectHref);
    } catch (error) {
      console.error("Launching event failed:", error);
    }
  };

  return { saveDraft, launch, isPending };
}
