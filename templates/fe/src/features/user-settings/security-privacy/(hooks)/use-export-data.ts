"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { apiProxy } from "@/lib/api";

export function useExportData() {
  const t = useTranslations("settings");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const res = await apiProxy.get<Blob>("/user/export-personal-data", {
        responseType: "blob",
      });

      const blob = res.data;
      if (!blob || blob.size === 0) {
        toast.error(t("exportDataError"));
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "personal_data.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("exportDataError"));
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, handleExport };
}
