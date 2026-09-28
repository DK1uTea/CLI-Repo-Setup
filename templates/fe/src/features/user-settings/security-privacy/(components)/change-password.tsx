'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Controller, useWatch } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { PasswordChecklist } from '@/features/auth/(components)/password-checklist'
import { useChangePassword } from '../(hooks)/use-change-password'

const CURRENT_PASSWORD_ID = 'current-password'
const CURRENT_PASSWORD_ERROR_ID = 'current-password-error'
const NEW_PASSWORD_ID = 'new-password'
const NEW_PASSWORD_ERROR_ID = 'new-password-error'
const CONFIRM_PASSWORD_ID = 'confirm-password'
const CONFIRM_PASSWORD_ERROR_ID = 'confirm-password-error'

export function ChangePassword() {
  const t = useTranslations('settings')
  const { form, isSubmitting, onSubmit } = useChangePassword()
  const { control, formState: { errors } } = form
  const newPassword = useWatch({ control, name: 'newPassword', defaultValue: '' })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const toggle = (field: keyof typeof showPasswords) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-0">
        <CardTitle className="text-lg font-semibold">{t('password')}</CardTitle>
        <Button variant="outline-primary" onClick={onSubmit} disabled={isSubmitting}>
          {t('passwordChange')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor={CURRENT_PASSWORD_ID}>{t('currentPassword')}</Label>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id={CURRENT_PASSWORD_ID}
                    type={showPasswords.current ? 'text' : 'password'}
                    placeholder={t('enterCurrentPassword')}
                    className="bg-input"
                    aria-invalid={errors.currentPassword ? true : undefined}
                    aria-describedby={errors.currentPassword ? CURRENT_PASSWORD_ERROR_ID : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggle('current')}
                    aria-label={showPasswords.current ? t('hidePassword') : t('showPassword')}
                    aria-pressed={showPasswords.current}
                    aria-controls={CURRENT_PASSWORD_ID}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPasswords.current ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
              )}
            />
            {errors.currentPassword && (
              <p id={CURRENT_PASSWORD_ERROR_ID} role="alert" className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={NEW_PASSWORD_ID}>{t('newPassword')}</Label>
            <Controller
              control={control}
              name="newPassword"
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id={NEW_PASSWORD_ID}
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder={t('enterNewPassword')}
                    className="bg-input"
                    aria-invalid={errors.newPassword ? true : undefined}
                    aria-describedby={errors.newPassword ? NEW_PASSWORD_ERROR_ID : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggle('new')}
                    aria-label={showPasswords.new ? t('hidePassword') : t('showPassword')}
                    aria-pressed={showPasswords.new}
                    aria-controls={NEW_PASSWORD_ID}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPasswords.new ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
              )}
            />
            {errors.newPassword && (errors.newPassword.type === 'manual' || !newPassword) && (
              <p id={NEW_PASSWORD_ERROR_ID} role="alert" className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
            <PasswordChecklist password={newPassword} className="mt-2" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={CONFIRM_PASSWORD_ID}>{t('confirmNewPassword')}</Label>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    id={CONFIRM_PASSWORD_ID}
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder={t('confirmNewPassword')}
                    className="bg-input"
                    aria-invalid={errors.confirmPassword ? true : undefined}
                    aria-describedby={errors.confirmPassword ? CONFIRM_PASSWORD_ERROR_ID : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggle('confirm')}
                    aria-label={showPasswords.confirm ? t('hidePassword') : t('showPassword')}
                    aria-pressed={showPasswords.confirm}
                    aria-controls={CONFIRM_PASSWORD_ID}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPasswords.confirm ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
              )}
            />
            {errors.confirmPassword && (
              <p id={CONFIRM_PASSWORD_ERROR_ID} role="alert" className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
