'use client';

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState, useQueryStates } from "nuqs";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { apiProxy } from "@/lib/api";
import { dayjs, nowUtc } from "@/lib/date-utils";
import { useDateFormat } from "@/shared/stores/use-user-store";

type ExportParams = {
  eventId?: string;
  sort?: string;
  search?: string;
  filter?: string;
};

const fetchLeadExport = async (params: ExportParams) => {
  const response = await apiProxy.get<Blob>(
    `tf/leads/export`,
    {
      params,
      responseType: "blob",
    }
  );
  return response;
};

export const useLeadExport = () => {
  const t = useTranslations("reportingTool.leadsOverview");
  const [eventId] = useQueryState("eventId", parseAsString);
  const dateFormat = useDateFormat();

  const [filters] = useQueryStates({
    keyword: parseAsString.withDefault(""),
    status: parseAsString,
    sort: parseAsString.withDefault("updatedAt:desc"),
  });

  const queryParams = {
    eventId: eventId ?? undefined,
    sort: filters.sort,
    ...(filters.keyword ? { search: filters.keyword } : {}),
    ...(filters.status ? { filter: `status:eq:${filters.status}` } : {}),
  };

  const query = useQuery({
    queryKey: ["trade-fair-lead-export", queryParams],
    queryFn: async () => {
      if (!eventId) {
        throw new Error("No event ID provided");
      }
      try {
        const response = await fetchLeadExport(queryParams);
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
          const filename = `export_leads_${formattedDate}.${extension}`;

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
        console.error("Error exporting leads:", error);
        throw error;
      }
    },
    enabled: false, // Do not fetch on mount
  });

  return {
    isExporting: query.isFetching,
    exportLeads: () => query.refetch(),
    eventId,
  };
};
