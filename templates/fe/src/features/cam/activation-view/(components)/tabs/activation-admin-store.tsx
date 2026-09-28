'use client'

import { useState } from 'react'
import { StoreAdminList } from '../store/store-admin-list'
import { StoreEditDrawer } from '../store/store-edit-drawer'

export function ActivationAdminStore() {
  const [editStoreId, setEditStoreId] = useState<string | null>(null)

  return (
    <>
      <StoreAdminList onEdit={(id) => setEditStoreId(id)} />
      {editStoreId && (
        <StoreEditDrawer
          storeId={editStoreId}
          onClose={() => setEditStoreId(null)}
        />
      )}
    </>
  )
}
