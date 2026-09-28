import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useProductCarousel } from '@/features/rent/product-detail/(hooks)/use-product-carousel'

function createApiMock() {
  const listeners: Record<string, (() => void)[]> = {}
  return {
    scrollTo: vi.fn(),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    selectedScrollSnap: vi.fn(() => 0),
    on: vi.fn((event: string, cb: () => void) => {
      listeners[event] = [...(listeners[event] ?? []), cb]
    }),
    off: vi.fn(),
    emit: (event: string) => listeners[event]?.forEach((cb) => cb()),
  }
}

describe('useProductCarousel', () => {
  it('disables the autoplay plugin for a single-image product (testcase 13/40 — no prev/next)', () => {
    const { result } = renderHook(() => useProductCarousel({ imageCount: 1 }))

    expect(result.current.carouselPlugins).toBeUndefined()
  })

  it('enables the autoplay plugin when there is more than one image', () => {
    const { result } = renderHook(() => useProductCarousel({ imageCount: 3 }))

    expect(result.current.carouselPlugins).toHaveLength(1)
  })

  it('scrolls the carousel and updates the selected index when a thumbnail is clicked', () => {
    const { result } = renderHook(() => useProductCarousel({ imageCount: 3 }))
    const api = createApiMock()

    act(() => result.current.setApi(api as never))
    act(() => result.current.handleThumbnailClick(2))

    expect(api.scrollTo).toHaveBeenCalledWith(2)
    expect(result.current.selectedIndex).toBe(2)
  })

  it('scrolls to the previous/next slide on handlePreviousClick/handleNextClick', () => {
    const { result } = renderHook(() => useProductCarousel({ imageCount: 3 }))
    const api = createApiMock()
    act(() => result.current.setApi(api as never))

    act(() => result.current.handlePreviousClick())
    expect(api.scrollPrev).toHaveBeenCalledTimes(1)

    act(() => result.current.handleNextClick())
    expect(api.scrollNext).toHaveBeenCalledTimes(1)
  })

  it('resets to the first slide when the image count changes (e.g. a new photo replaces the deleted one)', () => {
    const { result, rerender } = renderHook(
      ({ imageCount }) => useProductCarousel({ imageCount }),
      { initialProps: { imageCount: 3 } },
    )
    const api = createApiMock()
    act(() => result.current.setApi(api as never))
    act(() => result.current.handleThumbnailClick(2))
    expect(result.current.selectedIndex).toBe(2)

    rerender({ imageCount: 1 })

    expect(api.scrollTo).toHaveBeenCalledWith(0, true)
    expect(result.current.selectedIndex).toBe(0)
  })

  it('tracks the carousel-reported selected index on select/reInit events', () => {
    const { result } = renderHook(() => useProductCarousel({ imageCount: 3 }))
    const api = createApiMock()
    api.selectedScrollSnap.mockReturnValue(1)

    act(() => result.current.setApi(api as never))
    act(() => api.emit('select'))

    expect(result.current.selectedIndex).toBe(1)
  })
})
