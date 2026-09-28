import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useImportUsersForm } from '@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-import-users-form';

let onDrop: (files: File[]) => void;
let dropzoneOptions: Record<string, unknown>;

vi.mock('react-dropzone', () => ({
  useDropzone: (options: Record<string, unknown>) => {
    dropzoneOptions = options;
    onDrop = options.onDrop as (files: File[]) => void;
    return { getRootProps: vi.fn(), getInputProps: vi.fn() };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  dropzoneOptions = {};
  onDrop = () => undefined;
});

describe('useImportUsersForm', () => {
  it('configures one-file import for xlsx, xls, and csv only', () => {
    renderHook(() => useImportUsersForm());
    expect(dropzoneOptions).toMatchObject({ maxFiles: 1, multiple: false });
    expect(dropzoneOptions.accept).toEqual({
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    });
  });

  it('keeps the first accepted file and submits it once', () => {
    const onImportUsers = vi.fn();
    const file = new File(['email'], 'users.csv', { type: 'text/csv' });
    const { result } = renderHook(() => useImportUsersForm({ onImportUsers }));
    act(() => onDrop([file]));
    expect(result.current.file).toBe(file);
    let submitted = false;
    act(() => { submitted = result.current.onSubmit(); });
    expect(submitted).toBe(true);
    expect(onImportUsers).toHaveBeenCalledWith(file);
    expect(result.current.file).toBeNull();
  });

  it('does not submit when no accepted file is selected', () => {
    const onImportUsers = vi.fn();
    const { result } = renderHook(() => useImportUsersForm({ onImportUsers }));
    expect(result.current.onSubmit()).toBe(false);
    expect(onImportUsers).not.toHaveBeenCalled();
  });

  it('ignores an empty accepted-file result', () => {
    const { result } = renderHook(() => useImportUsersForm());
    act(() => onDrop([]));
    expect(result.current.file).toBeNull();
  });
});
