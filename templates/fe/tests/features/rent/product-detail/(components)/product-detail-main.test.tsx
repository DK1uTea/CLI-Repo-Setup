import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ProductDetailMain from '@/features/rent/product-detail/(components)/product-detail-main'
import { useBreadcrumbStore } from '@/shared/stores/use-breadcrumb-store'

const { useRentalProductDetailMock, useRentUrlDatesMock } = vi.hoisted(() => ({
  useRentalProductDetailMock: vi.fn(),
  useRentUrlDatesMock: vi.fn(),
}))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/features/rent/(hooks)/use-rent-url-dates', () => ({ useRentUrlDates: useRentUrlDatesMock }))
vi.mock('@/features/rent/product-detail/(hooks)/use-rental-product-detail', () => ({
  useRentalProductDetail: useRentalProductDetailMock,
}))
vi.mock('@/features/rent/product-detail/(components)/product-detail-general', () => ({
  default: () => <div data-testid="general" />,
}))
vi.mock('@/features/rent/product-detail/(components)/product-detail-tabs', () => ({
  default: () => <div data-testid="tabs" />,
}))
vi.mock('@/features/rent/product-detail/(components)/similar-products', () => ({
  default: () => <div data-testid="similar" />,
}))

const PRODUCT = {
  id: 'p1', sku: 'SKU-1', name: 'Chair', slug: 'chair', price: 10,
  productType: 'rental', totalQuantity: 5, availableQuantity: 2, isAvailable: true,
}

describe('ProductDetailMain', () => {
  it('sets the breadcrumb to Catalogue only while the product is loading', async () => {
    useRentUrlDatesMock.mockReturnValue({ fromIso: '2026-08-01', toIso: '2026-08-10', isReady: true })
    useRentalProductDetailMock.mockReturnValue({ rentalProductDetail: undefined, isLoading: true })

    render(<ProductDetailMain slug="chair" />)

    await waitFor(() => {
      expect(useBreadcrumbStore.getState().items).toEqual([
        { label: 'tabs.catalogue', href: '/rent?tab=catalogue' },
      ])
    })
  })

  it('appends the product name to the breadcrumb once loaded (testcase 8/9/35/36)', async () => {
    useRentUrlDatesMock.mockReturnValue({ fromIso: '2026-08-01', toIso: '2026-08-10', isReady: true })
    useRentalProductDetailMock.mockReturnValue({ rentalProductDetail: PRODUCT, isLoading: false })

    render(<ProductDetailMain slug="chair" />)

    await waitFor(() => {
      expect(useBreadcrumbStore.getState().items).toEqual([
        { label: 'tabs.catalogue', href: '/rent?tab=catalogue' },
        { label: 'Chair' },
      ])
    })
  })

  it('shows the general/tabs/similar sections once the product has loaded', () => {
    useRentUrlDatesMock.mockReturnValue({ fromIso: '2026-08-01', toIso: '2026-08-10', isReady: true })
    useRentalProductDetailMock.mockReturnValue({ rentalProductDetail: PRODUCT, isLoading: false })

    render(<ProductDetailMain slug="chair" />)

    expect(screen.getByTestId('general')).toBeInTheDocument()
    expect(screen.getByTestId('tabs')).toBeInTheDocument()
    expect(screen.getByTestId('similar')).toBeInTheDocument()
  })

  it('shows the not-found empty state once loading finishes with no product', () => {
    useRentUrlDatesMock.mockReturnValue({ fromIso: '2026-08-01', toIso: '2026-08-10', isReady: true })
    useRentalProductDetailMock.mockReturnValue({ rentalProductDetail: undefined, isLoading: false })

    render(<ProductDetailMain slug="does-not-exist" />)

    expect(screen.getByText('notFound')).toBeInTheDocument()
    expect(screen.queryByTestId('general')).not.toBeInTheDocument()
  })

  it('treats the page as still loading until the rent date range is ready', () => {
    useRentUrlDatesMock.mockReturnValue({ fromIso: undefined, toIso: undefined, isReady: false })
    useRentalProductDetailMock.mockReturnValue({ rentalProductDetail: undefined, isLoading: false })

    render(<ProductDetailMain slug="chair" />)

    expect(screen.queryByText('notFound')).not.toBeInTheDocument()
    expect(screen.queryByTestId('general')).not.toBeInTheDocument()
  })
})
