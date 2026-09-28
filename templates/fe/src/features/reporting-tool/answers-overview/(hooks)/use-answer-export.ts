'use client';

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { apiProxy } from "@/lib/api";
import { dayjs, nowUtc } from "@/lib/date-utils";
import { useDateFormat } from "@/shared/stores/use-user-store";

type ExportParams = {
  eventId?: string;
  ids?: string;
};

const fetchAnswerExport = async (params: ExportParams) => {
  const response = await apiProxy.get<Blob>(
    `tf/answers/export`,
    {
      params,
      responseType: "blob",
    }
  );
  return response;
};

export const useAnswerExport = (params?: ExportParams) => {
  const t = useTranslations("reportingTool.answersOverview");
  const [queryEventId] = useQueryState("eventId", parseAsString);
  const [queryAnswerId] = useQueryState("id", parseAsString);
  const dateFormat = useDateFormat();

  const eventId = params?.eventId ?? queryEventId ?? undefined;
  const ids = params?.ids ?? queryAnswerId ?? undefined;

  const queryParams = {
    eventId,
    ...(ids ? { ids } : {}),
  };

  const query = useQuery({
    queryKey: ["trade-fair-answer-export", queryParams],
    queryFn: async () => {
      if (!eventId) {
        throw new Error("No event ID provided");
      }
      try {
        const response = await fetchAnswerExport(queryParams);
        if (response && response.status === 200 && response.data) {
          const safeFormat = dateFormat.replace(/\//g, "-");
          const formattedDate = dayjs(nowUtc()).format(safeFormat);

          let extension = "xlsx";
          const contentDisposition = response.headers?.["content-disposition"];
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(
              /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/
            );
            if (filenameMatch && filenameMatch[1]) {
              const parsedName = decodeURIComponent(filenameMatch[1]);
              const extMatch = parsedName.match(/\.([^.]+)$/);
              if (extMatch && extMatch[1]) {
                extension = extMatch[1];
              }
            }
          }
          const filename = `export_reports_${formattedDate}.${extension}`;

          // Trigger file download
          const url = URL.createObjectURL(response.data);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast.success(t("exportSuccess"));
          return response.data;
        }
      } catch (error) {
        console.error("Error exporting answers:", error);
        throw error;
      }
    },
    enabled: false, // Do not fetch on mount
  });

  return {
    isExporting: query.isFetching,
    exportAnswers: () => query.refetch(),
    eventId,
  };
};
