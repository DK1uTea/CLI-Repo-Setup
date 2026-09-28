import { type NextRequest, NextResponse } from "next/server";
import dns from "node:dns/promises";
import net from "node:net";

const ALLOWED_IMAGE_HOSTS = new Set<string>([
  "images.example.com",
  "cdn.example.com",
]);

/**
 * Blocks SSRF via DNS rebinding: the hostname allowlist check and the actual
 * fetch happen at different times, so a hostname that resolves to a public IP
 * at check-time can be repointed to an internal IP by the time fetch() resolves
 * it again. Resolving once here and validating that IP — then fetching the IP
 * directly — closes that gap regardless of which domain is requested.
 */
function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224 // multicast + reserved
    );
  }
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80") ||
      normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:169.254.") ||
      normalized.startsWith("::ffff:192.168.")
    );
  }
  return true;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ message: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ message: "Invalid url" }, { status: 400 });
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ message: "Protocol not allowed" }, { status: 403 });
  }

  if (!ALLOWED_IMAGE_HOSTS.has(target.hostname.toLowerCase())) {
    return NextResponse.json({ message: "Host not allowed" }, { status: 403 });
  }

  let resolvedIp: string;
  try {
    const { address } = await dns.lookup(target.hostname);
    resolvedIp = address;
  } catch {
    return NextResponse.json({ message: "Host not found" }, { status: 502 });
  }

  if (isPrivateOrReservedIp(resolvedIp)) {
    return NextResponse.json({ message: "Host not allowed" }, { status: 403 });
  }

  const ipTarget = new URL(
    `${target.protocol}//${net.isIPv6(resolvedIp) ? `[${resolvedIp}]` : resolvedIp}${target.port ? `:${target.port}` : ""}${target.pathname}${target.search}${target.hash}`,
  );

  let response: Response;
  try {
    // redirect: "error" — a redirect could point to an unvalidated (e.g.
    // internal) address and must not be followed silently.
    response = await fetch(ipTarget.toString(), {
      cache: "no-store",
      redirect: "error",
      headers: { Host: target.hostname },
    });
  } catch {
    return NextResponse.json({ message: "Image unreachable" }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { message: "Image fetch failed" },
      { status: response.status },
    );
  }

  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
