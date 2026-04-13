import Parser from "rss-parser";
import { sources, type RSSSource } from "./sources";

export interface FeedItem {
  title: string;
  link: string;
  date: string;
  source: string;
  category: string;
  language: string;
  summary: string;
  // Full HTML content from feed (not all feeds provide this)
  fullContent: string | null;
}

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "RSS-Aggregator/1.0",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
  // Request content:encoded field (full article HTML many feeds include)
  customFields: {
    item: [["content:encoded", "contentEncoded"]],
  },
});

// Strip HTML tags to plain text
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Sanitize HTML for safe inline rendering — strip dangerous tags/attrs only
function sanitizeHtml(html: string): string {
  return html
    // Remove script, style, iframe, object, embed
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*/gi, "")
    // Remove on* event handlers
    .replace(/\s+on\w+="[^"]*"/gi, "")
    .replace(/\s+on\w+='[^']*'/gi, "")
    // Make all links open in new tab
    .replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ');
}

// Fetch and parse a single RSS feed, returns [] on failure
async function fetchFeed(source: RSSSource): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 20).map((item) => {
      // Prefer content:encoded (full article) → item.content → nothing
      const rawFull =
        (item as unknown as Record<string, string>).contentEncoded ||
        item.content ||
        null;

      return {
        title: item.title?.trim() || "Untitled",
        link: item.link || item.guid || "",
        date: item.pubDate || item.isoDate || new Date().toISOString(),
        source: source.name,
        category: source.category,
        language: source.language,
        summary: stripHtml(
          item.contentSnippet || item.content || item.summary || ""
        ).slice(0, 300),
        fullContent: rawFull ? sanitizeHtml(rawFull) : null,
      };
    });
  } catch (err) {
    console.error(`[RSS] Failed to fetch ${source.name} (${source.url}):`, err);
    return [];
  }
}

// Fetch all feeds in parallel, merge, sort by date descending
export async function fetchAllFeeds(): Promise<FeedItem[]> {
  const results = await Promise.all(sources.map(fetchFeed));
  const allItems = results.flat();

  allItems.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return allItems;
}
