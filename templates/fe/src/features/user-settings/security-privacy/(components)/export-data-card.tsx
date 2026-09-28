'use client'

import { useTranslations } from 'next-intl'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { useExportData } from '../(hooks)/use-export-data'

export function ExportDataCard() {
  const t = useTranslations('settings')
  const { isExporting, handleExport } = useExportData()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('privacyDataControl')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="size-8 text-primary shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-foreground">{t('exportData')}</p>
              <p className="text-sm text-muted-foreground">{t('exportDataDescription')}</p>
            </div>
          </div>
          <Button variant="outline-primary" className="w-fit ml-auto" onClick={handleExport} isLoading={isExporting}>
            {t('export')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
