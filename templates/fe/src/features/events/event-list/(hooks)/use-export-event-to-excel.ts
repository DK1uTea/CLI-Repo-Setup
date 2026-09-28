'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { apiProxy } from '@/lib/api'
import { dayjs, nowUtc } from '@/lib/date-utils'
import { REPEATED_ARRAY_PARAMS_SERIALIZER } from '@/lib/query-params'
import { useDateFormat } from '@/shared/stores/use-user-store'
import { useEventListFilters } from './use-event-list-filters'

export type ExportEventOptions = {
  year?: number | null
  yearScope?: 'ALL' | 'PAST' | 'FUTURE' | null
}

export function useExportEventToExcel() {
  const t = useTranslations('events.list')
  const dateFormat = useDateFormat()
  const { filters } = useEventListFilters()
  const [isExporting, setIsExporting] = useState(false)

  const exportEvents = async (options?: ExportEventOptions) => {
    setIsExporting(true)
    try {
      const queryParams: Record<string, any> = {
        sort: 'createdAt:desc',
      }

      if (filters.keyword) queryParams.search = filters.keyword
      if (filters.status && filters.status !== 'all') {
        queryParams.status = filters.status.toUpperCase()
      }
      if (filters.event_type && filters.event_type !== 'all') {
        queryParams.eventTypeId = filters.event_type
      }
      if (filters.userId && filters.userId !== 'all') {
        queryParams.createdBy = filters.userId
      }
      if (filters.timeFrame && filters.timeFrame !== 'all') {
        queryParams.timeFrame = filters.timeFrame
      }
      if (filters.start_date) queryParams.startDate = filters.start_date
      if (filters.end_date) queryParams.endDate = filters.end_date

      if (filters.partnershipTypes) {
        queryParams.partnershipTypes = filters.partnershipTypes.split(',')
      }
      if (filters.productPartnerCategories) {
        queryParams.productPartnerCategories = filters.productPartnerCategories.split(',')
      }
      if (filters.targetAudience) {
        queryParams.targetAudience = filters.targetAudience.split(',')
      }

      queryParams.onlyMine = filters.my_event === 'true'

      if (options?.year) {
        queryParams.year = options.year
        const currentYear = new Date().getFullYear()
        if (options.year === currentYear && options.yearScope) {
          queryParams.yearScope = options.yearScope
        }
      }

      const response = await apiProxy.get<Blob>('/etr/events/export', {
        params: queryParams,
        paramsSerializer: REPEATED_ARRAY_PARAMS_SERIALIZER,
        responseType: 'blob',
      })

      if (response && response.status === 200 && response.data) {
        const safeFormat = dateFormat.replace(/\//g, '-')
        const formattedDate = dayjs(nowUtc()).format(safeFormat)

        let extension = 'xlsx'
        const contentDisposition = response.headers?.['content-disposition']
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/
          )
          if (filenameMatch && filenameMatch[1]) {
            const parsedName = decodeURIComponent(filenameMatch[1])
            const extMatch = parsedName.match(/\.([^.]+)$/)
            if (extMatch && extMatch[1]) {
              extension = extMatch[1]
            }
          }
        }
        const filename = `export_events_${formattedDate}.${extension}`

        const url = URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success(t('exportSuccess') ?? 'Events exported successfully')
      }
    } catch (error) {
      console.error('Error exporting events:', error)
      toast.error(t('exportFailed') ?? 'Failed to export events')
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportEvents,
    isExporting,
  }
}
