'use client'

import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { AddRoleFormValues } from '../(helpers)/add-role-schema'

export function RoleInfoForm() {
  const t = useTranslations('settings')
  const { control } = useFormContext<AddRoleFormValues>()
  const { errors } = useFormState<AddRoleFormValues>()

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs text-foreground/70">
            {t('roleName')} <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                id="name"
                placeholder={t('enterRoleName')}
                translate="no"
                error={errors.name?.message}
                value={field.value ?? ''}
              />
            )}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="status" className="text-xs text-foreground/70">
            {t('statusColumn')} <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value || 'ACTIVE'} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="h-10! w-full">
                  <SelectValue placeholder={t('statusColumn')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t('statusActive')}</SelectItem>
                  <SelectItem value="INACTIVE">{t('statusInactive')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status?.message && (
            <p className="text-xs text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description" className="text-xs text-foreground/70">
          {t('roleDescription')} <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              {...field}
              id="description"
              placeholder={t('enterRoleDescription')}
              translate="no"
              rows={4}
              className="resize-none"
              value={field.value ?? ''}
            />
          )}
        />
        {errors.description?.message && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>
    </div>
  )
}
