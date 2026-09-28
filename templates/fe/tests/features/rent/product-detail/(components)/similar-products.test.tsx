import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import SimilarProducts from '@/features/rent/product-detail/(components)/similar-products'

const { useRelatedProductsMock } = vi.hoisted(() => ({
  useRelatedProductsMock: vi.fn(),
}))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))
vi.mock('@/features/rent/product-detail/(hooks)/use-related-products', () => ({
  useRelatedProducts: useRelatedProductsMock,
}))

describe('SimilarProducts', () => {
  it('shows the skeleton while loading', () => {
    useRelatedProductsMock.mockReturnValue({ data: undefined, isLoading: true })

    render(<SimilarProducts slug="chair" />)

    expect(screen.queryByText('seeOtherProducts')).not.toBeInTheDocument()
  })

  it('renders nothing once loaded with no related products', () => {
    useRelatedProductsMock.mockReturnValue({ data: [], isLoading: false })

    const { container } = render(<SimilarProducts slug="chair" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders the carousel and See other products link when related products exist', () => {
    useRelatedProductsMock.mockReturnValue({
      data: [{ id: '1', name: 'Table', slug: 'table', price: 10, productType: 'rental', isAvailable: true, totalQuantity: 5, availableQuantity: 2 }],
      isLoading: false,
    })

    render(<SimilarProducts slug="chair" />)

    expect(screen.getByText('seeOtherProducts')).toBeInTheDocument()
  })
})
