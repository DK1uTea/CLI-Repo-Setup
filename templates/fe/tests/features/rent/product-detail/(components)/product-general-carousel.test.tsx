import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductGeneralCarousel from '@/features/rent/product-detail/(components)/product-general-carousel';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

describe('ProductGeneralCarousel', () => {
  it('shows the no-images placeholder when there are no images', () => {
    render(<ProductGeneralCarousel images={[]} name="Coffee machine" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders a thumbnail button per image when given a raw image list', () => {
    render(
      <ProductGeneralCarousel
        images={['https://cdn/a.png', 'https://cdn/b.png']}
        name="Coffee machine"
      />,
    );

    expect(screen.getAllByRole('button', { name: 'showProductImage' })).toHaveLength(2);
  });
});
