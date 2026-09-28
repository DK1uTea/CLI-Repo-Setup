import { fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { SummaryFilesSection } from '@/features/events/event-form/(components)/steps/event-form-step-summary/summary-files-section';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';
import messages from '@/messages/en.json';

const downloadMocks = vi.hoisted(() => ({ downloadFile: vi.fn() }));

vi.mock('@/lib/download-file', () => downloadMocks);
vi.mock('lucide-react', async (importOriginal) => {
  const original = await importOriginal<typeof import('lucide-react')>();
  return {
    ...original,
    DownloadIcon: () => <span data-testid="download-icon" />,
  };
});

function TestForm({ defaultValues }: { defaultValues: Partial<EventFormDto> }) {
  const methods = useForm<EventFormDto>({ defaultValues: defaultValues as EventFormDto });

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormProvider {...methods}>
        <SummaryFilesSection />
      </FormProvider>
    </NextIntlClientProvider>
  );
}

describe('SummaryFilesSection', () => {
  it('renders an image preview for image files and keeps documents as file items', () => {
    render(
      <TestForm
        defaultValues={{
          accessPermit: [
            { name: 'venue.png', preview: 'https://cdn.test/venue.png' },
            { name: 'permit.pdf', preview: 'https://cdn.test/permit.pdf' },
          ],
        }}
      />,
    );

    const imageButton = screen.getByRole('button', { name: 'venue.png' });
    const documentButton = screen.getByRole('button', { name: 'permit.pdf' });

    expect(within(imageButton).getByRole('img', { name: 'venue.png' })).toBeInTheDocument();
    expect(within(imageButton).queryByTestId('download-icon')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'permit.pdf' })).not.toBeInTheDocument();
    expect(within(documentButton).getByTestId('download-icon')).toBeInTheDocument();
  });

  it('downloads the clicked file', () => {
    render(
      <TestForm
        defaultValues={{
          eventDocuments: [{ name: 'brief.pdf', preview: 'https://cdn.test/brief.pdf' }],
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'brief.pdf' }));

    expect(downloadMocks.downloadFile).toHaveBeenCalledWith('https://cdn.test/brief.pdf', 'brief.pdf');
  });
});
