import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventProductDetailInfo } from '@/features/events/product-detail/(components)/event-product-detail-info';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

const { stepDetailCalls } = vi.hoisted(() => ({ stepDetailCalls: [] as unknown[][] }));
const { addProductMutate, cartState, errorToast } = vi.hoisted(() => ({
  addProductMutate: vi.fn(),
  cartState: { cart: [] as { id: string; sku: string; quantity: number }[] },
  errorToast: vi.fn(),
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('nuqs', () => ({ parseAsString: {}, useQueryState: () => ['event-1'] }));
vi.mock('@/features/events/event-form/(hooks)/use-event-step-detail', () => ({
  useEventStepDetail: (...args: unknown[]) => {
    stepDetailCalls.push(args);
    return { data: { canEdit: true } };
  },
}));
vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: () => true,
}));
vi.mock('@/features/events/(stores)/use-event-cart-store', () => ({
  useEventCartStore: () => ({ cart: cartState.cart, addToCart: vi.fn(), isOpen: false, toggleCart: vi.fn() }),
}));
vi.mock('@/features/events/event-form/(hooks)/use-add-product-to-event', () => ({
  useAddProductToEvent: () => ({ mutate: addProductMutate, isPending: false }),
}));
vi.mock('sonner', () => ({ toast: { error: errorToast } }));
vi.mock('@/shared/stores/use-user-store', () => ({
  useCurrency: () => ({ symbol: '€' }), useDateFormat: () => 'DD.MM.YYYY',
}));
vi.mock('@/lib/date-utils', () => ({ formatDate: (value: string) => value }));
vi.mock('@/features/events/product-detail/(components)/event-product-detail-download-pdf', () => ({
  EventProductDetailDownloadPdf: ({ product }: { product: { sku: string } }) => (
    <button type="button">download {product.sku}</button>
  ),
}));

describe('EventProductDetailInfo', () => {
  beforeEach(() => {
    cartState.cart = [];
    addProductMutate.mockReset();
    errorToast.mockReset();
  });

  it('uses the shared event edit state without fetching the legacy step detail', () => {
    stepDetailCalls.length = 0;
    render(<EventProductDetailInfo product={{
      id: 'p1', sku: 'SKU-1', name: 'Product', price: 10, productType: 'rental',
      images: [], image_url: '', availableQuantity: 2, quantity: 2, slug: 'product',
      startDate: '2026-08-01', endDate: '2026-08-02', startTime: '10:00', endTime: '12:00',
    }} />);

    expect(stepDetailCalls).toEqual([]);
    expect(screen.getByRole('button', { name: 'download SKU-1' })).toBeEnabled();
  });

  it('does not render optional product detail fields without values', () => {
    render(<EventProductDetailInfo product={{
      id: 'p1', sku: 'SKU-1', name: 'Product', price: 10, productType: 'rental',
      images: [], image_url: '', availableQuantity: 2, quantity: 2, slug: 'product',
      manufacturer: '-', material: '-', shippingMethod: '-',
      startDate: '2026-08-01', endDate: '2026-08-02', startTime: '10:00', endTime: '12:00',
    }} />);

    expect(screen.queryByText('manufacturer:')).not.toBeInTheDocument();
    expect(screen.queryByText('materialType:')).not.toBeInTheDocument();
    expect(screen.queryByText('shippingMethod:')).not.toBeInTheDocument();
  });

  it('does not render bundle products in the information shell', () => {
    render(
      <TooltipProvider>
        <EventProductDetailInfo product={{
          id: 'p1', sku: 'SKU-1', name: 'Product', price: 10, productType: 'bundle',
          images: [], image_url: '', availableQuantity: 2, quantity: 2, slug: 'product',
          startDate: '2026-08-01', endDate: '2026-08-02', startTime: '10:00', endTime: '12:00',
          children: [{ sku: 'CHILD-1', name: 'Milk frother', requiredQty: 2 }],
        }} />
      </TooltipProvider>,
    );

    expect(screen.queryByText('bundleProduct')).not.toBeInTheDocument();
    expect(screen.queryByText('Milk frother')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'bundleProductInfo' })).not.toBeInTheDocument();
  });

  it('blocks an add that exceeds the latest detail availability after accounting for the cart', async () => {
    cartState.cart = [{ id: 'p1', sku: 'SKU-1', quantity: 1 }];
    const user = (await import('@testing-library/user-event')).default.setup();

    render(<EventProductDetailInfo product={{
      id: 'p1', sku: 'SKU-1', name: 'Product', price: 10, productType: 'rental',
      images: [], image_url: '', availableQuantity: 1, quantity: 2, slug: 'product',
      startDate: '2026-08-01', endDate: '2026-08-02', startTime: '10:00', endTime: '12:00',
    }} />);

    await user.click(screen.getByTestId('product-detail-add-to-event-button'));

    expect(addProductMutate).not.toHaveBeenCalled();
    expect(errorToast).toHaveBeenCalledWith('productCatalog.errorExceedsAvailable');
  });
});
