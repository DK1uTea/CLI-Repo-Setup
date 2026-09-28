'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { apiProxy } from '@/lib/api';
import { dayjs, nowUtc } from '@/lib/date-utils';
import { REPEATED_ARRAY_PARAMS_SERIALIZER } from '@/lib/query-params';
import { useDateFormat } from '@/shared/stores/use-user-store';
import { useCalendarListFilters } from './use-calendar-list-filters';

export type ExportCalendarOptions = {
  year?: number | null;
  yearScope?: 'ALL' | 'PAST' | 'FUTURE' | null;
};

export type ExportCalendarFilters = {
  keyword?: string | null;
  status?: string | null;
  eventTypeId?: string | null;
  timeFrame?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  partnershipTypes?: string[] | null;
  productPartnerCategories?: string[] | null;
  targetAudience?: string[] | null;
  onlyMine?: boolean | null;
};

// Calendar events are exported through the same shared endpoint as regular
// events — `isCalendarEvent: true` is what scopes the export to them, same
// flag the overview step sends on create (use-submit-step-overview.ts).
export function buildCalendarExportParams(
  filters: ExportCalendarFilters,
  options?: ExportCalendarOptions,
): Record<string, unknown> {
  const queryParams: Record<string, unknown> = {
    sort: 'createdAt:desc',
    isCalendarEvent: true,
  };

  if (filters.keyword) queryParams.search = filters.keyword;
  if (filters.status && filters.status !== 'all') queryParams.status = filters.status;
  if (filters.eventTypeId && filters.eventTypeId !== 'all') queryParams.eventTypeId = filters.eventTypeId;
  if (filters.timeFrame && filters.timeFrame !== 'all') queryParams.timeFrame = filters.timeFrame;
  if (filters.startDate) queryParams.startDate = filters.startDate;
  if (filters.endDate) queryParams.endDate = filters.endDate;
  if (filters.partnershipTypes?.length) queryParams.partnershipTypes = filters.partnershipTypes;
  if (filters.productPartnerCategories?.length) {
    queryParams.productPartnerCategories = filters.productPartnerCategories;
  }
  if (filters.targetAudience?.length) queryParams.targetAudience = filters.targetAudience;
  if (filters.onlyMine) queryParams.onlyMine = true;

  if (options?.year) {
    queryParams.year = options.year;
    const currentYear = new Date().getFullYear();
    if (options.year === currentYear && options.yearScope) queryParams.yearScope = options.yearScope;
  }

  return queryParams;
}

export function useExportCalendarToExcel() {
  const t = useTranslations('calendarList');
  const dateFormat = useDateFormat();
  const { filters } = useCalendarListFilters();
  const [isExporting, setIsExporting] = useState(false);

  const exportEvents = async (options?: ExportCalendarOptions) => {
    setIsExporting(true);
    try {
      const queryParams = buildCalendarExportParams(filters, options);

      const response = await apiProxy.get<Blob>('/etr/events/export', {
        params: queryParams,
        paramsSerializer: REPEATED_ARRAY_PARAMS_SERIALIZER,
        responseType: 'blob',
      });

      if (response && response.status === 200 && response.data) {
        const safeFormat = dateFormat.replace(/\//g, '-');
        const formattedDate = dayjs(nowUtc()).format(safeFormat);

        let extension = 'xlsx';
        const contentDisposition = response.headers?.['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/);
          if (filenameMatch && filenameMatch[1]) {
            const parsedName = decodeURIComponent(filenameMatch[1]);
            const extMatch = parsedName.match(/\.([^.]+)$/);
            if (extMatch && extMatch[1]) extension = extMatch[1];
          }
        }
        const filename = `export_calendar_${formattedDate}.${extension}`;

        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(t('exportSuccess'));
      }
    } catch (error) {
      console.error('Error exporting calendar events:', error);
      toast.error(t('exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  return { exportEvents, isExporting };
}
