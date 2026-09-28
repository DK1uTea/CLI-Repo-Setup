import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ActivationCasesTable } from '@/features/cam/activation-view/(components)/dashboard/activation-cases-table'

const mocks = vi.hoisted(() => ({
  useActivationAdminList: vi.fn(),
  useUpdateActivationStatus: vi.fn(),
}))

vi.mock('@/features/cam/activation-view/(hooks)/use-activation-admin-list', () => ({
  useActivationAdminList: mocks.useActivationAdminList,
}))

vi.mock('@/features/cam/activation-view/(hooks)/use-update-activation-status', () => ({
  useUpdateActivationStatus: mocks.useUpdateActivationStatus,
}))

const messages = {
  activationView: {
    filter: {
      sortBrandFitAsc: 'Brand Fit: A-Z',
      sortBrandFitDesc: 'Brand Fit: Z-A',
      sortCaseNameAsc: 'Case Name: A-Z',
      sortCaseNameDesc: 'Case Name: Z-A',
      sortScoreLowHigh: 'Score: Low to High',
      sortScoreHighLow: 'Score: High to Low',
      sortLastActivityNearest: 'Last activity: Nearest',
      sortLastActivityLatest: 'Last activity: Latest',
      sortPlaceholder: 'Sort by',
    },
    dashboard: {
      searchPlaceholder: 'Search cases...',
      colCases: 'Cases',
      colOwner: 'Owner',
      colBrandFit: 'Brand Fit',
      colScore: 'Score',
      colStatus: 'Status',
      colLastActivity: 'Last Activity',
      noCases: 'No cases found',
      noCasesDescription: 'Try adjusting your search or filters.',
    },
  },
}

function renderTable() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter>
          <ActivationCasesTable />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  )
}

describe('ActivationCasesTable empty state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useActivationAdminList.mockReturnValue({
      items: [],
      pagination: null,
      isLoading: false,
      page: 1,
      limit: 10,
      sortBy: 'NAME_ASC',
      goToPage: vi.fn(),
      setLimit: vi.fn(),
      setSortBy: vi.fn(),
    })
    mocks.useUpdateActivationStatus.mockReturnValue({ isPending: false, mutate: vi.fn() })
  })

  it('renders a helpful empty state when the admin activation list has no items', () => {
    renderTable()

    expect(screen.getByText('No cases found', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument()
  })
})
