import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'

import { useQueryState, parseAsInteger } from 'nuqs'
import ProductList from '@/features/rent/catalogue/(components)/product-list'
import { SearchInput } from '@/shared/components/common/search-input'

function PageProbe() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1))
  return <div data-testid="page-probe">{page}</div>
}

const { useProductListMock } = vi.hoisted(() => ({
  useProductListMock: vi.fn(),
}))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/features/rent/catalogue/(hooks)/use-product-list', () => ({
  useProductList: useProductListMock,
}))
vi.mock('@/features/rent/(hooks)/use-rent-url-dates', () => ({
  useRentUrlDates: () => ({ fromIso: undefined, toIso: undefined, isReady: true }),
}))
vi.mock('@/features/rent/(components)/product-catalog-card', () => ({
  ProductCatalogCard: ({ name }: { name: string }) => <div data-testid="product-card">{name}</div>,
}))

const PRODUCT = {
  id: '1', name: 'Chair', price: 10, productType: 'rental', slug: 'chair',
  isAvailable: true, totalQuantity: 5, availableQuantity: 2,
}

describe('ProductList', () => {
  it('shows a skeleton while fetching', () => {
    useProductListMock.mockReturnValue({ data: undefined, isFetching: true })

    render(
      <NuqsTestingAdapter>
        <ProductList />
      </NuqsTestingAdapter>,
    )

    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument()
  })

  it('shows the empty state when no products match the filters', () => {
    useProductListMock.mockReturnValue({ data: { products: [], pagination: null }, isFetching: false })

    render(
      <NuqsTestingAdapter>
        <ProductList />
      </NuqsTestingAdapter>,
    )

    expect(screen.getByText('noProducts')).toBeInTheDocument()
  })

  it('renders a card for every returned product', () => {
    useProductListMock.mockReturnValue({
      data: { products: [PRODUCT, { ...PRODUCT, id: '2', name: 'Table' }], pagination: null },
      isFetching: false,
    })

    render(
      <NuqsTestingAdapter>
        <ProductList />
      </NuqsTestingAdapter>,
    )

    expect(screen.getAllByTestId('product-card')).toHaveLength(2)
  })

  it('hides pagination when there is only one page', () => {
    useProductListMock.mockReturnValue({
      data: { products: [PRODUCT], pagination: { page: 1, totalPages: 1 } },
      isFetching: false,
    })

    render(
      <NuqsTestingAdapter>
        <ProductList />
      </NuqsTestingAdapter>,
    )

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('shows pagination when there is more than one page', () => {
    useProductListMock.mockReturnValue({
      data: { products: [PRODUCT], pagination: { page: 1, totalPages: 3 } },
      isFetching: false,
    })

    render(
      <NuqsTestingAdapter>
        <ProductList />
      </NuqsTestingAdapter>,
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('resets to page 1 when the search keyword changes (List + Category/Search kept in sync — testcase 24/46)', async () => {
    useProductListMock.mockReturnValue({ data: { products: [PRODUCT], pagination: null }, isFetching: false })
    const onUrlUpdate = vi.fn()
    const user = userEvent.setup()

    render(
      <NuqsTestingAdapter searchParams="?page=3" onUrlUpdate={onUrlUpdate} hasMemory>
        <PageProbe />
        <SearchInput useDebounced={false} />
        <ProductList />
      </NuqsTestingAdapter>,
    )

    expect(screen.getByTestId('page-probe')).toHaveTextContent('3')

    await user.type(screen.getByRole('textbox'), 'table{Enter}')

    await waitFor(() => {
      expect(screen.getByTestId('page-probe')).toHaveTextContent('1')
    })
  })
})
