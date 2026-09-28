const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";

if (!BASE) {
  throw new Error(
    "Missing env: NEXT_PUBLIC_API_BASE_URL — restart the dev server after updating .env",
  );
}

export function getApiUrl(module: string) {
  return `${BASE}/${module}/api/${VERSION}`;
}

export const CORE_API_URL = getApiUrl("core");
