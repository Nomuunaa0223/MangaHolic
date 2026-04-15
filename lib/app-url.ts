import { headers } from "next/headers";

function trimSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export async function getAppUrl() {
  const envUrl =
    process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (envUrl) {
    const normalized = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    return trimSlash(normalized);
  }

  const headerStore = await headers();
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const host =
    headerStore.get("x-forwarded-host") ||
    headerStore.get("host") ||
    process.env.VERCEL_URL;

  if (!host) {
    throw new Error("Unable to determine app URL");
  }

  return trimSlash(`${protocol}://${host}`);
}
