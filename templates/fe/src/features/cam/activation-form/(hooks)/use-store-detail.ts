'use client'

import { useQuery } from '@tanstack/react-query'
import { apiProxy } from '@/lib/api'

type StoreDetail = {
  id: string
  storeName: string
  storeAddress: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

async function fetchStoreDetail(id: string): Promise<StoreDetail> {
  const response = await apiProxy.get<{ data: StoreDetail }>(`/cam/stores/${id}`)
  return response.data.data
}

export function useStoreDetail(id: string) {
  return useQuery({
    queryKey: ['cam-store-detail', id],
    queryFn: () => fetchStoreDetail(id),
    enabled: !!id,
  })
}
