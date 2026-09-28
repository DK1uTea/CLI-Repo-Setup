import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_IMAGE_HOST = 'files.example.com';
});

import { GET } from '@/app/api/proxy-download/route';

const fetchMock = vi.fn();

function request(params: Record<string, string>) {
  const url = new URL('http://localhost/api/proxy-download');
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return new NextRequest(url);
}

describe('GET /api/proxy-download', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 400 when the URL parameter is missing', async () => {
    const response = await GET(request({}));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Missing url parameter' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 when the URL parameter is invalid', async () => {
    const response = await GET(request({ url: 'not-a-url' }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Invalid url parameter' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects non-HTTPS and non-allowlisted hosts', async () => {
    const httpResponse = await GET(
      request({ url: 'http://files.example.com/manual.pdf' }),
    );
    const hostResponse = await GET(
      request({ url: 'https://untrusted.example.com/manual.pdf' }),
    );

    expect(httpResponse.status).toBe(403);
    expect(hostResponse.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns the upstream status when the file cannot be fetched', async () => {
    fetchMock.mockResolvedValue(new Response('Not found', { status: 404 }));

    const response = await GET(
      request({ url: 'https://files.example.com/missing.pdf' }),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'Failed to fetch file' });
  });

  it('returns 502 when the upstream request throws', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'));

    const response = await GET(
      request({ url: 'https://files.example.com/manual.pdf' }),
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ message: 'Failed to fetch file' });
  });

  it('returns the binary file with download headers and a safe filename', async () => {
    fetchMock.mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      }),
    );

    const response = await GET(
      request({
        url: 'https://files.example.com/manual.pdf',
        filename: 'Manual "final".pdf',
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Content-Disposition')).toBe(
      "attachment; filename=\"Manual _final_.pdf\"; filename*=UTF-8''Manual%20_final_.pdf",
    );
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([1, 2, 3]),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://files.example.com/manual.pdf'),
      { cache: 'no-store', redirect: 'error' },
    );
  });
});
