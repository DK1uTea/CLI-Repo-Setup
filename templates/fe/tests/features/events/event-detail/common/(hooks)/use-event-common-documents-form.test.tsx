import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useUploadEventFiles } from '@/features/events/event-form/(hooks)/use-upload-event-files';
import { useEventCommonDocumentsForm } from '@/features/events/event-detail/common/(hooks)/use-event-common-documents-form';

vi.mock('@/lib/api', () => ({ apiProxy: { post: vi.fn() } }));
vi.mock('@/features/events/event-form/(hooks)/use-upload-event-files', () => ({
  useUploadEventFiles: vi.fn(),
}));

const uploadFiles = vi.fn();

const selectedFile = {
  name: 'proof.pdf',
  preview: 'blob:proof',
  file: new File(['proof'], 'proof.pdf', { type: 'application/pdf' }),
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useEventCommonDocumentsForm('event-1'), { wrapper });
}

describe('useEventCommonDocumentsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUploadEventFiles).mockReturnValue({ uploadFiles, isUploading: false });
  });

  it('submits a comment without uploading and preserves service and selected files', async () => {
    vi.mocked(apiProxy.post).mockResolvedValue({ data: { data: { id: 'task-1' } } });
    const { result } = setup();
    act(() => {
      result.current.form.setValue('service', 'AUFBAU');
      result.current.form.setValue('comment', '  Ready  ');
      result.current.form.setValue('files', [selectedFile]);
    });

    await act(() => result.current.submitComment());

    expect(uploadFiles).not.toHaveBeenCalled();
    expect(apiProxy.post).toHaveBeenCalledWith('etr/event-tasks', {
      eventId: 'event-1', service: 'AUFBAU', comment: 'Ready',
    });
    expect(result.current.form.getValues()).toMatchObject({
      service: 'AUFBAU', comment: '', files: [selectedFile],
    });
  });

  it('uploads files to the event folder and omits a blank comment when saving', async () => {
    uploadFiles.mockResolvedValue([{
      filename: 'proof.pdf', url: 'https://cdn/proof.pdf', key: 'event/proof.pdf',
      mimeType: 'application/pdf', size: 5,
    }]);
    vi.mocked(apiProxy.post).mockResolvedValue({ data: { data: { id: 'task-1' } } });
    const { result } = setup();
    act(() => {
      result.current.form.setValue('service', 'OTHER');
      result.current.form.setValue('comment', '   ');
      result.current.form.setValue('files', [selectedFile]);
    });

    await act(() => result.current.submitFiles());

    expect(uploadFiles).toHaveBeenCalledWith([selectedFile.file], 'event');
    expect(apiProxy.post).toHaveBeenCalledWith('etr/event-tasks', {
      eventId: 'event-1', service: 'OTHER', files: ['https://cdn/proof.pdf'],
    });
    expect(result.current.form.getValues()).toMatchObject({ service: 'OTHER', comment: '', files: [] });
  });

  it('saves uploaded files together with a trimmed comment', async () => {
    uploadFiles.mockResolvedValue([{
      filename: 'proof.pdf', url: 'https://cdn/proof.pdf', key: 'event/proof.pdf',
      mimeType: 'application/pdf', size: 5,
    }]);
    vi.mocked(apiProxy.post).mockResolvedValue({ data: { data: { id: 'task-1' } } });
    const { result } = setup();
    act(() => {
      result.current.form.setValue('service', 'ABBAU');
      result.current.form.setValue('comment', '  Packed up  ');
      result.current.form.setValue('files', [selectedFile]);
    });

    await act(() => result.current.submitFiles());

    expect(apiProxy.post).toHaveBeenCalledWith('etr/event-tasks', {
      eventId: 'event-1',
      service: 'ABBAU',
      files: ['https://cdn/proof.pdf'],
      comment: 'Packed up',
    });
  });

  it('scrolls the service field into view when save is submitted without a service', async () => {
    const field = document.createElement('div');
    field.setAttribute('data-field', 'service');
    const scrollIntoView = vi.fn();
    field.scrollIntoView = scrollIntoView;
    document.body.appendChild(field);

    const { result } = setup();
    act(() => {
      result.current.form.setValue('files', [selectedFile]);
    });

    await act(() => result.current.submitFiles());

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    field.remove();
  });

  it('scrolls the service field into view when a comment is submitted without a service', async () => {
    const field = document.createElement('div');
    field.setAttribute('data-field', 'service');
    const scrollIntoView = vi.fn();
    field.scrollIntoView = scrollIntoView;
    document.body.appendChild(field);

    const { result } = setup();
    act(() => {
      result.current.form.setValue('comment', 'Ready');
    });

    await act(() => result.current.submitComment());

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    expect(apiProxy.post).not.toHaveBeenCalled();
    field.remove();
  });

  it('does not scroll to the service field when only files are missing', async () => {
    const field = document.createElement('div');
    field.setAttribute('data-field', 'service');
    const scrollIntoView = vi.fn();
    field.scrollIntoView = scrollIntoView;
    document.body.appendChild(field);

    const { result } = setup();
    act(() => {
      result.current.form.setValue('service', 'AUFBAU');
    });

    await act(() => result.current.submitFiles());

    expect(scrollIntoView).not.toHaveBeenCalled();
    field.remove();
  });

  it('preserves form values when saving fails', async () => {
    uploadFiles.mockRejectedValue(new Error('upload failed'));
    const { result } = setup();
    act(() => {
      result.current.form.setValue('service', 'DEFEKT');
      result.current.form.setValue('comment', 'Broken');
      result.current.form.setValue('files', [selectedFile]);
    });

    await expect(act(() => result.current.submitFiles())).rejects.toThrow('upload failed');

    await waitFor(() => expect(result.current.form.getValues()).toMatchObject({
      service: 'DEFEKT', comment: 'Broken', files: [selectedFile],
    }));
  });
});
