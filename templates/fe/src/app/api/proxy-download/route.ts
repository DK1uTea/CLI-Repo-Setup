import { type NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOWNLOAD_HOSTS = new Set(
  (process.env.NEXT_PUBLIC_IMAGE_HOST ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
);

function safeFilename(filename: string | null) {
  const value = filename?.trim() || 'download';
  return value.replace(/[\r\n"]/g, '_');
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const filename = safeFilename(req.nextUrl.searchParams.get('filename'));

  if (!url) {
    return NextResponse.json({ message: 'Missing url parameter' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ message: 'Invalid url parameter' }, { status: 400 });
  }

  if (target.protocol !== 'https:' || !ALLOWED_DOWNLOAD_HOSTS.has(target.hostname.toLowerCase())) {
    return NextResponse.json({ message: 'Host not allowed' }, { status: 403 });
  }

  let response: Response;
  try {
    response = await fetch(target, { cache: 'no-store', redirect: 'error' });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch file' }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json({ message: 'Failed to fetch file' }, { status: response.status });
  }

  const buffer = await response.arrayBuffer();
  const asciiFilename = filename.replace(/[^\x20-\x7E]/g, '_');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'no-store',
    },
  });
}
