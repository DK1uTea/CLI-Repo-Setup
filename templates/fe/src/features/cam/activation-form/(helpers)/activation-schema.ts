import { z } from 'zod'
import { zEmail, zPhone, zString } from '@/shared/schemas'

export function buildStoreSchema() {
  return z.object({
    storeId: zString().optional(),
    storeName: zString(['required']),
    storeAddress: zString(['required']),
    contactName: zString(['required']),
    contactPhone: zPhone(['required']),
    contactEmail: zString(['required']).pipe(zEmail()),
  })
}

export type StoreFormData = z.infer<ReturnType<typeof buildStoreSchema>>
