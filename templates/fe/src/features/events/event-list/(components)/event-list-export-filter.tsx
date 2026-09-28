'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useExportEventToExcel } from '../(hooks)/use-export-event-to-excel'

export function EventListExportFilter() {
  const t = useTranslations('events.list')
  const { exportEvents, isExporting } = useExportEventToExcel()
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())
  const [selectedScope, setSelectedScope] = useState<'ALL' | 'PAST' | 'FUTURE'>('ALL')

  const years = Array.from({ length: 2030 - 2024 + 1 }, (_, i) => (2024 + i).toString())

  const handleExport = async () => {
    await exportEvents({
      year: parseInt(selectedYear, 10),
      yearScope: selectedScope,
    })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5 text-sm font-semibold" disabled={isExporting}>
          {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {t('exportToExcel')}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-3 flex flex-col gap-3">
        <RadioGroup
          value={selectedScope}
          onValueChange={(val) => setSelectedScope(val as 'ALL' | 'PAST' | 'FUTURE')}
          disabled={isExporting}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="ALL" id="scope-all" />
            <Label htmlFor="scope-all" className="text-sm font-medium cursor-pointer">
              {t('exportAll')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="PAST" id="scope-past" />
            <Label htmlFor="scope-past" className="text-sm font-medium cursor-pointer">
              {t('exportPast')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="FUTURE" id="scope-future" />
            <Label htmlFor="scope-future" className="text-sm font-medium cursor-pointer">
              {t('exportFuture')}
            </Label>
          </div>
        </RadioGroup>

        <div className="flex items-center justify-between gap-2 border-t pt-3">
          <Label className="text-sm font-medium">{t('year')}:</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear} disabled={isExporting}>
            <SelectTrigger className="h-8 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            {t('export')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
