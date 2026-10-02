import { headers } from "next/headers";

export async function requestOrigin() {
  const headerStore = await headers();
  const host = (headerStore.get("x-forwarded-host") ?? headerStore.get("host"))
    ?.split(",")[0]
    ?.trim();
  if (!host || /[\s/]/.test(host)) return null;
  const forwarded = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const local = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const proto = forwarded === "http" || forwarded === "https" ? forwarded : local ? "http" : "https";
  return `${proto}://${host}`;
}
