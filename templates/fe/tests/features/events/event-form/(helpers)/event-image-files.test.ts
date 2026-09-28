import { describe, expect, it } from 'vitest';

import { mergeUploadedEventImages } from '@/features/events/event-form/(helpers)/event-image-files';
import type { UploadFile } from '@/shared/components/ui/upload-dropzone';
import type { UploadedEventFile } from '@/features/events/event-form/(hooks)/use-upload-event-files';

describe('mergeUploadedEventImages', () => {
  it('keeps each crop distinct when the same source file is cropped twice into files sharing the same name', () => {
    const crop1: UploadFile = {
      name: 'photo.jpg',
      preview: 'blob:crop1',
      file: new File(['crop-1-bytes'], 'photo.jpg', { type: 'image/jpeg' }),
      isUploaded: false,
    };
    const crop2: UploadFile = {
      name: 'photo.jpg',
      preview: 'blob:crop2',
      file: new File(['crop-2-bytes'], 'photo.jpg', { type: 'image/jpeg' }),
      isUploaded: false,
    };
    const images = [crop1, crop2];
    const uploaded: UploadedEventFile[] = [
      { filename: 'photo.jpg', url: 'https://cdn/crop1.jpg', key: 'event/crop1.jpg', mimeType: 'image/jpeg', size: 1 },
      { filename: 'photo.jpg', url: 'https://cdn/crop2.jpg', key: 'event/crop2.jpg', mimeType: 'image/jpeg', size: 2 },
    ];

    const merged = mergeUploadedEventImages(images, images, uploaded);

    expect(merged[0].url).toBe('https://cdn/crop1.jpg');
    expect(merged[0].key).toBe('event/crop1.jpg');
    expect(merged[1].url).toBe('https://cdn/crop2.jpg');
    expect(merged[1].key).toBe('event/crop2.jpg');
  });

  it('still merges by filename-matching identity when only some images are pending upload', () => {
    const alreadyUploaded: UploadFile = {
      name: 'existing.jpg',
      preview: 'https://cdn/existing.jpg',
      url: 'https://cdn/existing.jpg',
      key: 'event/existing.jpg',
      isUploaded: true,
    };
    const pendingCrop: UploadFile = {
      name: 'photo.jpg',
      preview: 'blob:crop1',
      file: new File(['crop-bytes'], 'photo.jpg', { type: 'image/jpeg' }),
      isUploaded: false,
    };
    const images = [alreadyUploaded, pendingCrop];
    const pending = [pendingCrop];
    const uploaded: UploadedEventFile[] = [
      { filename: 'photo.jpg', url: 'https://cdn/crop1.jpg', key: 'event/crop1.jpg', mimeType: 'image/jpeg', size: 1 },
    ];

    const merged = mergeUploadedEventImages(images, pending, uploaded);

    expect(merged[0]).toEqual(alreadyUploaded);
    expect(merged[1].url).toBe('https://cdn/crop1.jpg');
    expect(merged[1].isUploaded).toBe(true);
  });
});
