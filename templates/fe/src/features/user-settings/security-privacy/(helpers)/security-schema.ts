import { z } from 'zod'
import { zPassword } from '@/shared/schemas/password.schema'
import { zString } from '@/shared/schemas'

export const changePasswordSchema = z
  .object({
    currentPassword: zString(['required']),
    newPassword: zPassword(),
    confirmPassword: zString(['required']),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
