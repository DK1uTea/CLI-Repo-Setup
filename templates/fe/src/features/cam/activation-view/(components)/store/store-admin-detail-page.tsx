'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { StoreAdminDetail } from './store-admin-detail'
import { StoreEditDrawer } from './store-edit-drawer'

type Props = { storeId: string }

export function StoreAdminDetailPage({ storeId }: Props) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <StoreAdminDetail
        storeId={storeId}
        onBack={() => router.push('/customer-activation?tab=store')}
        onEdit={() => setEditOpen(true)}
      />
      {editOpen && (
        <StoreEditDrawer storeId={storeId} onClose={() => setEditOpen(false)} />
      )}
    </>
  )
}
