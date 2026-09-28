import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ProductDetailGeneral from '@/features/rent/product-detail/(components)/product-detail-general'
import type { ProductDetail } from '@/features/rent/product-detail/(services)/product-detail-service'

const { carouselPropsMock } = vi.hoisted(() => ({ carouselPropsMock: vi.fn() }))

vi.mock('@/features/rent/product-detail/(components)/product-general-carousel', () => ({
  default: (props: { images: string[]; name: string }) => {
    carouselPropsMock(props)
    return <div data-testid="carousel" />
  },
}))
vi.mock('@/features/rent/product-detail/(components)/product-general-info', () => ({
  default: () => <div data-testid="info" />,
}))

const baseProduct: ProductDetail = {
  id: 'p1', sku: 'SKU-1', name: 'Chair', slug: 'chair', price: 10,
  productType: 'rental', totalQuantity: 5, availableQuantity: 2, isAvailable: true,
}

describe('ProductDetailGeneral', () => {
  it('passes the images array through when present', () => {
    render(<ProductDetailGeneral product={{ ...baseProduct, images: ['a.png', 'b.png'] }} />)

    expect(carouselPropsMock).toHaveBeenCalledWith(expect.objectContaining({ images: ['a.png', 'b.png'] }))
  })

  it('falls back to a single-item array from imageUrl when images is empty', () => {
    render(<ProductDetailGeneral product={{ ...baseProduct, images: [], imageUrl: 'single.png' }} />)

    expect(carouselPropsMock).toHaveBeenCalledWith(expect.objectContaining({ images: ['single.png'] }))
  })

  it('passes an empty array when neither images nor imageUrl is set', () => {
    render(<ProductDetailGeneral product={baseProduct} />)

    expect(carouselPropsMock).toHaveBeenCalledWith(expect.objectContaining({ images: [] }))
  })

  it('renders both the carousel and the info sections', () => {
    render(<ProductDetailGeneral product={baseProduct} />)

    expect(screen.getByTestId('carousel')).toBeInTheDocument()
    expect(screen.getByTestId('info')).toBeInTheDocument()
  })
})
