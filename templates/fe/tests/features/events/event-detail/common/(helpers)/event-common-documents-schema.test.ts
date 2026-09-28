import { describe, expect, it } from 'vitest';

import { getValidationMessage } from '@/lib/field-error';
import {
  eventCommonDocumentsSchema,
} from '@/features/events/event-detail/common/(helpers)/event-common-documents-schema';

const uploadableFile = {
  id: 'proof-1',
  preview: 'blob:proof-1',
  file: new File(['proof'], 'proof.pdf', { type: 'application/pdf' }),
};

describe('eventCommonDocumentsSchema', () => {
  it('accepts comment submit with a service and a non-blank comment', () => {
    const result = eventCommonDocumentsSchema.safeParse({
      submitMode: 'comment',
      service: 'AUFBAU',
      comment: '  Ready for setup  ',
      files: [],
    });

    expect(result.success).toBe(true);
  });

  it('rejects comment submit when the comment is blank', () => {
    const result = eventCommonDocumentsSchema.safeParse({
      submitMode: 'comment',
      service: 'AUFBAU',
      comment: '   ',
      files: [],
    });

    expect(result.success).toBe(false);
  });

  it('accepts save with an uploadable file and no comment', () => {
    const result = eventCommonDocumentsSchema.safeParse({
      submitMode: 'save',
      service: 'OTHER',
      comment: '',
      files: [uploadableFile],
    });

    expect(result.success).toBe(true);
  });

  it('rejects save when no uploadable file is selected', () => {
    const result = eventCommonDocumentsSchema.safeParse({
      submitMode: 'save',
      service: 'OTHER',
      comment: 'Optional note',
      files: [{ ...uploadableFile, file: undefined }],
    });

    expect(result.success).toBe(false);
  });

  it.each(['comment', 'save'] as const)('requires a service for %s submit', (submitMode) => {
    const result = eventCommonDocumentsSchema.safeParse({
      submitMode,
      service: '',
      comment: submitMode === 'comment' ? 'Ready' : '',
      files: submitMode === 'save' ? [uploadableFile] : [],
    });

    expect(result.success).toBe(false);
  });

  it('uses the shared required message when required strings are missing', () => {
    const result = eventCommonDocumentsSchema.safeParse({
      submitMode: 'comment',
      files: [],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: ['service'], message: getValidationMessage('fieldErrors.required') }),
      expect.objectContaining({ path: ['comment'], message: getValidationMessage('fieldErrors.required') }),
    ]));
  });
});
