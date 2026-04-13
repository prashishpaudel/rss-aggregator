import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";

// In-memory cache: stores result + timestamp
let cache: { data: Awaited<ReturnType<typeof fetchAllFeeds>>; ts: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  const now = Date.now();

  // Return cached response if still fresh
  if (cache && now - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json(
      { items: cache.data, cached: true, cachedAt: new Date(cache.ts).toISOString() },
      { headers: { "Cache-Control": "public, max-age=600" } }
    );
  }

  const items = await fetchAllFeeds();

  // Update cache
  cache = { data: items, ts: now };

  return NextResponse.json(
    { items, cached: false, cachedAt: new Date(now).toISOString() },
    { headers: { "Cache-Control": "public, max-age=600" } }
  );
}
