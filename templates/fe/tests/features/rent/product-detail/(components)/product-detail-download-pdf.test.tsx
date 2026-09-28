import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProductDetailDownloadPdf } from '@/features/rent/product-detail/(components)/product-detail-download-pdf';
import type { ProductDetail } from '@/features/rent/product-detail/(services)/product-detail-service';

const { downloadMock } = vi.hoisted(() => ({ downloadMock: vi.fn() }));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/shared/stores/use-user-store', () => ({
  useDateFormat: () => 'DD.MM.YYYY',
  useCurrency: () => ({ symbol: '€' }),
}));
vi.mock('@/features/events/event-detail/common/(hooks)/use-download-pdf', () => ({
  useDownloadPdf: () => ({ contentRef: { current: null }, downloading: false, download: downloadMock }),
}));
vi.mock('@/features/events/event-detail/common/(components)/event-common-pdf-content-wrapper', () => ({
  EventCommonPdfContentWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/features/rent/product-detail/(helpers)/resolve-product-image-src', () => ({
  resolveProductImageSrc: (url: string) => `resolved:${url}`,
}));

const baseProduct: ProductDetail = {
  id: 'p1', sku: 'SKU-1', name: 'Chair', slug: 'chair', price: 10,
  productType: 'rental', totalQuantity: 5, availableQuantity: 2, isAvailable: true,
};

describe('ProductDetailDownloadPdf', () => {
  it('downloads a PDF named after the SKU when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProductDetailDownloadPdf product={{ ...baseProduct, images: ['https://cdn/chair.png'] }} />);

    await user.click(screen.getByRole('button', { name: /downloadPdf/ }));

    expect(downloadMock).toHaveBeenCalledWith('SKU-1.pdf');
  });

  it('falls back to slug then name for the file name when sku is missing', async () => {
    const user = userEvent.setup();
    render(<ProductDetailDownloadPdf product={{ ...baseProduct, sku: '' }} />);

    await user.click(screen.getByRole('button', { name: /downloadPdf/ }));

    expect(downloadMock).toHaveBeenCalledWith('chair.pdf');
  });

  it('falls back to imageUrl when the images array is empty', () => {
    render(<ProductDetailDownloadPdf product={{ ...baseProduct, images: [], imageUrl: 'https://cdn/single.png' }} />);

    expect(screen.getByRole('img', { name: 'Chair 1' })).toHaveAttribute('src', 'resolved:https://cdn/single.png');
  });

  it('renders no product image (only the fixed PDF logo) when neither images nor imageUrl is set', () => {
    render(<ProductDetailDownloadPdf product={baseProduct} />);

    expect(screen.queryByRole('img', { name: /Chair/ })).not.toBeInTheDocument();
  });
});
