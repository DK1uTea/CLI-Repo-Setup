import { describe, expect, it } from 'vitest';

import {
  isProofImageFile,
  toProofFiles,
} from '@/features/events/event-detail/common/(helpers)/event-common-proof-files';

describe('toProofFiles', () => {
  it('returns an empty list when the API sends {} or null instead of an array', () => {
    expect(toProofFiles({})).toEqual([]);
    expect(toProofFiles(null)).toEqual([]);
  });

  it('keeps string URLs and file objects in one list', () => {
    expect(toProofFiles([
      'https://cdn.test/setup.jpg',
      { url: 'https://cdn.test/report.pdf', fileName: 'Leistungsnachweis.pdf' },
      { fileUrl: 'https://cdn.test/notes.docx' },
    ])).toEqual([
      { url: 'https://cdn.test/setup.jpg', name: 'setup.jpg' },
      { url: 'https://cdn.test/report.pdf', name: 'Leistungsnachweis.pdf' },
      { url: 'https://cdn.test/notes.docx', name: 'notes.docx' },
    ]);
  });
});
describe('isProofImageFile', () => {
  it('recognizes image extensions and ignores documents', () => {
    expect(isProofImageFile('https://cdn.test/photo.PNG?x=1')).toBe(true);
    expect(isProofImageFile('report.pdf')).toBe(false);
  });
});
