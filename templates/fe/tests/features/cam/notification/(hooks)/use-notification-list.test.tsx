import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { describe, expect, it, vi } from 'vitest'

import { apiProxy } from '@/lib/api'
import { useNotificationList } from '@/features/cam/notification/(hooks)/use-notification-list'

vi.mock('@/lib/api', () => ({
  apiProxy: { get: vi.fn() },
}))

function ListProbe() {
  const { notifications, isError } = useNotificationList()

  if (isError) return <p>list-error</p>
  return <p>{notifications.length} items</p>
}

function renderProbe() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <NextIntlClientProvider locale="de" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <ListProbe />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

describe('useNotificationList', () => {
  it('requests notifications with the toast interceptor disabled', async () => {
    vi.mocked(apiProxy.get).mockResolvedValueOnce({ data: [] })

    renderProbe()

    await screen.findByText('0 items')
    expect(apiProxy.get).toHaveBeenCalledWith('/notification/inapp', {
      params: { page: 1, limit: 20 },
      _skipToast: true,
    })
  })

  it('surfaces a real server failure as isError without the client showing its own toast', async () => {
    vi.mocked(apiProxy.get).mockRejectedValueOnce(new Error('Network Error'))

    renderProbe()

    expect(await screen.findByText('list-error')).toBeInTheDocument()
  })
})
