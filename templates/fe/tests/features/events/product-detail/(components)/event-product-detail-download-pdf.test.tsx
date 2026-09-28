import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EventProductDetailDownloadPdf } from '@/features/events/product-detail/(components)/event-product-detail-download-pdf';

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
  resolveProductImageSrc: (url: string) => `/_next/image?url=${encodeURIComponent(url)}&w=384&q=75`,
}));

const product = {
  id: 'p1', sku: 'SKU-1', name: 'Product', price: 10, productType: 'rental' as const,
  images: ['https://cdn/product.png'], image_url: '', availableQuantity: 2, quantity: 2,
  slug: 'product', startDate: '2026-08-01', endDate: '2026-08-02', startTime: '10:00', endTime: '12:00',
};

describe('EventProductDetailDownloadPdf', () => {
  it('embeds same-origin product images and downloads a PDF named after the SKU', async () => {
    const user = userEvent.setup();
    render(<EventProductDetailDownloadPdf product={product} />);

    await user.click(screen.getByRole('button', { name: 'downloadPdf' }));

    expect(downloadMock).toHaveBeenCalledWith('SKU-1.pdf');
    expect(screen.getByRole('img', { name: 'Product 1' })).toHaveAttribute(
      'src',
      '/_next/image?url=https%3A%2F%2Fcdn%2Fproduct.png&w=384&q=75',
    );
  });
});
