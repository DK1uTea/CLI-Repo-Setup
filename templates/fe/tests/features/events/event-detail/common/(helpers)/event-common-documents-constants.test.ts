import { describe, expect, it } from 'vitest';

import { EVENT_DOCUMENT_UPLOAD_ACCEPT } from '@/features/events/event-detail/common/(helpers)/event-common-documents-constants';

describe('EVENT_DOCUMENT_UPLOAD_ACCEPT', () => {
  it('accepts images, PDF, Word, and Excel documents', () => {
    expect(EVENT_DOCUMENT_UPLOAD_ACCEPT).toMatchObject({
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    });
  });
});
