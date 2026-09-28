import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductDocuments } from '@/features/rent/product-detail/(components)/product-documents';
import { apiProxy } from '@/lib/api';
import messages from '@/messages/en.json';

vi.mock('@/lib/api', () => ({ apiProxy: { get: vi.fn() } }));
vi.mock('next/image', () => ({
  default: (props: ComponentProps<'img'>) => <img {...props} />,
}));

const documents = [
  {
    bucket: 'instructions',
    fileName: 'preview.png',
    fileType: 'image/png',
    url: 'https://files.example.com/preview.png',
  },
  {
    bucket: 'manufacturer',
    fileName: 'manual.pdf',
    fileType: 'application/pdf',
    url: 'https://files.example.com/manual.pdf',
  },
];

function renderDocuments() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QueryClientProvider client={queryClient}>
        <ProductDocuments sku="SKU-1" />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('ProductDocuments', () => {
  beforeEach(() => {
    vi.mocked(apiProxy.get).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a loading state while the attachments request is pending', () => {
    vi.mocked(apiProxy.get).mockReturnValue(new Promise(() => {}));

    renderDocuments();

    expect(screen.getByLabelText('Loading documents')).toBeVisible();
  });

  it('renders both empty bucket states when the response contains no documents', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({ data: { data: { items: [] } } });

    renderDocuments();

    expect(await screen.findAllByText('No documents available')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Assembly Instructions' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Manufacturer Data' })).toBeVisible();
  });

  it('falls back to the empty states when the API items value is not an array', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({ data: { data: { items: {} } } });

    renderDocuments();

    expect(await screen.findAllByText('No documents available')).toHaveLength(2);
  });

  it('requests the product documents by SKU and renders image and file document items', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({ data: { data: { items: documents } } });

    renderDocuments();

    const imageButton = await screen.findByRole('button', { name: 'Download preview.png' });
    const fileButton = screen.getByRole('button', { name: 'Download manual.pdf' });

    expect(apiProxy.get).toHaveBeenCalledWith('etr/products/SKU-1/attachments');
    expect(imageButton.querySelector('img')).toBeInTheDocument();
    expect(fileButton.querySelector('svg')).toBeInTheDocument();
  });

  it('downloads a document when the document item is clicked', async () => {
    vi.mocked(apiProxy.get).mockResolvedValue({ data: { data: { items: [documents[1]] } } });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['file content'], { type: 'application/pdf' }),
    });
    const createObjectURLMock = vi.fn(() => 'blob:manual');
    const revokeObjectURLMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    renderDocuments();

    await userEvent.setup().click(await screen.findByText('manual.pdf'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/proxy-download?url=https%3A%2F%2Ffiles.example.com%2Fmanual.pdf&filename=manual.pdf',
      );
    });
    expect(createObjectURLMock).toHaveBeenCalledOnce();
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:manual');
  });
});
